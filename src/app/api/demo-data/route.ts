import { NextResponse } from 'next/server'
import { mockDataGenerator, DEMO_SCENARIOS } from '@/lib/realistic-mock-generator'

export interface DemoDataRequest {
  scenario?: string
  timeRange?: {
    hours: number // How many hours of data to generate
  }
  metrics?: string[] // Which metrics to include
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const scenario = searchParams.get('scenario') || DEMO_SCENARIOS.NORMAL
    const hours = parseInt(searchParams.get('hours') || '24')
    const metricsParam = searchParams.get('metrics')
    const requestedMetrics = metricsParam ? metricsParam.split(',') : null
    
    // Configure the generator for the requested time range
    const now = new Date()
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000)
    
    // Activate the requested scenario
    mockDataGenerator.activateScenario(scenario)
    
    // Generate the complete dataset
    const dataset = mockDataGenerator.generateDemoDataset()
    
    // Filter metrics if specific ones were requested
    let filteredKPIs = dataset.kpis
    if (requestedMetrics) {
      filteredKPIs = Object.keys(dataset.kpis)
        .filter(key => requestedMetrics.includes(key))
        .reduce((obj, key) => {
          const typedKey = key as keyof typeof dataset.kpis
          obj[typedKey] = dataset.kpis[typedKey]
          return obj
        }, {} as typeof dataset.kpis)
    }
    
    // Calculate summary statistics
    const summary = {
      dataPoints: Object.values(filteredKPIs).reduce((sum, series) => sum + series.length, 0),
      timeRange: {
        start: startTime.toISOString(),
        end: now.toISOString(),
        duration: `${hours} hours`
      },
      trains: dataset.trainMovements.length,
      disruptions: dataset.disruptions.length,
      scenario: {
        id: scenario,
        name: mockDataGenerator.getCurrentScenario()?.name || 'Unknown',
        active: !!mockDataGenerator.getCurrentScenario()
      }
    }
    
    const response = {
      timestamp: new Date().toISOString(),
      summary,
      data: {
        kpis: filteredKPIs,
        trainMovements: dataset.trainMovements,
        passengerLoad: dataset.passengerLoad,
        weather: dataset.weather,
        disruptions: dataset.disruptions
      },
      scenarios: dataset.scenarios.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        duration: s.duration
      }))
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Demo data API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate demo data' },
      { status: 500 }
    )
  }
}

// POST endpoint to activate scenarios or update configuration
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { scenario, action } = body
    
    if (action === 'activate_scenario' && scenario) {
      mockDataGenerator.activateScenario(scenario)
      
      return NextResponse.json({
        success: true,
        message: `Scenario '${scenario}' activated`,
        currentScenario: mockDataGenerator.getCurrentScenario()
      })
    }
    
    if (action === 'generate_live_data') {
      // Generate current snapshot with live data
      const liveData = {
        timestamp: new Date().toISOString(),
        kpis: {
          onTimePerformance: mockDataGenerator.generateKPITimeSeries('onTimePerformance', 87).slice(-1)[0],
          averageDelay: mockDataGenerator.generateKPITimeSeries('averageDelay', 8).slice(-1)[0],
          passengerSatisfaction: mockDataGenerator.generateKPITimeSeries('passengerSatisfaction', 8.2).slice(-1)[0]
        },
        passengerLoad: mockDataGenerator.generatePassengerLoadData().slice(-1)[0],
        weather: mockDataGenerator.generateWeatherData().slice(-1)[0],
        recentDisruptions: mockDataGenerator.generateDisruptionEvents().slice(-3) // Last 3 disruptions
      }
      
      return NextResponse.json({
        success: true,
        data: liveData
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action specified' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Demo data POST API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}