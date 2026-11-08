<#
.SYNOPSIS
    Safely stops CareerLaunch development services (Backend on port 5000 and Frontend on port 5173).
    Preserves MongoDB on port 27018 and all database records by default.

.PARAMETER IncludeMongo
    Optional switch. If specified, also stops the MongoDB daemon on port 27018. Default is $false.

.PARAMETER Force
    Force terminates the processes immediately.
#>

[CmdletBinding()]
param (
    [switch]$IncludeMongo = $false,
    [switch]$Force = $true
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "              CAREERLAUNCH SERVICE SHUTDOWN                     " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = (Resolve-Path "$PSScriptRoot\..").Path
$pidFile = Join-Path $PSScriptRoot ".careerlaunch-pids.json"

$stoppedProcesses = @()

# Helper function to safely terminate a process
function Stop-CareerLaunchProcess {
    param(
        [int]$ProcessId,
        [string]$Description
    )

    $proc = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    if (-not $proc) {
        return $false
    }

    # Safety check: ensure we do not terminate system processes
    $procName = $proc.ProcessName.ToLower()
    $safeNames = @("node", "cmd", "powershell", "pwsh", "mongod")
    if (-not ($safeNames -contains $procName)) {
        Write-Warning "Skipping PID $ProcessId ($procName) as it does not appear to be a Node/Web process."
        return $false
    }

    try {
        Stop-Process -Id $ProcessId -Force -ErrorAction Stop
        Write-Host "[STOPPED] $Description (PID: $ProcessId, Name: $procName)" -ForegroundColor Green
        return $true
    } catch {
        Write-Warning "Failed to stop $Description (PID: $ProcessId): $_"
        return $false
    }
}

# 1. Stop processes recorded in PID tracking file
if (Test-Path $pidFile) {
    try {
        $pidData = Get-Content $pidFile -Raw | ConvertFrom-Json -ErrorAction Stop
        if ($pidData.backendPid) {
            if (Stop-CareerLaunchProcess -ProcessId $pidData.backendPid -Description "Tracked Backend API") {
                $stoppedProcesses += $pidData.backendPid
            }
        }
        if ($pidData.frontendPid) {
            if (Stop-CareerLaunchProcess -ProcessId $pidData.frontendPid -Description "Tracked Frontend Vite Server") {
                $stoppedProcesses += $pidData.frontendPid
            }
        }
        Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Warning "Could not read ${pidFile}: $_"
    }
}

# 2. Check for any remaining processes holding Port 5000 (Backend)
try {
    $conn5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn5000 -and $conn5000.OwningProcess -gt 0) {
        $targetPid = $conn5000.OwningProcess
        if (-not ($stoppedProcesses -contains $targetPid)) {
            $proc = Get-Process -Id $targetPid -ErrorAction SilentlyContinue
            if ($proc -and $proc.ProcessName -eq "node") {
                Write-Host "Found active process holding port 5000..." -ForegroundColor Yellow
                if (Stop-CareerLaunchProcess -ProcessId $targetPid -Description "Backend API on port 5000") {
                    $stoppedProcesses += $targetPid
                }
            }
        }
    }
} catch {
    Write-Warning "Error inspecting port 5000: $_"
}

# 3. Check for any remaining processes holding Port 5173 (Frontend)
try {
    $conn5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn5173 -and $conn5173.OwningProcess -gt 0) {
        $targetPid = $conn5173.OwningProcess
        if (-not ($stoppedProcesses -contains $targetPid)) {
            $proc = Get-Process -Id $targetPid -ErrorAction SilentlyContinue
            if ($proc -and ($proc.ProcessName -eq "node" -or $proc.ProcessName -eq "cmd")) {
                Write-Host "Found active process holding port 5173..." -ForegroundColor Yellow
                if (Stop-CareerLaunchProcess -ProcessId $targetPid -Description "Frontend Vite Server on port 5173") {
                    $stoppedProcesses += $targetPid
                }
            }
        }
    }
} catch {
    Write-Warning "Error inspecting port 5173: $_"
}

# 4. Handle MongoDB
if ($IncludeMongo) {
    try {
        $conn27018 = Get-NetTCPConnection -LocalPort 27018 -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($conn27018 -and $conn27018.OwningProcess -gt 0) {
            $targetPid = $conn27018.OwningProcess
            $proc = Get-Process -Id $targetPid -ErrorAction SilentlyContinue
            if ($proc -and $proc.ProcessName -eq "mongod") {
                Write-Host "Stopping MongoDB on port 27018 (-IncludeMongo specified)..." -ForegroundColor Yellow
                if (Stop-CareerLaunchProcess -ProcessId $targetPid -Description "MongoDB Server on port 27018") {
                    $stoppedProcesses += $targetPid
                }
            }
        }
    } catch {
        Write-Warning "Error inspecting port 27018: $_"
    }
} else {
    Write-Host "[PRESERVED] MongoDB on port 27018 remains running (database records preserved)." -ForegroundColor Cyan
}

Write-Host ""
if ($stoppedProcesses.Count -gt 0) {
    Write-Host "[OK] Cleaned up $($stoppedProcesses.Count) process(es). Ports 5000 and 5173 are now free." -ForegroundColor Green
} else {
    Write-Host "[OK] No active CareerLaunch backend or frontend processes were holding ports." -ForegroundColor Gray
}
Write-Host ""
