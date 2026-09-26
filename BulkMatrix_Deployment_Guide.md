# BulkMatrix — Production Deployment & DevOps Engineering Guide

> **Author:** Senior Full-Stack DevOps & Infrastructure Architect  
> **Platform:** BulkMatrix — Intelligent Freight Forecasting and Vessel Chartering  
> **Target Environment:** Multi-tier Cloud Architecture (Vercel + Render / Docker + MongoDB Atlas)  
> **Date:** September 2026  
> **Target Audience:** DevOps Engineers, Lead Architects, Full-Stack Developers  

---

## Table of Contents
1. [⚠️ Deployment Issues Found in Current Codebase](#-deployment-issues-found-in-current-codebase)
2. [1. Project Deployment Analysis](#1-project-deployment-analysis)
3. [2. Recommended Production Architecture](#2-recommended-production-architecture)
4. [3. Step-by-Step Deployment Guide (From Zero)](#3-step-by-step-deployment-guide-from-zero)
5. [4. Backend Environment Variables Reference](#4-backend-environment-variables-reference)
6. [5. CORS, Authentication, JWT & Cookie Configuration](#5-cors-authentication-jwt--cookie-configuration)
7. [6. Frontend Deployment (Vercel)](#6-frontend-deployment-vercel)
8. [7. External APIs & Third-Party Services](#7-external-apis--third-party-services)
9. [8. BulkMatrix Specific Features Analysis](#8-bulkmatrix-specific-features-analysis)
10. [9. AI / ML Model Deployment Architecture](#9-ai--ml-model-deployment-architecture)
11. [10. Production Environment Variables Checklist](#10-production-environment-variables-checklist)
12. [11. Recommended Deployment Sequence](#11-recommended-deployment-sequence)
13. [12. Production Verification & Testing Checklist](#12-production-verification--testing-checklist)
14. [13. Common Deployment Errors & Troubleshooting](#13-common-deployment-errors--troubleshooting)
15. [14. Local vs. Production Comparison Matrix](#14-local-vs-production-comparison-matrix)
16. [15. Production Security & Hardening Checklist](#15-production-security--hardening-checklist)
17. [16. Custom Domain & DNS Configuration](#16-custom-domain--dns-configuration)
18. [17. Final Pre-Flight Deployment Checklist](#17-final-pre-flight-deployment-checklist)

---

## ⚠️ Deployment Issues Found in Current Codebase

During the end-to-end architectural and configuration audit, the following configuration discrepancies were detected in the codebase:

### Issue 1: Missing FastAPI & Uvicorn in ML Requirements
- **File:** `requirement.txt` and `Dockerfile.ml`
- **Current Configuration:** `backend/main.py` explicitly imports `fastapi`, `uvicorn`, and `pydantic`. `Dockerfile.ml` executes `pip install -r requirement.txt` and starts `CMD ["uvicorn", "backend.main:app", ...]`. However, `fastapi`, `uvicorn`, and `pydantic` were omitted from `requirement.txt`.
- **Problem:** Any build of the Python ML microservice via Docker or cloud provider fails immediately during image compilation or container start.
- **Required Change:** Ensure `fastapi>=0.100.0`, `uvicorn>=0.23.0`, and `pydantic>=2.0.0` are present in `requirement.txt`.
- **Why Required:** The Python prediction API cannot launch without its web server framework dependencies.

### Issue 2: Variable Inconsistency (`FRONTEND_URL` vs. `CLIENT_URL`)
- **File:** `backend/server.js` (line 34) vs. `backend/services/emailService.js` (line 15)
- **Current Configuration:** `backend/server.js` reads `process.env.FRONTEND_URL` for CORS origins. `backend/services/emailService.js` reads `process.env.CLIENT_URL` to generate email verification links.
- **Problem:** If a DevOps engineer sets only `FRONTEND_URL` on Render, account verification emails will generate URLs pointing to `http://localhost:5173/verify-email?token=...`, rendering email verification inoperative for live users.
- **Required Change:** Set **both** `FRONTEND_URL` and `CLIENT_URL` to the production frontend domain (or update `emailService.js` to fall back to `process.env.FRONTEND_URL`).
- **Why Required:** Guarantees cross-origin requests succeed and user registration verification emails link to the live production domain.

### Issue 3: CORS Trailing Slash Sensitivity
- **File:** `backend/server.js` (lines 31–47)
- **Current Configuration:**
  ```javascript
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL,
  ].filter(Boolean);
  ```
- **Problem:** Browsers send origin headers **without** trailing slashes (e.g. `https://bulkmatrix.vercel.app`). If `FRONTEND_URL` is configured in Render as `https://bulkmatrix.vercel.app/` (with trailing slash), strict string matching will evaluate to `false` and trigger `Not allowed by CORS`.
- **Required Change:** When defining `FRONTEND_URL` in environment variables, **never include a trailing slash**.

### Issue 4: Local `.env` Secrets Exposure Risk
- **File:** `backend/.env`
- **Current Configuration:** Contains a live development MongoDB Atlas connection string with credentials.
- **Problem:** If `.env` is committed to GitHub, database credentials will be exposed to public or unauthorized repository collaborators.
- **Required Change:** Ensure `backend/.env` and `frontend/.env` are strictly listed in `.gitignore`. Provide clean `.env.example` templates with empty placeholders.

---

## 1. Project Deployment Analysis

### Frontend
- **Framework & Version:** React 19 (`react@19.2.8`, `react-dom@19.2.8`)
- **Build Tool:** Vite 8 (`vite@8.2.2`, `@vitejs/plugin-react@6.1.0`)
- **Styling Engine:** Tailwind CSS v4 (`@tailwindcss/vite@4.3.3`, `tailwindcss@4.3.3`, `postcss`, `autoprefixer`)
- **Package Manager:** `npm` (manifest: `frontend/package.json`, lockfile: `frontend/package-lock.json`)
- **Build Command:** `npm run build` (outputs optimized static assets to `frontend/dist/`)
- **Development Command:** `npm run dev` (starts local dev server on port 5173)
- **Production Asset Output:** `dist/` (client-side Single Page Application comprising `index.html`, minified JS chunks, and CSS assets)
- **Required Environment Variables:**
  - `VITE_API_BASE_URL`: Base URL of the deployed Express backend (e.g., `https://bulkmatrix-api.onrender.com/api`)
  - `VITE_USD_INR_RATE`: (Optional) Currency conversion multiplier for Indian Rupee freight calculations (defaults to `83.5` if omitted)
- **API Base URL Configuration:** Defined in `frontend/src/services/api.js`:
  ```javascript
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
  });
  ```
- **Routing & Navigation:** `react-router-dom@7.18.3`. Requires SPA rewrite rule (`/* -> /index.html`) on hosting providers to prevent 404 errors on deep page refreshes.

### Backend
- **Framework & Runtime:** Node.js (v18.x or v20.x recommended, ES Modules enabled via `"type": "module"`) with Express 5 (`express@5.2.1`)
- **Package Manager:** `npm` (manifest: `backend/package.json`, lockfile: `backend/package-lock.json`)
- **Start Command:** `npm start` (`node server.js`)
- **Development Command:** `npm run dev` (`nodemon server.js`)
- **Port Configuration:** `const PORT = process.env.PORT || 5000;` (automatically adapts to cloud host port injection such as Render's dynamic `$PORT`)
- **Database Connector:** `mongoose@9.9.5` and native `mongodb@7.6.0` driver
- **Authentication:** `jsonwebtoken@9.0.3` (30-day expiration), `bcrypt@6.0.0` (salted password hashing)
- **Middleware:** `cors@2.8.6`, `cookie-parser@1.4.7`, `express.json()`
- **All Registered API Routes:**
  1. `/api/auth` &rarr; `authRoutes.js` (Signup, Login, Verify Email, Profile, Current User)
  2. `/api/dashboard` &rarr; `dashboardRoutes.js` (High-level procurement KPIs)
  3. `/api/charter` &rarr; `charterRoutes.js` (Recommendation generation, contract mapping)
  4. `/api/fleet` &rarr; `fleetRoutes.js` (Fleet listings, vessel specifications)
  5. `/api/analytics` &rarr; `analyticsRoutes.js` (Freight trends, port congestion, FX data, scenario simulation)
  6. `/api/market-analysis` &rarr; `marketAnalysisRoutes.js` (BDI indices, fuel bunker curves)
  7. `/api/admin` &rarr; `adminRoutes.js` (User management, system health)
  8. `/api/weather` &rarr; `weatherRoutes.js` (Ports catalog, real-time marine weather, 16-day forecasts)
  9. `/api/owner` &rarr; `ownerRoutes.js` (Vessel owner fleet management)
  10. `/api/vessels` &rarr; `vesselRoutes.js` (Vessel registration, technical parameters)
  11. `/api/contracts` &rarr; `contractRoutes.js` (Charter contract lifecycle, signature records)
  12. `/api/chat` &rarr; `chatRoutes.js` (Contract negotiation messaging)
  13. `/api/availability` &rarr; `availabilityRoutes.js` (Vessel laycan availability windows)
  14. `/api/ais` &rarr; `aisRoutes.js` (Live vessel telemetry along East Coast trade corridors)
  15. `/api/notifications` &rarr; `notificationRoutes.js` (In-app notifications)

### Database
- **Database Engine:** MongoDB (v6.0+ or MongoDB Atlas Cloud)
- **Object Data Modeling (ODM):** Mongoose v9
- **Database Name:** Default is `BulkMatrix` (derived from connection URI)
- **Connection Logic:** Implemented in `backend/config/db.js`:
  ```javascript
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bulkmatrix';
  ```
- **Network / IP Access:** Requires whitelisting the deployment host IPs or adding `0.0.0.0/0` (with strict password authentication) on MongoDB Atlas.
- **Data Persistence:** 16 Mongoose models handle all operational persistence. Mock data fallback services exist for demo resilience if ML service or MongoDB is unreachable.

---

## 2. Recommended Production Architecture

```
                                 [ USER BROWSER ]
                                        │
                         HTTPS Requests │ (Vite Single Page App)
                                        ▼
                   ┌─────────────────────────────────────────┐
                   │        FRONTEND HOSTING (Vercel)        │
                   │   Global Edge CDN • Automatic SSL       │
                   │   URL: https://bulkmatrix.vercel.app    │
                   └────────────────────┬────────────────────┘
                                        │
           REST API Requests via Axios  │ (Authorization: Bearer <JWT>)
           CORS Validated               │
                                        ▼
                   ┌─────────────────────────────────────────┐
                   │        BACKEND API GATEWAY (Render)     │
                   │   Node.js 20 + Express 5                │
                   │   URL: https://bulkmatrix-api.onrender  │
                   └──────────┬────────────────────┬─────────┘
                              │                    │
          Mongoose Connection │                    │ HTTP Proxy (Internal / Port 8000)
       (TLS / mongodb+srv://) │                    │
                              ▼                    ▼
     ┌──────────────────────────────┐    ┌───────────────────────────────────┐
     │    MONGODB ATLAS CLUSTER     │    │   PYTHON ML ENGINE (Render/Docker)│
     │   Managed Database Tier      │    │   FastAPI + CatBoost + Scikit-Learn│
     │   16 Data Collections        │    │   168 Pre-trained .pkl Models     │
     └──────────────────────────────┘    └─────────────────┬─────────────────┘
                                                           │
                                                           ▼
                                         ┌───────────────────────────────────┐
                                         │       EXTERNAL OPEN APIS          │
                                         │   api.open-meteo.com (Weather)    │
                                         │   marine-api.open-meteo.com(Waves)│
                                         └───────────────────────────────────┘
```

### Why This Architecture Fits BulkMatrix:
1. **Frontend on Vercel:** React 19 + Vite produces static client-side bundles. Vercel deploys them across edge locations worldwide with instantaneous cache invalidation, free SSL, and zero cold-start delay.
2. **Backend API Gateway on Render:** The Express server handles JWT verification, RBAC, business logic, and database operations. Render provides managed Node.js web services with automated GitHub deployment and TLS termination.
3. **ML Forecasting Engine on Render (Docker) / Cloud Container:** The Python service loads 168 pre-trained CatBoost models (totalling ~20MB of binary pickle data). Packaging this with Docker guarantees all native C++ libraries (OpenMP, CatBoost) run without version incompatibilities.
4. **Resilient Fallback Design:** If the ML service is under maintenance, `backend/services/mlService.js` automatically falls back to `backend/services/mockDataService.js`, guaranteeing zero downtime for the frontend chartering console.

---

## 3. Step-by-Step Deployment Guide (From Zero)

### STEP 1 — Prepare the GitHub Repository

1. **Verify `.gitignore` Coverage:**  
   Ensure that the root, backend, and frontend `.gitignore` files exclude all build artifacts, sensitive keys, and dependencies:
   ```gitignore
   # Dependencies
   node_modules/
   __pycache__/
   *.pyc

   # Environment Files
   .env
   .env.local
   .env.*.local
   backend/.env
   frontend/.env

   # Build Output
   dist/
   build/
   catboost_info/

   # OS Files
   .DS_Store
   Thumbs.db
   ```

2. **Audit for Accidentally Committed Secrets:**  
   Run a Git check in your terminal to ensure no `.env` files are tracked:
   ```bash
   git status
   git ls-files | grep -i "\.env"
   ```
   If any `.env` file appears, untrack it immediately:
   ```bash
   git rm --cached backend/.env frontend/.env
   git commit -m "chore: remove sensitive environment files from tracking"
   ```

3. **Push to Remote Repository:**  
   Push the validated codebase to GitHub:
   ```bash
   git add .
   git commit -m "feat: production readiness configuration"
   git push origin main
   ```

---

### STEP 2 — Deploy MongoDB Atlas

1. **Create Account & Organization:**  
   Navigate to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create or log in to your account.

2. **Deploy a Free/Shared Cluster (M0 Sandbox):**  
   - Select **Shared Cluster (Free M0)**.
   - Provider: **AWS** or **GCP**.
   - Region: Select a region close to your primary operations (e.g., `ap-south-1` Mumbai for India).
   - Cluster Name: `BulkMatrixCluster`.

3. **Configure Database Credentials:**  
   - Navigate to **Security &rarr; Database Access**.
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: e.g., `bulkmatrix_admin`.
   - Password: Click **Autogenerate Secure Password** (copy and save this securely).
   - Database User Privileges: **Read and write to any database**.

4. **Configure Network Access (Firewall):**  
   - Navigate to **Security &rarr; Network Access**.
   - Click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) since cloud hosting providers (Render, Vercel) use dynamic outgoing IP ranges.
   - Comment: `Production Cloud Access`.
   - Click **Confirm**.

5. **Obtain Connection String:**  
   - Click **Databases &rarr; Connect**.
   - Choose **Drivers** (Node.js, Version 5.5 or later).
   - Copy the connection string format:
     ```
     mongodb+srv://bulkmatrix_admin:<password>@bulkmatrixcluster.xxxxx.mongodb.net/BulkMatrix?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your generated password, and specify the database name `/BulkMatrix`.

---

### STEP 3 — Deploy Backend on Render

1. **Sign Up / Log In to Render:**  
   Visit [render.com](https://render.com) and link your GitHub account.

2. **Create New Web Service:**  
   - Click **New + &rarr; Web Service**.
   - Select **Build and deploy from a Git repository**.
   - Choose your `BulkMatrix` repository.

3. **Configure Service Settings:**
   | Setting | Value |
   | :--- | :--- |
   | **Name** | `bulkmatrix-backend-api` |
   | **Region** | Singapore (`Singapore`) or Frankfurt (closest to DB cluster) |
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` (or `node server.js`) |
   | **Plan Type** | `Free` (or `Starter` for persistent non-spinning instances) |

4. **Inject Environment Variables:**  
   Click **Advanced &rarr; Add Environment Variable** and provide the following:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://bulkmatrix_admin:YOUR_PASSWORD@bulkmatrixcluster.xxxxx.mongodb.net/BulkMatrix?retryWrites=true&w=majority
   JWT_SECRET=production_super_secret_jwt_key_bulkmatrix_2026
   FRONTEND_URL=https://bulkmatrix.vercel.app
   CLIENT_URL=https://bulkmatrix.vercel.app
   ML_API_URL=http://localhost:8000
   ```
   *(Note: Set `FRONTEND_URL` to your actual Vercel domain once generated in Step 4).*

5. **Deploy & Validate:**  
   Click **Create Web Service**. Wait for the build logs to display:
   ```
   ==> Starting service with 'node server.js'
   🚀 Server running on port 5000
   🔑 JWT_SECRET loaded: true
   🌍 Allowed origins: [ 'http://localhost:5173', 'http://localhost:5174', 'https://bulkmatrix.vercel.app' ]
   ✅ MongoDB Connected: bulkmatrixcluster-shard-00-00.xxxxx.mongodb.net
   ```
6. **Copy Backend URL:**  
   Copy the live URL assigned by Render (e.g., `https://bulkmatrix-backend-api.onrender.com`).

---

### STEP 4 — Deploy Python ML Service (Optional / Containerized)

If deploying the ML engine as a live standalone microservice alongside Node.js:

1. **On Render (New Web Service via Docker):**
   - Click **New + &rarr; Web Service**.
   - Select repository `BulkMatrix`.
   - **Root Directory:** Leave blank (root).
   - **Environment:** `Docker`.
   - **Dockerfile Path:** `./Dockerfile.ml`.
   - **Port:** `8000`.
2. **Environment Variables:**
   ```env
   PORT=8000
   ```
3. **Connect to Backend:**  
   Once the ML service is deployed (e.g., `https://bulkmatrix-ml.onrender.com`), update `ML_API_URL` in the backend service variables to `https://bulkmatrix-ml.onrender.com`.

*(Note: If you do not deploy the Python container immediately, the Node.js backend will run safely with its built-in automated mock forecasting fallback without crashing).*

---

### STEP 5 — Deploy Frontend on Vercel

1. **Sign In to Vercel:**  
   Navigate to [vercel.com](https://vercel.com) and log in with your GitHub account.

2. **Import Project:**  
   - Click **Add New... &rarr; Project**.
   - Select your `BulkMatrix` GitHub repository.

3. **Configure Project Settings:**
   - **Framework Preset:** `Vite` (Vercel detects Vite automatically).
   - **Root Directory:** Click **Edit** and select `frontend`.
   - **Build and Output Settings:**
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

4. **Set Production Environment Variables:**  
   Under **Environment Variables**, add:
   ```env
   VITE_API_BASE_URL=https://bulkmatrix-backend-api.onrender.com/api
   VITE_USD_INR_RATE=83.50
   ```
   *(Ensure `VITE_API_BASE_URL` contains `/api` at the end to match Express route mounting).*

5. **Deploy:**  
   Click **Deploy**. Vercel will install dependencies, compile the Tailwind CSS utilities, bundle the React chunks, and output the production deployment.

6. **Add SPA Fallback Configuration:**  
   To guarantee that direct navigation to subpages (e.g., `/charter-planner`, `/market-analysis`) does not throw a 404, verify that `frontend/vercel.json` exists with the following routing rewrite:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

7. **Synchronize CORS on Backend:**  
   Copy your assigned Vercel URL (e.g., `https://bulkmatrix.vercel.app`) and verify that it matches `FRONTEND_URL` and `CLIENT_URL` inside your Render Backend Environment Variables.

---

## 4. Backend Environment Variables Reference

The following environment variables were discovered and audited across the entire backend codebase:

| Variable | Required? | Default / Fallback | Codebase Location | Purpose | Example Production Value |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `NODE_ENV` | **Yes** | `development` | `backend/server.js` | Sets runtime optimizations | `production` |
| `PORT` | **Yes** | `5000` | `backend/server.js` | Listening HTTP port for Express | `5000` (or dynamically set by cloud host) |
| `MONGODB_URI` | **Yes** | `mongodb://127.0.0.1:27017/bulkmatrix` | `backend/config/db.js` | MongoDB Atlas TLS connection string | `mongodb+srv://admin:pass@cluster.mongodb.net/BulkMatrix` |
| `MONGO_URI` | No | None | `backend/config/db.js` | Alternative fallback variable for Mongo | `mongodb+srv://admin:pass@cluster.mongodb.net/BulkMatrix` |
| `JWT_SECRET` | **Yes** | None (Throws error in `User.js`) | `backend/models/User.js`, `backend/middleware/authMiddleware.js` | Cryptographic secret for signing auth tokens | `c87f9b4d13e01a2c5f789d6e4b1a3c5e7d9...` (minimum 32 chars) |
| `FRONTEND_URL` | **Yes** | None | `backend/server.js` | Whitelisted browser origin for CORS headers | `https://bulkmatrix.vercel.app` *(NO trailing slash)* |
| `CLIENT_URL` | **Yes** | `http://localhost:5173` | `backend/services/emailService.js` | Base domain for user email verification links | `https://bulkmatrix.vercel.app` |
| `ML_API_URL` | No | `http://localhost:8000` | `backend/services/mlService.js`, `backend/controllers/analyticsController.js` | Internal address of the Python FastAPI engine | `https://bulkmatrix-ml.onrender.com` |
| `SMTP_HOST` | No | `smtp.ethereal.email` | `backend/services/emailService.js` | Production SMTP mail server hostname | `smtp.sendgrid.net` or `smtp.mailgun.org` |
| `SMTP_PORT` | No | `587` | `backend/services/emailService.js` | SMTP port (typically 587 or 465) | `587` |
| `SMTP_USER` | No | None | `backend/services/emailService.js` | Username/API key for SMTP service | `apikey` |
| `SMTP_PASS` | No | None | `backend/services/emailService.js` | Password/Secret for SMTP service | `SG.xxxxxxxxxxxxxxxx` |
| `SMTP_FROM` | No | `noreply@bulkmatrix.com`| `backend/services/emailService.js` | Sender email address in verification headers | `"BulkMatrix Support" <noreply@bulkmatrix.com>` |

---

## 5. CORS, Authentication, JWT & Cookie Configuration

### Authentication Flow Architecture
BulkMatrix uses a stateless token authentication architecture:
1. **Token Generation:** When a user logs in (`POST /api/auth/login`) or registers (`POST /api/auth/signup`), `User.generateAuthToken()` signs a JWT containing the user's `_id` and `role` (`LOGISTIC_MANAGER`, `VESSEL_OWNER`, or `admin`), signed with `process.env.JWT_SECRET` with an expiry of `30d`.
2. **Token Response:** The backend returns the JWT in the JSON payload:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "_id": "651f8a9e...",
     "name": "Cargo Planner",
     "email": "planner@steelmill.in",
     "role": "LOGISTIC_MANAGER",
     "company": "Odisha Steel Works"
   }
   ```
3. **Client-Side Persistence:** `frontend/src/services/api.js` intercepts the response and persists the token in browser storage:
   ```javascript
   localStorage.setItem('bm_token', response.data.token);
   ```
4. **Subsequent API Requests:** An Axios request interceptor injects the token into every outbound request:
   ```javascript
   api.interceptors.request.use((config) => {
     const token = localStorage.getItem('bm_token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```
5. **Backend Verification:** `backend/middleware/authMiddleware.js` extracts the Bearer token, verifies its signature against `process.env.JWT_SECRET`, queries the user record excluding password, and attaches `req.user` to the request pipeline.

### CORS & Production Cross-Origin Settings
In `backend/server.js`:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, health monitors) or whitelisted domains
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Production Rules for CORS:
- **No Trailing Slash:** Set `FRONTEND_URL=https://bulkmatrix.vercel.app` (not `https://bulkmatrix.vercel.app/`).
- **Multiple Origins:** If deploying across multiple domains (e.g. apex domain and `www`), update `allowedOrigins` or ensure the primary canonical domain is provided.
- **Allowed Headers:** Explicitly permits `Content-Type` and `Authorization` headers.

---

## 6. Frontend Deployment (Vercel)

### Step-by-Step Vercel Configuration
1. **Root Directory:** Set to `frontend`.
2. **Build Settings:**
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Environment Variables:**
   - `VITE_API_BASE_URL`: `https://your-backend-api.onrender.com/api`
   - `VITE_USD_INR_RATE`: `83.5`
4. **Single Page Application Routing (`frontend/vercel.json`):**  
   Create `frontend/vercel.json` to prevent 404 errors when users refresh deep pages:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

---

## 7. External APIs & Third-Party Services

| Service Name | Purpose | API Key Needed? | Tier | Base URL / Provider | Production Considerations |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Open-Meteo Weather API** | Real-time weather, temperature, humidity, wind speed for Indian ports | **No** | Free / Open-Source | `https://api.open-meteo.com/v1/forecast` | No rate-limiting under normal procurement volume; requests are batched server-side in `weatherService.js`. |
| **Open-Meteo Marine API** | Significant wave height, wave direction, swell period, sea surface temperature | **No** | Free / Open-Source | `https://marine-api.open-meteo.com/v1/marine` | Returns HTTP 400 for inland waterway terminals (e.g., Haldia upper dock); `weatherService.js` handles this gracefully with null fallback. |
| **SMTP Mail Delivery** | Account verification and notification emails | **Yes** (in production) | Free tier available | Ethereal (Dev) / SendGrid / Amazon SES | If credentials are not provided, system falls back to console logging verification URLs without throwing fatal errors. |
| **AIS Telemetry Service** | Dynamic vessel positions on East Coast routes | **No external API** | Internal Simulation | `backend/routes/aisRoutes.js` | Coordinates are computed mathematically from database vessel records along shipping waypoints (Singapore, Malacca Strait, Bay of Bengal). |

---

## 8. BulkMatrix Specific Features Analysis

| Feature | Implementation Mechanism | Deployment Requirement |
| :--- | :--- | :--- |
| **Role-Based Auth** | Express middleware checking `user.role` against `LOGISTIC_MANAGER` / `VESSEL_OWNER` / `admin`. | Ensure `JWT_SECRET` is strong and identical across restarts. |
| **Fleet Tracking** | MongoDB `Vessel` collection populated by registered owners; supplemented by standard fleet models. | Requires MongoDB Atlas connection. |
| **Charter Recommendation** | Computes cargo volume, commodity density, port draft limits; calls ML service proxy. | Calls `ML_API_URL`. Automatically falls back to `mockDataService.js` if ML server is offline. |
| **Freight Forecasting** | 15-day, 30-day, 90-day rate curves per route (e.g., Hay Point &rarr; Paradip). | Models stored in `models/regularized/` when ML service is active. |
| **Weather Intelligence** | Server-side parallel fetch to Open-Meteo with nautical risk score calculation. | Outgoing HTTPS access to `api.open-meteo.com` from backend host. |
| **Bilateral Contract Chat** | MongoDB `ChatMessage` collection linked to executed `Contract` documents. | No WebSockets required; utilizes REST polling on contract view. |
| **Live Operations (AIS)** | Generates sinusoidal coordinate movement along major maritime shipping lines. | No third-party satellite AIS subscription required. |
| **Email Verification** | `nodemailer` transport; generates token verification links. | Configure `CLIENT_URL` matching the Vercel domain. |

---

## 9. AI / ML Model Deployment Architecture

### Model Repository & Architecture
- **Location of Models:** Inside root directory: `models/regularized/`
- **Format:** 168 pre-trained CatBoost regressors serialized as Python **`pickle`** files (`catboost_reg_15_*.pkl`, `catboost_reg_30_*.pkl`, `catboost_reg_90_*.pkl`).
- **Features Matrix:** Stored in `data/features/ml_feature_matrix.parquet`.
- **Inference Runtime:** Python 3.10+ running FastAPI (`backend/main.py`).

### How Components Communicate:
1. Frontend makes request: `POST /api/charter/recommendation` &rarr; Express Backend.
2. `backend/services/mlService.js` proxies JSON payload &rarr; `http://<ML_API_URL>/api/charter_recommendation`.
3. FastAPI loads model artifact via `pickle.load()` inside `src/model_loader.py` and returns forecast rate and recommended vessel class.
4. If `ML_API_URL` is unavailable or errors out, `mlService.js` catches the exception and immediately invokes `mockDataService.generateRecommendation(params)`.

### Production Deployment Options for ML:
- **Option A (Containerized Docker Service):** Deploy `Dockerfile.ml` on Render or Railway as a dedicated web service. Set `ML_API_URL=https://bulkmatrix-ml.onrender.com` in backend.
- **Option B (Graceful Fallback Mode):** Run the Node.js backend alone. The built-in heuristic fallback provides immediate, realistic freight recommendations without incurring extra container hosting overhead.

---

## 10. Production Environment Variables Checklist

### Backend Checklist (`backend/.env`)
```bash
# ============================================================
# BULKMATRIX BACKEND PRODUCTION ENVIRONMENT VARIABLES
# ============================================================

# Environment & Server Port
NODE_ENV=production
PORT=5000

# Database Connection (MongoDB Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/BulkMatrix?retryWrites=true&w=majority

# Authentication Security (Minimum 32 random characters)
JWT_SECRET=super_secret_jwt_key_bulkmatrix_production_2026_x9f2a7

# Client Domain Configuration (NO TRAILING SLASH)
FRONTEND_URL=https://bulkmatrix.vercel.app
CLIENT_URL=https://bulkmatrix.vercel.app

# Machine Learning Engine Microservice (Optional)
ML_API_URL=https://bulkmatrix-ml.onrender.com

# SMTP Mail Delivery Configuration (Optional - Defaults to console log)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP_FROM="BulkMatrix Support" <noreply@bulkmatrix.com>
```

### Frontend Checklist (`frontend/.env`)
```bash
# ============================================================
# BULKMATRIX FRONTEND PRODUCTION ENVIRONMENT VARIABLES
# ============================================================

# Backend API Gateway URL (Include /api path, NO trailing slash)
VITE_API_BASE_URL=https://bulkmatrix-backend-api.onrender.com/api

# Currency Analytics Default Exchange Rate
VITE_USD_INR_RATE=83.50
```

---

## 11. Recommended Deployment Sequence

```
1. GitHub Push ──► 2. MongoDB Atlas ──► 3. Backend (Render) ──► 4. Frontend (Vercel) ──► 5. CORS Sync
```

1. **Step 1 — Push to GitHub:** Ensures clean branch state and removes untracked `.env` files.
2. **Step 2 — Provision MongoDB Atlas:** Database credentials and IP access must exist before starting the backend, otherwise Mongoose connection retries will slow bootup.
3. **Step 3 — Deploy Backend on Render:** The backend generates the production URL required by the frontend build.
4. **Step 4 — Deploy Frontend on Vercel:** Point `VITE_API_BASE_URL` to the live backend URL from Step 3.
5. **Step 5 — Synchronize Backend CORS:** Paste the resulting Vercel URL back into Render under `FRONTEND_URL` and `CLIENT_URL`.

---

## 12. Production Verification & Testing Checklist

### 1. Backend Health Check
- Open `https://your-backend-api.onrender.com/` in browser.
- Expect HTTP 200 response:
  ```json
  {
    "success": true,
    "message": "BulkMatrix Freight Forecasting API",
    "status": "Backend is running"
  }
  ```

### 2. Database Connectivity
- Check Render service logs:
  ```
  ✅ MongoDB Connected: bulkmatrixcluster-shard...
  ```

### 3. Authentication Verification
- Visit the frontend registration page (`/signup`).
- Create a user with role **Logistics Manager**.
- Confirm successful redirection to dashboard and token presence in Developer Tools (`localStorage.getItem('bm_token')`).
- Log out and log back in via `/login`.

### 4. Weather Intelligence Live Check
- Navigate to `/weather-intelligence`.
- Confirm weather and marine cards load for ports (Paradip, Dhamra, Visakhapatnam).
- Verify significant wave heights and weather alert tags render without errors.

### 5. Charter Recommendation Engine
- Navigate to `/charter-planner`.
- Enter:
  - Commodity: `Coal`
  - Cargo Volume: `75000` MT
  - Origin: `Hay Point`
  - Destination: `Paradip`
- Click **Generate Charter Recommendation**.
- Verify that Capesize/Panamax suitability, forecast rates (15d/30d/90d), and Buy/Hold market signals render.

---

## 13. Common Deployment Errors & Troubleshooting

### Error 1: `Not allowed by CORS`
- **Cause:** `process.env.FRONTEND_URL` does not match the browser's request origin.
- **Diagnostic:** Open Browser Console &rarr; Network Tab &rarr; Click failed preflight `OPTIONS` request &rarr; View `Origin` header.
- **Fix:** In Render backend settings, set `FRONTEND_URL` exactly matching the Origin without trailing slash (e.g. `https://bulkmatrix.vercel.app`).

### Error 2: `401 Unauthorized` on Page Refresh
- **Cause:** Expired token or missing Bearer header.
- **Diagnostic:** Check DevTools &rarr; Application &rarr; Local Storage &rarr; `bm_token`. If missing or empty, user is unauthenticated.
- **Fix:** Ensure login controller returns `token` and client executes `localStorage.setItem('bm_token', response.data.token)`.

### Error 3: Deep Route Refresh Returns `404 Not Found` on Vercel
- **Cause:** Client-side router subpages (`/market-analysis`, `/charter-planner`) do not exist as physical files on the web server.
- **Diagnostic:** Accessing `/` works, but refreshing `/charter-planner` returns Vercel 404.
- **Fix:** Add `frontend/vercel.json` with `{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}`.

### Error 4: MongoDB Connection Hangs or Throws `MongooseServerSelectionError`
- **Cause:** MongoDB Atlas firewall has blocked the backend host IP address.
- **Diagnostic:** Render logs show `Could not connect to MongoDB: connection timed out`.
- **Fix:** In MongoDB Atlas &rarr; Network Access &rarr; Add IP `0.0.0.0/0` (Allow Access from Anywhere).

### Error 5: Frontend Calls `http://localhost:5000` in Production
- **Cause:** `VITE_API_BASE_URL` was not configured during the Vercel build step, falling back to default localhost.
- **Diagnostic:** Network tab shows API calls failing against `http://localhost:5000/api/...`.
- **Fix:** Add `VITE_API_BASE_URL=https://your-backend.onrender.com/api` in Vercel Project Settings &rarr; Environment Variables &rarr; **Redeploy**.

---

## 14. Local vs. Production Comparison Matrix

| Attribute | Local Development | Production Environment |
| :--- | :--- | :--- |
| **Frontend URL** | `http://localhost:5173` | `https://bulkmatrix.vercel.app` |
| **Backend API URL** | `http://localhost:5000/api` | `https://bulkmatrix-backend-api.onrender.com/api` |
| **Database Connection** | Local MongoDB (`127.0.0.1:27017`) or Atlas Sandbox | Dedicated MongoDB Atlas Production Cluster |
| **CORS Origins** | `http://localhost:5173`, `http://localhost:5174` | Exact production Vercel domain |
| **Node Environment** | `development` (Verbose logging, nodemon restart) | `production` (Optimized Express routing, minified stacks) |
| **SSL / TLS** | Plain HTTP (`http://`) | Enforced TLS/HTTPS on all endpoints (`https://`) |
| **Token Transport** | HTTP Headers / localStorage | Secure HTTPS Headers / localStorage |
| **Email Dispatch** | Ethereal mock logging to terminal console | Authenticated SMTP (SendGrid / SES) |

---

## 15. Production Security & Hardening Checklist

- [x] **Zero Credentials in Git:** Confirm `.env` is uncommitted.
- [x] **Enforce HTTPS:** Ensure all communication to Vercel and Render is routed over TLS.
- [x] **Cryptographic Secret Entropy:** Ensure `JWT_SECRET` is generated via a cryptographically secure random generator (minimum 256 bits).
- [x] **Strict CORS Whitelisting:** Disallow wildcard `*` origins on the Express API gateway in production.
- [x] **Password Protection:** User passwords salted and hashed using bcrypt (10 rounds) before persistence.
- [x] **Password Exclusion:** Mongoose `User` schema enforces `select: false` on passwords to prevent accidental exposure in user queries.
- [x] **Controlled Database Access:** Dedicated MongoDB Atlas database user with principle of least privilege.

---

## 16. Custom Domain & DNS Configuration

To bind a professional domain such as `www.bulkmatrix.com`:

1. **In Vercel:**
   - Go to **Project Settings &rarr; Domains**.
   - Enter `www.bulkmatrix.com` and `bulkmatrix.com`.
2. **In Your DNS Registrar (GoDaddy, Namecheap, Cloudflare):**
   - For `www`: Add a **CNAME** record pointing to `cname.vercel-dns.com`.
   - For apex (`bulkmatrix.com`): Add an **A** record pointing to `76.76.21.21`.
3. **Automatic SSL:** Vercel provisions a free Let's Encrypt SSL certificate automatically once DNS propagation completes.
4. **Update Backend Environment Variables:**
   - Update `FRONTEND_URL` in Render to `https://www.bulkmatrix.com`.
   - Update `CLIENT_URL` in Render to `https://www.bulkmatrix.com`.

---

## 17. Final Pre-Flight Deployment Checklist

### Pre-Deployment
- [ ] Code committed and pushed to `main` branch on GitHub.
- [ ] No `.env` files tracked in git history.
- [ ] MongoDB Atlas cluster active and network access set to `0.0.0.0/0`.
- [ ] Database credentials copied securely.

### Backend Deployment (Render)
- [ ] Service root directory set to `backend`.
- [ ] Runtime set to `Node 20`.
- [ ] `npm install` and `npm start` set as commands.
- [ ] All required environment variables (`MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`) populated.
- [ ] Health check endpoint (`GET /`) returns HTTP 200.

### Frontend Deployment (Vercel)
- [ ] Root directory set to `frontend`.
- [ ] Framework preset detected as `Vite`.
- [ ] `VITE_API_BASE_URL` defined with `/api` suffix.
- [ ] Build completes without errors and site loads over HTTPS.

### Post-Deployment Verification
- [ ] User signup and login working with JWT stored in `localStorage`.
- [ ] Weather Intelligence loads live data from Open-Meteo.
- [ ] Charter planner generates recommendations without console errors.
- [ ] Live operations map renders trade corridor vessel markers.
