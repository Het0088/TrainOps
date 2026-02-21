import { NextResponse } from 'next/server'
import {
  generateTrainData,
  STATIONS,
  TRACKS,
  SAMPLE_DISRUPTIONS
} from '@/lib/scaled-mock-data'

export interface ScheduleEntry {
  trainId: string
  trainName: string
  route: {
    stationId: string
    stationName: string
    arrivalTime: string | null
    departureTime: string
    platform: string
    track: string
    delay: number
    status: 'ON_TIME' | 'DELAYED' | 'CANCELLED' | 'DIVERTED'
  }[]
  currentStatus: {
    currentStation: string
    nextStation: string
    estimatedArrival: string
    delay: number
  }
  disruptions: {
    id: string
    type: string
    description: string
    impact: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  }[]
}

export interface ScheduleResponse {
  timestamp: string
  schedules: ScheduleEntry[]
  summary: {
    totalTrains: number
    onTime: number
    delayed: number
    cancelled: number
    averageDelay: number
  }
  systemStatus: 'NORMAL' | 'DISRUPTED' | 'MAINTENANCE'
}

function generateScheduleRoute(train: any) {
  const numStops = Math.floor(Math.random() * 6) + 4 // 4-9 stops
  const selectedStations = [...STATIONS]
    .sort(() => Math.random() - 0.5)
    .slice(0, numStops)
    .sort((a, b) => a.id.localeCompare(b.id))

  let currentTime = new Date()
  currentTime.setHours(6 + Math.floor(Math.random() * 12)) // Start between 6AM-6PM

  return selectedStations.map((station, index) => {
    const arrivalTime = index === 0 ? null : currentTime.toTimeString().slice(0, 5)

    // Add 2-5 minutes for station time
    currentTime.setMinutes(currentTime.getMinutes() + Math.floor(Math.random() * 3) + 2)
    const departureTime = currentTime.toTimeString().slice(0, 5)

    // Add 15-45 minutes travel time to next station
    currentTime.setMinutes(currentTime.getMinutes() + Math.floor(Math.random() * 30) + 15)

    const delay = Math.random() < 0.3 ? Math.floor(Math.random() * 15) : 0

    return {
      stationId: station.id,
      stationName: station.name,
      arrivalTime,
      departureTime,
      platform: `P${Math.floor(Math.random() * 4) + 1}`,
      track: TRACKS[Math.floor(Math.random() * TRACKS.length)].id,
      delay,
      status: (delay > 0 ? 'DELAYED' : 'ON_TIME') as 'ON_TIME' | 'DELAYED' | 'CANCELLED' | 'DIVERTED'
    }
  })
}

function generateCurrentStatus(route: any[]) {
  const currentIndex = Math.floor(Math.random() * (route.length - 1))
  const current = route[currentIndex]
  const next = route[currentIndex + 1]

  return {
    currentStation: current.stationName,
    nextStation: next?.stationName || 'Terminal',
    estimatedArrival: next?.arrivalTime || current.departureTime,
    delay: Math.floor(Math.random() * 10)
  }
}

function generateTrainDisruptions() {
  if (Math.random() < 0.7) return [] // 70% chance of no disruptions

  const numDisruptions = Math.floor(Math.random() * 2) + 1
  return SAMPLE_DISRUPTIONS
    .sort(() => Math.random() - 0.5)
    .slice(0, numDisruptions)
    .map(disruption => ({
      id: `disrupt-${Date.now()}-${Math.random()}`,
      type: disruption.type,
      description: disruption.description,
      impact: `${Math.floor(Math.random() * 30) + 5} minute delay expected`,
      severity: disruption.severity
    }))
}

export async function GET() {
  try {
    const trains = generateTrainData()
    const schedules: ScheduleEntry[] = trains.map(train => {
      const route = generateScheduleRoute(train)
      const currentStatus = generateCurrentStatus(route)
      const disruptions = generateTrainDisruptions()

      return {
        trainId: train.id,
        trainName: train.name,
        route,
        currentStatus,
        disruptions
      }
    })

    // Calculate summary statistics
    const summary = {
      totalTrains: schedules.length,
      onTime: schedules.filter(s => s.route.every(r => r.status === 'ON_TIME')).length,
      delayed: schedules.filter(s => s.route.some(r => r.status === 'DELAYED')).length,
      cancelled: schedules.filter(s => s.route.some(r => r.status === 'CANCELLED')).length,
      averageDelay: Math.round(
        schedules.reduce((sum, s) =>
          sum + s.route.reduce((routeSum, r) => routeSum + r.delay, 0), 0
        ) / schedules.length
      )
    }

    const systemStatus = summary.delayed > summary.totalTrains * 0.3 ? 'DISRUPTED' :
      summary.cancelled > 0 ? 'MAINTENANCE' : 'NORMAL'

    const response: ScheduleResponse = {
      timestamp: new Date().toISOString(),
      schedules,
      summary,
      systemStatus
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Schedule API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule data' },
      { status: 500 }
    )
  }
}