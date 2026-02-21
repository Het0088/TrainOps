// Realistic Mock Data Generator for TrainOps AI
// Generates time-series data and dynamic updates for demo scenarios

import { Train, Station, Track, Platform, TrainRoute, DisruptionEvent, TrainType } from '@/types'
import { STATIONS, TRACKS, generateTrainData, SAMPLE_DISRUPTIONS } from './scaled-mock-data'

export interface TimeSeriesDataPoint {
  timestamp: string
  value: number
  metadata?: Record<string, any>
}

export interface MockDataConfig {
  timeRange: {
    start: Date
    end: Date
    interval: number // milliseconds
  }
  scenarios: {
    normal: number // weight 0-1
    disrupted: number // weight 0-1
    peak: number // weight 0-1
    maintenance: number // weight 0-1
  }
  variability: {
    seasonal: boolean
    weatherImpact: boolean
    rushHourPatterns: boolean
    randomFluctuations: number // 0-1
  }
}

export interface MockScenario {
  id: string
  name: string
  description: string
  duration: number // minutes
  triggers: {
    timeOfDay?: string
    dayOfWeek?: string[]
    weatherCondition?: string
    passengerLoad?: 'LOW' | 'MEDIUM' | 'HIGH'
  }
  effects: {
    delayMultiplier: number
    capacityReduction: number
    incidentProbability: number
    passengerSatisfactionImpact: number
  }
  data: {
    trains: Partial<Train>[]
    disruptions: DisruptionEvent[]
    kpis: Record<string, number>
  }
}

export class RealisticMockDataGenerator {
  private config: MockDataConfig
  private scenarios: MockScenario[]
  private currentScenario: MockScenario | null = null
  private baselineData: {
    trains: Train[]
    kpis: Record<string, number>
  }

  constructor(config?: Partial<MockDataConfig>) {
    this.config = {
      timeRange: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        end: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours future
        interval: 5 * 60 * 1000 // 5 minutes
      },
      scenarios: {
        normal: 0.7,
        disrupted: 0.2,
        peak: 0.1,
        maintenance: 0.0
      },
      variability: {
        seasonal: true,
        weatherImpact: true,
        rushHourPatterns: true,
        randomFluctuations: 0.15
      },
      ...config
    }

    this.baselineData = {
      trains: generateTrainData(),
      kpis: this.generateBaselineKPIs()
    }

