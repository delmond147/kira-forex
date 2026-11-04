Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "STARTING KIRAFOREX DIGITAL PLATFORM" -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  -> [1/2] Public Website:     http://localhost:3000" -ForegroundColor Cyan
Write-Host "  -> [2/2] Private Admin CMS:  http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to terminate the servers." -ForegroundColor Gray
Write-Host "==============================================================================" -ForegroundColor Green

$env:ELECTRON_RUN_AS_NODE = "1"
& "C:\Users\bongha\AppData\Local\Programs\antigravity\Antigravity.exe" "$PSScriptRoot\server.js"
