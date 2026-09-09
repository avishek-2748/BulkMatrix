"""
Retrain Models on 100% Data - ALL ROUTES
Memory-optimized for 16GB RAM laptop
"""

import pandas as pd
import numpy as np
import pickle
import gc
from pathlib import Path
import logging
import warnings
import time
from datetime import datetime
warnings.filterwarnings('ignore')

from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error

import xgboost as xgb
import lightgbm as lgb
from catboost import CatBoostRegressor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FullDataTrainer:
    """Train models on 100% data - ALL ROUTES"""
    
    def __init__(self, features_path: str = "data/features",
                 models_path: str = "models"):
        self.features_path = Path(features_path)
        self.models_path = Path(models_path)
        self.models_path.mkdir(parents=True, exist_ok=True)
        
        self.all_results = []
        
    def load_full_data(self) -> pd.DataFrame:
        """Load 100% data with memory optimization"""
        logger.info("=" * 60)
        logger.info("📊 Loading 100% Feature Matrix")
        logger.info("=" * 60)
        
        parquet_path = self.features_path / "ml_feature_matrix.parquet"
        
        if not parquet_path.exists():
            logger.error(f"❌ Parquet file not found: {parquet_path}")
            return pd.DataFrame()
        
        logger.info("   🔄 Loading parquet with memory optimization...")
        
        df = pd.read_parquet(parquet_path)
        
        # Optimize dtypes
        for col in df.select_dtypes(include=['float64']).columns:
            df[col] = df[col].astype('float32')
        
        for col in df.select_dtypes(include=['int64']).columns:
            df[col] = df[col].astype('int32')
        
        logger.info(f"   ✅ Loaded {len(df):,} rows, {len(df.columns)} columns")
        logger.info(f"   📅 Date range: {df['date'].min()} to {df['date'].max()}")
        
        # Get all unique routes
        routes = df['route_id'].unique()
        logger.info(f"   🛤️  Total routes: {len(routes)}")
        
        memory_mb = df.memory_usage(deep=True).sum() / (1024 * 1024)
        logger.info(f"   💾 Memory usage: {memory_mb:.1f} MB")
        
        return df
    
    def prepare_data(self, df: pd.DataFrame, 
                    target_col: str = 'target_bdi_30d',
                    route_id: str = None) -> tuple:
        """Prepare data for a specific route"""
        if route_id:
            df = df[df['route_id'] == route_id].copy()
            logger.info(f"   🛤️  Route: {route_id} ({len(df):,} rows)")
        
        if len(df) < 100:
            return None, None, None, None, None
        
        # Sort by date
        df = df.sort_values('date').reset_index(drop=True)
        
        # Define features
        exclude_cols = ['date', 'route_id', 
                       'target_bdi_15d', 'target_bdi_30d', 'target_bdi_90d']
        
        feature_cols = [col for col in df.columns 
                       if col not in exclude_cols 
                       and pd.api.types.is_numeric_dtype(df[col])
                       and not col.startswith('target_')]
        
        # Clean target
        df[target_col] = df[target_col].astype(str).str.replace(',', '').str.strip()
        df[target_col] = pd.to_numeric(df[target_col], errors='coerce')
        
        df_clean = df.dropna(subset=[target_col]).copy()
        
        if len(df_clean) < 100:
            return None, None, None, None, None
        
        X = df_clean[feature_cols].values.astype('float32')
        y = df_clean[target_col].values.astype('float32')
        
        logger.info(f"   ✅ Features: {X.shape[1]}, Samples: {X.shape[0]:,}")
        
        return X, y, feature_cols, df_clean
    
    def train_models_for_route(self, X, y, feature_cols, route_id, horizon):
        """Train all models for a single route and horizon"""
        n = len(X)
        train_end = int(n * 0.70)
        val_end = int(n * 0.85)
        
        X_train, X_val, X_test = X[:train_end], X[train_end:val_end], X[val_end:]
        y_train, y_val, y_test = y[:train_end], y[train_end:val_end], y[val_end:]
        
        logger.info(f"   📊 Train: {len(X_train):,}, Val: {len(X_val):,}, Test: {len(X_test):,}")
        
        # Preprocess
        imputer = SimpleImputer(strategy='mean')
        X_train = imputer.fit_transform(X_train)
        X_val = imputer.transform(X_val)
        X_test = imputer.transform(X_test)
        
        scaler = StandardScaler()
        X_train = scaler.fit_transform(X_train)
        X_val = scaler.transform(X_val)
        X_test = scaler.transform(X_test)
        
        results = {}
        models = {}
        
        # XGBoost
        model = xgb.XGBRegressor(
            n_estimators=500,
            learning_rate=0.05,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            early_stopping_rounds=50,
            eval_metric='mae',
            n_jobs=-1,
            tree_method='hist'
        )
        model.fit(X_train, y_train, eval_set=[(X_train, y_train), (X_val, y_val)], verbose=False)
        models['xgboost'] = model
        
        # LightGBM
        model = lgb.LGBMRegressor(
            n_estimators=500,
            learning_rate=0.05,
            num_leaves=31,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            early_stopping_rounds=50,
            n_jobs=-1,
            verbosity=-1
        )
        model.fit(X_train, y_train, eval_set=[(X_train, y_train), (X_val, y_val)], 
                  callbacks=[lgb.early_stopping(50), lgb.log_evaluation(0)])
        models['lightgbm'] = model
        
        # CatBoost
        model = CatBoostRegressor(
            iterations=500,
            learning_rate=0.05,
            depth=6,
            random_seed=42,
            verbose=False,
            early_stopping_rounds=50,
            loss_function='MAE',
            thread_count=-1
        )
        model.fit(X_train, y_train, eval_set=(X_val, y_val), verbose=False)
        models['catboost'] = model
        
        # Evaluate and save
        for name, model in models.items():
            y_pred = model.predict(X_test)
            mae = mean_absolute_error(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
            
            results[name] = {'mae': mae, 'rmse': rmse, 'mape': mape}
            
            # Save model per route and horizon
            model_path = self.models_path / f"{name}_{horizon}_{route_id.replace('/', '_')}.pkl"
            with open(model_path, 'wb') as f:
                pickle.dump(model, f)
        
        # Save preprocessors
        imputer_path = self.models_path / f"imputer_{horizon}_{route_id.replace('/', '_')}.pkl"
        scaler_path = self.models_path / f"scaler_{horizon}_{route_id.replace('/', '_')}.pkl"
        
        with open(imputer_path, 'wb') as f:
            pickle.dump(imputer, f)
        with open(scaler_path, 'wb') as f:
            pickle.dump(scaler, f)
        
        return results
    
    def retrain_all_routes(self, df: pd.DataFrame):
        """Train on ALL routes"""
        logger.info("\n" + "=" * 60)
        logger.info("🚀 Retraining on ALL Routes (100% Data)")
        logger.info("=" * 60)
        
        routes = df['route_id'].unique()
        horizons = [15, 30, 90]
        
        route_results = {}
        
        for route_id in routes:
            logger.info(f"\n" + "-" * 40)
            logger.info(f"🛤️  Route: {route_id}")
            logger.info("-" * 40)
            
            route_results[route_id] = {}
            
            for horizon in horizons:
                target_col = f'target_bdi_{horizon}d'
                logger.info(f"\n🎯 Horizon: {horizon} days")
                
                X, y, feature_cols, df_clean = self.prepare_data(df, target_col, route_id)
                
                if X is None:
                    logger.warning(f"   ⚠️ Skipping: insufficient data")
                    continue
                
                results = self.train_models_for_route(X, y, feature_cols, route_id, horizon)
                route_results[route_id][horizon] = results
                
                # Clean up
                del X, y
                gc.collect()
        
        # Summary
        logger.info("\n" + "=" * 60)
        logger.info("📊 TRAINING SUMMARY (ALL ROUTES)")
        logger.info("=" * 60)
        logger.info(f"   Total routes trained: {len(routes)}")
        logger.info(f"   Models saved: {len(routes) * len(horizons) * 3}")
        logger.info("=" * 60)
        logger.info("✅ Retraining Complete!")
        
        return route_results


def retrain_full():
    """Main retraining function"""
    logger.info("\n" + "=" * 60)
    logger.info("🚀 STARTING FULL DATA RETRAINING (ALL ROUTES)")
    logger.info("=" * 60)
    logger.info(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 60)
    
    start_total = time.time()
    
    trainer = FullDataTrainer()
    df = trainer.load_full_data()
    
    if df.empty:
        logger.error("❌ Failed to load data")
        return
    
    results = trainer.retrain_all_routes(df)
    
    total_elapsed = time.time() - start_total
    logger.info(f"\n⏰ Total time: {total_elapsed/60:.1f} minutes")
    logger.info("✅ Full retraining complete!")


if __name__ == "__main__":
    retrain_full()