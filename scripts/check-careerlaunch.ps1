# ==============================================================================
# CareerLaunch - Service Health Check Script
# ==============================================================================
# Independently verifies MongoDB (port 27018), Express Backend (port 5000),
# and Vite Frontend (port 5173) without modifying database records.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File ./scripts/check-careerlaunch.ps1
# ==============================================================================

$ErrorActionPreference = "Continue"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "         CAREERLAUNCH SYSTEM HEALTH & DIAGNOSTIC PROBE           " -ForegroundColor Cyan
Write-Host "=================================================================`n" -ForegroundColor Cyan

$results = [ordered]@{}
$allPassed = $true

# Helper function to check if a local port is listening
function Test-PortListening {
    param([int]$Port)
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    return ($null -ne $conn)
}

# ------------------------------------------------------------------------------
# 1. MongoDB Health Probe (Port 27018)
# ------------------------------------------------------------------------------
Write-Host "[1/3] Probing MongoDB on port 27018..." -NoNewline
$mongoPortActive = Test-PortListening -Port 27018

if (-not $mongoPortActive) {
    Write-Host " [FAIL]" -ForegroundColor Red
    $results["MongoDB Port (27018)"] = @{ Status = "FAIL"; Details = "Port 27018 is not listening. Start mongod with C:\data\careerlaunch\mongod.cfg." }
    $results["MongoDB Connection"]   = @{ Status = "SKIP"; Details = "Skipped because port 27018 is closed." }
    $results["Database Accessibility"] = @{ Status = "SKIP"; Details = "Skipped." }
    $allPassed = $false
} else {
    # Check actual database connectivity using read-only Node probe
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $probeOutput = node "$scriptDir/lib/env-health.mjs" mongo 2>$null

    if ($LASTEXITCODE -eq 0 -and $probeOutput) {
        $mongoData = $probeOutput | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($mongoData.ok -eq $true) {
            Write-Host " [PASS]" -ForegroundColor Green
            $results["MongoDB Port (27018)"] = @{ Status = "PASS"; Details = "Listening on 127.0.0.1:27018" }
            $results["MongoDB Connection"]   = @{ Status = "PASS"; Details = "Ping succeeded (URI: mongodb://127.0.0.1:27018/careerlaunch)" }
            $results["Database Accessibility"] = @{ Status = "PASS"; Details = "Database: 'careerlaunch' ($($mongoData.lessonsCount) lessons, $($mongoData.studentsCount) students preserved)" }
        } else {
            Write-Host " [FAIL]" -ForegroundColor Red
            $results["MongoDB Port (27018)"] = @{ Status = "PASS"; Details = "Port 27018 is listening." }
            $results["MongoDB Connection"]   = @{ Status = "FAIL"; Details = "Connection refused or failed: $($mongoData.error)" }
            $results["Database Accessibility"] = @{ Status = "FAIL"; Details = "Unable to read 'careerlaunch' collections." }
            $allPassed = $false
        }
    } else {
        Write-Host " [FAIL]" -ForegroundColor Red
        $results["MongoDB Port (27018)"] = @{ Status = "PASS"; Details = "Port is listening but ping probe failed." }
        $results["MongoDB Connection"]   = @{ Status = "FAIL"; Details = "Failed to establish database session." }
        $results["Database Accessibility"] = @{ Status = "FAIL"; Details = "Database probe failed." }
        $allPassed = $false
    }
}

# ------------------------------------------------------------------------------
# 2. Express Backend Health Probe (Port 5000)
# ------------------------------------------------------------------------------
Write-Host "[2/3] Probing Backend API on port 5000..." -NoNewline
$backendPortActive = Test-PortListening -Port 5000

