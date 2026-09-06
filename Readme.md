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
