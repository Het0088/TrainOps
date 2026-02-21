@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo  TrainOps AI - Stopping
echo ========================================
echo.

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel! equ 0 echo [OK] Backend stopped (port 8000)
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel! equ 0 echo [OK] Frontend stopped (port 3000)
)

echo.
echo [DONE] All services stopped
echo ========================================
echo.
pause
