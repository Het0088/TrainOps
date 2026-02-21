import { NextRequest, NextResponse } from 'next/server'
import { generateTrainData, STATIONS, TRACKS } from '@/lib/scaled-mock-data'

export interface TrainResponse {
  id: string
  name: string
  status: 'ON_TIME' | 'DELAYED' | 'CANCELLED' | 'DIVERTED'
  currentLocation: {
    stationId: string
    stationName: string
    arrivalTime: string
    departureTime: string
    platform: string
  }
  route: {
    stationId: string
    stationName: string
    arrivalTime: string | null
    departureTime: string
    platform: string
    delay: number
  }[]
  delay: number
  passengerCount: number
  capacity: number
  type: string
  coordinates?: { lat: number; lng: number }
}

function enrichTrainData(trains: any[]): TrainResponse[] {
  return trains.map(train => {
    const currentStation = STATIONS[Math.floor(Math.random() * STATIONS.length)]
    const route = STATIONS.slice(0, Math.floor(Math.random() * 5) + 3).map((station, index) => {
      const baseTime = new Date()
      baseTime.setHours(6 + index * 2) // Stagger departures
      
      return {
        stationId: station.id,
        stationName: station.name,
        arrivalTime: index === 0 ? null : baseTime.toTimeString().slice(0, 5),
        departureTime: new Date(baseTime.getTime() + 5 * 60 * 1000).toTimeString().slice(0, 5),
        platform: `P${Math.floor(Math.random() * 4) + 1}`,
        delay: Math.random() < 0.3 ? Math.floor(Math.random() * 15) : 0
      }
    })

    const delay = Math.floor(Math.random() * 20)
    
    return {
      id: train.id,
      name: train.name,
      status: delay > 10 ? 'DELAYED' : delay > 0 ? 'DELAYED' : 'ON_TIME',
      currentLocation: {
        stationId: currentStation.id,
        stationName: currentStation.name,
        arrivalTime: new Date().toTimeString().slice(0, 5),
        departureTime: new Date(Date.now() + 10 * 60 * 1000).toTimeString().slice(0, 5),
        platform: `P${Math.floor(Math.random() * 4) + 1}`
      },
      route,
      delay,
      passengerCount: Math.floor(Math.random() * 800) + 200,
      capacity: 1000,
      type: train.type,
      coordinates: currentStation.coordinates
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const url = new URL(request.url)
    const limit = url.searchParams.get('limit')
    const status = url.searchParams.get('status')
    const includeRoute = url.searchParams.get('includeRoute') === 'true'
    
    let trains = generateTrainData()
    let enrichedTrains = enrichTrainData(trains)
    
    // Filter by status if provided
    if (status) {
      enrichedTrains = enrichedTrains.filter(train => train.status === status)
    }
    
    // Limit results if specified
    if (limit) {
      enrichedTrains = enrichedTrains.slice(0, parseInt(limit))
    }
    
    // Remove route data if not requested to reduce payload size
    if (!includeRoute) {
      enrichedTrains = enrichedTrains.map(train => ({
        ...train,
        route: [] // Empty route to reduce payload
      }))
    }
    
    // Calculate summary stats
    const summary = {
      total: enrichedTrains.length,
      onTime: enrichedTrains.filter(t => t.status === 'ON_TIME').length,
      delayed: enrichedTrains.filter(t => t.status === 'DELAYED').length,
      cancelled: enrichedTrains.filter(t => t.status === 'CANCELLED').length,
      averageDelay: Math.round(
        enrichedTrains.reduce((sum, t) => sum + t.delay, 0) / enrichedTrains.length
      )
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
      data: enrichedTrains,
      count: enrichedTrains.length
    })
  } catch (error) {
    console.error('Trains API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trains data' },
      { status: 500 }
    )
  }
}