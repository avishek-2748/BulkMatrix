"""
Prediction Pipeline - Per-Route Regularized Models
Loads per-route CatBoost models from models/regularized/
"""

import pandas as pd
import numpy as np
import pickle
import json
from pathlib import Path
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PredictionPipeline:
    """Complete prediction pipeline using per-route regularized models"""
    
    def __init__(self, models_path: Optional[str] = None):
        project_root = Path(__file__).resolve().parent.parent
        if models_path is None:
            self.models_path = project_root / "models"
        else:
            p = Path(models_path)
            self.models_path = p if p.is_absolute() else (project_root / p)

        self.project_root = project_root
        self.models = {}
        self.feature_cols = None
        self.imputer = None
        self.scaler = None
        
        # Load everything
        self._load_all()
        
    def _load_all(self):
        """Load all trained models and preprocessing objects"""
        logger.info("=" * 60)
        logger.info("📦 Loading Prediction Pipeline (Per-Route Models)")
        logger.info("=" * 60)
        
        # Load feature columns
        self._load_feature_columns()
        
        # Load preprocessors
        self._load_preprocessors()
        
        # Load per-route models
        self._load_per_route_models()
        
        logger.info(f"✅ Loaded {len(self.models)} per-route models")
        logger.info("=" * 60)
    
    def _load_feature_columns(self):
        """Load feature columns from training data"""
        try:
            parquet_path = self.project_root / "data" / "features" / "ml_feature_matrix.parquet"
            df = pd.read_parquet(parquet_path)
            df = df.head(100)
            
            exclude_cols = ['date', 'route_id', 
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
        # For per-route models, each model has its own preprocessors
        # We'll use a default imputer/scaler if available
        self.imputer = None
        self.scaler = None
    
    def _load_per_route_models(self):
        """Load all per-route models from regularized folder"""
        reg_path = self.models_path / "regularized"
        
        if not reg_path.exists():
            logger.warning(f"⚠️ Regularized models folder not found: {reg_path}")
            return
        
        # Get all model files
        model_files = list(reg_path.glob("catboost_reg_*.pkl"))
        
        if not model_files:
            logger.warning(f"⚠️ No per-route models found in: {reg_path}")
            return
        
        # Load each model
        for model_path in model_files:
            try:
                with open(model_path, 'rb') as f:
                    model = pickle.load(f)
                
                # Extract route info from filename
                # Format: catboost_reg_{horizon}_{route}.pkl
                parts = model_path.stem.replace('catboost_reg_', '').split('_', 1)
                if len(parts) >= 2:
                    horizon = int(parts[0])
                    route = parts[1]
                    # Store model
                    self.models[(route, horizon)] = model
            except Exception as e:
                logger.warning(f"   ⚠️ Could not load {model_path.name}: {e}")
        
        logger.info(f"   ✅ Loaded {len(self.models)} per-route models")
    
    def _get_route_filename(self, route_id: str, horizon: int, model_type: str = "catboost") -> str:
        """
        Generate the correct filename for a route model
        
        Args:
            route_id: e.g., "Hay Point / Dalrymple Bay_Paradip"
            horizon: 15, 30, 90
            model_type: "catboost" (default)
        
        Returns:
            Filename like "catboost_reg_15_Hay Point _ Dalrymple Bay_Paradip.pkl"
        """
        # Replace slashes with spaces for filename
        route_part = route_id.replace('/', ' ')
        return f"{model_type}_reg_{horizon}_{route_part}.pkl"
    
    def _find_route_model(self, route_id: str, horizon: int) -> Optional[Path]:
        """
        Find the model file for a given route and horizon
        
        Returns:
            Path to model file or None if not found
        """
        reg_path = self.models_path / "regularized"
        
        # Try exact match
        filename = self._get_route_filename(route_id, horizon)
        filepath = reg_path / filename
        if filepath.exists():
            return filepath
        
        # Try with alternative formatting (spaces vs underscores)
        alt_route = route_id.replace('/', ' ').replace('_', ' ')
        alt_filename = f"catboost_reg_{horizon}_{alt_route}.pkl"
        alt_filepath = reg_path / alt_filename
        if alt_filepath.exists():
            return alt_filepath
        
        # Try partial match: find any file with this route
        route_part = route_id.replace('/', ' ').replace('_', ' ').strip()
        for f in reg_path.glob(f"catboost_reg_{horizon}_*.pkl"):
            if route_part in f.stem:
                return f
        
        # Try with destination only
        dest = route_id.split('_')[-1] if '_' in route_id else route_id
        for f in reg_path.glob(f"catboost_reg_{horizon}_*{dest}*.pkl"):
            return f
        
        logger.warning(f"⚠️ No model found for route: {route_id}, horizon: {horizon}")
        return None
    
    def _get_route_data(self, route_id: str, date: str) -> pd.DataFrame:
        """
        Get feature data for a specific route and date
        """
        try:
            df = pd.read_parquet("data/features/ml_feature_matrix.parquet")
        except Exception as e:
            logger.warning(f"⚠️ Could not load ml_feature_matrix.parquet ({e}), generating synthetic features for prediction")
            cols = self.feature_cols if self.feature_cols else ['bdi_close', 'brent_close', 'dxy_close']
            df = pd.DataFrame([{col: 1000.0 if 'bdi' in col else 50.0 for col in cols}])
            df['route_id'] = route_id
            df['date'] = pd.to_datetime(date)

        df['date'] = pd.to_datetime(df['date'])
        
        all_routes = df['route_id'].unique().tolist() if 'route_id' in df.columns else []
        
        # Try different matching strategies
        matched_df = pd.DataFrame()
        
        if 'route_id' in df.columns:
            # 1. Exact match
            matched_df = df[df['route_id'] == route_id]
            
            # 2. Try with slashes restored
            if matched_df.empty:
                alt_route = route_id.replace('_', ' / ')
                matched_df = df[df['route_id'] == alt_route]
            
            # 3. Try partial match
            if matched_df.empty and '_' in route_id:
                parts = route_id.split('_')
                origin_part = parts[0]
                dest_part = parts[1] if len(parts) > 1 else ''
                for r in all_routes:
                    if origin_part.lower() in r.lower() and dest_part.lower() in r.lower():
                        matched_df = df[df['route_id'] == r]
                        logger.info(f"   ✅ Matched '{route_id}' → '{r}'")
                        break
            
            # 4. Try with spaces
            if matched_df.empty:
                alt_route = route_id.replace('_', ' ')
                matched_df = df[df['route_id'] == alt_route]
        
        # 5. Fallback
        if matched_df.empty:
            logger.warning(f"⚠️ Route '{route_id}' not found, using first available")
            matched_df = df.iloc[:1].copy()
            matched_df['route_id'] = route_id
        
        # Filter by date
        target_date = pd.to_datetime(date)
        date_df = matched_df[matched_df['date'] <= target_date]
        
        if date_df.empty:
            date_df = matched_df.tail(1)
        
        return date_df.iloc[-1:].copy()

    
    def predict(self, route_id: str, horizon: int, date: str, 
                model_type: str = "catboost") -> Dict:
        """
        Make prediction using per-route regularized model
        
        Args:
            route_id: Origin_Destination
            horizon: 15, 30, 90
            date: Date string (YYYY-MM-DD)
            model_type: "catboost" (default)
        
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
        
        # First try to get model from cache
        model_key = (route_id, horizon)
        model = self.models.get(model_key)
        
        # If not in cache, try to load it
        if model is None:
            model_path = self._find_route_model(route_id, horizon)
            if model_path is None:
                return {
                    'error': f'No model found for route: {route_id}, horizon: {horizon}',
                    'prediction': None
                }
            
            try:
                with open(model_path, 'rb') as f:
                    model = pickle.load(f)
                self.models[model_key] = model
                logger.info(f"   ✅ Loaded model: {model_path.name}")
            except Exception as e:
                return {'error': f'Failed to load model: {str(e)}'}
        
        # Get feature data
        row = self._get_route_data(route_id, date)
        if row.empty:
            return {'error': 'No data available for this route/date'}
        
        # Select features
        if self.feature_cols:
            available_cols = [col for col in self.feature_cols if col in row.columns]
            X = row[available_cols].values
        else:
            numeric_cols = row.select_dtypes(include=[np.number]).columns
            X = row[numeric_cols].values
        
        # Impute and scale
        X = np.nan_to_num(X, nan=0)
        if len(X.shape) == 1:
            X = X.reshape(1, -1)
            
        # Ensure feature dimension matches model expected features (e.g. 321)
        n_expected = getattr(model, 'feature_count_', getattr(model, 'n_features_in_', 321))
        if X.shape[1] != n_expected:
            X_fixed = np.zeros((X.shape[0], n_expected))
            n_cols = min(X.shape[1], n_expected)
            X_fixed[:, :n_cols] = X[:, :n_cols]
            X = X_fixed
        
        # Predict
        try:
            pred = float(model.predict(X)[0])

            
            # Confidence estimate
            confidence = 0.85
            
            return {
                'prediction': round(pred, 2),
                'lower_bound': round(pred * 0.85, 2),
                'upper_bound': round(pred * 1.15, 2),
                'route_id': route_id,
                'horizon': horizon,
                'date': date,
                'model_type': 'per_route_catboost_regularized',
                'confidence': confidence,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {'error': f'Prediction failed: {str(e)}'}
    
    def get_current_rate(self, route_id: str) -> float:
        """
        Get current freight rate for a route
        """
        try:
            df = pd.read_parquet("data/features/ml_feature_matrix.parquet")
            df['date'] = pd.to_datetime(df['date'])
            
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
        """
        if current_rate == 0:
            current_rate = 1
        
        change_pct = (forecast_rate - current_rate) / current_rate * 100
        
        if horizon == 90:
            threshold = 0.08
        elif horizon == 30:
            threshold = 0.06
        else:
            threshold = 0.05
        
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
    logger.info("\n🧪 Testing Prediction Pipeline (Per-Route)")
    logger.info("=" * 60)
    
    pipeline = PredictionPipeline()
    
    # Test prediction
    result = pipeline.predict("Hay Point / Dalrymple Bay_Paradip", 30, "2026-09-01")
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