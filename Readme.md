# BulkMatrix — Freight Forecasting & Chartering Platform

End-to-End Broker-Free Charter Marketplace for Bulk Cargo

---

## Overview

BulkMatrix is a production-style full-stack decision-support platform for Freight Forecasting & Chartering of Bulk Cargo. It connects Logistic Managers and Vessel Owners directly on a single platform — eliminating the traditional broker.

### What It Does

| Capability | Description |
|------------|-------------|
| Freight Forecasting | Predict BDI 15/30/90 days ahead using 168 per-route CatBoost models |
| Vessel Recommendation | Recommends best vessel class (Handysize to Capesize) based on cargo & port constraints |
| Buy/Hold Signals | Tells logistic managers when to lock a charter vs wait for better rates |
| Weather & Port Congestion Alerts | Cyclone/monsoon risk + waiting days + berth occupancy |
| Live AIS Tracking | Post-charter real-time vessel tracking for both parties |
| Owner Matching Engine | Ranks vessel owners based on class match, availability, rating, and response rate |
| Contract Requests | In-platform request/accept/reject with chat negotiation |
| Availability Locking | Auto-locks vessels during voyages to prevent double-booking |

---

## The Problem We Solve

Before BulkMatrix:
Logistic Manager -> Daily spot market -> Broker -> Vessel Owner -> Deal

- Logistic managers pay volatile spot rates
- No forward visibility into freight prices
- Vessel size mismatches (draft/LOA/beam violations) cause demurrage
- Brokers take a cut which increases costs
- No centralized data on vessel availability

After BulkMatrix:
Logistic Manager -> ML Recommendation -> Smart-Matched Owner List -> Direct Deal
                                              ^
                                     Vessel Owner Dashboard
                                     (Registered fleet owners)

---

## Architecture

High-Level Architecture:

    +-------------------------------------------------------------+
    |                    FRONTEND (React)                         |
    |  +---------------------+    +---------------------+         |
    |  | Logistic Manager    |    | Vessel Owner        |         |
    |  | Dashboard           |    | Dashboard           |         |
    |  +---------------------+    +---------------------+         |
    +-------------------------------------------------------------+
                                |
                                v REST API
    +-------------------------------------------------------------+
    |                BACKEND (Node.js + Express)                  |
    |  +------------+  +------------+  +---------------------+    |
    |  | Controllers|  |  Services  |  |      Routes         |    |
    |  +------------+  +------------+  +---------------------+    |
    +-------------------------------------------------------------+
                                |
                  +-------------+-------------+
                  v             v             v
           +------------+  +------------+  +------------+
           |  MongoDB   |  |  ML API    |  | Live APIs  |
           |  (Users,   |  |  (168      |  | (AIS,      |
           |  Vessels,  |  |  CatBoost) |  | Weather,   |
           | Contracts) |  |            |  | Fuel)      |
           +------------+  +------------+  +------------+

---

## End-to-End User Flow

    STEP 1: OWNER REGISTERS
            Owner -> Registration -> Email Verify -> Add Vessel -> Stored in DB

    STEP 2: MANAGER PLANS
            Manager -> Charter Planner -> ML Recommendation

    STEP 3: SMART MATCHING
            Recommendation -> Matching Engine -> Ranked Owner List

    STEP 4: MANAGER SENDS REQUEST
            Manager -> Selects Owner -> Send Contract Request -> Email Notify

    STEP 5: OWNER RESPONDS
            Owner -> Accept / Reject / Negotiate (Chat)

    STEP 6: DEAL CONFIRMED
            Owner shares vessel details -> Availability Calendar Locked

    STEP 7: LIVE TRACKING ACTIVATES
            Vessel auto-added to both dashboards

    STEP 8: VOYAGE MONITORING
            Real-time alerts (weather, congestion, ETA)

    STEP 9: VOYAGE COMPLETED
            Contract marked complete -> Availability Unlocked

---

## ML Engine

Models:
- 168 per-route CatBoost models (56 routes x 3 horizons)
- Regularized parameters: iterations=500, depth=6, l2_leaf_reg=3, learning_rate=0.05
- Models saved in models/regularized/

Forecasting Targets:

| Horizon | Average MAPE |
|---------|--------------|
| 15 days | 21.51% |
| 30 days | 27.50% |
| 90 days | 24.06% |

Feature Matrix:
- 319,816 rows x 333 columns
- File: data/features/ml_feature_matrix.parquet (1.39 GB)

