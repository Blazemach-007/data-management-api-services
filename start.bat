@echo off
title CareAll Digital Services — Server
color 0A
echo ============================================
echo   CareAll Digital Services — Starting...
echo ============================================
echo.

:: Start Backend
start "CareAll Backend (Port 5000)" cmd /k "cd /d "%~dp0backend" && node server.js"

:: Wait 3 seconds for backend to start
timeout /t 3 /nobreak >nul

:: Start Frontend
start "CareAll Frontend (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo.
echo Backend:  http://localhost:5000/api/health
echo Frontend: http://localhost:3000
echo.
echo To allow office computers to access this system:
echo   1. Press Win+R, type "cmd", press Enter
echo   2. Type: ipconfig
echo   3. Share your IPv4 address with other computers
echo   4. They access: http://YOUR_IP:3000
echo.
pause
