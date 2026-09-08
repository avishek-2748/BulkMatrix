"""
Model Trainer - Baseline Models
Trains and evaluates baseline forecasting models
"""

import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

from pathlib import Path
import logging
from datetime import datetime
import json
import pickle

# Machine Learning
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

# Time Series
from statsmodels.tsa.statespace.sarimax import SARIMAX
from prophet import Prophet

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BaselineModelTrainer:
    """Train and evaluate baseline forecasting models"""
    
    def __init__(self, features_path: str = "data/features",
                 models_path: str = "models/baseline"):
        self.features_path = Path(features_path)
        self.models_path = Path(models_path)
        self.models_path.mkdir(parents=True, exist_ok=True)
        
        self.results = {}
        self.models = {}
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
        logger.info(f"   📅 Date range: {df['date'].min()} to {df['date'].max()}")
        
        return df
    
    def prepare_data(self, df: pd.DataFrame, 
                    target_col: str = 'target_bdi_30d',
                    horizon: int = 30):
        """Prepare data for training"""
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
        
        # **FIX: Convert target column to numeric (remove commas)**
        df[target_col] = df[target_col].astype(str).str.replace(',', '').str.strip()
        df[target_col] = pd.to_numeric(df[target_col], errors='coerce')
        
        df_clean = df.dropna(subset=[target_col]).copy()
        
        X = df_clean[feature_cols].values
        y = df_clean[target_col].values
        dates = df_clean['date'].values
        
        # Impute NaN values in features
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
    
    def evaluate_model(self, y_true, y_pred, model_name, horizon):
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
        
        logger.info(f"   📈 {model_name} (h={horizon}): MAE={mae:.2f}, RMSE={rmse:.2f}, MAPE={mape:.2f}%")
        
        return result
    
    def train_linear_regression(self, X_train, y_train, X_test, y_test, horizon):
        """Train Linear Regression model"""
        logger.info(f"\n🔹 Training Linear Regression (h={horizon})...")
        
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        model = LinearRegression()
        model.fit(X_train_scaled, y_train)
        
        y_pred = model.predict(X_test_scaled)
        
        result = self.evaluate_model(y_test, y_pred, 'LinearRegression', horizon)
        
        self.models['linear_regression'] = model
        self.models['scaler'] = scaler
        
        return result, y_pred
    
    def train_sarimax(self, df, target_col, horizon):
        """Train SARIMAX model"""
        logger.info(f"\n🔹 Training SARIMAX (h={horizon})...")
        
        if 'route_id' in df.columns:
            route = df['route_id'].unique()[0]
            df_route = df[df['route_id'] == route].copy()
        else:
            df_route = df.copy()
        
        df_route = df_route.sort_values('date').reset_index(drop=True)
        
        # **FIX: Convert target to numeric**
        df_route[target_col] = df_route[target_col].astype(str).str.replace(',', '').str.strip()
        df_route[target_col] = pd.to_numeric(df_route[target_col], errors='coerce')
        
        series = df_route[target_col].dropna()
        
        n = len(series)
        train_end = int(n * 0.70)
        test_start = int(n * 0.85)
        
        train = series[:train_end]
        test = series[test_start:]
        
        try:
            model = SARIMAX(train, 
                           order=(1, 1, 1), 
                           seasonal_order=(1, 1, 1, 12),
                           enforce_stationarity=False,
                           enforce_invertibility=False)
            fitted = model.fit(disp=False, maxiter=100)
            
            forecast = fitted.forecast(steps=len(test))
            y_pred = forecast.values
            y_true = test.values
            
            result = self.evaluate_model(y_true, y_pred, 'SARIMAX', horizon)
            self.models['sarimax'] = fitted
            
            return result, y_pred
            
        except Exception as e:
            logger.error(f"   ❌ SARIMAX failed: {e}")
            return None, None
    
    def train_prophet(self, df, target_col, horizon):
        """Train Prophet model"""
        logger.info(f"\n🔹 Training Prophet (h={horizon})...")
        
        if 'route_id' in df.columns:
            route = df['route_id'].unique()[0]
            df_route = df[df['route_id'] == route].copy()
        else:
            df_route = df.copy()
        
        df_route = df_route.sort_values('date').reset_index(drop=True)
        
        # **FIX: Convert target to numeric**
        df_route[target_col] = df_route[target_col].astype(str).str.replace(',', '').str.strip()
        df_route[target_col] = pd.to_numeric(df_route[target_col], errors='coerce')
        
        df_prophet = df_route[['date', target_col]].dropna()
        df_prophet = df_prophet.rename(columns={'date': 'ds', target_col: 'y'})
        
        n = len(df_prophet)
        train_end = int(n * 0.70)
        test_start = int(n * 0.85)
        
        train_df = df_prophet[:train_end]
        test_df = df_prophet[test_start:]
        
        try:
            model = Prophet(yearly_seasonality=True,
                           weekly_seasonality=False,
                           daily_seasonality=False,
                           interval_width=0.95)
            model.fit(train_df)
            
            future = model.make_future_dataframe(periods=len(test_df), include_history=False)
            forecast = model.predict(future)
            
            y_pred = forecast['yhat'].values[:len(test_df)]
            y_true = test_df['y'].values
            
            result = self.evaluate_model(y_true, y_pred, 'Prophet', horizon)
            self.models['prophet'] = model
            
            return result, y_pred
            
        except Exception as e:
            logger.error(f"   ❌ Prophet failed: {e}")
            return None, None
    
    def run_all_baselines(self, df: pd.DataFrame):
        """Run all baseline models for all horizons"""
        logger.info("\n" + "=" * 60)
        logger.info("🚀 Training All Baseline Models")
        logger.info("=" * 60)
        
        horizons = [15, 30, 90]
        
        for horizon in horizons:
            target_col = f'target_bdi_{horizon}d'
            logger.info(f"\n" + "-" * 40)
            logger.info(f"🎯 Horizon: {horizon} days")
            logger.info("-" * 40)
            
            X, y, dates, df_clean = self.prepare_data(df, target_col, horizon)
            if X is None:
                continue
            
            X_train, X_val, X_test, y_train, y_val, y_test, dates_train, dates_val, dates_test = self.split_data(X, y, dates)
            
            result_lr, _ = self.train_linear_regression(X_train, y_train, X_test, y_test, horizon)
            if result_lr:
                self.results[f'{target_col}_lr'] = result_lr
            
            result_sarimax, _ = self.train_sarimax(df_clean, target_col, horizon)
            if result_sarimax:
                self.results[f'{target_col}_sarimax'] = result_sarimax
            
            result_prophet, _ = self.train_prophet(df_clean, target_col, horizon)
            if result_prophet:
                self.results[f'{target_col}_prophet'] = result_prophet
        
        self._save_results()
        return self.results
    
    def _save_results(self):
        """Save results and models"""
        results_path = self.models_path / "baseline_results.json"
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
        logger.info("📊 Baseline Model Results")
        logger.info("=" * 60)
        
        results_df = pd.DataFrame(self.results).T
        results_df = results_df[['model', 'horizon', 'mae', 'rmse', 'mape']]
        results_df = results_df.sort_values(['horizon', 'mae'])
        
        print("\n")
        print(results_df.to_string(index=False))
        
        results_df.to_csv(self.models_path / "baseline_results.csv", index=False)
        logger.info(f"\n💾 Results saved to: {self.models_path / 'baseline_results.csv'}")
        
        return results_df


def test_baseline():
    """Test the baseline trainer"""
    logger.info("\n" + "=" * 60)
    logger.info("🧪 Testing Baseline Models")
    logger.info("=" * 60)
    
    trainer = BaselineModelTrainer()
    df = trainer.load_data(sample_size=0.1)
    
    if df.empty:
        logger.error("❌ No data loaded")
        return
    
    results = trainer.run_all_baselines(df)
    trainer.display_results()
    
    logger.info("\n✅ Baseline model testing complete!")
    return trainer


if __name__ == "__main__":
    test_baseline()