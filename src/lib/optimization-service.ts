import { OptimizationResult, SimulationScenario } from '@/types'
import { generateTrainData, STATIONS } from '@/lib/scaled-mock-data'
import { useOptimizationStore } from '@/store/optimization-store'

export interface OptimizationService {
  runOptimization(scenario: SimulationScenario, setProgress: (progress: number) => void): Promise<OptimizationResult>
}

// OR-Tools optimization implementation
class ORToolsOptimizationService implements OptimizationService {
  async runOptimization(
    scenario: SimulationScenario, 
    setProgress: (progress: number) => void
  ): Promise<OptimizationResult> {
    const config = useOptimizationStore.getState().config
    const endpoint = `${config.backendUrl}/api/optimize`
    
    console.log('🚀 Running OR-Tools optimization...')
    
    // Prepare OR-Tools request data
    const trains = generateTrainData()
    const requestData = {
      trains: trains.map(train => ({
        id: train.id,
        number: train.number,
        name: train.name,
        type: train.type,
        priority: train.priority,
        status: train.status,
        current_station: train.currentStation,
        next_station: train.nextStation,
        scheduled_arrival: train.scheduledArrival,
        estimated_arrival: train.estimatedArrival,
        scheduled_departure: train.scheduledDeparture,
        estimated_departure: train.estimatedDeparture,
        delay: train.delay,
        platform: train.platform,
        capacity: train.capacity,
        route: train.route.map(r => ({
          station_id: r.stationId,
          station_name: r.stationName,
          scheduled_arrival: r.scheduledArrival,
          scheduled_departure: r.scheduledDeparture,
          estimated_arrival: r.estimatedArrival,
          estimated_departure: r.estimatedDeparture,
          platform_id: r.platformId,
          dwell_time: r.dwellTime || 2
        }))
      })),
      stations: STATIONS.map(station => ({
        id: station.id,
        name: station.name,
        code: station.code,
        platforms: station.platforms.map(p => ({ id: p.id, name: p.id })),
        capacity: station.platforms.length
      })),
      disruptions: scenario.changes.map(change => ({
        id: change.id,
        type: change.type,
        severity: change.severity || 'MEDIUM',
        location: change.title || 'Unknown Location',
        start_time: change.startTime || new Date().toISOString(),
        end_time: change.endTime,
        description: change.description,
        affected_trains: [],
        estimated_delay: change.delayMinutes || 0
      })),
      constraints: {},
      optimization_params: {
        timeout: config.timeout / 1000, // Convert to seconds
        objective: 'minimize_delay'
      }
    }

    // Make API request with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`OR-Tools API error: ${response.status} ${response.statusText}`)
      }

      const orToolsResult = await response.json()

      // Convert OR-Tools result to our format
      return {
        scenarioId: scenario.id,
        executionTime: orToolsResult.execution_time * 1000, // Convert to ms
        status: orToolsResult.status === 'COMPLETED' ? 'SUCCESS' : 'PARTIAL',
        summary: {
          affectedTrains: orToolsResult.affected_trains,
          totalDelayMinutes: orToolsResult.total_delay,
          rescheduledTrains: orToolsResult.rescheduled_trains,
          reroutedTrains: Math.floor(orToolsResult.rescheduled_trains * 0.3),
          throughputImpact: orToolsResult.kpi_comparison?.after?.throughput - orToolsResult.kpi_comparison?.before?.throughput || -5,
          costImpact: orToolsResult.cost_impact
        },
        scheduleComparison: {
          original: { timestamp: new Date().toISOString(), trains: [], sections: [], platforms: [] },
          optimized: { timestamp: new Date().toISOString(), trains: [], sections: [], platforms: [] }
        },
        recommendations: orToolsResult.recommendations.map((rec: any) => ({
          id: `ortools-${rec.type}-${Date.now()}`,
          type: rec.type,
          trainId: `T${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`,
          priority: rec.priority,
          title: rec.description.split(' ').slice(0, 4).join(' '),
          description: rec.description,
          impact: rec.estimated_benefit,
          confidence: Math.floor(rec.confidence * 100),
          estimatedSaving: Math.floor(rec.implementation_cost / 100),
          implementationCost: rec.implementation_cost,
          autoApproved: rec.confidence > 0.8
        })),
        kpiImpact: {
          throughput: {
            original: orToolsResult.kpi_comparison?.before?.throughput || 24,
            optimized: orToolsResult.kpi_comparison?.after?.throughput || 20,
            change: (orToolsResult.kpi_comparison?.after?.throughput || 20) - (orToolsResult.kpi_comparison?.before?.throughput || 24),
            unit: 'trains/hour'
          },
          avgDelay: {
            original: orToolsResult.kpi_comparison?.before?.avg_delay || 8,
            optimized: orToolsResult.kpi_comparison?.after?.avg_delay || 15,
            change: (orToolsResult.kpi_comparison?.after?.avg_delay || 15) - (orToolsResult.kpi_comparison?.before?.avg_delay || 8),
            unit: 'minutes'
          },
          onTimePercentage: {
            original: orToolsResult.kpi_comparison?.before?.on_time_percentage || 92,
            optimized: orToolsResult.kpi_comparison?.after?.on_time_percentage || 78,
            change: (orToolsResult.kpi_comparison?.after?.on_time_percentage || 78) - (orToolsResult.kpi_comparison?.before?.on_time_percentage || 92),
            unit: 'percentage'
          },
          sectionUtilization: {
            original: 78,
            optimized: 82,
            change: 4,
            unit: 'percentage'
          }
        }
      }
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }
}

