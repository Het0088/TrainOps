import { NextResponse } from 'next/server'
import { 
  generateTrainData, 
  STATIONS, 
  TRACKS,
  SAMPLE_DISRUPTIONS 
} from '@/lib/scaled-mock-data'

export interface DisruptionDetails {
  id: string
  type: 'ACCIDENT' | 'SIGNAL_FAILURE' | 'WEATHER_DELAY' | 'PLATFORM_UNAVAILABLE' | 'BLOCK_SECTION' | 'DELAY_TRAIN'
  title: string
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'ACTIVE' | 'RESOLVED' | 'INVESTIGATING' | 'MITIGATING'
  location: {
    stationId?: string
    stationName?: string
    trackId?: string
    sectionName?: string
    coordinates?: { lat: number; lng: number }
  }
  impact: {
    affectedTrains: string[]
    affectedStations: string[]
    estimatedDelay: number
    passengerCount: number
    serviceDisruption: 'MINOR' | 'MODERATE' | 'MAJOR' | 'SEVERE'
  }
  timeline: {
    reported: string
    acknowledged: string
    investigated?: string
    mitigated?: string
    resolved?: string
  }
  mitigation: {
    actions: string[]
    alternativeRoutes: string[]
    estimatedResolution: string
    resourcesDeployed: string[]
  }
  updates: {
    timestamp: string
    message: string
    author: string
    type: 'STATUS_UPDATE' | 'MITIGATION_STARTED' | 'RESOLUTION_UPDATE' | 'PASSENGER_INFO'
  }[]
}

export interface DisruptionStats {
  total: number
  active: number
  resolved: number
  byType: Record<string, number>
  bySeverity: Record<string, number>
  averageResolutionTime: number
  totalPassengersAffected: number
}

export interface DisruptionResponse {
  timestamp: string
  disruptions: DisruptionDetails[]
  stats: DisruptionStats
  heatMap: {
    stationId: string
    incidentCount: number
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  }[]
  predictions: {
    likelyDisruptions: {
      type: string
      probability: number
      timeWindow: string
      location: string
    }[]
    riskFactors: string[]
  }
}

function generateDisruptionTimeline() {
  const now = new Date()
  const reported = new Date(now.getTime() - Math.random() * 4 * 60 * 60 * 1000) // 0-4 hours ago
  const acknowledged = new Date(reported.getTime() + Math.random() * 30 * 60 * 1000) // 0-30 min after
  
  return {
    reported: reported.toISOString(),
    acknowledged: acknowledged.toISOString(),
    investigated: Math.random() > 0.5 ? 
      new Date(acknowledged.getTime() + Math.random() * 60 * 60 * 1000).toISOString() : undefined,
    mitigated: Math.random() > 0.7 ? 
      new Date(acknowledged.getTime() + Math.random() * 120 * 60 * 1000).toISOString() : undefined,
    resolved: Math.random() > 0.8 ? 
      new Date(acknowledged.getTime() + Math.random() * 180 * 60 * 1000).toISOString() : undefined
  }
}

function generateMitigationActions(disruptionType: string) {
  const actionsByType = {
    ACCIDENT: [
      'Emergency response team deployed',
      'Medical assistance coordinated',
      'Traffic diverted to alternative tracks',
      'Safety investigation initiated'
    ],
    SIGNAL_FAILURE: [
      'Signal maintenance team dispatched',
      'Manual block system activated',
      'Backup signaling systems enabled',
      'Speed restrictions implemented'
    ],
    WEATHER_DELAY: [
      'Weather monitoring systems activated',
      'Speed restrictions implemented',
      'Passenger advisory systems updated',
      'Alternative transportation arranged'
    ],
    PLATFORM_UNAVAILABLE: [
      'Platform inspection team deployed',
      'Passenger flow redirected',
      'Alternative boarding arrangements',
      'Maintenance crew coordinated'
    ],
    BLOCK_SECTION: [
      'Track inspection initiated',
      'Alternative routing implemented',
      'Engineering team deployed',
      'Traffic control measures activated'
    ],
    DELAY_TRAIN: [
      'Schedule optimization activated',
      'Crew replacement coordinated',
      'Passenger notifications sent',
      'Connection management initiated'
    ]
  }
  
  return actionsByType[disruptionType as keyof typeof actionsByType] || [
    'Investigation team deployed',
    'Monitoring systems activated',
    'Passenger updates initiated'
  ]
}

function generateDisruptionUpdates(disruptionType: string) {
  const updateTypes = ['STATUS_UPDATE', 'MITIGATION_STARTED', 'RESOLUTION_UPDATE', 'PASSENGER_INFO'] as const
  const authors = ['Control Room', 'Field Engineer', 'Station Manager', 'Operations Center']
  const now = new Date()
  
  const updates = []
  const numUpdates = Math.floor(Math.random() * 4) + 1
  
  for (let i = 0; i < numUpdates; i++) {
    const timestamp = new Date(now.getTime() - (numUpdates - i) * 30 * 60 * 1000)
    updates.push({
      timestamp: timestamp.toISOString(),
      message: `${disruptionType} situation update: ${i === 0 ? 'Incident reported and acknowledged' : 
               i === 1 ? 'Investigation team deployed' :
               i === 2 ? 'Mitigation measures implemented' : 'Resolution in progress'}`,
      author: authors[Math.floor(Math.random() * authors.length)],
      type: updateTypes[Math.min(i, updateTypes.length - 1)]
    })
  }
  
  return updates
}

