<#
.SYNOPSIS
    Deterministic CareerLaunch automated startup script.
    Starts services in order: MongoDB (27018) -> Backend API (5000) -> Frontend Vite (5173).
    Reuses running healthy services and avoids duplicate instances.
    Safely reports port conflicts without killing unrelated processes.

.PARAMETER SkipBrowser
    Optional switch. If specified, does not attempt to launch or notify browser.
#>

[CmdletBinding()]
param (
    [switch]$SkipBrowser = $false,
    [ValidateSet('Hidden', 'Minimized', 'Normal')][string]$WindowStyle = 'Minimized'
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "           CAREERLAUNCH DETERMINISTIC SERVICE STARTUP            " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = (Resolve-Path "$PSScriptRoot\..").Path
$serverDir = Join-Path $rootDir "server"
$pidFile = Join-Path $PSScriptRoot ".careerlaunch-pids.json"
$envHealthScript = Join-Path $PSScriptRoot "lib\env-health.mjs"

# Invariants
$mongoPort = 27018
$backendPort = 5000
$frontendPort = 5173
$mongoCfg = "C:\data\careerlaunch\mongod.cfg"
$mongoDbPath = "C:\data\careerlaunch\db"

# Track newly spawned PIDs
$spawnedBackendPid = $null
$spawnedFrontendPid = $null

# Helper: Find mongod.exe
function Find-MongoD {
    # 1. Check in PATH
    $inPath = Get-Command "mongod.exe" -ErrorAction SilentlyContinue
    if ($inPath) {
        return $inPath.Source
    }

    # 2. Check standard Program Files installation paths
    $stdPaths = @(
        "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe",
        "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe",
        "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe",
        "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
    )
    foreach ($p in $stdPaths) {
        if (Test-Path $p) {
            return $p
        }
    }

    # 3. Dynamic wildcard search
    $wildcard = Get-Item "C:\Program Files\MongoDB\Server\*\bin\mongod.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($wildcard) {
        return $wildcard.FullName
    }

    return $null
}

# Helper: Check TCP port
function Test-PortListening {
    param([int]$Port)
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    return [bool]$conn
}

# -------------------------------------------------------------------------
# STEP 1: MONGODB SERVICE (Port 27018)
# -------------------------------------------------------------------------
Write-Host "[1/3] Checking MongoDB on port $mongoPort..." -ForegroundColor Yellow

$mongoIsHealthy = $false
if (Test-PortListening -Port $mongoPort) {
    try {
        $rawProbe = node $envHealthScript mongo
        $mongoRes = $rawProbe | ConvertFrom-Json
        if ($mongoRes.ok) {
            Write-Host "      [OK] MongoDB is already running and accepting connections." -ForegroundColor Green
            $mongoIsHealthy = $true
        } else {
            Write-Warning "Port $mongoPort is active but database probe failed: $($mongoRes.error)"
        }
    } catch {
        Write-Warning "Failed probing active port ${mongoPort}: $_"
    }
}

