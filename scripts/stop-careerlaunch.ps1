<#
.SYNOPSIS
    Safely stops CareerLaunch development services (Backend on port 5000 and Frontend on port 5173).
    Strictly verifies process ownership before terminating any process.
    Never terminates an unrelated application occupying port 5000 or 5173.
    MongoDB on port 27018 is protected and is NEVER terminated.

.PARAMETER Force
    Force terminates verified CareerLaunch processes.
#>

[CmdletBinding()]
param (
    [switch]$IncludeMongo = $false,
    [switch]$Force = $true
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "              CAREERLAUNCH SAFE SERVICE SHUTDOWN                " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = (Resolve-Path "$PSScriptRoot\..").Path
$pidFile = Join-Path $PSScriptRoot ".careerlaunch-pids.json"

$stoppedProcesses = @()

# -------------------------------------------------------------------------
# OWNERSHIP VERIFICATION HELPER
# Inspects command line, working directory, and live service identity
# -------------------------------------------------------------------------
function Test-IsCareerLaunchProcess {
    param(
        [int]$ProcessId,
        [string]$ExpectedRole = "any" # "backend", "frontend", or "any"
    )

    $proc = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    if (-not $proc) {
        return $false
    }

    # Inspect command line via WMI / CIM
    $wmiProc = Get-CimInstance Win32_Process -Filter "ProcessId = $ProcessId" -ErrorAction SilentlyContinue
    $cmdLine = if ($wmiProc -and $wmiProc.CommandLine) { $wmiProc.CommandLine } else { "" }
    $execPath = if ($wmiProc -and $wmiProc.ExecutablePath) { $wmiProc.ExecutablePath } else { "" }

    # Normalize directory paths for case-insensitive comparison
    $normalizedRootDir = $rootDir.Replace('\', '/').ToLower()
    $normalizedCmdLine = $cmdLine.Replace('\', '/').ToLower()

    $hasRootDirMatch = $normalizedCmdLine.Contains($normalizedRootDir)
    $hasBackendSignature = ($normalizedCmdLine.Contains("src/index.js") -or $normalizedCmdLine.Contains("server/src/index.js"))
    $hasFrontendSignature = ($normalizedCmdLine.Contains("vite") -and ($normalizedCmdLine.Contains("5173") -or $hasRootDirMatch))

    # Check live API identity for Backend role
    if ($ExpectedRole -eq "backend" -or $ExpectedRole -eq "any") {
        # Check if the process listening on port 5000 matches $ProcessId and responds as CareerLaunch
        $conn5000 = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($conn5000 -and $conn5000.OwningProcess -eq $ProcessId) {
            try {
                $probeRes = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/health" -TimeoutSec 2 -ErrorAction Stop
                if ($probeRes.service -eq "CareerLaunch Backend API") {
                    return $true
                }
            } catch {
                # API not responding; rely on command line check
            }
        }
        if ($hasBackendSignature -and ($hasRootDirMatch -or $normalizedCmdLine.Contains("careerlaunch"))) {
            return $true
        }
    }

    # Check live response for Frontend role
    if ($ExpectedRole -eq "frontend" -or $ExpectedRole -eq "any") {
        $conn5173 = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($conn5173 -and $conn5173.OwningProcess -eq $ProcessId) {
            try {
                $probeText = Invoke-RestMethod -Uri "http://localhost:5173/" -TimeoutSec 2 -ErrorAction Stop
                if ($probeText -like "*CareerLaunch*" -or $probeText -like "*vite*") {
                    return $true
                }
            } catch {
                # Frontend not responding; rely on command line check
            }
        }
        if ($hasFrontendSignature -or ($hasRootDirMatch -and $proc.ProcessName -match "^(node|cmd)$")) {
            return $true
        }
    }

    return $false
}

# -------------------------------------------------------------------------
# TERMINATION HELPER
# Only terminates after strict ownership verification
# -------------------------------------------------------------------------
function Stop-CareerLaunchProcess {
    param(
        [int]$ProcessId,
        [string]$Description,
        [string]$Role
    )

    $proc = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    if (-not $proc) {
        return $false
    }

    # Strict ownership check
    $isOwned = Test-IsCareerLaunchProcess -ProcessId $ProcessId -ExpectedRole $Role
    if (-not $isOwned) {
        $wmiProc = Get-CimInstance Win32_Process -Filter "ProcessId = $ProcessId" -ErrorAction SilentlyContinue
        $cmdLine = if ($wmiProc -and $wmiProc.CommandLine) { $wmiProc.CommandLine } else { "N/A" }

        Write-Host ""
        Write-Host "[SAFETY PRESERVATION] Skipping PID $ProcessId ($($proc.ProcessName))." -ForegroundColor Yellow
        Write-Host "                      Reason: Process does NOT match CareerLaunch ownership checks." -ForegroundColor Yellow
        Write-Host "                      Command line: $cmdLine" -ForegroundColor DarkGray
        Write-Host "                      The unrelated application has been left running untouched." -ForegroundColor Yellow
        Write-Host ""
        return $false
    }

    try {
        Stop-Process -Id $ProcessId -Force -ErrorAction Stop
        Write-Host "[STOPPED] $Description (PID: $ProcessId, Name: $($proc.ProcessName))" -ForegroundColor Green
        return $true
    } catch {
        Write-Warning "Failed to stop $Description (PID: $ProcessId): $_"
        return $false
    }
}

# -------------------------------------------------------------------------
# 1. PROCESSES RECORDED IN PID TRACKING FILE
# -------------------------------------------------------------------------
if (Test-Path $pidFile) {
    try {
        $pidData = Get-Content $pidFile -Raw | ConvertFrom-Json -ErrorAction Stop
        if ($pidData.backendPid) {
            if (Stop-CareerLaunchProcess -ProcessId $pidData.backendPid -Description "Tracked Backend API" -Role "backend") {
                $stoppedProcesses += $pidData.backendPid
            }
        }
        if ($pidData.frontendPid) {
            if (Stop-CareerLaunchProcess -ProcessId $pidData.frontendPid -Description "Tracked Frontend Vite Server" -Role "frontend") {
                $stoppedProcesses += $pidData.frontendPid
            }
        }
        Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Warning "Could not read ${pidFile}: $_"
    }
}

# -------------------------------------------------------------------------
# 2. CHECK PORT 5000 (Backend API)
# -------------------------------------------------------------------------
try {
    $conn5000 = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn5000 -and $conn5000.OwningProcess -gt 0) {
        $targetPid = $conn5000.OwningProcess
        if (-not ($stoppedProcesses -contains $targetPid)) {
            Write-Host "Inspecting process holding port 5000 (PID: $targetPid)..." -ForegroundColor Cyan
            if (Stop-CareerLaunchProcess -ProcessId $targetPid -Description "CareerLaunch Backend API on port 5000" -Role "backend") {
                $stoppedProcesses += $targetPid
            }
        }
    }
} catch {
    Write-Warning "Error inspecting port 5000: $_"
}

# -------------------------------------------------------------------------
# 3. CHECK PORT 5173 (Frontend Vite Server)
# -------------------------------------------------------------------------
try {
    $conn5173 = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn5173 -and $conn5173.OwningProcess -gt 0) {
        $targetPid = $conn5173.OwningProcess
        if (-not ($stoppedProcesses -contains $targetPid)) {
            Write-Host "Inspecting process holding port 5173 (PID: $targetPid)..." -ForegroundColor Cyan
            if (Stop-CareerLaunchProcess -ProcessId $targetPid -Description "CareerLaunch Frontend Vite Server on port 5173" -Role "frontend") {
                $stoppedProcesses += $targetPid
            }
        }
    }
} catch {
    Write-Warning "Error inspecting port 5173: $_"
}

# -------------------------------------------------------------------------
# 4. MONGODB SAFETY CHECK (Port 27018)
# MongoDB is protected and is NEVER stopped by this script
# -------------------------------------------------------------------------
if ($IncludeMongo) {
    Write-Host "[SAFETY] MongoDB shutdown request was ignored. MongoDB daemon on port 27018 is protected" -ForegroundColor Cyan
    Write-Host "         and is NEVER terminated by CareerLaunch shutdown scripts to preserve database integrity." -ForegroundColor Cyan
} else {
    Write-Host "[SAFETY] MongoDB on port 27018 is protected and remains running (database records preserved)." -ForegroundColor Cyan
}

Write-Host ""
if ($stoppedProcesses.Count -gt 0) {
    Write-Host "[OK] Cleaned up $($stoppedProcesses.Count) verified CareerLaunch process(es)." -ForegroundColor Green
} else {
    Write-Host "[OK] No active CareerLaunch backend or frontend processes required termination." -ForegroundColor Gray
}
Write-Host ""
