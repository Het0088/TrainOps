@echo off
setlocal enabledelayedexpansion

set ROOT=%~dp0

echo.
echo ========================================
echo  TrainOps AI - Local Startup
echo ========================================
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Install from https://www.python.org/downloads/
    pause
    exit /b 1
)

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Prerequisites OK
echo.

echo [1/4] Setting up Python venv...
cd /d "%ROOT%backend"
if not exist "venv\" (
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtualenv
        cd /d "%ROOT%"
        pause
        exit /b 1
    )
)
call venv\Scripts\activate.bat
python -m pip install --upgrade pip setuptools wheel -q
pip install -q -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] pip install failed
    cd /d "%ROOT%"
    pause
    exit /b 1
)
cd /d "%ROOT%"
echo [OK] Backend deps ready
echo.

echo [2/4] Setting up Node.js deps...
if not exist "node_modules\" (
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed
        pause
        exit /b 1
    )
)
echo [OK] Frontend deps ready
echo.

echo [3/4] Starting Backend on port 8000...
start "TrainOps-Backend" cmd /k "cd /d %ROOT%backend && call venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul
echo [OK] Backend started
echo.

echo [4/4] Starting Frontend on port 3000...
start "TrainOps-Frontend" cmd /k "cd /d %ROOT% && npm run dev"

timeout /t 2 /nobreak >nul
echo [OK] Frontend started
echo.

echo ========================================
echo  TrainOps AI is running locally
echo ========================================
echo.
echo  Backend:   http://localhost:8000
echo  API Docs:  http://localhost:8000/docs
echo  Frontend:  http://localhost:3000
echo.
echo  Run stop.bat to shut everything down
echo ========================================
echo.
pause
