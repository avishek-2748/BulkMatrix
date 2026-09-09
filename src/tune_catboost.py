"""
Hyperparameter Tuning for CatBoost
Tunes on a subset of routes and applies best params to all routes
"""

import pandas as pd
import numpy as np
import pickle
import gc
from pathlib import Path
import logging
import time
from datetime import datetime
from sklearn.model_selection import RandomizedSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from catboost import CatBoostRegressor
import warnings
warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CatBoostTuner:
    """Hyperparameter tuning for CatBoost models"""
    
    def __init__(self, features_path: str = "data/features",
                 models_path: str = "models"):
        self.features_path = Path(features_path)
        self.models_path = Path(models_path)
        self.models_path.mkdir(parents=True, exist_ok=True)
        
        # Sample routes for tuning (representative mix)
        self.sample_routes = [
            'Hay Point / Dalrymple Bay_Paradip',      # Australia → East India
            'Port Hedland_Gangavaram',                # Australia → East India (iron ore)
            'Taboneo Anchorage_Gopalpur',             # Indonesia → East India
            'Richards Bay Coal Terminal_Dhamra',      # South Africa → East India
            'Baltimore / Norfolk_Visakhapatnam (Inner)' # USA → East India
        ]
        
    def load_data(self) -> pd.DataFrame:
        """Load full feature matrix"""
        logger.info("📊 Loading feature matrix...")
        parquet_path = self.features_path / "ml_feature_matrix.parquet"
        df = pd.read_parquet(parquet_path)
        
        # Optimize memory
        for col in df.select_dtypes(include=['float64']).columns:
            df[col] = df[col].astype('float32')
        
        logger.info(f"   ✅ Loaded {len(df):,} rows, {len(df.columns)} columns")
        return df
    
    def prepare_route_data(self, df: pd.DataFrame, route_id: str, target_col: str):
        """Prepare data for a single route"""
        route_df = df[df['route_id'] == route_id].copy()
        if len(route_df) < 100:
            return None, None, None, None
        
        route_df = route_df.sort_values('date').reset_index(drop=True)
        
        # Clean target
        route_df[target_col] = route_df[target_col].astype(str).str.replace(',', '').str.strip()
        route_df[target_col] = pd.to_numeric(route_df[target_col], errors='coerce')
        route_df = route_df.dropna(subset=[target_col])
        
        if len(route_df) < 100:
            return None, None, None, None
        
        exclude_cols = ['date', 'route_id', 
                       'target_bdi_15d', 'target_bdi_30d', 'target_bdi_90d']
        feature_cols = [col for col in route_df.columns 
                       if col not in exclude_cols 
                       and pd.api.types.is_numeric_dtype(route_df[col])
                       and not col.startswith('target_')]
        
        X = route_df[feature_cols].values.astype('float32')
        y = route_df[target_col].values.astype('float32')
        
        return X, y, feature_cols
    
    def tune_catboost(self, df: pd.DataFrame, horizon: int):
        """Tune CatBoost hyperparameters on sample routes"""
        target_col = f'target_bdi_{horizon}d'
        logger.info(f"\n{'='*60}")
        logger.info(f"🔍 Tuning CatBoost for horizon {horizon} days")
        logger.info(f"{'='*60}")
        
        X_all = []
        y_all = []
        
        # Collect data from sample routes
        for route in self.sample_routes:
            logger.info(f"   📍 Adding route: {route}")
            X, y, _ = self.prepare_route_data(df, route, target_col)
            if X is not None and len(X) > 50:
                X_all.append(X)
                y_all.append(y)
        
        if not X_all:
            logger.error("❌ No data collected for tuning")
            return None
        
        # Combine data from all sample routes
        X_combined = np.vstack(X_all)
        y_combined = np.concatenate(y_all)
        logger.info(f"   ✅ Combined samples: {len(X_combined):,}")
        
        # Split
        n = len(X_combined)
        train_end = int(n * 0.70)
        val_end = int(n * 0.85)
        
        X_train, X_val, X_test = X_combined[:train_end], X_combined[train_end:val_end], X_combined[val_end:]
        y_train, y_val, y_test = y_combined[:train_end], y_combined[train_end:val_end], y_combined[val_end:]
        
        # Preprocess
        imputer = SimpleImputer(strategy='mean')
        X_train = imputer.fit_transform(X_train)
        X_val = imputer.transform(X_val)
        X_test = imputer.transform(X_test)
        
        scaler = StandardScaler()
        X_train = scaler.fit_transform(X_train)
        X_val = scaler.transform(X_val)
        X_test = scaler.transform(X_test)
        
        # Define parameter grid
        param_grid = {
            'iterations': [300, 500, 700],
            'learning_rate': [0.03, 0.05, 0.07],
            'depth': [4, 6, 8],
            'l2_leaf_reg': [1, 3, 5],
            'border_count': [32, 64, 128],
            'subsample': [0.7, 0.8, 0.9]
        }
        
        logger.info("   🔄 Running RandomizedSearchCV...")
        
        base_model = CatBoostRegressor(
            random_seed=42,
            verbose=False,
            loss_function='MAE',
            thread_count=-1,
            early_stopping_rounds=50
        )
        
        random_search = RandomizedSearchCV(
            base_model,
            param_grid,
            n_iter=20,
            cv=3,
            scoring='neg_mean_absolute_error',
            random_state=42,
            n_jobs=-1
        )
        
        random_search.fit(X_train, y_train, eval_set=(X_val, y_val), verbose=False)
        
        best_params = random_search.best_params_
        logger.info(f"   ✅ Best params: {best_params}")
        
        # Evaluate on test set
        best_model = random_search.best_estimator_
        y_pred = best_model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
        
        logger.info(f"   📈 Tuned model on test set: MAE={mae:.2f}, RMSE={rmse:.2f}, MAPE={mape:.2f}%")
        
        # Save best params for this horizon
        params_path = self.models_path / f"catboost_tuned_params_{horizon}.pkl"
        with open(params_path, 'wb') as f:
            pickle.dump(best_params, f)
        logger.info(f"   💾 Saved params: {params_path}")
        
        return best_params
    
    def tune_all_horizons(self, df: pd.DataFrame):
        """Tune for all horizons"""
        horizons = [15, 30, 90]
        tuned_params = {}
        
        for horizon in horizons:
            params = self.tune_catboost(df, horizon)
            if params:
                tuned_params[horizon] = params
        
        # Save all params
        all_params_path = self.models_path / "catboost_tuned_params_all.pkl"
        with open(all_params_path, 'wb') as f:
            pickle.dump(tuned_params, f)
        logger.info(f"\n💾 Saved all tuned params: {all_params_path}")
        
        return tuned_params


def main():
    """Main tuning function"""
    logger.info("\n" + "="*60)
    logger.info("🚀 STARTING CATBOOST HYPERPARAMETER TUNING")
    logger.info("="*60)
    logger.info(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("="*60)
    
    start_total = time.time()
    
    tuner = CatBoostTuner()
    df = tuner.load_data()
    
    if df.empty:
        logger.error("❌ Failed to load data")
        return
    
    tuned_params = tuner.tune_all_horizons(df)
    
    # Print summary
    logger.info("\n" + "="*60)
    logger.info("📊 TUNING SUMMARY")
    logger.info("="*60)
    for horizon, params in tuned_params.items():
        logger.info(f"Horizon {horizon}d:")
        for key, val in params.items():
            logger.info(f"   {key}: {val}")
    
    total_elapsed = time.time() - start_total
    logger.info(f"\n⏰ Total tuning time: {total_elapsed/60:.1f} minutes")
    logger.info("✅ Tuning complete!")
    logger.info("="*60)


if __name__ == "__main__":
    main()