import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    """Application configuration settings"""
    
    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # OR-Tools settings
    OPTIMIZATION_TIMEOUT: int = int(os.getenv("OPTIMIZATION_TIMEOUT", "30"))
    MAX_SOLVER_THREADS: int = int(os.getenv("MAX_SOLVER_THREADS", "4"))
    
    # Redis settings (optional for caching)
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL")
    
    # CORS settings
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]
    
    # Logging settings
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Performance settings
    MAX_TRAINS_PER_OPTIMIZATION: int = int(os.getenv("MAX_TRAINS_PER_OPTIMIZATION", "500"))
    MAX_STATIONS_PER_OPTIMIZATION: int = int(os.getenv("MAX_STATIONS_PER_OPTIMIZATION", "100"))

# Global settings instance
settings = Settings()