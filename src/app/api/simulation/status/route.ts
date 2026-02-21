import { NextRequest, NextResponse } from 'next/server'

// Mock WebSocket-like streaming for simulation updates
// In a real implementation, this would use WebSocket or Server-Sent Events

interface SimulationUpdate {
  type: 'PROGRESS' | 'STATUS' | 'RESULT' | 'ERROR'
  timestamp: string
  scenarioId: string
  data: any
}

const activeSimulations = new Map<string, {
  status: 'RUNNING' | 'COMPLETED' | 'FAILED'
  progress: number
  startTime: string
}>()

// GET /api/simulation/status - Get simulation status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const scenarioId = searchParams.get('scenarioId')

  try {
    if (scenarioId) {
      const simulation = activeSimulations.get(scenarioId)
      if (!simulation) {
        return NextResponse.json(
          { error: 'Simulation not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        simulation: {
          scenarioId,
          ...simulation
        }
      })
    }

    // Return all active simulations
    const simulations = Array.from(activeSimulations.entries()).map(([id, sim]) => ({
      scenarioId: id,
      ...sim
    }))

    return NextResponse.json({
      success: true,
      simulations
    })

  } catch (error) {
    console.error('Error fetching simulation status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch simulation status' },
      { status: 500 }
    )
  }
}

// POST /api/simulation/status - Start or update simulation
export async function POST(request: NextRequest) {
  try {
    const { scenarioId, action, data } = await request.json()

    if (!scenarioId) {
      return NextResponse.json(
        { error: 'Scenario ID is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'START':
        activeSimulations.set(scenarioId, {
          status: 'RUNNING',
          progress: 0,
          startTime: new Date().toISOString()
        })
        break

      case 'UPDATE_PROGRESS':
        const sim = activeSimulations.get(scenarioId)
        if (sim) {
          sim.progress = data.progress || 0
          activeSimulations.set(scenarioId, sim)
        }
        break

      case 'COMPLETE':
        const completedSim = activeSimulations.get(scenarioId)
        if (completedSim) {
          completedSim.status = 'COMPLETED'
          completedSim.progress = 100
          activeSimulations.set(scenarioId, completedSim)
        }
        break

      case 'FAIL':
        const failedSim = activeSimulations.get(scenarioId)
        if (failedSim) {
          failedSim.status = 'FAILED'
          activeSimulations.set(scenarioId, failedSim)
        }
        break

      case 'STOP':
        activeSimulations.delete(scenarioId)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const simulation = activeSimulations.get(scenarioId)

    return NextResponse.json({
      success: true,
      simulation: simulation ? {
        scenarioId,
        ...simulation
      } : null
    })

  } catch (error) {
    console.error('Error updating simulation status:', error)
    return NextResponse.json(
      { error: 'Failed to update simulation status' },
      { status: 500 }
    )
  }
}

// DELETE /api/simulation/status - Stop simulation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const scenarioId = searchParams.get('scenarioId')

    if (!scenarioId) {
      return NextResponse.json(
        { error: 'Scenario ID is required' },
        { status: 400 }
      )
    }

    const existed = activeSimulations.has(scenarioId)
    activeSimulations.delete(scenarioId)

    return NextResponse.json({
      success: true,
      stopped: existed
    })

  } catch (error) {
    console.error('Error stopping simulation:', error)
    return NextResponse.json(
      { error: 'Failed to stop simulation' },
      { status: 500 }
    )
  }
}