function generateActiveDisruptions(): DisruptionDetails[] {
  const numDisruptions = Math.floor(Math.random() * 8) + 2 // 2-9 disruptions
  const trains = generateTrainData()
  
  return Array.from({ length: numDisruptions }, (_, index) => {
    const disruption = SAMPLE_DISRUPTIONS[Math.floor(Math.random() * SAMPLE_DISRUPTIONS.length)]
    const station = STATIONS[Math.floor(Math.random() * STATIONS.length)]
    const track = TRACKS[Math.floor(Math.random() * TRACKS.length)]
    const timeline = generateDisruptionTimeline()
    const status = timeline.resolved ? 'RESOLVED' : 
                  timeline.mitigated ? 'MITIGATING' :
                  timeline.investigated ? 'INVESTIGATING' : 'ACTIVE'
    
    const affectedTrains = trains
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 5) + 1)
      .map(t => t.id)
    
    const affectedStations = STATIONS
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1)
      .map(s => s.name)
    
    return {
      id: `disruption-${Date.now()}-${index}`,
      type: disruption.type as any,
      title: `${disruption.type.replace('_', ' ')} at ${station.name}`,
      description: disruption.description,
      severity: disruption.severity,
      status: status as any,
      location: {
        stationId: station.id,
        stationName: station.name,
        trackId: track.id,
        sectionName: `${station.name} Section`,
        coordinates: station.coordinates
      },
      impact: {
        affectedTrains,
        affectedStations,
        estimatedDelay: Math.floor(Math.random() * 45) + 15,
        passengerCount: Math.floor(Math.random() * 2000) + 500,
        serviceDisruption: disruption.severity === 'CRITICAL' ? 'SEVERE' :
                          disruption.severity === 'HIGH' ? 'MAJOR' :
                          disruption.severity === 'MEDIUM' ? 'MODERATE' : 'MINOR'
      },
      timeline,
      mitigation: {
        actions: generateMitigationActions(disruption.type),
        alternativeRoutes: TRACKS.filter(t => t.id !== track.id).slice(0, 2).map(t => t.name),
        estimatedResolution: `${Math.floor(Math.random() * 120) + 30} minutes`,
        resourcesDeployed: ['Field Engineer', 'Maintenance Crew', 'Control Room Operator']
      },
      updates: generateDisruptionUpdates(disruption.type)
    }
  })
}

function generateDisruptionStats(disruptions: DisruptionDetails[]): DisruptionStats {
  const active = disruptions.filter(d => d.status === 'ACTIVE').length
  const resolved = disruptions.filter(d => d.status === 'RESOLVED').length
  
  const byType = disruptions.reduce((acc, d) => {
    acc[d.type] = (acc[d.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const bySeverity = disruptions.reduce((acc, d) => {
    acc[d.severity] = (acc[d.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const totalPassengersAffected = disruptions.reduce((sum, d) => sum + d.impact.passengerCount, 0)
  const averageResolutionTime = Math.floor(Math.random() * 60) + 45 // 45-105 minutes
  
  return {
    total: disruptions.length,
    active,
    resolved,
    byType,
    bySeverity,
    averageResolutionTime,
    totalPassengersAffected
  }
}

function generateHeatMap(): { stationId: string; incidentCount: number; severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }[] {
  return STATIONS.map(station => {
    const random = Math.random()
    const severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 
      random > 0.8 ? 'CRITICAL' :
      random > 0.6 ? 'HIGH' :
      random > 0.4 ? 'MEDIUM' : 'LOW'
    
    return {
      stationId: station.id,
      incidentCount: Math.floor(Math.random() * 5),
      severity
    }
  }).filter(h => h.incidentCount > 0)
}

function generatePredictions() {
  const disruptionTypes = ['SIGNAL_FAILURE', 'WEATHER_DELAY', 'PLATFORM_UNAVAILABLE', 'DELAY_TRAIN']
  const timeWindows = ['Next 2 hours', 'Next 4 hours', 'Next 8 hours', 'Tomorrow']
  
  return {
    likelyDisruptions: disruptionTypes.map(type => ({
      type,
      probability: Math.round(Math.random() * 40 + 10), // 10-50%
      timeWindow: timeWindows[Math.floor(Math.random() * timeWindows.length)],
      location: STATIONS[Math.floor(Math.random() * STATIONS.length)].name
    })),
    riskFactors: [
      'High passenger volume during peak hours',
      'Weather forecast indicates potential delays',
      'Scheduled maintenance activities',
      'Historical data shows increased incidents on this route'
    ]
  }
}

export async function GET() {
  try {
    const disruptions = generateActiveDisruptions()
    const stats = generateDisruptionStats(disruptions)
    const heatMap = generateHeatMap()
    const predictions = generatePredictions()
    
    const response: DisruptionResponse = {
      timestamp: new Date().toISOString(),
      disruptions,
      stats,
      heatMap,
      predictions
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Disruptions API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch disruption data' },
      { status: 500 }
    )
  }
}