// Mock optimization implementation (existing behavior)
export class MockOptimizationService implements OptimizationService {
  async runOptimization(
    scenario: SimulationScenario,
    setProgress: (progress: number) => void
  ): Promise<OptimizationResult> {
    console.log('🎭 Running mock optimization...')
    
    // Simulate optimization process with progress
    const steps = 8
    const stepLabels = [
      'Loading current schedule...',
      'Analyzing disruptions...',
      'Generating constraints...',
      'Running mock solver...',
      'Evaluating solutions...',
      'Optimizing routes...',
      'Validating schedule...',
      'Generating recommendations...'
    ]

    for (let i = 0; i < steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProgress(((i + 1) / steps) * 100)
    }

    // Generate mock optimization results
    return {
      scenarioId: scenario.id,
      executionTime: Math.floor(Math.random() * 5000) + 3000, // 3-8 seconds
      status: Math.random() > 0.1 ? 'SUCCESS' : 'PARTIAL', // 90% success rate
      summary: {
        affectedTrains: Math.floor(Math.random() * 8) + 3,
        totalDelayMinutes: Math.floor(Math.random() * 60) + 15,
        rescheduledTrains: Math.floor(Math.random() * 5) + 1,
        reroutedTrains: Math.floor(Math.random() * 3),
        throughputImpact: -(Math.random() * 20 + 5), // Negative impact
        costImpact: Math.floor(Math.random() * 50000) + 10000
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
          id: 'rec-1',
          type: 'PLATFORM_CHANGE',
          trainId: 'T001',
          priority: 'HIGH',
          title: 'Change Platform Assignment',
          description: 'Reassign train to alternative platform to avoid conflict',
          impact: `Reduces delay by ${Math.floor(Math.random() * 20) + 5} minutes`,
          confidence: Math.floor(Math.random() * 20) + 80,
          estimatedSaving: Math.floor(Math.random() * 20) + 5,
          implementationCost: Math.floor(Math.random() * 1000) + 200,
          autoApproved: Math.random() > 0.7
        },
        {
          id: 'rec-2',
          type: 'HOLDING',
          trainId: 'T002',
          priority: 'MEDIUM',
          title: 'Implement Strategic Hold',
          description: 'Hold train at station to create operational buffer',
          impact: 'Prevents cascade delays across network',
          confidence: Math.floor(Math.random() * 25) + 75,
          estimatedSaving: Math.floor(Math.random() * 30) + 10,
          implementationCost: Math.floor(Math.random() * 500) + 100,
          autoApproved: Math.random() > 0.5
        }
      ],
      kpiImpact: {
        throughput: { 
          original: 24, 
          optimized: Math.floor(Math.random() * 6) + 18, 
          change: -(Math.floor(Math.random() * 6) + 1), 
          unit: 'trains/hour' 
        },
        avgDelay: { 
          original: 8, 
          optimized: Math.floor(Math.random() * 10) + 12, 
          change: Math.floor(Math.random() * 10) + 4, 
          unit: 'minutes' 
        },
        onTimePercentage: { 
          original: 92, 
          optimized: Math.floor(Math.random() * 15) + 75, 
          change: -(Math.floor(Math.random() * 15) + 2), 
          unit: 'percentage' 
        },
        sectionUtilization: { 
          original: 78, 
          optimized: Math.floor(Math.random() * 10) + 80, 
          change: Math.floor(Math.random() * 10) + 2, 
          unit: 'percentage' 
        }
      }
    }
  }
}

// Factory function to get the appropriate optimization service
export function createOptimizationService(): OptimizationService {
  const config = useOptimizationStore.getState().config
  
  if (config.mode === 'ortools') {
    return new ORToolsOptimizationService()
  } else {
    return new MockOptimizationService()
  }
}