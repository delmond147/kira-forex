@echo off
echo ==============================================================================
echo STARTING KIRAFOREX DIGITAL PLATFORM
echo ==============================================================================
echo.
echo [1/2] Public Website will be available at:       http://localhost:3000
echo [2/2] Private Admin CMS will be available at:    http://localhost:3001
echo.
echo Press Ctrl+C at any time to stop the platform.
echo ==============================================================================
echo.

set ELECTRON_RUN_AS_NODE=1
"C:\Users\bongha\AppData\Local\Programs\antigravity\Antigravity.exe" "%~dp0server.js"
pause
