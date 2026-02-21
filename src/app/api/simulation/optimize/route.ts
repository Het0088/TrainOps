import { NextRequest, NextResponse } from 'next/server'
import { DisruptionEvent, OptimizationResult } from '@/types'

// Mock function to simulate OR-Tools optimization
async function runORToolsOptimization(disruptions: DisruptionEvent[]): Promise<OptimizationResult> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 800))

  const scenarioId = `opt-${Date.now()}`
  const affectedTrains = Math.floor(Math.random() * 10) + 3
  const totalDelayMinutes = Math.floor(Math.random() * 90) + 30

  return {
    scenarioId,
    executionTime: Math.floor(Math.random() * 5000) + 2000,
    status: Math.random() > 0.1 ? 'SUCCESS' : 'PARTIAL',
    summary: {
      affectedTrains,
      totalDelayMinutes,
      rescheduledTrains: Math.floor(affectedTrains * 0.6),
      reroutedTrains: Math.floor(affectedTrains * 0.3),
      throughputImpact: -(Math.random() * 25 + 5),
      costImpact: Math.floor(Math.random() * 75000) + 15000
    },
    scheduleComparison: {
      original: {
        timestamp: new Date().toISOString(),
        trains: [],
        sections: [],
        platforms: []
      },
      optimized: {
        timestamp: new Date().toISOString(),
        trains: [],
        sections: [],
        platforms: []
      }
    },
    recommendations: [
      {
        id: `rec-${Date.now()}-1`,
        type: Math.random() > 0.5 ? 'PLATFORM_CHANGE' : 'ROUTE_CHANGE',
        trainId: `T${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
        priority: Math.random() > 0.6 ? 'HIGH' : Math.random() > 0.3 ? 'MEDIUM' : 'LOW',
        title: 'Optimize Platform Assignment',
        description: 'Reassign train to alternative platform to minimize conflicts',
        impact: `Reduces total delay by ${Math.floor(Math.random() * 25) + 5} minutes`,
        confidence: Math.floor(Math.random() * 30) + 70,
        estimatedSaving: Math.floor(Math.random() * 30) + 10,
        implementationCost: Math.floor(Math.random() * 2000) + 300,
        autoApproved: Math.random() > 0.6
      },
      {
        id: `rec-${Date.now()}-2`,
        type: 'HOLDING',
        trainId: `T${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
        priority: 'MEDIUM',
        title: 'Strategic Train Hold',
        description: 'Hold train at current station to prevent cascade delays',
        impact: 'Prevents system-wide disruption',
        confidence: Math.floor(Math.random() * 25) + 75,
        estimatedSaving: Math.floor(Math.random() * 45) + 15,
        implementationCost: Math.floor(Math.random() * 800) + 150,
        autoApproved: Math.random() > 0.4
      }
    ],
    kpiImpact: {
      throughput: {
        original: 24,
        optimized: Math.floor(Math.random() * 8) + 16,
        change: -(Math.floor(Math.random() * 8) + 1),
        unit: 'trains/hour'
      },
      avgDelay: {
        original: 8,
        optimized: Math.floor(Math.random() * 15) + 12,
        change: Math.floor(Math.random() * 15) + 4,
        unit: 'minutes'
      },
      onTimePercentage: {
        original: 92,
        optimized: Math.floor(Math.random() * 20) + 70,
        change: -(Math.floor(Math.random() * 20) + 2),
        unit: 'percentage'
      },
      sectionUtilization: {
        original: 78,
        optimized: Math.floor(Math.random() * 15) + 80,
        change: Math.floor(Math.random() * 15) + 2,
        unit: 'percentage'
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { disruptions, scenarioId } = await request.json()

    if (!disruptions || !Array.isArray(disruptions)) {
      return NextResponse.json(
        { error: 'Invalid disruptions data' },
        { status: 400 }
      )
    }

    // Run the optimization
    const result = await runORToolsOptimization(disruptions)

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        scenarioId: scenarioId || result.scenarioId
      }
    })

  } catch (error) {
    console.error('Optimization error:', error)
    return NextResponse.json(
      { error: 'Internal server error during optimization' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'OR-Tools Optimization API',
    endpoints: {
      POST: 'Run optimization with disruption data',
      GET: 'Get API information'
    },
    status: 'online'
  })
}