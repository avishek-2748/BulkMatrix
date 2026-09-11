"""
Model Loader - Centralised loading of per-route models
"""

import pickle
from pathlib import Path
import logging
import re
from typing import Dict, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelLoader:
    """Load and cache per-route regularized models"""
    
    _instance = None
    _models = {}
    _model_path = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._load_all_models()
        return cls._instance
    
    def _normalize_route(self, route_id: str) -> str:
        """
        Normalize route ID for matching.
        Converts to lowercase, replaces '/', '\\', multiple spaces, etc.
        """
        # Replace slashes with spaces
        norm = route_id.replace('/', ' ').replace('\\', ' ')
        # Replace underscores with spaces (but careful: some parts might have underscores)
        norm = norm.replace('_', ' ')
        # Remove extra spaces
        norm = ' '.join(norm.split())
        return norm.lower()
    
    def _load_all_models(self):
        """Load all models from models/regularized/ into cache"""
        project_root = Path(__file__).resolve().parent.parent
        self._model_path = project_root / "models" / "regularized"
        if not self._model_path.exists():
            logger.warning(f"Model path not found: {self._model_path}")
            return
        
        model_files = list(self._model_path.glob("catboost_reg_*.pkl"))
        logger.info(f"📦 Loading {len(model_files)} models...")
        
        for filepath in model_files:
            try:
                # Parse filename: catboost_reg_{horizon}_{route}.pkl
                # Example: catboost_reg_15_Hay Point _ Dalrymple Bay_Paradip.pkl
                parts = filepath.stem.split('_', 3)  # ['catboost', 'reg', 'horizon', 'route']
                if len(parts) >= 4:
                    horizon = int(parts[2])
                    route = parts[3]  # the rest is the route name (may contain underscores)
                    with open(filepath, 'rb') as f:
                        model = pickle.load(f)
                    # Store using the raw route string and also a normalized version for matching
                    # We'll store by (horizon, route) and also build a normalized index
                    self._models[(horizon, route)] = model
                else:
                    logger.warning(f"⚠️ Skipping unexpected filename: {filepath.name}")
            except Exception as e:
                logger.warning(f"⚠️ Failed to load {filepath.name}: {e}")
        
        logger.info(f"✅ Loaded {len(self._models)} models")
    
    def get_model(self, route_id: str, horizon: int) -> Optional[object]:
        """
        Retrieve a model for a given route and horizon.
        Tries exact match first, then normalized partial match.
        """
        # Try exact match on stored raw route
        for (h, r), model in self._models.items():
            if h == horizon and r == route_id:
                return model
        
        # Normalize the incoming route
        norm_route = self._normalize_route(route_id)
        
        # Try matching by checking if normalized route is contained in stored route (or vice versa)
        best_match = None
        best_score = 0
        for (h, r), model in self._models.items():
            if h == horizon:
                norm_stored = self._normalize_route(r)
                # Check if one is substring of the other
                if norm_route in norm_stored or norm_stored in norm_route:
                    # Compute simple score: length of common substring? Just use length for now
                    common_len = len(set(norm_route.split()) & set(norm_stored.split()))
                    if common_len > best_score:
                        best_score = common_len
                        best_match = (r, model)
        
        if best_match:
            logger.info(f"🔍 Matched '{route_id}' → '{best_match[0]}'")
            return best_match[1]
        
        # If still no match, try to find any model with same horizon (fallback)
        for (h, r), model in self._models.items():
            if h == horizon:
                logger.warning(f"⚠️ Using fallback model for horizon {horizon}: '{r}'")
                return model
        
        logger.warning(f"⚠️ No model found for route '{route_id}', horizon {horizon}")
        return None
    
    def list_models(self):
        """Debug: list all loaded model keys"""
        return list(self._models.keys())


# Singleton accessor
def get_model_loader():
    return ModelLoader()


# Quick test
if __name__ == "__main__":
    loader = ModelLoader()
    print(f"Total models loaded: {len(loader._models)}")
    # Test retrieval
    model = loader.get_model("Hay Point / Dalrymple Bay_Paradip", 30)
    if model:
        print("✅ Model found for Hay Point / Dalrymple Bay_Paradip, 30d")
    else:
        print("❌ Model not found")