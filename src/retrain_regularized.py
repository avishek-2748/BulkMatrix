"""
Retrain with Regularized CatBoost Parameters
Options A (per-route) and B (global) with safe regularization
"""

import pandas as pd
import numpy as np
import pickle
import gc
from pathlib import Path
import logging
import time
from datetime import datetime
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error
from catboost import CatBoostRegressor
import warnings
warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RegularizedTrainer:
    """Train per-route and global models with regularized hyperparameters"""
    
    def __init__(self, features_path: str = "data/features",
                 models_path: str = "models"):
        self.features_path = Path(features_path)
        self.models_path = Path(models_path)
        self.regularized_path = self.models_path / "regularized"
        self.global_path = self.models_path / "global_regularized"
        self.regularized_path.mkdir(parents=True, exist_ok=True)
        self.global_path.mkdir(parents=True, exist_ok=True)
        
        # Regularized parameters (safe)
        self.regularized_params = {
            15: {
                'iterations': 500,
                'learning_rate': 0.05,
                'depth': 6,
                'subsample': 0.8,
                'l2_leaf_reg': 3,
                'border_count': 128
            },
            30: {
                'iterations': 500,
                'learning_rate': 0.05,
                'depth': 6,
                'subsample': 0.8,
                'l2_leaf_reg': 3,
                'border_count': 128
            },
            90: {
                'iterations': 500,
                'learning_rate': 0.05,
                'depth': 6,
                'subsample': 0.8,
                'l2_leaf_reg': 3,
                'border_count': 128
            }
        }
        
        self.results = []
        self.global_results = []
    
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
    
    def train_regularized_per_route(self, df: pd.DataFrame):
        """Train per-route models with regularized params"""
        logger.info("\n" + "="*60)
        logger.info("🔹 Option A: Regularized Per-Route Models")
        logger.info("="*60)
        
        horizons = [15, 30, 90]
        routes = df['route_id'].unique()
        total_routes = len(routes)
        
        for horizon in horizons:
            target_col = f'target_bdi_{horizon}d'
            logger.info(f"\n🎯 Horizon: {horizon} days")
            
            params = self.regularized_params[horizon]
            logger.info(f"   Parameters: iterations={params['iterations']}, depth={params['depth']}, l2={params['l2_leaf_reg']}, lr={params['learning_rate']}")
            
            route_count = 0
            for route in routes:
                X, y, feature_cols = self.prepare_route_data(df, route, target_col)
                if X is None or len(X) < 100:
                    continue
                
                n = len(X)
                train_end = int(n * 0.70)
                val_end = int(n * 0.85)
                X_train, X_val, X_test = X[:train_end], X[train_end:val_end], X[val_end:]
                y_train, y_val, y_test = y[:train_end], y[train_end:val_end], y[val_end:]
                
                # Preprocess
                imputer = SimpleImputer(strategy='mean')
                X_train = imputer.fit_transform(X_train)
                X_val = imputer.transform(X_val)
                X_test = imputer.transform(X_test)
                
                scaler = StandardScaler()
                X_train = scaler.fit_transform(X_train)
                X_val = scaler.transform(X_val)
                X_test = scaler.transform(X_test)
                
                # Train with regularized params
                model = CatBoostRegressor(
                    iterations=params['iterations'],
                    learning_rate=params['learning_rate'],
                    depth=params['depth'],
                    subsample=params['subsample'],
                    l2_leaf_reg=params['l2_leaf_reg'],
                    border_count=params['border_count'],
                    random_seed=42,
                    verbose=False,
                    loss_function='MAE',
                    thread_count=-1,
                    early_stopping_rounds=50
                )
                model.fit(X_train, y_train, eval_set=(X_val, y_val), verbose=False)
                
                # Evaluate
                y_pred = model.predict(X_test)
                mae = mean_absolute_error(y_test, y_pred)
                rmse = np.sqrt(mean_squared_error(y_test, y_pred))
                mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
                
                self.results.append({
                    'model_type': 'regularized_per_route',
                    'horizon': horizon,
                    'route': route,
                    'mae': mae,
                    'rmse': rmse,
                    'mape': mape
                })
                
                # Save model
                model_filename = f"catboost_reg_{horizon}_{route.replace('/', '_')}.pkl"
                model_path = self.regularized_path / model_filename
                with open(model_path, 'wb') as f:
                    pickle.dump(model, f)
                
                route_count += 1
                if route_count % 10 == 0:
                    logger.info(f"   Progress: {route_count}/{total_routes} routes done")
            
            logger.info(f"   ✅ Horizon {horizon}: {route_count} routes trained")
    
    def train_global_regularized(self, df: pd.DataFrame):
        """Train a single global model with regularized params"""
        logger.info("\n" + "="*60)
        logger.info("🔹 Option B: Global Regularized Model")
        logger.info("="*60)
        
        horizons = [15, 30, 90]
        
        for horizon in horizons:
            target_col = f'target_bdi_{horizon}d'
            logger.info(f"\n🎯 Horizon: {horizon} days")
            
            params = self.regularized_params[horizon]
            logger.info(f"   Parameters: iterations={params['iterations']}, depth={params['depth']}, l2={params['l2_leaf_reg']}, lr={params['learning_rate']}")
            
            X_all = []
            y_all = []
            routes = df['route_id'].unique()
            
            for route in routes:
                X, y, _ = self.prepare_route_data(df, route, target_col)
                if X is not None and len(X) > 50:
                    X_all.append(X)
                    y_all.append(y)
            
            if not X_all:
                logger.warning(f"   No data for horizon {horizon}")
                continue
            
            X_combined = np.vstack(X_all)
            y_combined = np.concatenate(y_all)
            logger.info(f"   Combined samples: {len(X_combined):,} from {len(X_all)} routes")
            
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
            
            # Train global model
            model = CatBoostRegressor(
                iterations=params['iterations'],
                learning_rate=params['learning_rate'],
                depth=params['depth'],
                subsample=params['subsample'],
                l2_leaf_reg=params['l2_leaf_reg'],
                border_count=params['border_count'],
                random_seed=42,
                verbose=False,
                loss_function='MAE',
                thread_count=-1,
                early_stopping_rounds=50
            )
            model.fit(X_train, y_train, eval_set=(X_val, y_val), verbose=False)
            
            # Evaluate
            y_pred = model.predict(X_test)
            mae = mean_absolute_error(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
            
            self.global_results.append({
                'model_type': 'global_regularized',
                'horizon': horizon,
                'mae': mae,
                'rmse': rmse,
                'mape': mape
            })
            
            # Save model
            model_path = self.global_path / f"catboost_global_reg_{horizon}.pkl"
            with open(model_path, 'wb') as f:
                pickle.dump(model, f)
            logger.info(f"   ✅ Global model saved: {model_path}")
            logger.info(f"   📈 Test metrics: MAE={mae:.2f}, RMSE={rmse:.2f}, MAPE={mape:.2f}%")
    
    def compare_results(self):
        """Compare regularized per-route vs global model"""
        logger.info("\n" + "="*60)
        logger.info("📊 COMPARISON: Regularized Per-Route vs Global")
        logger.info("="*60)
        
        if not self.results:
            logger.warning("No per-route results available.")
            return
        
        per_route_df = pd.DataFrame(self.results)
        per_route_summary = per_route_df.groupby('horizon').agg({
            'mae': ['mean', 'std'],
            'rmse': ['mean', 'std'],
            'mape': ['mean', 'std']
        }).round(2)
        
        print("\n🔹 Regularized Per-Route Models (Average across all routes):")
        print(per_route_summary)
        
        if self.global_results:
            global_df = pd.DataFrame(self.global_results)
            print("\n🔹 Global Regularized Model (Single model):")
            print(global_df[['horizon', 'mae', 'rmse', 'mape']].to_string(index=False))
        
        print("\n" + "-"*60)
        print("🏆 SIDE-BY-SIDE COMPARISON (MAPE %)")
        print("-"*60)
        
        global_dict = {r['horizon']: r['mape'] for r in self.global_results} if self.global_results else {}
        per_route_mean = per_route_df.groupby('horizon')['mape'].mean()
        
        comparison = []
        for horizon in [15, 30, 90]:
            if horizon in global_dict:
                global_mape = global_dict[horizon]
                per_route_mape = per_route_mean.get(horizon, np.nan)
                if not np.isnan(per_route_mape):
                    better = "Per-Route" if per_route_mape < global_mape else "Global"
                else:
                    better = "N/A"
                comparison.append({
                    'Horizon': f'{horizon}d',
                    'Per-Route MAPE': f"{per_route_mape:.2f}%" if not np.isnan(per_route_mape) else "N/A",
                    'Global MAPE': f"{global_mape:.2f}%",
                    'Better': better
                })
        
        comp_df = pd.DataFrame(comparison)
        print(comp_df.to_string(index=False))
        
        # Save comparison
        comp_path = self.models_path / "comparison_regularized.csv"
        comp_df.to_csv(comp_path, index=False)
        logger.info(f"\n💾 Comparison saved to: {comp_path}")


def main():
    logger.info("\n" + "="*60)
    logger.info("🚀 STARTING REGULARIZED TRAINING (Per-Route + Global)")
    logger.info("="*60)
    logger.info(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("="*60)
    
    start_total = time.time()
    
    trainer = RegularizedTrainer()
    df = trainer.load_data()
    if df.empty:
        logger.error("❌ Failed to load data")
        return
    
    # Option A: Regularized per-route
    trainer.train_regularized_per_route(df)
    
    # Option B: Regularized global
    trainer.train_global_regularized(df)
    
    # Compare
    trainer.compare_results()
    
    total_elapsed = time.time() - start_total
    logger.info(f"\n⏰ Total time: {total_elapsed/60:.1f} minutes")
    logger.info("✅ Process complete!")
    logger.info("="*60)


if __name__ == "__main__":
    main()