---

## Technology Stack

Frontend:
- React.js (Vite)
- React Router DOM
- Tailwind CSS
- Axios
- Recharts
- React Leaflet

Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose
- Nodemon

ML Engine:
- Python
- CatBoost
- Pandas, NumPy, Scikit-learn
- Prophet, XGBoost, LightGBM (for comparison)

Live Data APIs:
- MarineTraffic (AIS vessel positions)
- IMD / NOAA (weather alerts)
- Bunker Fuel API (VLSFO/HSFO prices)
- Port Congestion API (waiting days)

---

## Project Structure

    BulkMatrix/
    ├── backend/                          # Node.js + Express
    │   ├── config/db.js
    │   ├── controllers/
    │   ├── routes/
    │   ├── services/
    │   ├── server.js
    │   └── package.json
    ├── frontend/                         # React + Vite
    │   ├── src/
    │   │   ├── pages/
    │   │   └── services/
    │   └── package.json
    ├── models/                           # ML models
    │   ├── regularized/                  # 168 CatBoost models
    │   ├── archived/
    │   └── metadata/
    ├── data/
    │   ├── raw/                          # 15 CSV datasets
    │   ├── processed/
    │   └── features/
    ├── src/                              # Python ML code
    │   ├── model_loader.py
    │   ├── prediction_pipeline.py
    │   └── charter_engine.py
    ├── docker-compose.yml
    └── README.md

---

## Setup and Installation

Prerequisites:
- Node.js v18+
- Python 3.10+
- MongoDB (local or Atlas)
- Git

Frontend Setup:

    cd frontend
    npm install
    npm run dev

Starts Vite dev server at http://localhost:5173

Backend Setup:

    cd backend
    npm install
    npm run dev

Starts Nodemon server at http://localhost:5000

ML Engine Setup:

    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt

    python -m src.prediction_pipeline
    python -m src.charter_engine

