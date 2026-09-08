"""
FastAPI Backend for BulkMatrix
Exposes ML models and charter engine as REST APIs
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from prediction_pipeline import PredictionPipeline
from charter_engine import CharterEngine

# Initialize FastAPI
app = FastAPI(
    title="BulkMatrix Charter API",
    description="AI-powered Freight Forecasting & Vessel Chartering Optimization",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
print("🚀 Loading ML models...")
prediction = PredictionPipeline()
charter_engine = CharterEngine()
print("✅ Models loaded successfully!")


# ============================================
# Request/Response Models
# ============================================

class CharterRequest(BaseModel):
    cargo_volume: float
    commodity: str
    origin: str
    destinations: List[str]
    contract_type: str
    arrival_window: Optional[List[str]] = None


class ForecastRequest(BaseModel):
    route_id: str
    horizon: int
    date: str
    model_type: Optional[str] = "best"


# ============================================
# Health Check
# ============================================

@app.get("/")
async def root():
    return {
        "name": "BulkMatrix Charter API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": [
            "/api/kpis",
            "/api/forecast",
            "/api/charter_recommendation",
            "/api/ports",
            "/api/routes",
            "/api/fleet",
            "/api/vessel/{vessel_id}"
        ]
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "models_loaded": len(prediction.models) > 0
    }


# ============================================
# API Endpoints
# ============================================

@app.get("/api/kpis")
async def get_kpis():
    """Get global KPIs"""
    return {
        "bdi": 1420,
        "bdi_trend": "+2.3%",
        "congestion_index": 12.5,
        "active_charters": 3,
        "risk_summary": "Cyclone risk: High (Oct-Nov)",
        "last_updated": "2026-09-09"
    }


@app.post("/api/forecast")
async def get_forecast(request: ForecastRequest):
    """Get freight rate forecast"""
    try:
        result = prediction.predict(
            request.route_id,
            request.horizon,
            request.date,
            request.model_type
        )
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/charter_recommendation")
async def get_charter_recommendation(request: CharterRequest):
    """Get complete charter recommendation"""
    try:
        result = charter_engine.get_charter_recommendation(request.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/ports")
async def get_ports():
    """Get all ports"""
    ports = charter_engine.ports['port_name'].tolist()
    return {"ports": sorted(ports)}


@app.get("/api/origins")
async def get_origins():
    """Get all origin ports"""
    origins = charter_engine.ports[
        charter_engine.ports['port_type'].str.lower() == 'loading'
    ]['port_name'].tolist()
    return {"origins": sorted(origins)}


@app.get("/api/destinations")
async def get_destinations():
    """Get all destination ports"""
    dests = charter_engine.ports[
        charter_engine.ports['port_type'].str.lower() == 'discharge'
    ]['port_name'].tolist()
    return {"destinations": sorted(dests)}


@app.get("/api/routes")
async def get_routes():
    """Get all routes"""
    routes = charter_engine.routes.to_dict('records')
    return {"routes": routes}


@app.get("/api/fleet")
async def get_fleet():
    """Get active fleet (simulated AIS)"""
    return {
        "vessels": [
            {
                "id": "v1",
                "name": "Sea Explorer",
                "vessel_class": "Panamax",
                "cargo": "Coal 75,000t",
                "origin": "Hay Point",
                "destination": "Paradip",
                "progress": 45,
                "eta": "2026-09-15",
                "fuel_consumed": 320,
                "alerts": []
            },
            {
                "id": "v2",
                "name": "Ocean Giant",
                "vessel_class": "Capesize",
                "cargo": "Iron Ore 180,000t",
                "origin": "Port Hedland",
                "destination": "Gangavaram",
                "progress": 70,
                "eta": "2026-09-12",
                "fuel_consumed": 540,
                "alerts": [
                    {
                        "type": "weather",
                        "severity": "HIGH",
                        "message": "Cyclone risk in 5 days"
                    }
                ]
            },
            {
                "id": "v3",
                "name": "Blue Horizon",
                "vessel_class": "Supramax",
                "cargo": "Coal 55,000t",
                "origin": "Taboneo",
                "destination": "Gopalpur",
                "progress": 25,
                "eta": "2026-09-20",
                "fuel_consumed": 180,
                "alerts": []
            }
        ]
    }


@app.get("/api/vessel/{vessel_id}")
async def get_vessel_detail(vessel_id: str):
    """Get vessel details"""
    vessels = {
        "v1": {
            "id": "v1",
            "name": "Sea Explorer",
            "vessel_class": "Panamax",
            "cargo": {"type": "coal", "volume": 75000},
            "position": {"lat": -15.5, "lon": 115.5},
            "progress": 45,
            "eta": "2026-09-15",
            "fuel_consumption": 32,
            "alerts": []
        },
        "v2": {
            "id": "v2",
            "name": "Ocean Giant",
            "vessel_class": "Capesize",
            "cargo": {"type": "iron_ore", "volume": 180000},
            "position": {"lat": -12.3, "lon": 118.7},
            "progress": 70,
            "eta": "2026-09-12",
            "fuel_consumption": 45,
            "alerts": ["Cyclone risk in 5 days"]
        }
    }
    
    return vessels.get(vessel_id, {"error": "Vessel not found"})


@app.get("/api/analytics/freight")
async def get_freight_history():
    """Get historical freight data"""
    # Placeholder - load from processed data
    return {"data": []}


@app.get("/api/analytics/congestion")
async def get_congestion_history():
    """Get congestion history"""
    return {"data": []}


@app.get("/api/analytics/risk_calendar")
async def get_risk_calendar():
    """Get seasonal risk calendar"""
    return {"data": []}


@app.get("/api/analytics/ports/performance")
async def get_port_performance():
    """Get port performance comparison"""
    return {"data": []}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True
    )