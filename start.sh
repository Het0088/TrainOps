
#!/bin/bash
# ========================================
# TrainOps AI - Unified Startup Script
# ========================================
# Usage:
#   ./start.sh dev   - Start development mode
#   ./start.sh prod  - Start production mode (Docker)
#   ./start.sh stop  - Stop all running servers
# ========================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

MODE=$1
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Show usage if no mode specified
if [ -z "$MODE" ]; then
    echo ""
    echo "========================================"
    echo "TrainOps AI - Unified Startup Script"
    echo "========================================"
    echo ""
    echo "Usage:"
    echo "  ./start.sh dev    - Start development mode"
    echo "  ./start.sh prod   - Start production mode (Docker)"
    echo "  ./start.sh stop   - Stop all running servers"
    echo ""
    echo "========================================"
    exit 0
fi

# ========================================
# DEVELOPMENT MODE
# ========================================
if [ "$MODE" == "dev" ]; then
    echo ""
    echo "========================================"
    echo "TrainOps AI - Development Mode"
    echo "========================================"
    echo ""

    # Check Python
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}[ERROR]${NC} Python 3 is not installed"
        echo "Install from: https://www.python.org/downloads/"
        exit 1
    fi

    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}[ERROR]${NC} Node.js is not installed"
        echo "Install from: https://nodejs.org/"
        exit 1
    fi

    echo -e "${GREEN}[OK]${NC} Prerequisites checked"
    echo ""

    # Backend Setup
    echo -e "${BLUE}[1/4]${NC} Setting up Backend..."
    cd "$SCRIPT_DIR/backend"

    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}[INFO]${NC} Creating virtual environment..."
        python3 -m venv venv
    fi

    source venv/bin/activate
    pip install -q -r requirements.txt
    cd "$SCRIPT_DIR"
    echo -e "${GREEN}[OK]${NC} Backend ready"
    echo ""

    # Frontend Setup
    echo -e "${BLUE}[2/4]${NC} Setting up Frontend..."
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}[INFO]${NC} Installing dependencies..."
        npm install
    else
        echo -e "${YELLOW}[INFO]${NC} Dependencies already installed"
    fi
    echo -e "${GREEN}[OK]${NC} Frontend ready"
    echo ""

    # Start Backend
    echo -e "${BLUE}[3/4]${NC} Starting Backend (port 8000)..."
    cd "$SCRIPT_DIR/backend"
    source venv/bin/activate
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../.backend.pid
    cd "$SCRIPT_DIR"
    sleep 3

    if ! ps -p $BACKEND_PID > /dev/null; then
        echo -e "${RED}[ERROR]${NC} Backend failed to start. Check backend.log"
        exit 1
    fi
    echo -e "${GREEN}[OK]${NC} Backend started (PID: $BACKEND_PID)"
    echo ""

    # Start Frontend
    echo -e "${BLUE}[4/4]${NC} Starting Frontend (port 3000)..."
    npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > .frontend.pid
    sleep 2

    if ! ps -p $FRONTEND_PID > /dev/null; then
        echo -e "${RED}[ERROR]${NC} Frontend failed. Check frontend.log"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    echo -e "${GREEN}[OK]${NC} Frontend started (PID: $FRONTEND_PID)"
    echo ""

    # Success
    echo "========================================"
    echo -e "${GREEN}TrainOps AI is running!${NC}"
    echo "========================================"
    echo ""
    echo -e "${BLUE}Backend:${NC}  http://localhost:8000"
    echo -e "${BLUE}API Docs:${NC} http://localhost:8000/docs"
    echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
    echo ""
    echo -e "${YELLOW}Logs:${NC} backend.log, frontend.log"
    echo -e "${YELLOW}Stop:${NC} ./start.sh stop"
    echo ""
    echo "Press Ctrl+C to stop..."
    echo "========================================"

    # Cleanup on exit
    cleanup() {
        echo ""
        echo -e "${YELLOW}[INFO]${NC} Stopping servers..."
        [ -f .backend.pid ] && kill $(cat .backend.pid) 2>/dev/null && rm .backend.pid
        [ -f .frontend.pid ] && kill $(cat .frontend.pid) 2>/dev/null && rm .frontend.pid
        echo -e "${GREEN}[OK]${NC} Stopped"
        exit 0
    }
    trap cleanup INT TERM

    # Show logs
    tail -f backend.log frontend.log

# ========================================
# PRODUCTION MODE
# ========================================
elif [ "$MODE" == "prod" ]; then
    echo ""
    echo "========================================"
    echo "TrainOps AI - Production Mode (Docker)"
    echo "========================================"
    echo ""

    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}[ERROR]${NC} Docker is not installed"
        echo "Install from: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}[ERROR]${NC} Docker daemon is not running"
        exit 1
    fi

    if ! docker compose version &> /dev/null; then
        echo -e "${RED}[ERROR]${NC} Docker Compose not available"
        exit 1
    fi

    echo -e "${GREEN}[OK]${NC} Docker is available"
    echo ""

    cd "$SCRIPT_DIR"

    # Build
    echo -e "${BLUE}[1/2]${NC} Building containers..."
    docker compose build
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR]${NC} Build failed"
        exit 1
    fi
    echo ""

    # Start
    echo -e "${BLUE}[2/2]${NC} Starting services..."
    docker compose up -d
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR]${NC} Start failed"
        exit 1
    fi
    echo ""

    sleep 3
    docker compose ps

    # Success
    echo ""
    echo "========================================"
    echo -e "${GREEN}TrainOps AI is running!${NC}"
    echo "========================================"
    echo ""
    echo -e "${BLUE}Backend:${NC}  http://localhost:8000"
    echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
    echo -e "${BLUE}Nginx:${NC}    http://localhost:80"
    echo ""
    echo "Commands:"
    echo "  docker compose logs -f    - View logs"
    echo "  docker compose down       - Stop services"
    echo "  docker compose restart    - Restart"
    echo ""
    echo "========================================"

# ========================================
# STOP MODE
# ========================================
elif [ "$MODE" == "stop" ]; then
    echo ""
    echo "========================================"
    echo "Stopping TrainOps AI"
    echo "========================================"
    echo ""

    cd "$SCRIPT_DIR"

    # Stop Docker containers
    docker compose down > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[OK]${NC} Docker containers stopped"
    fi

    # Stop dev servers
    if [ -f .backend.pid ]; then
        kill $(cat .backend.pid) 2>/dev/null && echo -e "${GREEN}[OK]${NC} Backend stopped"
        rm .backend.pid
    fi

    if [ -f .frontend.pid ]; then
        kill $(cat .frontend.pid) 2>/dev/null && echo -e "${GREEN}[OK]${NC} Frontend stopped"
        rm .frontend.pid
    fi

    # Kill by port if needed
    if lsof -ti:8000 > /dev/null 2>&1; then
        kill $(lsof -ti:8000) 2>/dev/null && echo -e "${GREEN}[OK]${NC} Stopped port 8000"
    fi

    if lsof -ti:3000 > /dev/null 2>&1; then
        kill $(lsof -ti:3000) 2>/dev/null && echo -e "${GREEN}[OK]${NC} Stopped port 3000"
    fi

    echo ""
    echo -e "${GREEN}[INFO]${NC} All services stopped"
    echo "========================================"

else
    echo -e "${RED}[ERROR]${NC} Invalid mode: $MODE"
    echo "Use: dev, prod, or stop"
    exit 1
fi