    this.scenarios = this.generateScenarios()
  }

  // Generate time-series data for KPIs
  generateKPITimeSeries(metric: string, baseValue?: number): TimeSeriesDataPoint[] {
    const points: TimeSeriesDataPoint[] = []
    const { start, end, interval } = this.config.timeRange
    
    let currentTime = new Date(start)
    let previousValue = baseValue || this.baselineData.kpis[metric] || 85
    
    while (currentTime <= end) {
      let value = previousValue
      
      // Apply time-of-day patterns
      if (this.config.variability.rushHourPatterns) {
        value *= this.getRushHourMultiplier(currentTime, metric)
      }
      
      // Apply seasonal patterns
      if (this.config.variability.seasonal) {
        value *= this.getSeasonalMultiplier(currentTime, metric)
      }
      
      // Apply weather impact
      if (this.config.variability.weatherImpact) {
        value *= this.getWeatherMultiplier(currentTime, metric)
      }
      
      // Apply current scenario effects
      if (this.currentScenario) {
        value *= this.getScenarioImpact(metric, currentTime)
      }
      
      // Add random fluctuations
      const randomFactor = 1 + (Math.random() - 0.5) * 2 * this.config.variability.randomFluctuations
      value *= randomFactor
      
      // Smooth transitions
      value = previousValue * 0.8 + value * 0.2
      
      points.push({
        timestamp: currentTime.toISOString(),
        value: Math.round(value * 100) / 100,
        metadata: {
          scenario: this.currentScenario?.name || 'normal',
          dayOfWeek: currentTime.getDay(),
          hourOfDay: currentTime.getHours()
        }
      })
      
      previousValue = value
      currentTime = new Date(currentTime.getTime() + interval)
    }
    
    return points
  }

  // Generate train position updates over time
  generateTrainMovementData(trainId: string): TimeSeriesDataPoint[] {
    const train = this.baselineData.trains.find(t => t.id === trainId)
    if (!train || !train.route) return []
    
    const points: TimeSeriesDataPoint[] = []
    const { start, end, interval } = this.config.timeRange
    
    let currentTime = new Date(start)
    let currentStationIndex = 0
    let delay = 0
    
    while (currentTime <= end && currentStationIndex < train.route.length) {
      const currentStation = train.route[currentStationIndex]
      const nextStation = train.route[currentStationIndex + 1]
      
      // Calculate progress between stations
      const stationArrivalTime = new Date(currentStation.estimatedArrival)
      const nextArrivalTime = nextStation ? new Date(nextStation.estimatedArrival) : currentTime
      const journeyProgress = Math.min(1, (currentTime.getTime() - stationArrivalTime.getTime()) / 
                                           (nextArrivalTime.getTime() - stationArrivalTime.getTime()))
      
      // Apply disruption effects
      if (this.shouldApplyDisruption(currentTime)) {
        delay += Math.random() * 10 + 2 // 2-12 minutes additional delay
      }
      
      points.push({
        timestamp: currentTime.toISOString(),
        value: journeyProgress,
        metadata: {
          trainId,
          currentStation: currentStation.stationName,
          nextStation: nextStation?.stationName || 'Terminal',
          delay,
          status: delay > 5 ? 'DELAYED' : 'ON_TIME',
          coordinates: this.interpolateCoordinates(currentStation, nextStation, journeyProgress)
        }
      })
      
      // Move to next station when journey is complete
      if (journeyProgress >= 1 && nextStation) {
        currentStationIndex++
      }
      
      currentTime = new Date(currentTime.getTime() + interval)
    }
    
    return points
  }

  // Generate passenger load patterns
  generatePassengerLoadData(): TimeSeriesDataPoint[] {
    const points: TimeSeriesDataPoint[] = []
    const { start, end, interval } = this.config.timeRange
    
    let currentTime = new Date(start)
    
    while (currentTime <= end) {
      const baseLoad = 100 // Base passenger count
      let load = baseLoad
      
      // Rush hour patterns (7-9 AM, 5-7 PM)
      const hour = currentTime.getHours()
      if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
        load *= 2.5 // 250% capacity during rush hours
      } else if ((hour >= 6 && hour <= 10) || (hour >= 16 && hour <= 20)) {
        load *= 1.8 // 180% capacity during extended peak
      } else if (hour >= 22 || hour <= 5) {
        load *= 0.3 // 30% capacity during night hours
      }
      
      // Weekend patterns
      if (currentTime.getDay() === 0 || currentTime.getDay() === 6) {
        load *= 0.7 // 70% of weekday traffic
      }
      
      // Add random variations
      load *= (0.8 + Math.random() * 0.4) // ±20% variation
      
      points.push({
        timestamp: currentTime.toISOString(),
        value: Math.round(load),
        metadata: {
          capacity: baseLoad * 1.2, // 120% of base is max capacity
          utilization: Math.min(100, (load / (baseLoad * 1.2)) * 100),
          peakHour: (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)
        }
      })
      
      currentTime = new Date(currentTime.getTime() + interval)
    }
    
    return points
  }

  // Generate weather impact data
  generateWeatherData(): TimeSeriesDataPoint[] {
    const points: TimeSeriesDataPoint[] = []
    const { start, end, interval } = this.config.timeRange
    
    let currentTime = new Date(start)
    let currentWeather = this.getRandomWeatherCondition()
    let weatherDuration = Math.random() * 4 + 2 // 2-6 hours
    
    while (currentTime <= end) {
      // Change weather conditions periodically
      if (Math.random() < 0.1) { // 10% chance per interval
        currentWeather = this.getRandomWeatherCondition()
        weatherDuration = Math.random() * 4 + 2
      }
      
      const impactFactor = this.getWeatherImpactFactor(currentWeather)
      
      points.push({
        timestamp: currentTime.toISOString(),
        value: impactFactor,
        metadata: {
          condition: currentWeather,
          visibility: Math.random() * 5 + 5, // 5-10 km
          windSpeed: Math.random() * 20 + 5, // 5-25 km/h
          precipitation: currentWeather.includes('Rain') ? Math.random() * 10 : 0
        }
      })
      
      currentTime = new Date(currentTime.getTime() + interval)
    }
    
    return points
  }

  // Generate dynamic disruption events
  generateDisruptionEvents(): DisruptionEvent[] {
    const events: DisruptionEvent[] = []
    const { start, end } = this.config.timeRange
    
    let currentTime = new Date(start)
    
    while (currentTime <= end) {
      // Higher probability during peak hours and bad weather
      const baseProb = 0.002 // 0.2% per 5-minute interval
      let probability = baseProb
      
      const hour = currentTime.getHours()
      if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
        probability *= 2 // Double during rush hours
      }
      
      if (Math.random() < probability) {
        const template = SAMPLE_DISRUPTIONS[Math.floor(Math.random() * SAMPLE_DISRUPTIONS.length)]
        const station = STATIONS[Math.floor(Math.random() * STATIONS.length)]
        
        events.push({
          ...template,
          id: `event-${currentTime.getTime()}-${Math.random()}`,
          stationId: station.id,
          platformId: station.platforms?.[0]?.id,
          sectionId: undefined,
          trainId: this.baselineData.trains[Math.floor(Math.random() * this.baselineData.trains.length)].id
        })
      }
      
      currentTime = new Date(currentTime.getTime() + this.config.timeRange.interval)
    }
    
    return events
  }

  // Activate a specific scenario
  activateScenario(scenarioId: string) {
    this.currentScenario = this.scenarios.find(s => s.id === scenarioId) || null
  }

  // Get current scenario
  getCurrentScenario(): MockScenario | null {
    return this.currentScenario
  }

  // Generate comprehensive demo dataset
  generateDemoDataset() {
    return {
      kpis: {
        onTimePerformance: this.generateKPITimeSeries('onTimePerformance', 87),
        averageDelay: this.generateKPITimeSeries('averageDelay', 8),
        passengerSatisfaction: this.generateKPITimeSeries('passengerSatisfaction', 8.2),
        trainUtilization: this.generateKPITimeSeries('trainUtilization', 76),
        safetyScore: this.generateKPITimeSeries('safetyScore', 96)
      },
      trainMovements: this.baselineData.trains.slice(0, 5).map(train => ({
        trainId: train.id,
        movements: this.generateTrainMovementData(train.id)
      })),
      passengerLoad: this.generatePassengerLoadData(),
      weather: this.generateWeatherData(),
      disruptions: this.generateDisruptionEvents(),
      scenarios: this.scenarios
    }
  }

  private generateBaselineKPIs(): Record<string, number> {
    return {
      onTimePerformance: 87.5,
      averageDelay: 8.2,
      passengerSatisfaction: 8.1,
      trainUtilization: 76.8,
      safetyScore: 96.3,
      energyEfficiency: 84.2,
      platformUtilization: 68.5,
      trackUtilization: 72.1
    }
  }

  private generateScenarios(): MockScenario[] {
    return [
      {
        id: 'normal-operations',
        name: 'Normal Operations',
        description: 'Standard daily operations with typical variations',
        duration: 480, // 8 hours
        triggers: {},
        effects: {
          delayMultiplier: 1.0,
          capacityReduction: 0.0,
          incidentProbability: 0.1,
          passengerSatisfactionImpact: 0.0
        },
        data: { trains: [], disruptions: [], kpis: {} }
      },
      {
        id: 'rush-hour-peak',
        name: 'Rush Hour Peak',
        description: 'High passenger demand during morning/evening rush',
        duration: 180, // 3 hours
        triggers: { timeOfDay: '07:00-09:00,17:00-19:00' },
        effects: {
          delayMultiplier: 1.4,
          capacityReduction: 0.2,
          incidentProbability: 0.25,
          passengerSatisfactionImpact: -0.3
        },
        data: { trains: [], disruptions: [], kpis: {} }
      },
      {
        id: 'weather-disruption',
        name: 'Weather Disruption',
        description: 'Heavy rain causing delays and reduced visibility',
        duration: 240, // 4 hours
        triggers: { weatherCondition: 'Heavy Rain' },
        effects: {
          delayMultiplier: 1.8,
          capacityReduction: 0.15,
          incidentProbability: 0.4,
          passengerSatisfactionImpact: -0.5
        },
        data: { trains: [], disruptions: [], kpis: {} }
      },
      {
        id: 'maintenance-window',
        name: 'Maintenance Window',
        description: 'Scheduled maintenance affecting track availability',
        duration: 360, // 6 hours
        triggers: { timeOfDay: '22:00-04:00', dayOfWeek: ['Sunday'] },
        effects: {
          delayMultiplier: 1.2,
          capacityReduction: 0.4,
          incidentProbability: 0.05,
          passengerSatisfactionImpact: -0.1
        },
        data: { trains: [], disruptions: [], kpis: {} }
      }
    ]
  }

  private getRushHourMultiplier(time: Date, metric: string): number {
    const hour = time.getHours()
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)
    
    switch (metric) {
      case 'onTimePerformance':
        return isRushHour ? 0.85 : 1.0
      case 'averageDelay':
        return isRushHour ? 1.6 : 1.0
      case 'passengerSatisfaction':
        return isRushHour ? 0.9 : 1.0
      default:
        return isRushHour ? 0.95 : 1.0
    }
  }

  private getSeasonalMultiplier(time: Date, metric: string): number {
    const month = time.getMonth()
    const isMonsoon = month >= 5 && month <= 8 // June-September
    
    switch (metric) {
      case 'onTimePerformance':
        return isMonsoon ? 0.9 : 1.0
      case 'averageDelay':
        return isMonsoon ? 1.3 : 1.0
      default:
        return isMonsoon ? 0.95 : 1.0
    }
  }

  private getWeatherMultiplier(time: Date, metric: string): number {
    const weather = this.getRandomWeatherCondition()
    const impactFactor = this.getWeatherImpactFactor(weather)
    
    switch (metric) {
      case 'onTimePerformance':
        return impactFactor
      case 'averageDelay':
        return 2 - impactFactor
      default:
        return 0.8 + impactFactor * 0.4
    }
  }

  private getScenarioImpact(metric: string, time: Date): number {
    if (!this.currentScenario) return 1.0
    
    const effects = this.currentScenario.effects
    
    switch (metric) {
      case 'onTimePerformance':
        return 1 - (effects.delayMultiplier - 1) * 0.5
      case 'averageDelay':
        return effects.delayMultiplier
      case 'passengerSatisfaction':
        return 1 + effects.passengerSatisfactionImpact * 0.1
      default:
        return 1 - effects.capacityReduction * 0.5
    }
  }

  private shouldApplyDisruption(time: Date): boolean {
    const hour = time.getHours()
    const baseProb = 0.01 // 1% chance per interval
    let probability = baseProb
    
    // Higher probability during peak hours
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      probability *= 2
    }
    
    return Math.random() < probability
  }

  private interpolateCoordinates(current: any, next: any, progress: number) {
    if (!current || !next) return undefined
    
    const currentCoords = STATIONS.find(s => s.name === current.stationName)?.coordinates
    const nextCoords = STATIONS.find(s => s.name === next.stationName)?.coordinates
    
    if (!currentCoords || !nextCoords) return currentCoords
    
    return {
      lat: currentCoords.lat + (nextCoords.lat - currentCoords.lat) * progress,
      lng: currentCoords.lng + (nextCoords.lng - currentCoords.lng) * progress
    }
  }

  private getRandomWeatherCondition(): string {
    const conditions = ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Fog']
    const weights = [0.3, 0.25, 0.2, 0.15, 0.08, 0.02]
    
    const random = Math.random()
    let cumulativeWeight = 0
    
    for (let i = 0; i < conditions.length; i++) {
      cumulativeWeight += weights[i]
      if (random <= cumulativeWeight) {
        return conditions[i]
      }
    }
    
    return 'Clear'
  }

  private getWeatherImpactFactor(weather: string): number {
    switch (weather) {
      case 'Clear': return 1.0
      case 'Partly Cloudy': return 0.98
      case 'Cloudy': return 0.95
      case 'Light Rain': return 0.85
      case 'Heavy Rain': return 0.7
      case 'Fog': return 0.75
      default: return 1.0
    }
  }
}

// Global instance for use across the application
export const mockDataGenerator = new RealisticMockDataGenerator()

// Export demo scenarios for quick access
export const DEMO_SCENARIOS = {
  NORMAL: 'normal-operations',
  RUSH_HOUR: 'rush-hour-peak',
  WEATHER: 'weather-disruption',
  MAINTENANCE: 'maintenance-window'
}