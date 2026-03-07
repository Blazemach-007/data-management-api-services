@echo off
title CareAll Digital Services — Server
color 0A
echo ============================================
echo   CareAll Digital Services — Starting...
echo ============================================
echo.

:: Get local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R "IPv4"') do (
    set LOCAL_IP=%%a
    goto :found
)
:found
set LOCAL_IP=%LOCAL_IP: =%

:: Start Backend (binds to 0.0.0.0 — LAN accessible)
start "CareAll Backend (Port 5000)" cmd /k "cd /d "%~dp0backend" && node server.js"

:: Wait for backend to start
timeout /t 4 /nobreak >nul

:: Start Frontend (LAN accessible)
start "CareAll Frontend (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npx next start -H 0.0.0.0 -p 3000"

echo.
echo Both servers are starting in separate windows.
echo.
echo ----------------------------------------
echo  LOCAL ACCESS:
echo    http://localhost:3000
echo.
echo  LAN ACCESS (share with office PCs):
echo    http://%LOCAL_IP%:3000
echo ----------------------------------------
echo.
echo  API Health Check: http://localhost:5000/api/health
echo.
echo Press any key to close this window (servers keep running)
pause
