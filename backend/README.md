# TrainOps AI - OR-Tools Backend

A FastAPI-based backend service that provides real-time train scheduling optimization using Google OR-Tools.

## Features

- **Google OR-Tools Integration**: Uses CP-SAT solver for constraint programming
- **Real-time WebSocket Updates**: Live optimization progress and results
- **Train Schedule Optimization**: Handles complex railway scheduling constraints
- **Disruption Management**: Real-time re-optimization for disruptions
- **RESTful API**: Easy integration with frontend applications

## Quick Start

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Server**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. **Access API Documentation**:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## API Endpoints

### Main Endpoints
- `POST /api/optimize` - Main train schedule optimization
- `POST /api/disruption` - Handle disruption events
- `GET /health` - Health check and system status
- `WS /ws/optimization` - WebSocket for real-time updates

### Example Usage

```python
import requests

# Optimize train schedule
response = requests.post("http://localhost:8000/api/optimize", json={
    "trains": [...],
    "stations": [...],
    "disruptions": [...],
    "constraints": {}
})

optimization_result = response.json()
```

## Configuration

Environment variables:
- `HOST` - Server host (default: 0.0.0.0)
- `PORT` - Server port (default: 8000) 
- `DEBUG` - Debug mode (default: true)
- `OPTIMIZATION_TIMEOUT` - OR-Tools timeout in seconds (default: 30)
- `MAX_SOLVER_THREADS` - Maximum solver threads (default: 4)

## Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── models/
│   │   └── train_models.py  # Pydantic data models
│   ├── services/
│   │   ├── or_tools_optimizer.py  # OR-Tools optimization engine
│   │   └── websocket_manager.py   # WebSocket management
│   └── core/
│       └── config.py        # Configuration settings
├── requirements.txt
└── README.md
```

## OR-Tools Integration

The backend uses Google OR-Tools CP-SAT solver to handle:
- **Track Capacity Constraints**: Minimum headway between trains
- **Platform Allocation**: Optimal platform assignment
- **Travel Time Constraints**: Realistic journey times
- **Priority Handling**: High-priority train preferences
- **Disruption Response**: Real-time re-optimization

## Performance

- **Optimization Time**: Typically 2-8 seconds for 50-200 trains
- **Scalability**: Handles up to 500 trains per optimization
- **Real-time Updates**: WebSocket broadcasts optimization progress
- **Fallback Handling**: Graceful degradation if optimization fails

## Integration with Frontend

The backend is designed to work with the Next.js TrainOps AI frontend:
- **CORS Enabled**: Allows requests from localhost:3000/3001
- **TypeScript Compatible**: Matching data models
- **WebSocket Support**: Real-time UI updates
- **Toggle Support**: Can switch between mock and OR-Tools modes