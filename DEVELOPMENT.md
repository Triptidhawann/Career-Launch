# CAREERLAUNCH — LOCAL DEVELOPMENT & ENVIRONMENT RELIABILITY GUIDE

This guide documents the local development architecture, automated lifecycle workflows, health diagnostics, and recovery procedures for CareerLaunch.

---

## 1. Environment Architecture & Preserved Configuration

CareerLaunch requires three interdependent development services running on dedicated local ports:

| Service | Port | Endpoint / URI | Configuration & Notes |
| :--- | :--- | :--- | :--- |
| **MongoDB Database** | `27018` | `mongodb://127.0.0.1:27018/careerlaunch` | Config: `C:\data\careerlaunch\mongod.cfg`<br>Data: `C:\data\careerlaunch\db`<br>Host: `127.0.0.1`<br>*Preserved across all sessions.* |
| **Express Backend API** | `5000` | `http://localhost:5000/api`<br>Health: `http://localhost:5000/api/health` | Node.js ESM server in `server/src/index.js`. Connects to MongoDB port 27018. |
| **Vite Frontend App** | `5173` | `http://localhost:5173` | React 19 + Tailwind CSS SPA. Proxies `/api` requests to `http://127.0.0.1:5000`. |

> [!IMPORTANT]
> **Data Preservation Invariants**:
> - Never delete or reinitialize `C:\data\careerlaunch\db`.
> - Preserved records: 5 canonical Software Engineer AI pilot lessons (`swe-top-1`, `swe-top-4`, `swe-top-7`, `swe-top-9`, `swe-top-13`) and student profiles (`triptidhawan15@gmail.com`, `mahajannatansh@gmail.com`).
> - MongoDB port `27018` and Express port `5000` must remain unchanged.

---

## 2. Automated Service Management Commands

CareerLaunch provides one-command deterministic lifecycle scripts located in `scripts/`:

### 2.1 Daily Automated Startup
Starts all services in strict dependency order (**MongoDB -> Backend -> Frontend**), validates readiness at each stage, and avoids creating duplicate instances:
```bash
npm run start:careerlaunch
```
*Or directly via PowerShell:*
```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/start-careerlaunch.ps1
```

**Startup Behavior:**
1. **Checks MongoDB (Port 27018)**: If already running and healthy, reuses it immediately. If stopped, locates `mongod.exe` and launches it using `C:\data\careerlaunch\mongod.cfg`.
2. **Checks Backend (Port 5000)**: Probes `/api/health`. If already healthy and connected to MongoDB, reuses it. If stopped, launches `server/src/index.js` and verifies database connectivity.
3. **Checks Frontend (Port 5173)**: Probes HTTP 200. If already responding, reuses it. If stopped, launches Vite development server on port 5173.
4. **Summary**: Prints an operational status dashboard with all verified ports, preserved record counts, and URLs.

### 2.2 System Health Diagnostics
Independently inspects and verifies all three services without modifying any state:
```bash
npm run check:careerlaunch
```
*Or directly via PowerShell:*
```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/check-careerlaunch.ps1
```
Outputs a detailed `[PASS]`/`[FAIL]` summary table:
- Port accessibility (27018, 5000, 5173)
- MongoDB database connection and preserved collection record counts
- Backend `/api/health` HTTP status and Mongoose connection state
- Frontend HTTP 200 responsiveness

### 2.3 Safe Service Teardown
Safely terminates CareerLaunch backend and frontend processes holding ports 5000 and 5173 while **preserving MongoDB on port 27018**:
```bash
npm run stop:careerlaunch
```
*Or directly via PowerShell:*
```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/stop-careerlaunch.ps1
```

> [!NOTE]
> `stop:careerlaunch` deliberately leaves MongoDB running on port 27018 to preserve database cache, open connections, and data integrity. To stop MongoDB as well, pass the optional switch:
> ```powershell
> powershell -ExecutionPolicy Bypass -File ./scripts/stop-careerlaunch.ps1 -IncludeMongo
> ```

---

## 3. Post-Restart Recovery (After Windows Reboot)

When Windows restarts, the MongoDB daemon and Node processes are stopped. To recover the complete development environment with one command:

```bash
npm run start:careerlaunch
```

The script will automatically:
1. Detect that port 27018 is down.
2. Launch MongoDB with `C:\data\careerlaunch\mongod.cfg`.
3. Wait up to 25 seconds for MongoDB to accept connections.
4. Launch Express backend on port 5000 and wait for MongoDB connection.
5. Launch Vite frontend on port 5173.
6. Verify all three services and output the ready URLs.

Verify health immediately afterward:
```bash
npm run check:careerlaunch
```

---

## 4. Troubleshooting & Conflict Resolution

### Issue: "Port 5000 is already in use by another process"
**Cause**: An existing backend process (or previous background run) is already bound to port 5000. When you manually run `npm run dev` in `server/`, Node fails with `EADDRINUSE`.

**Resolution Options**:
1. **Option A (Automated)**:
   Run the stop script from root or `server`:
   ```bash
   npm run stop:careerlaunch
   # Or inside server/: npm run stop
   ```
   This immediately terminates the process holding port 5000 and frees the port.
2. **Option B (PowerShell One-Liner)**:
   ```powershell
   Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess -Force
   ```
3. **Option C (Let `start:careerlaunch` Manage It)**:
   Instead of running `npm run dev` manually, run `npm run start:careerlaunch`. If port 5000 is already healthy, it detects it and reuses it without crashing!

### Issue: "Port 5173 is already in use"
**Resolution**:
```bash
npm run stop:careerlaunch
npm run start:careerlaunch
```

### Issue: "Backend is running but reports database disconnected"
**Cause**: Backend started while MongoDB was temporarily offline or unreachable.
**Resolution**:
1. Run `npm run check:careerlaunch` to confirm MongoDB status.
2. Start MongoDB:
   ```powershell
   npm run start:careerlaunch
   ```

---

## 5. Verification & Testing Commands

To run regression suites and confirm all Phase 1-4 functionalities remain intact:

```bash
# Verify Phase 4 student lesson integration & API routing
node server/src/scripts/testPhase4.js

# Verify Phase 3 Groq generation & citation grounding
node server/src/scripts/testPhase3.js

# Verify Phase 2B student profile updates & roadmap syncing
node server/src/scripts/testPhase2B.js

# Verify Phase 2A authentication & onboarding
node server/src/scripts/testPhase2A.js

# Verify API route protection & admin authorization
node server/src/scripts/testApiSecurity.js

# Code quality and frontend production build
npm run lint
npm run build
```
