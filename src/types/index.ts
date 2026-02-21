// Enums
export enum TrainType {
  EXPRESS = 'EXPRESS',
  PASSENGER = 'PASSENGER',
  FREIGHT = 'FREIGHT',
  LOCAL = 'LOCAL',
  SUPER_FAST = 'SUPER_FAST',
  MAIL = 'MAIL',
  SPECIAL = 'SPECIAL'
}

export interface Train {
  id: string
  number: string
  name: string
  type: TrainType
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'ON_TIME' | 'DELAYED' | 'CRITICAL' | 'REROUTED' | 'CANCELLED'
  currentStation: string
  nextStation: string
  scheduledArrival: string
  estimatedArrival: string
  scheduledDeparture: string
  estimatedDeparture: string
  delay: number // in minutes
  platform?: string
  assignedTrack?: string
  position: {
    lat: number
    lng: number
    sectionId: string
    trackId: string
    progress: number // 0-100%
  }
  passengers?: number
  capacity: number
  route: TrainRoute[]
  constraints: TrainConstraint[]
  operationalCost: number // per minute
  fuelConsumption: number // per km
}

export interface TrainRoute {
  stationId: string
  stationName: string
  scheduledArrival: string
  scheduledDeparture: string
  estimatedArrival: string
  estimatedDeparture: string
  platformId?: string
  trackId?: string
  dwellTime: number // minutes
  distance: number // km from previous station
  travelTime: number // expected minutes
  isOrigin: boolean
  isDestination: boolean
}

export interface TrainConstraint {
  type: 'MIN_HEADWAY' | 'TRACK_OCCUPANCY' | 'PLATFORM_AVAILABILITY' | 'PRIORITY_ENFORCEMENT' | 'SPEED_LIMIT'
  description: string
  value: number
  unit: string
  conflictsWith?: string[] // other train IDs
}

export interface TrainSection {
  id: string
  name: string
  startStation: string
  endStation: string
  distance: number // in km
  maxSpeed: number
  currentTrains: string[]
  status: 'CLEAR' | 'OCCUPIED' | 'BLOCKED'
  signals: Signal[]
}

export interface Signal {
  id: string
  position: number // 0-100% along section
  status: 'GREEN' | 'YELLOW' | 'RED'
  type: 'AUTOMATIC' | 'MANUAL'
}

export interface ScheduleEvent {
  id: string
  type: 'departure' | 'arrival' | 'maintenance'
  trainId: string
  trainName: string
  time: string
  platform: string
  status: 'on-time' | 'delayed' | 'scheduled' | 'cancelled'
  delay?: number // in minutes
  duration?: number // in minutes for maintenance
}

export interface AIRecommendation {
  id: string
  type: 'PRECEDENCE' | 'HOLDING' | 'PLATFORM' | 'ROUTE'
  trainId: string
  title: string
  description: string
  impact: string
  confidence: number // 0-100%
  urgency: 'LOW' | 'MEDIUM' | 'HIGH'
  createdAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  controllerAction?: {
    action: 'APPROVE' | 'OVERRIDE' | 'DELAY'
    timestamp: string
    reason?: string
    userId: string
  }
}

export interface User {
  id: string
  name: string
  email: string
  role: 'CONTROLLER' | 'ADMIN' | 'OBSERVER'
  station?: string
  permissions: Permission[]
  lastActive: string
}

export interface Permission {
  resource: string
  actions: ('READ' | 'WRITE' | 'APPROVE' | 'OVERRIDE')[]
}

export interface Alert {
  id: string
  type: 'DELAY' | 'ACCIDENT' | 'WEATHER' | 'SYSTEM' | 'SECURITY'
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  title: string
  message: string
  affectedTrains: string[]
  affectedSections: string[]
  timestamp: string
  acknowledged: boolean
  acknowledgedBy?: string
}

export interface KPI {
  throughput: {
    current: number
    target: number
    unit: 'trains/hour'
  }
  avgDelay: {
    current: number
    target: number
    unit: 'minutes'
  }
  onTimePercentage: {
    current: number
    target: number
    unit: 'percentage'
  }
  sectionUtilization: {
    current: number
    target: number
    unit: 'percentage'
  }
}

export interface Schedule {
  id: string
  trainId: string
  stationId: string
  scheduledTime: string
  estimatedTime: string
  actualTime?: string
  platform?: string
  type: 'ARRIVAL' | 'DEPARTURE'
  status: 'SCHEDULED' | 'DELAYED' | 'COMPLETED' | 'CANCELLED'
}

export interface Track {
  id: string
  name: string
  type: 'MAIN' | 'LOOP' | 'SIDING' | 'YARD'
  direction: 'UP' | 'DOWN' | 'BIDIRECTIONAL'
  status: 'AVAILABLE' | 'OCCUPIED' | 'BLOCKED' | 'MAINTENANCE'
  maxSpeed: number // km/h
  length: number // km
  capacity: number // number of trains
  currentOccupancy: string[] // train IDs
  connectedStations: string[]
  signaling: 'AUTOMATIC' | 'MANUAL' | 'ELECTRONIC'
  electrification: boolean
  maintenanceWindows: MaintenanceWindow[]
}

