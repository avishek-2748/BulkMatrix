"""
ML Ensemble Trainer - XGBoost, LightGBM, CatBoost
Trains and evaluates gradient boosting models for freight forecasting
"""

import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

from pathlib import Path
import logging
import json
import pickle
from datetime import datetime
import time

# Scikit-learn
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.impute import SimpleImputer
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV

# XGBoost
import xgboost as xgb

# LightGBM
import lightgbm as lgb

# CatBoost
from catboost import CatBoostRegressor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MLEnsembleTrainer:
    """Train and evaluate gradient boosting models"""
    
    def __init__(self, features_path: str = "data/features",
                 models_path: str = "models/ensemble"):
        self.features_path = Path(features_path)
        self.models_path = Path(models_path)
        self.models_path.mkdir(parents=True, exist_ok=True)
        
        self.results = {}
        self.models = {}
        self.scaler = StandardScaler()
        self.imputer = SimpleImputer(strategy='mean')
        
    def load_data(self, sample_size: float = 1.0) -> pd.DataFrame:
        """Load feature matrix"""
        logger.info("📊 Loading feature matrix...")
        
        csv_path = self.features_path / "ml_feature_matrix.csv"
        if not csv_path.exists():
            logger.error(f"❌ Feature matrix not found: {csv_path}")
            return pd.DataFrame()
        
        df = pd.read_csv(csv_path)
        df['date'] = pd.to_datetime(df['date'])
        
        if sample_size < 1.0:
            df = df.sample(frac=sample_size, random_state=42)
            logger.info(f"   ✅ Sampled: {len(df)} rows ({sample_size*100:.0f}%)")
        
        logger.info(f"   ✅ Loaded: {len(df)} rows, {len(df.columns)} columns")
        return df
    
    def prepare_data(self, df: pd.DataFrame, target_col: str = 'target_bdi_30d'):
        """Prepare data for training"""
        # Use first route for baseline comparison
        if 'route_id' in df.columns:
            route = df['route_id'].unique()[0]
            df = df[df['route_id'] == route].copy()
            logger.info(f"   🛤️  Using route: {route}")
        
        df = df.sort_values('date').reset_index(drop=True)
        
        exclude_cols = ['date', 'route_id', 'origin_port', 'destination_port',
                       'target_bdi_15d', 'target_bdi_30d', 'target_bdi_90d']
        
        feature_cols = [col for col in df.columns 
                       if col not in exclude_cols 
                       and pd.api.types.is_numeric_dtype(df[col])
                       and not col.startswith('target_')]
        
        if target_col not in df.columns:
            logger.error(f"❌ Target column '{target_col}' not found")
            return None, None, None, None
        
        # Clean target column
        df[target_col] = df[target_col].astype(str).str.replace(',', '').str.strip()
        df[target_col] = pd.to_numeric(df[target_col], errors='coerce')
        
        df_clean = df.dropna(subset=[target_col]).copy()
        
        X = df_clean[feature_cols].values
        y = df_clean[target_col].values
        dates = df_clean['date'].values
        
        # Impute NaN values
        X = self.imputer.fit_transform(X)
        
        logger.info(f"   ✅ Features: {X.shape[1]}, Samples: {X.shape[0]}")
        
        return X, y, dates, df_clean
    
    def split_data(self, X, y, dates, train_ratio=0.70, val_ratio=0.15):
        """Split data chronologically"""
        n = len(X)
        train_end = int(n * train_ratio)
        val_end = int(n * (train_ratio + val_ratio))
        
        X_train, X_val, X_test = X[:train_end], X[train_end:val_end], X[val_end:]
        y_train, y_val, y_test = y[:train_end], y[train_end:val_end], y[val_end:]
        dates_train, dates_val, dates_test = dates[:train_end], dates[train_end:val_end], dates[val_end:]
        
        logger.info(f"   📊 Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
        
        return X_train, X_val, X_test, y_train, y_val, y_test, dates_train, dates_val, dates_test
    
    def evaluate_model(self, y_true, y_pred, model_name, horizon, additional_metrics=False):
        """Evaluate model performance"""
        mae = mean_absolute_error(y_true, y_pred)
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        mape = np.mean(np.abs((y_true - y_pred) / y_true)) * 100
        
        result = {
            'model': model_name,
            'horizon': horizon,
            'mae': float(mae),
            'rmse': float(rmse),
            'mape': float(mape)
        }
        
        if additional_metrics:
            # R² score
            ss_res = np.sum((y_true - y_pred) ** 2)
            ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
            r2 = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
            result['r2'] = float(r2)
            
            # Mean Absolute Percentage Error (symmetric)
            smape = np.mean(2 * np.abs(y_true - y_pred) / (np.abs(y_true) + np.abs(y_pred))) * 100
            result['smape'] = float(smape)
        
        logger.info(f"   📈 {model_name} (h={horizon}): MAE={mae:.2f}, RMSE={rmse:.2f}, MAPE={mape:.2f}%")
        
        return result
    
    def train_xgboost(self, X_train, y_train, X_test, y_test, horizon):
        """Train XGBoost model"""
        logger.info(f"\n🔹 Training XGBoost (h={horizon})...")
        
        model = xgb.XGBRegressor(
            n_estimators=500,
            learning_rate=0.05,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            early_stopping_rounds=50,
            eval_metric='mae',
            n_jobs=-1
        )
        
        # Fit with validation
        model.fit(
            X_train, y_train,
            eval_set=[(X_train, y_train), (X_test, y_test)],
            verbose=False
        )
        
        y_pred = model.predict(X_test)
        result = self.evaluate_model(y_test, y_pred, 'XGBoost', horizon, additional_metrics=True)
        
        self.models[f'xgboost_{horizon}'] = model
        return result, y_pred
    
    def train_lightgbm(self, X_train, y_train, X_test, y_test, horizon):
        """Train LightGBM model"""
        logger.info(f"\n🔹 Training LightGBM (h={horizon})...")
        
        model = lgb.LGBMRegressor(
            n_estimators=500,
            learning_rate=0.05,
            num_leaves=31,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            early_stopping_rounds=50,
            n_jobs=-1
        )
        
        model.fit(
            X_train, y_train,
            eval_set=[(X_train, y_train), (X_test, y_test)],
            callbacks=[lgb.early_stopping(50), lgb.log_evaluation(0)]
        )
        
        y_pred = model.predict(X_test)
        result = self.evaluate_model(y_test, y_pred, 'LightGBM', horizon, additional_metrics=True)
        
        self.models[f'lightgbm_{horizon}'] = model
        return result, y_pred
    
    def train_catboost(self, X_train, y_train, X_test, y_test, horizon):
        """Train CatBoost model"""
        logger.info(f"\n🔹 Training CatBoost (h={horizon})...")
        
        model = CatBoostRegressor(
            iterations=500,
            learning_rate=0.05,
            depth=6,
            random_seed=42,
            verbose=False,
            early_stopping_rounds=50,
            loss_function='MAE'
        )
        
        model.fit(
            X_train, y_train,
            eval_set=(X_test, y_test),
            verbose=False
        )
        
        y_pred = model.predict(X_test)
        result = self.evaluate_model(y_test, y_pred, 'CatBoost', horizon, additional_metrics=True)
        
        self.models[f'catboost_{horizon}'] = model
        return result, y_pred
    
    def train_all_ensemble(self, df: pd.DataFrame):
        """Train all ensemble models for all horizons"""
        logger.info("\n" + "=" * 60)
        logger.info("🚀 Training ML Ensemble Models")
        logger.info("=" * 60)
        
        horizons = [15, 30, 90]
        all_results = {}
        
        for horizon in horizons:
            target_col = f'target_bdi_{horizon}d'
            logger.info(f"\n" + "-" * 40)
            logger.info(f"🎯 Horizon: {horizon} days")
            logger.info("-" * 40)
            
            X, y, dates, df_clean = self.prepare_data(df, target_col)
            if X is None:
                continue
            
            X_train, X_val, X_test, y_train, y_val, y_test, dates_train, dates_val, dates_test = self.split_data(X, y, dates)
            
            # Train all models
            result_xgb, _ = self.train_xgboost(X_train, y_train, X_test, y_test, horizon)
            if result_xgb:
                all_results[f'{target_col}_xgb'] = result_xgb
            
            result_lgb, _ = self.train_lightgbm(X_train, y_train, X_test, y_test, horizon)
            if result_lgb:
                all_results[f'{target_col}_lgb'] = result_lgb
            
            result_cat, _ = self.train_catboost(X_train, y_train, X_test, y_test, horizon)
            if result_cat:
                all_results[f'{target_col}_cat'] = result_cat
        
        self.results = all_results
        self._save_results()
        return all_results
    
    def _save_results(self):
        """Save results and models"""
        results_path = self.models_path / "ensemble_results.json"
        with open(results_path, 'w') as f:
            json.dump(self.results, f, indent=2)
        logger.info(f"\n💾 Results saved to: {results_path}")
        
        for name, model in self.models.items():
            try:
                model_path = self.models_path / f"{name}.pkl"
                with open(model_path, 'wb') as f:
                    pickle.dump(model, f)
            except:
                pass
    
    def display_results(self):
        """Display results as a table"""
        if not self.results:
            logger.warning("No results to display")
            return
        
        logger.info("\n" + "=" * 60)
        logger.info("📊 Ensemble Model Results")
        logger.info("=" * 60)
        
        results_df = pd.DataFrame(self.results).T
        results_df = results_df[['model', 'horizon', 'mae', 'rmse', 'mape', 'r2']]
        results_df = results_df.sort_values(['horizon', 'mae'])
        
        print("\n")
        print(results_df.to_string(index=False))
        
        results_df.to_csv(self.models_path / "ensemble_results.csv", index=False)
        logger.info(f"\n💾 Results saved to: {self.models_path / 'ensemble_results.csv'}")
        
        return results_df


def test_ensemble():
    """Test the ensemble trainer"""
    logger.info("\n" + "=" * 60)
    logger.info("🧪 Testing ML Ensemble Models")
    logger.info("=" * 60)
    
    trainer = MLEnsembleTrainer()
    df = trainer.load_data(sample_size=0.1)
    
    if df.empty:
        logger.error("❌ No data loaded")
        return
    
    results = trainer.train_all_ensemble(df)
    trainer.display_results()
    
    logger.info("\n✅ Ensemble model testing complete!")
    return trainer


if __name__ == "__main__":
    test_ensemble()