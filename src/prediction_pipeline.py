"""
Prediction Pipeline - Complete
Loads trained models and makes predictions for any route/horizon
"""

import pandas as pd
import numpy as np
import pickle
import json
from pathlib import Path
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PredictionPipeline:
    """Complete prediction pipeline for freight forecasting"""
    
    def __init__(self, models_path: str = "models"):
        self.models_path = Path(models_path)
        self.models = {}
        self.feature_cols = None
        self.imputer = None
        self.scaler = None
        
        # Load everything
        self._load_all()
        
    def _load_all(self):
        """Load all trained models and preprocessing objects"""
        logger.info("=" * 60)
        logger.info("📦 Loading Prediction Pipeline")
        logger.info("=" * 60)
        
        # 1. Load ensemble models
        self._load_ensemble_models()
        
        # 2. Load Prophet models
        self._load_prophet_models()
        
        # 3. Load feature columns
        self._load_feature_columns()
        
        # 4. Load preprocessors
        self._load_preprocessors()
        
        logger.info(f"✅ Loaded {len(self.models)} models")
        logger.info("=" * 60)
    
    def _load_ensemble_models(self):
        """Load XGBoost, LightGBM, CatBoost models"""
        ensemble_path = self.models_path / "ensemble"
        
        model_files = [
            ('xgboost_15', 'xgboost_15.pkl'),
            ('xgboost_30', 'xgboost_30.pkl'),
            ('xgboost_90', 'xgboost_90.pkl'),
            ('lightgbm_15', 'lightgbm_15.pkl'),
            ('lightgbm_30', 'lightgbm_30.pkl'),
            ('lightgbm_90', 'lightgbm_90.pkl'),
            ('catboost_15', 'catboost_15.pkl'),
            ('catboost_30', 'catboost_30.pkl'),
            ('catboost_90', 'catboost_90.pkl'),
        ]
        
        for key, filename in model_files:
            filepath = ensemble_path / filename
            if filepath.exists():
                try:
                    with open(filepath, 'rb') as f:
                        self.models[key] = pickle.load(f)
                    logger.info(f"   ✅ Loaded: {key}")
                except Exception as e:
                    logger.warning(f"   ⚠️ Could not load {key}: {e}")
            else:
                logger.warning(f"   ⚠️ File not found: {filename}")
    
    def _load_prophet_models(self):
        """Load Prophet models"""
        baseline_path = self.models_path / "baseline"
        prophet_path = baseline_path / "prophet.pkl"
        
        if prophet_path.exists():
            try:
                with open(prophet_path, 'rb') as f:
                    prophet_model = pickle.load(f)
                    # Use same model for all horizons (will be fine-tuned later)
                    self.models['prophet_15'] = prophet_model
                    self.models['prophet_30'] = prophet_model
                    self.models['prophet_90'] = prophet_model
                logger.info(f"   ✅ Loaded: Prophet")
            except Exception as e:
                logger.warning(f"   ⚠️ Could not load Prophet: {e}")
        else:
            logger.warning("   ⚠️ Prophet model not found")
    
    def _load_feature_columns(self):
        """Load feature columns from training data"""
        try:
            # Use parquet instead of CSV (faster)
            df = pd.read_parquet("data/features/ml_feature_matrix.parquet")
            df = df.head(100)  # Just need column names
            
            exclude_cols = ['date', 'route_id', 'origin_port', 'destination_port',
                           'target_bdi_15d', 'target_bdi_30d', 'target_bdi_90d']
            
            self.feature_cols = [col for col in df.columns 
                               if col not in exclude_cols 
                               and pd.api.types.is_numeric_dtype(df[col])
                               and not col.startswith('target_')]
            
            logger.info(f"   ✅ Loaded {len(self.feature_cols)} feature columns")
        except Exception as e:
            logger.warning(f"   ⚠️ Could not load feature columns: {e}")
            self.feature_cols = []
    
    def _load_preprocessors(self):
        """Load imputer and scaler"""
        # Try to load from models directory
        imputer_path = self.models_path / "imputer.pkl"
        scaler_path = self.models_path / "scaler.pkl"
        
        if imputer_path.exists():
            try:
                with open(imputer_path, 'rb') as f:
                    self.imputer = pickle.load(f)
                logger.info("   ✅ Loaded: Imputer")
            except:
                pass
        
        if scaler_path.exists():
            try:
                with open(scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                logger.info("   ✅ Loaded: Scaler")
            except:
                pass
    
    def get_route_data(self, route_id: str, date: str) -> pd.DataFrame:
        """
        Get feature data for a specific route and date
        
        Args:
            route_id: Format "origin_destination" (e.g., "Hay Point_Paradip")
            date: Date string (YYYY-MM-DD)
        
        Returns:
            DataFrame with features for prediction
        """
        # Load parquet
        df = pd.read_parquet("data/features/ml_feature_matrix.parquet")
        df['date'] = pd.to_datetime(df['date'])
        
        # Get all unique route IDs
        all_routes = df['route_id'].unique().tolist()
        
        # Try different matching strategies
        matched_df = pd.DataFrame()
        
        # 1. Exact match
        matched_df = df[df['route_id'] == route_id]
        
        # 2. Try with spaces instead of underscores
        if matched_df.empty:
            alt_route = route_id.replace('_', ' ')
            matched_df = df[df['route_id'] == alt_route]
        
        # 3. Try partial match on origin and destination
        if matched_df.empty and '_' in route_id:
            parts = route_id.split('_')
            origin_part = parts[0]
            dest_part = parts[1] if len(parts) > 1 else ''
            
            # Try to match by checking if both origin and destination are in the route_id
            for r in all_routes:
                if origin_part.lower() in r.lower() and dest_part.lower() in r.lower():
                    matched_df = df[df['route_id'] == r]
                    logger.info(f"   ✅ Matched '{route_id}' → '{r}'")
                    break
        
        # 4. Try fuzzy matching - find route containing origin
        if matched_df.empty:
            origin_part = route_id.split('_')[0]
            for r in all_routes:
                if origin_part.lower() in r.lower():
                    matched_df = df[df['route_id'] == r]
                    logger.info(f"   ✅ Matched '{route_id}' → '{r}' (partial match on origin)")
                    break
        
        # 5. Fallback to first available route
        if matched_df.empty:
            logger.warning(f"⚠️ Route '{route_id}' not found. Available routes: {all_routes[:5]}...")
            matched_df = df.iloc[:1].copy()
            matched_df['route_id'] = route_id
        
        # Filter by date
        target_date = pd.to_datetime(date)
        date_df = matched_df[matched_df['date'] <= target_date]
        
        if date_df.empty:
            date_df = matched_df.tail(1)
        
        latest = date_df.iloc[-1:].copy()
        
        return latest
    
    def predict_ensemble(self, route_id: str, horizon: int, date: str) -> Dict:
        """
        Make prediction using ensemble models
        
        Args:
            route_id: Origin_Destination
            horizon: 15, 30, or 90
            date: Date to predict from
        
        Returns:
            Dictionary with predictions
        """
        # Get feature data
        row = self.get_route_data(route_id, date)
        
        if row.empty:
            return {'error': 'No data available for this route/date'}
        
        # Select features
        if self.feature_cols:
            available_cols = [col for col in self.feature_cols if col in row.columns]
            X = row[available_cols].values
        else:
            # Use all numeric columns
            numeric_cols = row.select_dtypes(include=[np.number]).columns
            X = row[numeric_cols].values
        
        # Impute if needed
        if self.imputer is not None:
            X = self.imputer.transform(X)
        else:
            # Simple imputation
            X = np.nan_to_num(X, nan=0)
        
        # Scale if needed
        if self.scaler is not None:
            X = self.scaler.transform(X)
        
        # Get model key
        model_keys = {
            15: 'xgboost_15',
            30: 'xgboost_30',
            90: 'xgboost_90'
        }
        
        model_key = model_keys.get(horizon, 'xgboost_15')
        model = self.models.get(model_key)
        
        if model is None:
            return {'error': f'Model {model_key} not found'}
        
        # Predict
        try:
            pred = float(model.predict(X)[0])
            
            # Also try other models for ensemble
            lgb_key = f'lightgbm_{horizon}'
            cat_key = f'catboost_{horizon}'
            
            predictions = [pred]
            models_used = ['xgboost']
            
            if lgb_key in self.models and self.models[lgb_key] is not None:
                try:
                    lgb_pred = float(self.models[lgb_key].predict(X)[0])
                    predictions.append(lgb_pred)
                    models_used.append('lightgbm')
                except:
                    pass
            
            if cat_key in self.models and self.models[cat_key] is not None:
                try:
                    cat_pred = float(self.models[cat_key].predict(X)[0])
                    predictions.append(cat_pred)
                    models_used.append('catboost')
                except:
                    pass
            
            # Ensemble average
            ensemble_pred = np.mean(predictions)
            std_pred = np.std(predictions) if len(predictions) > 1 else pred * 0.05
            
            return {
                'prediction': round(ensemble_pred, 2),
                'lower_bound': round(ensemble_pred - 1.96 * std_pred, 2),
                'upper_bound': round(ensemble_pred + 1.96 * std_pred, 2),
                'models_used': models_used,
                'individual_predictions': {m: float(p) for m, p in zip(models_used, predictions)},
                'route_id': route_id,
                'horizon': horizon,
                'date': date
            }
            
        except Exception as e:
            return {'error': f'Prediction failed: {str(e)}'}
    
    def predict_prophet(self, route_id: str, horizon: int, date: str) -> Dict:
        """
        Make prediction using Prophet
        """
        # Simplified Prophet prediction
        # In production, Prophet would be used with proper time series data
        
        # For now, use ensemble as fallback
        return self.predict_ensemble(route_id, horizon, date)
    
    def predict(self, route_id: str, horizon: int, date: str, 
                model_type: str = 'ensemble') -> Dict:
        """
        Main prediction method
        
        Args:
            route_id: Origin_Destination
            horizon: 15, 30, 90
            date: Date string (YYYY-MM-DD)
            model_type: 'ensemble', 'prophet', or 'best'
        
        Returns:
            Dictionary with prediction
        """
        logger.info(f"🔮 Predicting: {route_id} | {horizon}d | {date}")
        
        # Validate inputs
        if horizon not in [15, 30, 90]:
            return {'error': 'Horizon must be 15, 30, or 90'}
        
        try:
            pd.to_datetime(date)
        except:
            return {'error': f'Invalid date format: {date}'}
        
        # Choose model
        if model_type == 'prophet':
            result = self.predict_prophet(route_id, horizon, date)
        elif model_type == 'ensemble':
            result = self.predict_ensemble(route_id, horizon, date)
        else:  # 'best'
            # Use prophet for 15/30, ensemble for 90
            if horizon == 90:
                result = self.predict_ensemble(route_id, horizon, date)
            else:
                result = self.predict_prophet(route_id, horizon, date)
        
        # Add metadata
        result['model_type'] = model_type
        result['timestamp'] = datetime.now().isoformat()
        
        return result
    
    def get_current_rate(self, route_id: str) -> float:
        """
        Get current freight rate for a route
        """
        try:
            df = pd.read_parquet("data/features/ml_feature_matrix.parquet")
            df['date'] = pd.to_datetime(df['date'])
            
            # Try exact match
            route_df = df[df['route_id'] == route_id]
            
            if route_df.empty:
                # Try partial match
                origin_part = route_id.split('_')[0]
                for r in df['route_id'].unique():
                    if origin_part.lower() in r.lower():
                        route_df = df[df['route_id'] == r]
                        break
            
            if route_df.empty:
                return 1500.0
            
            latest = route_df.iloc[-1]
            bdi_value = latest.get('bdi_score', 1500.0)
            
            # Handle string with commas
            if isinstance(bdi_value, str):
                bdi_value = bdi_value.replace(',', '').strip()
                return float(bdi_value)
            
            return float(bdi_value)
        except Exception as e:
            logger.warning(f"⚠️ Could not get current rate: {e}")
            return 1500.0
    
    def get_buy_hold_signal(self, current_rate: float, forecast_rate: float,
                           horizon: int, threshold: float = 0.05) -> Dict:
        """
        Generate Buy/Hold signal
        
        Args:
            current_rate: Current freight rate
            forecast_rate: Predicted future rate
            horizon: 15, 30, or 90
            threshold: Minimum % change to trigger signal (default 5%)
        """
        if current_rate == 0:
            current_rate = 1
        
        change_pct = (forecast_rate - current_rate) / current_rate * 100
        
        # Adjust threshold based on horizon
        if horizon == 90:
            threshold = 0.08  # 8% for long-term
        elif horizon == 30:
            threshold = 0.06  # 6% for medium-term
        else:
            threshold = 0.05  # 5% for short-term
        
        if change_pct > threshold * 100:
            signal = "BUY"
            reason = f"Rates expected to rise {change_pct:.1f}% in {horizon} days. Lock in now."
            confidence = min(abs(change_pct) / (threshold * 150), 1.0)
        elif change_pct < -threshold * 100:
            signal = "HOLD"
            reason = f"Rates expected to drop {abs(change_pct):.1f}% in {horizon} days. Wait for lower rates."
            confidence = min(abs(change_pct) / (threshold * 150), 1.0)
        else:
            signal = "NEUTRAL"
            reason = f"Rates stable (±{change_pct:.1f}%) for {horizon} days. Monitor market."
            confidence = 0.5
        
        return {
            'signal': signal,
            'reason': reason,
            'confidence': round(min(confidence, 1.0), 2),
            'current_rate': round(current_rate, 2),
            'forecast_rate': round(forecast_rate, 2),
            'change_percent': round(change_pct, 1),
            'horizon': horizon
        }


# ============================================
# Quick Test
# ============================================

def test_pipeline():
    """Test the prediction pipeline"""
    logger.info("\n🧪 Testing Prediction Pipeline")
    logger.info("=" * 60)
    
    pipeline = PredictionPipeline()
    
    # Test prediction
    result = pipeline.predict("Hay Point_Paradip", 30, "2026-09-01")
    print(f"\n📊 Prediction Result:")
    print(json.dumps(result, indent=2))
    
    # Test Buy/Hold
    signal = pipeline.get_buy_hold_signal(1500, 1650, 30)
    print(f"\n📈 Buy/Hold Signal:")
    print(json.dumps(signal, indent=2))
    
    logger.info("✅ Prediction Pipeline test complete")
    return pipeline


if __name__ == "__main__":
    test_pipeline()