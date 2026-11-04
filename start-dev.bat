@echo off
setlocal enabledelayedexpansion
title KIRAFOREX DIGITAL PLATFORM - RUNNER

echo ==============================================================================
echo                      KIRAFOREX DIGITAL PLATFORM
echo ==============================================================================
echo.
echo Detecting Node.js runtime environment...

:: 1. Check for standard system Node.js
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    set "NODE_CMD=node"
    goto :FOUND
)

:: 2. Check for Program Files node.exe
if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_CMD=C:\Program Files\nodejs\node.exe"
    goto :FOUND
)

:: 3. Check for bundled agy-node
if exist "%APPDATA%\Antigravity\bin\agy-node.cmd" (
    set "NODE_CMD=%APPDATA%\Antigravity\bin\agy-node.cmd"
    goto :FOUND
)

:: 4. Fallback to Antigravity embedded runtime
if exist "%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe" (
    set ELECTRON_RUN_AS_NODE=1
    set "NODE_CMD=%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe"
    goto :FOUND
)

echo [ERROR] Node.js executable was not found. Please ensure Node.js is installed.
pause
exit /b 1

:FOUND
echo [OK] Using Node.js runtime: !NODE_CMD!
echo.
echo ==============================================================================
echo   - Public Website:            http://localhost:3000
echo   - Private Admin Dashboard:   http://localhost:3001
echo ==============================================================================
echo.
echo Platform is active and listening for requests. Press Ctrl+C to stop.
echo.

"!NODE_CMD!" "%~dp0server.js"

pause
