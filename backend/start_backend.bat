@echo off
echo Starting TrainOps AI Backend...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo Failed to create virtual environment
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
if exist "requirements.txt" (
    echo Installing requirements...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo Failed to install requirements
        pause
        exit /b 1
    )
) else (
    echo Installing individual packages...
    pip install fastapi uvicorn python-multipart websockets ortools pydantic
    if errorlevel 1 (
        echo Failed to install packages
        pause
        exit /b 1
    )
)

echo.
echo ====================================
echo Starting FastAPI server...
echo Backend URL: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo WebSocket: ws://localhost:8000/ws/optimization
echo ====================================
echo.
echo Press Ctrl+C to stop the server
echo.

REM Ensure we're in the backend directory
cd /d "%~dp0"
echo Current directory: %CD%

REM Start the FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

echo.
echo Server stopped.
pause