export interface MaintenanceWindow {
  id: string
  startTime: string
  endTime: string
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY'
  affectedTracks: string[]
  affectedPlatforms: string[]
  description: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface Station {
  id: string
  name: string
  code: string
  platforms: Platform[]
  trackIds: string[] // References to Track IDs
  coordinates: {
    lat: number
    lng: number
  }
  facilities: string[]
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'CLOSED' | 'DISRUPTED'
  capacity: number
  currentOccupancy: number
  processingTimes: {
    express: number // minutes
    passenger: number
    freight: number
    local: number
  }
  operationalHours: {
    open: string
    close: string
  }
  maxSimultaneousOperations: number
  congestionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

export interface Platform {
  id: string
  stationId: string
  number: number
  length: number // meters
  trackIds: string[] // Track IDs this platform serves
  canHandle: TrainType[]
  isElectrified: boolean
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'BLOCKED'
  currentTrain?: string // Train ID
  maxTrainLength: number
  passengerFacilities: string[]
  signalSystems: string[]
}

export interface SystemStatus {
  id: string
  name: string
  type: 'SIGNALING' | 'TMS' | 'TIMETABLE' | 'ROLLING_STOCK' | 'WEATHER'
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR'
  lastUpdate: string
  health: number // 0-100%
  url?: string
}

export interface SimulationScenario {
  id: string
  name: string
  description: string
  status: 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  executedAt?: string
  changes: DisruptionEvent[]
  results?: OptimizationResult
}

export interface DisruptionEvent {
  id: string
  type: 'DELAY_TRAIN' | 'BLOCK_SECTION' | 'PLATFORM_UNAVAILABLE' | 'WEATHER_DELAY' | 'ACCIDENT' | 'SIGNAL_FAILURE'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  startTime: string
  endTime?: string
  duration?: number // in minutes
  // Event-specific data
  trainId?: string
  sectionId?: string
  platformId?: string
  stationId?: string
  delayMinutes?: number
  affectedArea?: {
    lat: number
    lng: number
    radius: number // in km
  }
}

export interface OptimizationResult {
  scenarioId: string
  executionTime: number // milliseconds
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED'
  summary: {
    affectedTrains: number
    totalDelayMinutes: number
    rescheduledTrains: number
    reroutedTrains: number
    throughputImpact: number // percentage
    costImpact: number // estimated cost
  }
  scheduleComparison: {
    original: ScheduleSnapshot
    optimized: ScheduleSnapshot
  }
  recommendations: OperationalRecommendation[]
  kpiImpact: KPIComparison
}

export interface ScheduleSnapshot {
  timestamp: string
  trains: TrainScheduleEntry[]
  sections: SectionUtilization[]
  platforms: PlatformAllocation[]
}

export interface TrainScheduleEntry {
  trainId: string
  trainNumber: string
  route: RouteSegment[]
  totalDelay: number
  status: 'NORMAL' | 'DELAYED' | 'REROUTED' | 'CANCELLED'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface RouteSegment {
  sectionId: string
  stationId: string
  scheduledEntry: string
  scheduledExit: string
  optimizedEntry: string
  optimizedExit: string
  platform?: string
  conflict?: boolean
}

export interface SectionUtilization {
  sectionId: string
  capacity: number
  utilization: number // percentage
  trains: string[]
  blocked: boolean
  blockReason?: string
}

export interface PlatformAllocation {
  platformId: string
  stationId: string
  allocations: {
    trainId: string
    startTime: string
    endTime: string
    type: 'ARRIVAL' | 'DEPARTURE' | 'MAINTENANCE'
  }[]
}

export interface OperationalRecommendation {
  id: string
  type: 'PRECEDENCE' | 'HOLDING' | 'PLATFORM_CHANGE' | 'ROUTE_CHANGE' | 'SPEED_ADJUSTMENT'
  trainId: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  impact: string
  confidence: number // 0-100%
  estimatedSaving: number // minutes
  implementationCost: number
  autoApproved: boolean
}

export interface KPIComparison {
  throughput: {
    original: number
    optimized: number
    change: number
    unit: 'trains/hour'
  }
  avgDelay: {
    original: number
    optimized: number
    change: number
    unit: 'minutes'
  }
  onTimePercentage: {
    original: number
    optimized: number
    change: number
    unit: 'percentage'
  }
  sectionUtilization: {
    original: number
    optimized: number
    change: number
    unit: 'percentage'
  }
}

export interface SimulationTemplate {
  id: string
  name: string
  category: 'ACCIDENT' | 'WEATHER' | 'MAINTENANCE' | 'PEAK_HOUR' | 'CUSTOM'
  description: string
  presetEvents: Omit<DisruptionEvent, 'id'>[]
  estimatedDuration: number // minutes
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
}

export interface SimulationMetrics {
  totalRuns: number
  avgOptimizationTime: number
  successRate: number
  mostAffectedSection: string
  peakDisruptionHour: number
  totalTrainsRerouted: number
  totalDelayMinutes: number
}