Docker Setup:

    docker-compose up --build

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/charter/recommendation | Get charter recommendation |
| POST | /api/charter/forecast | Forecast freight rate |
| GET | /api/ports | All ports |
| GET | /api/ports/origins | Loading ports |
| GET | /api/ports/destinations | Discharge ports |
| GET | /api/routes | All trade routes |
| GET | /api/kpis | Global KPIs |
| GET | /api/fleet | Active fleet (AIS) |
| GET | /api/vessel/:id | Vessel detail |
| GET | /api/analytics/* | Analytics endpoints |

---

## Master Dataset Reference

| # | Dataset File | Category | Purpose |
|---|--------------|----------|---------|
| 1 | dataset_1_freight_bdi_daily.csv | Freight Index | Daily BDI 2011-2026 |
| 2 | dataset_1_freight_vessel_proxies.csv | Freight Index | Capesize/Panamax/Supramax proxies |
| 3 | dataset_2_macro_brent_oil_daily.csv | Commodity | Brent crude prices |
| 4 | dataset_2_macro_coal_newcastle_daily.csv | Commodity | Newcastle coal prices |
| 5 | dataset_2_macro_dxy_usd_index.csv | Macro | US Dollar Index |
| 6 | dataset_2_macro_iron_ore_daily.csv | Commodity | Iron ore 62% Fe CFR |
| 7 | dataset_2_macro_usd_inr_daily.csv | Macro | USD/INR exchange rate |
| 8 | dataset_3_port_infrastructure_rules.csv | Port Constraints | Port limits (15 ports) |
| 9 | dataset_4_vessel_specifications.csv | Vessel Specs | Vessel class specs |
| 10 | dataset_5_port_traffic_timeseries.csv | Congestion | Waiting days + berth occupancy |
| 11 | dataset_6_weather_risk_flags.csv | Weather | Monsoon/cyclone risk |
| 12 | dataset_7_route_distances.csv | Route Data | Nautical miles (56 routes) |
| 13 | dataset_8_disruption_events.csv | Disruptions | Cyclone/strike event log |
| 14 | dataset_9_bunker_fuel_prices.csv | Fuel | VLSFO/HSFO Singapore prices |
| 15 | dataset_10_fx_rates.csv | FX | USD/INR daily |

---

## Vessel Specifications

Vessel Class Overview:

| Class | DWT Range | Typical Cargo | Primary Use |
|-------|-----------|---------------|-------------|
| Handysize | 25,000 - 40,000 | Coal, grain, minor bulks | Small ports, shallow draft |
| Supramax | 50,000 - 64,000 | Coal, iron ore, grain | Flexible, geared vessels |
| Panamax | 65,000 - 82,000 | Coal, iron ore, grain | Panama Canal max dimensions |
| Capesize | 150,000 - 180,000 | Iron ore, coal | Deep-water ports only |

Master Comparison Table:

| Specification | Handysize | Supramax | Panamax | Capesize |
|---------------|-----------|----------|---------|----------|
| DWT Min | 25,000 | 50,000 | 65,000 | 150,000 |
| DWT Max | 40,000 | 64,000 | 82,000 | 180,000 |
| Draft (m) | 9.5 | 12.2 | 14.0 | 18.0 |
| LOA (m) | 170 | 195 | 225 | 290 |
| Beam (m) | 27.0 | 32.2 | 32.3 | 45.0 |
| Speed (knots) | 13.0 | 14.0 | 14.0 | 14.5 |
| Fuel (t/day) | 18.0 | 25.0 | 32.0 | 45.0 |
| Best For | Shallow ports | Flexible routes | Medium ports | Deep-water ports |

Vessel-Port Feasibility Matrix:

| Port | Max Draft | Max LOA | Max Beam | Handysize | Supramax | Panamax | Capesize |
|------|-----------|---------|----------|-----------|----------|---------|----------|
| Paradip | 16.5 m | 300 m | 46 m | Yes | Yes | Yes | Yes (restricted) |
| Visakhapatnam (Inner) | 14.5 m | 240 m | 32.5 m | Yes | Yes | Yes | No |
| Visakhapatnam (Outer/VGCB) | 18.1 m | 356 m | 50 m | Yes | Yes | Yes | Yes |
| Gangavaram | 19.5 m | 320 m | 48 m | Yes | Yes | Yes | Yes |
| Dhamra | 18.0 m | 310 m | 48 m | Yes | Yes | Yes | Yes |
| Gopalpur | 14.5 m | 230 m | 33 m | Yes | Yes | No | No |
| Haldia Dock Complex | 8.5 m | 230 m | 32.26 m | Yes | No | No | No |

---

## Voyage Cost Estimation

| Vessel | Daily Fuel (t) | 14-day Voyage (t) | Cost at $620/t (VLSFO) |
|--------|----------------|-------------------|------------------------|
| Handysize | 18.0 | 252 | $156,240 |
| Supramax | 25.0 | 350 | $217,000 |
| Panamax | 32.0 | 448 | $277,760 |
| Capesize | 45.0 | 630 | $390,600 |

---

## Model Performance

Final Per-Route CatBoost Results:

| Horizon | Average MAPE |
|---------|--------------|
| 15 days | 21.51% |
| 30 days | 27.50% |
| 90 days | 24.06% |

Model Selection:

| Decision | Reason |
|----------|--------|
| Model | Per-Route CatBoost |
| Parameters | Regularized (iter=500, depth=6, l2=3, lr=0.05) |
| Number of Models | 168 (56 routes x 3 horizons) |
| Global Model | Rejected (overfit, unrealistic MAPE ~2%) |

---

## Owner Matching Engine

Ranks vessel owners based on:

| # | Parameter | Weight |
|---|-----------|--------|
| 1 | Class Match | 30% |
| 2 | Availability | 25% |
| 3 | Fleet Size in Class | 15% |
| 4 | Owner Rating | 10% |
| 5 | Response Rate | 8% |
| 6 | Geographic Preference | 5% |
| 7 | Insurance Status | 4% |
| 8 | Last Activity | 3% |

---

## Availability Locking

When a deal is confirmed:

    vessel_id: V123
    busy_from: 2026-10-01
    busy_to: 2026-10-15
    status: ON_CHARTER

Next time -> filtered out of owner list -> prevents double-booking.

---

## Future Roadmap

| Feature | Status |
|---------|--------|
| WebSocket real-time notifications | Planned |
| Digital contract signing | Planned |
| Payment integration | Planned |
| Owner analytics dashboard | Planned |
| Admin panel | Planned |
| KYC / Document upload | Planned |
| Multi-currency support | Planned |

---

## License

MIT License — see LICENSE for details.

---

## Contributors

- Avishek — Full-stack & ML
- Ayush — Backend

---

## Contact

GitHub: https://github.com/avishek-2748/BulkMatrix

---

Built with love for India's bulk importers.