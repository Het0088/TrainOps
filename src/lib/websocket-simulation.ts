// Real-time WebSocket simulation service for TrainOps
export interface WebSocketMessage {
  type: 'train_position' | 'schedule_update' | 'alert' | 'system_status' | 'optimization_progress'
  timestamp: string
  data: any
}

export interface TrainPositionUpdate {
  trainId: string
  currentStation: string
  nextStation: string
  delay: number
  status: 'ON_TIME' | 'DELAYED' | 'CANCELLED' | 'DIVERTED'
  coordinates?: { lat: number; lng: number }
}

export interface ScheduleUpdate {
  trainId: string
  changes: {
    originalTime: string
    newTime: string
    station: string
    type: 'departure' | 'arrival'
  }[]
  reason: string
}

export interface SystemAlert {
  id: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  affectedTrains: string[]
  affectedStations: string[]
  estimatedResolution: string
}

export interface OptimizationProgress {
  scenarioId: string
  phase: string
  progress: number
  currentAction: string
  eta: string
}

export class WebSocketSimulation {
  private listeners: ((message: WebSocketMessage) => void)[] = []
  private intervals: NodeJS.Timeout[] = []
  private isActive = false

  // Subscribe to real-time updates
  subscribe(callback: (message: WebSocketMessage) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  // Start simulation
  start() {
    if (this.isActive) return
    this.isActive = true

    // Train position updates every 10 seconds
    const trainPositionInterval = setInterval(() => {
      this.broadcastTrainPositions()
    }, 10000)

    // Schedule updates every 30 seconds  
    const scheduleUpdateInterval = setInterval(() => {
      this.broadcastScheduleUpdates()
    }, 30000)

    // System alerts every 45 seconds
    const alertInterval = setInterval(() => {
      this.broadcastSystemAlerts()
    }, 45000)

    // System status every 20 seconds
    const statusInterval = setInterval(() => {
      this.broadcastSystemStatus()
    }, 20000)

    this.intervals = [
      trainPositionInterval,
      scheduleUpdateInterval,
      alertInterval,
      statusInterval
    ]
  }

  // Stop simulation
  stop() {
    this.isActive = false
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals = []
  }

  // Simulate optimization progress
  simulateOptimization(scenarioId: string): Promise<void> {
    return new Promise((resolve) => {
      const phases = [
        { name: 'Analyzing network topology', duration: 2000 },
        { name: 'Computing optimal paths', duration: 3000 },
        { name: 'Validating resource constraints', duration: 2500 },
        { name: 'Generating recommendations', duration: 1500 }
      ]

      let currentPhase = 0
      let progress = 0

      const progressInterval = setInterval(() => {
        progress += Math.random() * 15

        if (currentPhase < phases.length) {
          const phase = phases[currentPhase]
          
          this.broadcast({
            type: 'optimization_progress',
            timestamp: new Date().toISOString(),
            data: {
              scenarioId,
              phase: phase.name,
              progress: Math.min(progress, 100),
              currentAction: this.getRandomAction(),
              eta: this.calculateETA(progress)
            } as OptimizationProgress
          })

          if (progress >= (currentPhase + 1) * 25) {
            currentPhase++
            if (currentPhase >= phases.length) {
              clearInterval(progressInterval)
              resolve()
            }
          }
        }
      }, 500)
    })
  }

  private broadcast(message: WebSocketMessage) {
    this.listeners.forEach(listener => listener(message))
  }

  private broadcastTrainPositions() {
    const trains = this.generateTrainPositions()
    trains.forEach(train => {
      this.broadcast({
        type: 'train_position',
        timestamp: new Date().toISOString(),
        data: train
      })
    })
  }

  private broadcastScheduleUpdates() {
    const updates = this.generateScheduleUpdates()
    updates.forEach(update => {
      this.broadcast({
        type: 'schedule_update',
        timestamp: new Date().toISOString(),
        data: update
      })
    })
  }

  private broadcastSystemAlerts() {
    if (Math.random() < 0.3) { // 30% chance of alert
      const alert = this.generateSystemAlert()
      this.broadcast({
        type: 'alert',
        timestamp: new Date().toISOString(),
        data: alert
      })
    }
  }

  private broadcastSystemStatus() {
    this.broadcast({
      type: 'system_status',
      timestamp: new Date().toISOString(),
      data: {
        overall: Math.random() > 0.8 ? 'DEGRADED' : 'OPERATIONAL',
        signaling: Math.random() > 0.9 ? 'WARNING' : 'NORMAL',
        communications: Math.random() > 0.95 ? 'ERROR' : 'NORMAL',
        powerSystems: Math.random() > 0.92 ? 'WARNING' : 'NORMAL',
        trackStatus: Math.random() > 0.88 ? 'MAINTENANCE' : 'CLEAR'
      }
    })
  }

  private generateTrainPositions(): TrainPositionUpdate[] {
    const trains = ['T001', 'T002', 'T003', 'T004', 'T005']
    const stations = ['Mumbai Central', 'Borivali', 'Virar', 'Vasai Road', 'Nalasopara']
    
    return trains.slice(0, Math.floor(Math.random() * 3) + 1).map(trainId => ({
      trainId,
      currentStation: stations[Math.floor(Math.random() * stations.length)],
      nextStation: stations[Math.floor(Math.random() * stations.length)],
      delay: Math.random() < 0.3 ? Math.floor(Math.random() * 15) : 0,
      status: this.getRandomTrainStatus(),
      coordinates: {
        lat: 19.0760 + (Math.random() - 0.5) * 0.5,
        lng: 72.8777 + (Math.random() - 0.5) * 0.5
      }
    }))
  }

  private generateScheduleUpdates(): ScheduleUpdate[] {
    if (Math.random() < 0.4) return [] // 60% chance of no updates

    const trains = ['T001', 'T002', 'T003', 'T004', 'T005']
    const stations = ['Mumbai Central', 'Borivali', 'Virar', 'Vasai Road', 'Nalasopara']
    const reasons = [
      'Signal delay cleared',
      'Platform availability updated',
      'Crew change completed',
      'Track maintenance finished',
      'Weather conditions improved'
    ]

    return [{
      trainId: trains[Math.floor(Math.random() * trains.length)],
      changes: [{
        originalTime: '14:30',
        newTime: '14:35',
        station: stations[Math.floor(Math.random() * stations.length)],
        type: Math.random() > 0.5 ? 'departure' : 'arrival'
      }],
      reason: reasons[Math.floor(Math.random() * reasons.length)]
    }]
  }

  private generateSystemAlert(): SystemAlert {
    const severities: SystemAlert['severity'][] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    const titles = [
      'Track maintenance scheduled',
      'Signal system update',
      'Weather advisory',
      'Platform capacity warning',
      'Equipment malfunction detected'
    ]
    const trains = ['T001', 'T002', 'T003', 'T004', 'T005']
    const stations = ['Mumbai Central', 'Borivali', 'Virar', 'Vasai Road', 'Nalasopara']

    return {
      id: `alert-${Date.now()}`,
      severity: severities[Math.floor(Math.random() * severities.length)],
      title: titles[Math.floor(Math.random() * titles.length)],
      description: 'System monitoring has detected an event requiring attention.',
      affectedTrains: trains.slice(0, Math.floor(Math.random() * 3) + 1),
      affectedStations: stations.slice(0, Math.floor(Math.random() * 2) + 1),
      estimatedResolution: `${Math.floor(Math.random() * 60) + 15} minutes`
    }
  }

  private getRandomTrainStatus(): TrainPositionUpdate['status'] {
    const statuses: TrainPositionUpdate['status'][] = ['ON_TIME', 'DELAYED', 'CANCELLED', 'DIVERTED']
    const weights = [0.7, 0.2, 0.05, 0.05] // 70% on time, 20% delayed, etc.
    
    const random = Math.random()
    let cumulativeWeight = 0
    
    for (let i = 0; i < statuses.length; i++) {
      cumulativeWeight += weights[i]
      if (random <= cumulativeWeight) {
        return statuses[i]
      }
    }
    
    return 'ON_TIME'
  }

  private getRandomAction(): string {
    const actions = [
      'Calculating route alternatives',
      'Optimizing resource allocation',
      'Validating safety constraints',
      'Updating schedule matrices',
      'Analyzing passenger impact',
      'Coordinating with stations',
      'Checking equipment status',
      'Balancing network load'
    ]
    return actions[Math.floor(Math.random() * actions.length)]
  }

  private calculateETA(progress: number): string {
    const remainingTime = Math.max(0, (100 - progress) * 2) // 2 seconds per percentage
    const minutes = Math.floor(remainingTime / 60)
    const seconds = remainingTime % 60
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
  }
}

// Global instance
export const webSocketSimulation = new WebSocketSimulation()