if (-not $backendPortActive) {
    Write-Host " [FAIL]" -ForegroundColor Red
    $results["Backend Port (5000)"] = @{ Status = "FAIL"; Details = "Port 5000 is not listening. Backend server is stopped." }
    $results["Backend /api/health"] = @{ Status = "SKIP"; Details = "Skipped because port 5000 is closed." }
    $results["Backend DB Status"]   = @{ Status = "SKIP"; Details = "Skipped." }
    $allPassed = $false
} else {
    try {
        $healthRes = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/health" -Method Get -TimeoutSec 3 -ErrorAction Stop
        if ($healthRes.status -eq "ok") {
            Write-Host " [PASS]" -ForegroundColor Green
            $results["Backend Port (5000)"] = @{ Status = "PASS"; Details = "Listening on 0.0.0.0:5000" }
            $results["Backend /api/health"] = @{ Status = "PASS"; Details = "$($healthRes.service) returned HTTP 200 (status: ok)" }
            
            if ($healthRes.database -eq "connected") {
                $results["Backend DB Status"] = @{ Status = "PASS"; Details = "Mongoose connected to MongoDB 27018" }
            } else {
                $results["Backend DB Status"] = @{ Status = "FAIL"; Details = "Backend reports database DISCONNECTED!" }
                $allPassed = $false
            }
        } else {
            Write-Host " [FAIL]" -ForegroundColor Red
            $results["Backend Port (5000)"] = @{ Status = "PASS"; Details = "Port listening." }
            $results["Backend /api/health"] = @{ Status = "FAIL"; Details = "Returned status: $($healthRes.status)" }
            $results["Backend DB Status"]   = @{ Status = "FAIL"; Details = "Database state unknown." }
            $allPassed = $false
        }
    } catch {
        Write-Host " [FAIL]" -ForegroundColor Red
        $results["Backend Port (5000)"] = @{ Status = "PASS"; Details = "Port listening." }
        $results["Backend /api/health"] = @{ Status = "FAIL"; Details = "Failed to query http://127.0.0.1:5000/api/health ($($_.Exception.Message))" }
        $results["Backend DB Status"]   = @{ Status = "FAIL"; Details = "Service unreachable." }
        $allPassed = $false
    }
}

# ------------------------------------------------------------------------------
# 3. Vite Frontend Health Probe (Port 5173)
# ------------------------------------------------------------------------------
Write-Host "[3/3] Probing Frontend on port 5173..." -NoNewline
$frontendPortActive = Test-PortListening -Port 5173

if (-not $frontendPortActive) {
    Write-Host " [FAIL]" -ForegroundColor Red
    $results["Frontend Port (5173)"] = @{ Status = "FAIL"; Details = "Port 5173 is not listening. Vite server is stopped." }
    $results["Frontend Responsiveness"] = @{ Status = "SKIP"; Details = "Skipped because port 5173 is closed." }
    $allPassed = $false
} else {
    try {
        $feRes = Invoke-WebRequest -Uri "http://localhost:5173/" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        if ($feRes.StatusCode -eq 200) {
            Write-Host " [PASS]" -ForegroundColor Green
            $results["Frontend Port (5173)"] = @{ Status = "PASS"; Details = "Listening on port 5173" }
            $results["Frontend Responsiveness"] = @{ Status = "PASS"; Details = "HTTP 200 OK (CareerLaunch client ready)" }
        } else {
            Write-Host " [FAIL]" -ForegroundColor Red
            $results["Frontend Port (5173)"] = @{ Status = "PASS"; Details = "Port listening." }
            $results["Frontend Responsiveness"] = @{ Status = "FAIL"; Details = "Returned HTTP $($feRes.StatusCode)" }
            $allPassed = $false
        }
    } catch {
        Write-Host " [FAIL]" -ForegroundColor Red
        $results["Frontend Port (5173)"] = @{ Status = "PASS"; Details = "Port listening." }
        $results["Frontend Responsiveness"] = @{ Status = "FAIL"; Details = "Unreachable on http://localhost:5173 ($($_.Exception.Message))" }
        $allPassed = $false
    }
}

# ------------------------------------------------------------------------------
# Health Summary Table Output
# ------------------------------------------------------------------------------
Write-Host "`n-----------------------------------------------------------------" -ForegroundColor Gray
Write-Host "                      HEALTH CHECK SUMMARY                       " -ForegroundColor Gray
Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray

foreach ($key in $results.Keys) {
    $item = $results[$key]
    $color = "Green"
    if ($item.Status -eq "FAIL") { $color = "Red" }
    elseif ($item.Status -eq "SKIP") { $color = "Yellow" }
    
    $statusText = "[$($item.Status)]".PadRight(8)
    Write-Host "$statusText " -ForegroundColor $color -NoNewline
    Write-Host "$($key.PadRight(26)) : " -ForegroundColor White -NoNewline
    Write-Host "$($item.Details)" -ForegroundColor Gray
}

Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray

if ($allPassed) {
    Write-Host ""
    Write-Host "[OK] ALL CAREERLAUNCH SERVICES ARE HEALTHY AND READY!" -ForegroundColor Green
    Write-Host "Application URL: http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
    exit 0
} else {
    Write-Host ""
    Write-Host "[FAIL] ONE OR MORE CAREERLAUNCH SERVICES ARE UNHEALTHY OR STOPPED." -ForegroundColor Red
    Write-Host "Run 'npm run start:careerlaunch' to automatically start missing services." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
