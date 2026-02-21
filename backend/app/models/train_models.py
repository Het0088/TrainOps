from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

class TrainType(str, Enum):
    EXPRESS = "EXPRESS"
    PASSENGER = "PASSENGER" 
    FREIGHT = "FREIGHT"
    LOCAL = "LOCAL"
    SUPER_FAST = "SUPER_FAST"
    MAIL = "MAIL"
    SPECIAL = "SPECIAL"

class TrainStatus(str, Enum):
    ON_TIME = "ON_TIME"
    DELAYED = "DELAYED"
    CRITICAL = "CRITICAL" 
    REROUTED = "REROUTED"
    CANCELLED = "CANCELLED"

class DisruptionType(str, Enum):
    ACCIDENT = "ACCIDENT"
    SIGNAL_FAILURE = "SIGNAL_FAILURE"
    WEATHER_DELAY = "WEATHER_DELAY"
    PLATFORM_ISSUES = "PLATFORM_ISSUES"
    SECTION_BLOCKAGE = "SECTION_BLOCKAGE"
    TRAIN_DELAY = "TRAIN_DELAY"
    TRACK_BLOCKAGE = "TRACK_BLOCKAGE"
    PLATFORM_CLOSURE = "PLATFORM_CLOSURE"

class Priority(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class Severity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class TrainRouteData(BaseModel):
    station_id: str
    station_name: str
    scheduled_arrival: str
    scheduled_departure: str
    estimated_arrival: str
    estimated_departure: str
    platform_id: Optional[str] = None
    track_id: Optional[str] = None
    dwell_time: int = 2  # minutes
    distance: float = 0.0  # km from previous station
    travel_time: int = 30  # expected minutes
    is_origin: bool = False
    is_destination: bool = False

class TrainConstraint(BaseModel):
    type: str
    description: str
    value: float
    unit: str
    conflicts_with: List[str] = []

class TrainData(BaseModel):
    id: str
    number: str
    name: str
    type: TrainType
    priority: Priority
    status: TrainStatus
    current_station: str
    next_station: str
    scheduled_arrival: str
    estimated_arrival: str
    scheduled_departure: str
    estimated_departure: str
    delay: int = 0  # minutes
    platform: Optional[str] = None
    assigned_track: Optional[str] = None
    passengers: Optional[int] = None
    capacity: int
    route: List[TrainRouteData] = []
    constraints: List[TrainConstraint] = []
    operational_cost: float = 0.0  # per minute
    fuel_consumption: float = 0.0  # per km

class StationData(BaseModel):
    id: str
    name: str
    code: str
    platforms: List[Dict[str, Any]] = []
    tracks: List[str] = []
    coordinates: Dict[str, float] = {}
    capacity: int = 10
    processing_time: int = 5  # minutes

class DisruptionEvent(BaseModel):
    id: str
    type: DisruptionType
    severity: Severity
    location: str
    start_time: str
    end_time: Optional[str] = None
    description: str
    affected_trains: List[str] = []
    affected_sections: List[str] = []
    affected_platforms: List[str] = []
    estimated_delay: int = 0  # minutes
    cost_impact: float = 0.0
    mitigation_actions: List[str] = []

class OperationalRecommendation(BaseModel):
    type: str
    description: str
    priority: str
    confidence: float
    estimated_benefit: str
    implementation_cost: float

class KPIComparison(BaseModel):
    before: Dict[str, Any]
    after: Dict[str, Any]

class OptimizationResult(BaseModel):
    optimization_id: str
    status: str
    execution_time: float  # seconds
    affected_trains: int
    total_delay: int  # minutes
    rescheduled_trains: int
    cancelled_trains: int
    cost_impact: float
    solver_iterations: int
    objective_value: int
    kpi_comparison: KPIComparison
    recommendations: List[OperationalRecommendation]
    timestamp: str
    solver_used: str
    constraint_violations: List[str]
    alternative_solutions: List[Dict[str, Any]]

class TrainScheduleRequest(BaseModel):
    trains: List[TrainData]
    stations: List[StationData]
    disruptions: List[DisruptionEvent] = []
    constraints: Dict[str, Any] = {}
    optimization_params: Dict[str, Any] = {}