if (-not $mongoIsHealthy) {
    # Validate files
    if (-not (Test-Path $mongoDbPath)) {
        Write-Error "MongoDB data directory '$mongoDbPath' does not exist! Aborting startup."
        exit 1
    }
    if (-not (Test-Path $mongoCfg)) {
        Write-Error "MongoDB configuration file '$mongoCfg' does not exist! Aborting startup."
        exit 1
    }

    $mongodExe = Find-MongoD
    if (-not $mongodExe) {
        Write-Error "Could not find 'mongod.exe' in PATH or 'C:\Program Files\MongoDB\Server\'. Please install MongoDB or add it to PATH."
        exit 1
    }

    Write-Host "      Starting MongoDB daemon ($mongodExe)..." -ForegroundColor Cyan
    Start-Process -FilePath $mongodExe -ArgumentList "--config `"$mongoCfg`"" -WindowStyle Hidden

    # Poll up to 25 seconds
    $mongoDeadline = (Get-Date).AddSeconds(25)
    while ((Get-Date) -lt $mongoDeadline) {
        Start-Sleep -Milliseconds 1000
        try {
            $rawProbe = node $envHealthScript mongo 2>$null
            $mongoRes = $rawProbe | ConvertFrom-Json
            if ($mongoRes.ok) {
                $mongoIsHealthy = $true
                Write-Host "      [OK] MongoDB started successfully on port $mongoPort." -ForegroundColor Green
                break
            }
        } catch {
            # continue polling
        }
    }

    if (-not $mongoIsHealthy) {
        Write-Error "MongoDB failed to become healthy on port $mongoPort within 25 seconds. Please inspect mongod.log or event logs."
        exit 1
    }
}

# -------------------------------------------------------------------------
# STEP 2: EXPRESS BACKEND API (Port 5000)
# -------------------------------------------------------------------------
Write-Host "[2/3] Checking Backend API on port $backendPort..." -ForegroundColor Yellow

$backendIsHealthy = $false
if (Test-PortListening -Port $backendPort) {
    try {
        $rawProbe = node $envHealthScript backend
        $backendRes = $rawProbe | ConvertFrom-Json
        if ($backendRes.ok) {
            Write-Host "      [OK] Backend API is already running and connected to database." -ForegroundColor Green
            $backendIsHealthy = $true
        } else {
            $conn5000 = Get-NetTCPConnection -LocalPort $backendPort -ErrorAction SilentlyContinue | Select-Object -First 1
            $conflictingPid = if ($conn5000) { $conn5000.OwningProcess } else { "Unknown" }
            Write-Host ""
            Write-Host "=================================================================" -ForegroundColor Red
            Write-Host "              PORT CONFLICT DETECTED ON PORT $backendPort               " -ForegroundColor Red
            Write-Host "=================================================================" -ForegroundColor Red
            Write-Host "Process PID $conflictingPid is listening on port $backendPort, but is NOT responding as a healthy CareerLaunch backend." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Recommended Actions:" -ForegroundColor Cyan
            Write-Host "  1. If this is an orphaned Node process, run:" -ForegroundColor White
            Write-Host "     npm run stop:careerlaunch" -ForegroundColor Green
            Write-Host "  2. Or terminate PID $conflictingPid manually:" -ForegroundColor White
            Write-Host "     Stop-Process -Id $conflictingPid -Force" -ForegroundColor Green
            Write-Host ""
            exit 1
        }
    } catch {
        Write-Warning "Failed probing active port ${backendPort}: $_"
    }
}

if (-not $backendIsHealthy) {
    Write-Host "      Starting Backend API from server/src/index.js..." -ForegroundColor Cyan
    $proc = Start-Process -FilePath "node" -ArgumentList "src/index.js" -WorkingDirectory $serverDir -WindowStyle $WindowStyle -PassThru
    $spawnedBackendPid = $proc.Id

    # Poll up to 25 seconds
    $backendDeadline = (Get-Date).AddSeconds(25)
    while ((Get-Date) -lt $backendDeadline) {
        Start-Sleep -Milliseconds 1000
        try {
            $rawProbe = node $envHealthScript backend 2>$null
            $backendRes = $rawProbe | ConvertFrom-Json
            if ($backendRes.ok) {
                $backendIsHealthy = $true
                Write-Host "      [OK] Backend API started successfully on port $backendPort (PID: $spawnedBackendPid)." -ForegroundColor Green
                break
            }
        } catch {
            # continue polling
        }
    }

    if (-not $backendIsHealthy) {
        Write-Error "Backend API failed to start or connect to database within 25 seconds. PID was: $spawnedBackendPid."
        exit 1
    }
}

# -------------------------------------------------------------------------
# STEP 3: FRONTEND VITE SERVER (Port 5173)
# -------------------------------------------------------------------------
Write-Host "[3/3] Checking Frontend on port $frontendPort..." -ForegroundColor Yellow

$frontendIsHealthy = $false
if (Test-PortListening -Port $frontendPort) {
    try {
        $rawProbe = node $envHealthScript frontend
        $frontendRes = $rawProbe | ConvertFrom-Json
        if ($frontendRes.ok) {
            Write-Host "      [OK] Frontend Vite server is already running and responding." -ForegroundColor Green
            $frontendIsHealthy = $true
        } else {
            $conn5173 = Get-NetTCPConnection -LocalPort $frontendPort -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
            $conflictingPid = if ($conn5173) { $conn5173.OwningProcess } else { "Unknown" }
            Write-Host ""
            Write-Host "=================================================================" -ForegroundColor Red
            Write-Host "              PORT CONFLICT DETECTED ON PORT $frontendPort              " -ForegroundColor Red
            Write-Host "=================================================================" -ForegroundColor Red
            Write-Host "Process PID $conflictingPid is listening on port $frontendPort, but is NOT responding as the CareerLaunch Vite frontend." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Recommended Actions:" -ForegroundColor Cyan
            Write-Host "  1. If this is an orphaned Vite process, run:" -ForegroundColor White
            Write-Host "     npm run stop:careerlaunch" -ForegroundColor Green
            Write-Host "  2. Or terminate PID $conflictingPid manually:" -ForegroundColor White
            Write-Host "     Stop-Process -Id $conflictingPid -Force" -ForegroundColor Green
            Write-Host ""
            exit 1
        }
    } catch {
        Write-Warning "Failed probing active port ${frontendPort}: $_"
    }
}

if (-not $frontendIsHealthy) {
    Write-Host "      Starting Frontend Vite server on port $frontendPort..." -ForegroundColor Cyan
    $npxCmd = "cmd.exe"
    $proc = Start-Process -FilePath $npxCmd -ArgumentList "/c npx vite --port $frontendPort" -WorkingDirectory $rootDir -WindowStyle $WindowStyle -PassThru
    $spawnedFrontendPid = $proc.Id

    # Poll up to 25 seconds
    $frontendDeadline = (Get-Date).AddSeconds(25)
    while ((Get-Date) -lt $frontendDeadline) {
        Start-Sleep -Milliseconds 1000
        try {
            $rawProbe = node $envHealthScript frontend 2>$null
            $frontendRes = $rawProbe | ConvertFrom-Json
            if ($frontendRes.ok) {
                $frontendIsHealthy = $true
                Write-Host "      [OK] Frontend Vite server started successfully on port $frontendPort (PID: $spawnedFrontendPid)." -ForegroundColor Green
                break
            }
        } catch {
            # continue polling
        }
    }

    if (-not $frontendIsHealthy) {
        Write-Error "Frontend Vite server failed to respond on port $frontendPort within 25 seconds."
        exit 1
    }
}

# -------------------------------------------------------------------------
# UPDATE PID TRACKING FILE
# -------------------------------------------------------------------------
$currentPids = @{}
if (Test-Path $pidFile) {
    try {
        $existing = Get-Content $pidFile -Raw | ConvertFrom-Json
        if ($existing.backendPid) { $currentPids["backendPid"] = $existing.backendPid }
        if ($existing.frontendPid) { $currentPids["frontendPid"] = $existing.frontendPid }
    } catch {
        # ignore parse error
    }
}

if ($spawnedBackendPid) { $currentPids["backendPid"] = $spawnedBackendPid }
if ($spawnedFrontendPid) { $currentPids["frontendPid"] = $spawnedFrontendPid }
$currentPids["updatedAt"] = (Get-Date).ToString("o")

try {
    $currentPids | ConvertTo-Json | Set-Content $pidFile -Force
} catch {
    Write-Warning "Could not update PID tracking file: $_"
}

# -------------------------------------------------------------------------
# FINAL STATUS & SUMMARY
# -------------------------------------------------------------------------
$allStatus = node $envHealthScript all | ConvertFrom-Json

Write-Host ""
Write-Host "-----------------------------------------------------------------" -ForegroundColor Cyan
Write-Host "               CAREERLAUNCH SYSTEM OPERATIONAL                   " -ForegroundColor Cyan
Write-Host "-----------------------------------------------------------------" -ForegroundColor Cyan
Write-Host ("  MongoDB Port  : {0,-8} | Status: Healthy (URI: mongodb://127.0.0.1:{0}/careerlaunch)" -f $mongoPort) -ForegroundColor Green
Write-Host ("  Database Preserved : 'careerlaunch' ({0} canonical lessons, {1} student profiles)" -f $allStatus.mongo.lessonsCount, $allStatus.mongo.studentsCount) -ForegroundColor Green
Write-Host ("  Backend API   : {0,-8} | Status: HTTP 200 OK (DB Connected)" -f "Port $backendPort") -ForegroundColor Green
Write-Host ("  Frontend App  : {0,-8} | Status: HTTP 200 OK (Ready)" -f "Port $frontendPort") -ForegroundColor Green
Write-Host "-----------------------------------------------------------------" -ForegroundColor Cyan
Write-Host ""
Write-Host "  >> App URL    : http://localhost:$frontendPort" -ForegroundColor White
Write-Host "  >> API Health : http://localhost:$backendPort/api/health" -ForegroundColor White
Write-Host ""
Write-Host "[SUCCESS] All CareerLaunch services are up and verified!" -ForegroundColor Green
Write-Host ""
