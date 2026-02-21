import { NextRequest, NextResponse } from 'next/server'
import { SimulationScenario, SimulationTemplate } from '@/types'

// Mock database for scenarios (in a real app, this would be a database)
let scenarios: SimulationScenario[] = []

const templates: SimulationTemplate[] = [
  {
    id: 'accident-template',
    name: 'Track Accident',
    category: 'ACCIDENT',
    description: 'Simulate a track accident blocking a section',
    difficulty: 'HARD',
    estimatedDuration: 120,
    presetEvents: [{
      type: 'ACCIDENT',
      severity: 'CRITICAL',
      title: 'Track Blockage',
      description: 'Accident blocks track section',
      startTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      duration: 90
    }]
  },
  {
    id: 'delay-template',
    name: 'Train Delay',
    category: 'CUSTOM',
    description: 'Simulate significant train delay',
    difficulty: 'MEDIUM',
    estimatedDuration: 60,
    presetEvents: [{
      type: 'DELAY_TRAIN',
      severity: 'MEDIUM',
      title: 'Express Train Delay',
      description: 'High-priority train delayed by 20 minutes',
      startTime: new Date().toISOString(),
      delayMinutes: 20
    }]
  },
  {
    id: 'platform-failure',
    name: 'Platform Unavailable',
    category: 'MAINTENANCE',
    description: 'Platform maintenance affects operations',
    difficulty: 'EASY',
    estimatedDuration: 45,
    presetEvents: [{
      type: 'PLATFORM_UNAVAILABLE',
      severity: 'LOW',
      title: 'Platform Maintenance',
      description: 'Platform unavailable for maintenance',
      startTime: new Date().toISOString(),
      duration: 60
    }]
  },
  {
    id: 'weather-disruption',
    name: 'Weather Event',
    category: 'WEATHER',
    description: 'Heavy rain affects multiple sections',
    difficulty: 'MEDIUM',
    estimatedDuration: 180,
    presetEvents: [{
      type: 'WEATHER_DELAY',
      severity: 'HIGH',
      title: 'Heavy Rain',
      description: 'Reduced visibility and speed limits',
      startTime: new Date().toISOString(),
      duration: 120
    }]
  }
]

// GET /api/simulation/scenarios - Get all scenarios and templates
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  try {
    if (type === 'templates') {
      return NextResponse.json({
        success: true,
        templates
      })
    }

    return NextResponse.json({
      success: true,
      scenarios,
      templates
    })

  } catch (error) {
    console.error('Error fetching scenarios:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scenarios' },
      { status: 500 }
    )
  }
}

// POST /api/simulation/scenarios - Create a new scenario
export async function POST(request: NextRequest) {
  try {
    const scenarioData = await request.json()

    const newScenario: SimulationScenario = {
      id: `scenario-${Date.now()}`,
      name: scenarioData.name || `Scenario ${scenarios.length + 1}`,
      description: scenarioData.description || 'Custom simulation scenario',
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      changes: scenarioData.changes || [],
      ...scenarioData
    }

    scenarios.push(newScenario)

    return NextResponse.json({
      success: true,
      scenario: newScenario
    })

  } catch (error) {
    console.error('Error creating scenario:', error)
    return NextResponse.json(
      { error: 'Failed to create scenario' },
      { status: 500 }
    )
  }
}

// PUT /api/simulation/scenarios - Update an existing scenario
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Scenario ID is required' },
        { status: 400 }
      )
    }

    const scenarioIndex = scenarios.findIndex(s => s.id === id)
    if (scenarioIndex === -1) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      )
    }

    scenarios[scenarioIndex] = {
      ...scenarios[scenarioIndex],
      ...updates
    }

    return NextResponse.json({
      success: true,
      scenario: scenarios[scenarioIndex]
    })

  } catch (error) {
    console.error('Error updating scenario:', error)
    return NextResponse.json(
      { error: 'Failed to update scenario' },
      { status: 500 }
    )
  }
}

// DELETE /api/simulation/scenarios - Delete a scenario
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Scenario ID is required' },
        { status: 400 }
      )
    }

    const scenarioIndex = scenarios.findIndex(s => s.id === id)
    if (scenarioIndex === -1) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      )
    }

    const deletedScenario = scenarios.splice(scenarioIndex, 1)[0]

    return NextResponse.json({
      success: true,
      scenario: deletedScenario
    })

  } catch (error) {
    console.error('Error deleting scenario:', error)
    return NextResponse.json(
      { error: 'Failed to delete scenario' },
      { status: 500 }
    )
  }
}