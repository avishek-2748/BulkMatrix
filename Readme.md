# BULKMATRIX — FREIGHT FORECASTING & CHARTERING DASHBOARD

## Overview
BulkMatrix is a production-style full-stack decision-support dashboard for Freight Forecasting & Chartering of Bulk Cargo. It helps logistics managers make data-driven decisions on vessel chartering, port selection, forecasting freight rates, and mitigating weather or congestion risks.

## Architecture
```text
React Frontend
       ↓
Node.js + Express Backend
       ↓
MongoDB / CSV / Mock Data
       ↓
External ML API (Future Integration)
```

## Technology Stack
- **Frontend**: React.js, Vite, React Router DOM, Tailwind CSS, Axios, Recharts, React Leaflet
- **Backend**: Node.js, Express.js, MongoDB, Mongoose

## Setup and Installation

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

## Development Commands
- `npm run dev` in frontend/ will start the Vite dev server at `http://localhost:5173`.
- `npm run dev` in backend/ will start the Nodemon server at `http://localhost:5000`.

## API Architecture
The frontend only communicates with the Node.js backend. The Node.js backend acts as an abstraction layer, interacting with mock data, database, or the external ML API without requiring frontend architectural changes.

# BulkMatrix — Master Dataset Reference

| # | Dataset File | Category | Purpose | Why We Used It |
|---|--------------|----------|---------|----------------|
| 1 | dataset_1_freight_bdi_daily.csv | Freight Index | Daily Baltic Dry Index (BDI) values from 2011–2026 | Primary forecasting target |
| 2 | dataset_1_freight_vessel_proxies.csv | Freight Index | Daily proxy values for Capesize/Panamax/Supramax | Vessel-class signals |
| 3 | dataset_2_macro_brent_oil_daily.csv | Commodity | Daily Brent crude oil prices | Fuel cost driver |
| 4 | dataset_2_macro_coal_newcastle_daily.csv | Commodity | Daily Newcastle thermal coal prices | Cargo demand signal |
| 5 | dataset_2_macro_dxy_usd_index.csv | Macro | Daily US Dollar Index (DXY) | Currency strength indicator |
| 6 | dataset_2_macro_iron_ore_daily.csv | Commodity | Daily iron ore 62% Fe CFR prices | Cargo demand signal |
| 7 | dataset_2_macro_usd_inr_daily.csv | Macro | Daily USD/INR exchange rate | INR cost conversion |
| 8 | dataset_3_port_infrastructure_rules.csv | Port Constraints | Static port limits for 15 ports | Hard feasibility check |
| 9 | dataset_4_vessel_specifications.csv | Vessel Specs | Static vessel class specs | Cargo-vessel matching |
| 10 | dataset_5_port_traffic_timeseries.csv | Congestion | Daily waiting days and berth occupancy | Idle time estimation |
| 11 | dataset_6_weather_risk_flags.csv | Weather | Daily monsoon/cyclone risk levels | Risk alerts |
| 12 | dataset_7_route_distances.csv | Route Data | Static origin-destination nautical miles | Sailing time and fuel estimation |
| 13 | dataset_8_disruption_events.csv | Disruptions | Event log of cyclones strikes port closures | Backtesting and risk windows |
| 14 | dataset_9_bunker_fuel_prices.csv | Fuel | Daily Singapore VLSFO and HSFO prices | Voyage cost estimation |
| 15 | dataset_10_fx_rates.csv | FX | USD/INR exchange rate | INR cost conversion |
