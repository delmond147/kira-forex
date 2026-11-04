# ==============================================================================
# KIRAFOREX DIGITAL PLATFORM - POWERSHELL RUNNER
# ==============================================================================

Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "                      KIRAFOREX DIGITAL PLATFORM" -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host ""

# Detect available Node runtime
$nodeCmd = $null

if (Get-Command "node" -ErrorAction SilentlyContinue) {
    $nodeCmd = "node"
} elseif (Test-Path "C:\Program Files\nodejs\node.exe") {
    $nodeCmd = "C:\Program Files\nodejs\node.exe"
} elseif (Test-Path "$env:APPDATA\Antigravity\bin\agy-node.cmd") {
    $nodeCmd = "$env:APPDATA\Antigravity\bin\agy-node.cmd"
} elseif (Test-Path "$env:LOCALAPPDATA\Programs\antigravity\Antigravity.exe") {
    $env:ELECTRON_RUN_AS_NODE = "1"
    $nodeCmd = "$env:LOCALAPPDATA\Programs\antigravity\Antigravity.exe"
}

if (-not $nodeCmd) {
    Write-Host "[ERROR] Could not locate Node.js runtime. Please install Node.js." -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Using Node.js runtime: $nodeCmd" -ForegroundColor Gray
Write-Host ""
Write-Host "  -> [1/2] Public Website:          http://localhost:3000" -ForegroundColor Cyan
Write-Host "  -> [2/2] Private Admin CMS:       http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the platform." -ForegroundColor Gray
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host ""

& $nodeCmd "$PSScriptRoot\server.js"
