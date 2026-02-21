#!/bin/bash

echo "Starting TrainOps AI Backend..."
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "Failed to create virtual environment"
        exit 1
    fi
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "Failed to activate virtual environment"
    exit 1
fi

# Upgrade pip
echo "Upgrading pip..."
python -m pip install --upgrade pip

# Install requirements
if [ -f "requirements.txt" ]; then
    echo "Installing requirements..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "Failed to install requirements"
        exit 1
    fi
else
    echo "Installing individual packages..."
    pip install fastapi uvicorn python-multipart websockets ortools pydantic
    if [ $? -ne 0 ]; then
        echo "Failed to install packages"
        exit 1
    fi
fi

echo ""
echo "===================================="
echo "Starting FastAPI server..."
echo "Backend URL: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "WebSocket: ws://localhost:8000/ws/optimization"
echo "===================================="
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

echo ""
echo "Server stopped."