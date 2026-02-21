from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import asyncio
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging

from .models.train_models import (
    TrainScheduleRequest, 
    OptimizationResult, 
    DisruptionEvent,
    TrainData,
    StationData
)
from .services.or_tools_optimizer import ORToolsOptimizer
from .services.websocket_manager import WebSocketManager
from .core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="TrainOps AI - OR-Tools Backend",
    description="Real-time train scheduling optimization using Google OR-Tools",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
optimizer = ORToolsOptimizer()
websocket_manager = WebSocketManager()

@app.get("/")
async def root():
    return {
        "message": "TrainOps AI OR-Tools Backend", 
        "status": "running", 
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "or_tools": "available",
        "timestamp": datetime.now().isoformat(),
        "active_connections": websocket_manager.get_connection_count(),
        "solver_version": "CP-SAT 9.8"
    }

@app.post("/api/optimize", response_model=OptimizationResult)
async def optimize_schedule(request: TrainScheduleRequest):
    """
    Main optimization endpoint using Google OR-Tools
    """
    try:
        logger.info(f"Starting OR-Tools optimization for {len(request.trains)} trains")
        
        # Broadcast optimization start
        await websocket_manager.broadcast({
            "type": "optimization_started",
            "timestamp": datetime.now().isoformat(),
            "train_count": len(request.trains),
            "mode": "or_tools"
        })
        
        # Run OR-Tools optimization
        result = await optimizer.optimize_schedule(
            trains=request.trains,
            stations=request.stations,
            disruptions=request.disruptions,
            constraints=request.constraints
        )
        
        # Broadcast results
        await websocket_manager.broadcast({
            "type": "optimization_complete",
            "timestamp": datetime.now().isoformat(),
            "result": result.dict(),
            "mode": "or_tools"
        })
        
        logger.info(f"OR-Tools optimization completed: {result.affected_trains} trains affected")
        return result
        
    except Exception as e:
        logger.error(f"OR-Tools optimization failed: {str(e)}")
        await websocket_manager.broadcast({
            "type": "optimization_error",
            "timestamp": datetime.now().isoformat(),
            "error": str(e),
            "mode": "or_tools"
        })
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

@app.post("/api/disruption")
async def handle_disruption(disruption: DisruptionEvent):
    """
    Handle disruption events and trigger re-optimization
    """
    try:
        logger.info(f"Processing disruption with OR-Tools: {disruption.type} at {disruption.location}")
        
        # Broadcast disruption event
        await websocket_manager.broadcast({
            "type": "disruption_detected",
            "timestamp": datetime.now().isoformat(),
            "disruption": disruption.dict(),
            "mode": "or_tools"
        })
        
        # Process disruption through OR-Tools
        result = await optimizer.handle_disruption(disruption)
        
        return {
            "status": "processed",
            "disruption_id": disruption.id,
            "optimization_result": result.dict(),
            "timestamp": datetime.now().isoformat(),
            "solver": "OR-Tools CP-SAT"
        }
        
    except Exception as e:
        logger.error(f"OR-Tools disruption handling failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Disruption handling failed: {str(e)}")

@app.websocket("/ws/optimization")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time optimization updates
    """
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "ping":
                await websocket.send_json({
                    "type": "pong", 
                    "timestamp": datetime.now().isoformat(),
                    "backend": "or_tools"
                })
            elif message.get("type") == "optimization_request":
                # Handle optimization request via WebSocket
                try:
                    trains = message.get("data", {}).get("trains", [])
                    stations = message.get("data", {}).get("stations", [])
                    
                    await websocket.send_json({
                        "type": "optimization_progress",
                        "progress": 0,
                        "status": "Starting OR-Tools optimization...",
                        "timestamp": datetime.now().isoformat()
                    })
                    
                    # Convert to proper models for optimization
                    train_data = [TrainData(**train) for train in trains] if trains else []
                    station_data = [StationData(**station) for station in stations] if stations else []
                    
                    # Run optimization
                    result = await optimizer.optimize_schedule(
                        trains=train_data,
                        stations=station_data,
                        disruptions=[],
                        constraints={}
                    )
                    
                    await websocket.send_json({
                        "type": "optimization_result",
                        "status": result.status,
                        "affected_trains": result.affected_trains,
                        "objective_value": result.objective_value,
                        "solve_time": result.solve_time_seconds,
                        "timestamp": datetime.now().isoformat(),
                        "solver": "OR-Tools CP-SAT"
                    })
                    
                except Exception as e:
                    await websocket.send_json({
                        "type": "optimization_error",
                        "error": str(e),
                        "timestamp": datetime.now().isoformat()
                    })
                
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
        logger.info("WebSocket client disconnected")

@app.get("/api/status")
async def get_status():
    """Get current backend status and capabilities"""
    return {
        "backend_type": "or_tools",
        "solver": "CP-SAT",
        "capabilities": [
            "train_scheduling",
            "disruption_handling", 
            "constraint_optimization",
            "real_time_updates"
        ],
        "performance": {
            "avg_optimization_time": "2-8 seconds",
            "max_trains": 1000,
            "max_constraints": 10000
        },
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )