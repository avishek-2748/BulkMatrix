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


# 🚢 Vessel Size Specifications — BulkMatrix

Complete technical reference for all dry bulk vessel classes used in the BulkMatrix charter optimization engine.

---

## 📊 Vessel Class Overview

| Class | DWT Range | Typical Cargo | Primary Use |
|-------|-----------|---------------|-------------|
| **Handysize** | 25,000 – 40,000 | Coal, grain, minor bulks | Small ports, shallow draft |
| **Supramax** | 50,000 – 64,000 | Coal, iron ore, grain | Flexible, geared vessels |
| **Panamax** | 65,000 – 82,000 | Coal, iron ore, grain | Panama Canal max dimensions |
| **Capesize** | 150,000 – 180,000 | Iron ore, coal | Deep-water ports only |

---

## 1️⃣ Handysize

| Specification | Value |
|---------------|-------|
| **DWT Range** | 25,000 – 40,000 tonnes |
| **Typical Draft** | 9.5 m |
| **Length Overall (LOA)** | 170 m |
| **Beam** | 27.0 m |
| **Average Speed** | 13.0 knots |
| **Daily Fuel Consumption** | 18.0 tonnes/day |
| **Ports Accessible** | Haldia, Gopalpur (smaller Indian ports) |
| **Example Routes** | Indonesia → Haldia, Mozambique → Gopalpur |
| **Advantages** | Can enter shallow ports; flexible |
| **Limitations** | Small cargo capacity; less economical for long hauls |

---

## 2️⃣ Supramax

| Specification | Value |
|---------------|-------|
| **DWT Range** | 50,000 – 64,000 tonnes |
| **Typical Draft** | 12.2 m |
| **Length Overall (LOA)** | 195 m |
| **Beam** | 32.2 m |
| **Average Speed** | 14.0 knots |
| **Daily Fuel Consumption** | 25.0 tonnes/day |
| **Ports Accessible** | Gopalpur, Visakhapatnam (Inner), Haldia (restricted) |
| **Example Routes** | Indonesia → Gopalpur, South Africa → Vizag |
| **Advantages** | Geared (self-loading/unloading); flexible |
| **Limitations** | Not suitable for Capesize-only ports |

---

## 3️⃣ Panamax

| Specification | Value |
|---------------|-------|
| **DWT Range** | 65,000 – 82,000 tonnes |
| **Typical Draft** | 14.0 m |
| **Length Overall (LOA)** | 225 m |
| **Beam** | 32.3 m |
| **Average Speed** | 14.0 knots |
| **Daily Fuel Consumption** | 32.0 tonnes/day |
| **Ports Accessible** | Visakhapatnam (Inner), Gopalpur, Paradip (restricted) |
| **Example Routes** | Australia → Vizag, Indonesia → Paradip |
| **Advantages** | Fits Panama Canal; good capacity |
| **Limitations** | Draft too deep for Haldia |

---

## 4️⃣ Capesize

| Specification | Value |
|---------------|-------|
| **DWT Range** | 150,000 – 180,000 tonnes |
| **Typical Draft** | 18.0 m |
| **Length Overall (LOA)** | 290 m |
| **Beam** | 45.0 m |
| **Average Speed** | 14.5 knots |
| **Daily Fuel Consumption** | 45.0 tonnes/day |
| **Ports Accessible** | Paradip (restricted), Vizag (Outer/VGCB), Gangavaram, Dhamra |
| **Example Routes** | Australia → Gangavaram, Brazil → Paradip |
| **Advantages** | Lowest cost per tonne for long hauls |
| **Limitations** | Cannot enter Haldia (draft 8.5 m) or inner harbors |

---

## 📋 Master Comparison Table

| Specification | Handysize | Supramax | Panamax | Capesize |
|---------------|-----------|----------|---------|----------|
| **DWT Min** | 25,000 | 50,000 | 65,000 | 150,000 |
| **DWT Max** | 40,000 | 64,000 | 82,000 | 180,000 |
| **Draft (m)** | 9.5 | 12.2 | 14.0 | 18.0 |
| **LOA (m)** | 170 | 195 | 225 | 290 |
| **Beam (m)** | 27.0 | 32.2 | 32.3 | 45.0 |
| **Speed (knots)** | 13.0 | 14.0 | 14.0 | 14.5 |
| **Fuel (t/day)** | 18.0 | 25.0 | 32.0 | 45.0 |
| **Cargo Example** | 30,000 t coal | 60,000 t coal | 75,000 t coal | 150,000 t coal |
| **Best For** | Shallow ports | Flexible routes | Medium ports | Deep-water ports |

---

## 🎯 Vessel–Port Feasibility Matrix

| Port | Max Draft | Max LOA | Max Beam | Handysize | Supramax | Panamax | Capesize |
|------|-----------|---------|----------|-----------|----------|---------|----------|
| **Paradip** | 16.5 m | 300 m | 46 m | ✅ | ✅ | ✅ | ✅ (restricted) |
| **Visakhapatnam (Inner)** | 14.5 m | 240 m | 32.5 m | ✅ | ✅ | ✅ | ❌ |
| **Visakhapatnam (Outer/VGCB)** | 18.1 m | 356 m | 50 m | ✅ | ✅ | ✅ | ✅ |
| **Gangavaram** | 19.5 m | 320 m | 48 m | ✅ | ✅ | ✅ | ✅ |
| **Dhamra** | 18.0 m | 310 m | 48 m | ✅ | ✅ | ✅ | ✅ |
| **Gopalpur** | 14.5 m | 230 m | 33 m | ✅ | ✅ | ❌ | ❌ |
| **Haldia Dock Complex** | 8.5 m | 230 m | 32.26 m | ✅ | ❌ | ❌ | ❌ |

---

## 💰 Fuel Consumption & Cost Estimation

| Vessel | Daily Fuel (t) | 14-day Voyage (t) | Cost @ $620/t (VLSFO) |
|--------|----------------|-------------------|-----------------------|
| **Handysize** | 18.0 | 252 | $156,240 |
| **Supramax** | 25.0 | 350 | $217,000 |
| **Panamax** | 32.0 | 448 | $277,760 |
| **Capesize** | 45.0 | 630 | $390,600 |