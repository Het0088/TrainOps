import asyncio
import json
import logging
from typing import List, Dict, Any
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class WebSocketManager:
    """
    Manages WebSocket connections for real-time optimization updates
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        
    async def connect(self, websocket: WebSocket):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
        
        # Send welcome message
        await websocket.send_text(json.dumps({
            "type": "connected",
            "message": "Connected to OR-Tools optimization backend",
            "timestamp": asyncio.get_event_loop().time()
        }))
        
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
        
    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast message to all connected clients"""
        if not self.active_connections:
            return
            
        disconnected = []
        message_str = json.dumps(message)
        
        for connection in self.active_connections:
            try:
                await connection.send_text(message_str)
            except Exception as e:
                logger.warning(f"Failed to send message to WebSocket: {e}")
                disconnected.append(connection)
                
        # Remove disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
            
    async def send_to_connection(self, websocket: WebSocket, message: Dict[str, Any]):
        """Send message to a specific connection"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.warning(f"Failed to send message to specific WebSocket: {e}")
            self.disconnect(websocket)
                
    def get_connection_count(self) -> int:
        """Get the number of active connections"""
        return len(self.active_connections)
    
    async def broadcast_optimization_progress(self, progress: float, stage: str):
        """Broadcast optimization progress updates"""
        await self.broadcast({
            "type": "optimization_progress",
            "progress": progress,
            "stage": stage,
            "timestamp": asyncio.get_event_loop().time()
        })