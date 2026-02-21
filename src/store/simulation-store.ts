import { create } from 'zustand'
import { DisruptionEvent, SimulationScenario, OptimizationResult, SimulationTemplate } from '@/types'
import { STATIONS, TRACKS, generateTrainData, SAMPLE_DISRUPTIONS } from '@/lib/scaled-mock-data'

interface SimulationState {
  // Current simulation state
  currentScenario: SimulationScenario | null
  isOptimizing: boolean
  optimizationProgress: number
  systemStatus: 'NORMAL' | 'DISRUPTED' | 'OPTIMIZING'
  
  // Active disruptions and results
  activeDisruptions: DisruptionEvent[]
  optimizationResults: OptimizationResult | null
  
  // Historical data
  scenarios: SimulationScenario[]
  templates: SimulationTemplate[]
  
  // Actions
  setCurrentScenario: (scenario: SimulationScenario | null) => void
  setOptimizing: (isOptimizing: boolean) => void
  setOptimizationProgress: (progress: number) => void
  setSystemStatus: (status: 'NORMAL' | 'DISRUPTED' | 'OPTIMIZING') => void
  setActiveDisruptions: (disruptions: DisruptionEvent[]) => void
  setOptimizationResults: (results: OptimizationResult | null) => void
  addScenario: (scenario: SimulationScenario) => void
  updateScenario: (id: string, updates: Partial<SimulationScenario>) => void
  deleteScenario: (id: string) => void
  reset: () => void
  
  // Simulation orchestration
  simulateDisruption: (disruption: DisruptionEvent) => Promise<void>
  runOptimization: (scenario: SimulationScenario) => Promise<void>
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // Initial state
  currentScenario: null,
  isOptimizing: false,
  optimizationProgress: 0,
  systemStatus: 'NORMAL',
  activeDisruptions: [],
  optimizationResults: null,
  scenarios: [],
  templates: [
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
    },
    {
      id: 'signal-failure',
      name: 'Signal System Failure',
      category: 'MAINTENANCE',
      description: 'Critical signaling system malfunction',
      difficulty: 'HARD',
      estimatedDuration: 90,
      presetEvents: [{
        type: 'SIGNAL_FAILURE',
        severity: 'CRITICAL',
        title: 'Signal System Down',
        description: 'Manual operations required',
        startTime: new Date().toISOString(),
        duration: 60
      }]
    }
  ],

  // Basic setters
  setCurrentScenario: (scenario) => set({ currentScenario: scenario }),
  setOptimizing: (isOptimizing) => set({ isOptimizing }),
  setOptimizationProgress: (optimizationProgress) => set({ optimizationProgress }),
  setSystemStatus: (systemStatus) => set({ systemStatus }),
  setActiveDisruptions: (activeDisruptions) => set({ activeDisruptions }),
  setOptimizationResults: (optimizationResults) => set({ optimizationResults }),

  // Scenario management
  addScenario: (scenario) => set((state) => ({
    scenarios: [...state.scenarios, scenario]
  })),

  updateScenario: (id, updates) => set((state) => ({
    scenarios: state.scenarios.map(scenario =>
      scenario.id === id ? { ...scenario, ...updates } : scenario
    ),
    currentScenario: state.currentScenario?.id === id 
      ? { ...state.currentScenario, ...updates } 
      : state.currentScenario
  })),

  deleteScenario: (id) => set((state) => ({
    scenarios: state.scenarios.filter(scenario => scenario.id !== id),
    currentScenario: state.currentScenario?.id === id ? null : state.currentScenario
  })),

  reset: () => set({
    currentScenario: null,
    isOptimizing: false,
    optimizationProgress: 0,
    systemStatus: 'NORMAL',
    activeDisruptions: [],
    optimizationResults: null
  }),

  // Simulation orchestration
  simulateDisruption: async (disruption) => {
    const { runOptimization, addScenario, setCurrentScenario, setSystemStatus, setActiveDisruptions } = get()

    const newScenario: SimulationScenario = {
      id: `scenario-${Date.now()}`,
      name: `${disruption.type} Disruption - ${new Date().toLocaleTimeString()}`,
      description: disruption.description,
      status: 'RUNNING',
      createdAt: new Date().toISOString(),
      changes: [{
        ...disruption,
        id: `disruption-${Date.now()}`,
      }]
    }

    // Update state
    addScenario(newScenario)
    setCurrentScenario(newScenario)
    setSystemStatus('DISRUPTED')
    setActiveDisruptions(newScenario.changes)

    // Start optimization
    await runOptimization(newScenario)
  },

  runOptimization: async (scenario) => {
    const { 
      setOptimizing, 
      setOptimizationProgress, 
      setSystemStatus, 
      setOptimizationResults, 
      updateScenario 
    } = get()

    setOptimizing(true)
    setOptimizationProgress(0)
    setSystemStatus('OPTIMIZING')

    const startTime = Date.now()

    try {
      // Dynamic import to avoid circular dependency
      const { createOptimizationService } = await import('@/lib/optimization-service')
      const { useOptimizationStore } = await import('@/store/optimization-store')
      
      const optimizationService = createOptimizationService()
      const { recordOptimization } = useOptimizationStore.getState()

      // Run optimization using the service
      const results = await optimizationService.runOptimization(scenario, setOptimizationProgress)

      // Record performance metrics
      const executionTime = Date.now() - startTime
      recordOptimization(executionTime, results.status === 'SUCCESS')

      // Update results
      setOptimizationResults(results)
      updateScenario(scenario.id, {
        status: 'COMPLETED',
        executedAt: new Date().toISOString(),
        results: results
      })

    } catch (error) {
      console.error('Optimization failed:', error)
      
      // Record failure
      const executionTime = Date.now() - startTime
      const { useOptimizationStore } = await import('@/store/optimization-store')
      const { recordOptimization, config } = useOptimizationStore.getState()
      recordOptimization(executionTime, false)

      // Try fallback to mock if OR-Tools failed and fallback is enabled
      if (config.autoFallback && config.mode === 'ortools') {
        console.log('🔄 Falling back to mock optimization...')
        try {
          const { MockOptimizationService } = await import('@/lib/optimization-service')
          const mockService = new (MockOptimizationService as any)()
          const fallbackResults = await mockService.runOptimization(scenario, setOptimizationProgress)
          
          setOptimizationResults(fallbackResults)
          updateScenario(scenario.id, {
            status: 'COMPLETED',
            executedAt: new Date().toISOString(),
            results: fallbackResults
          })
        } catch (fallbackError) {
          updateScenario(scenario.id, {
            status: 'FAILED',
            executedAt: new Date().toISOString()
          })
        }
      } else {
        updateScenario(scenario.id, {
          status: 'FAILED',
          executedAt: new Date().toISOString()
        })
      }
    } finally {
      setOptimizing(false)
      setOptimizationProgress(0)
      setSystemStatus('NORMAL')
    }
  }

}))

// Helper functions to access scaled network data
export const getScaledNetworkData = () => ({
  stations: STATIONS,
  tracks: TRACKS,
  trains: generateTrainData(),
  sampleDisruptions: SAMPLE_DISRUPTIONS
})

export const getNetworkStatistics = () => {
  const trains = generateTrainData()
  return {
    totalStations: STATIONS.length,
    totalTracks: TRACKS.length,
    totalTrains: trains.length,
    trainsByType: {
      EXPRESS: trains.filter(t => t.type === 'EXPRESS').length,
      PASSENGER: trains.filter(t => t.type === 'PASSENGER').length,
      FREIGHT: trains.filter(t => t.type === 'FREIGHT').length,
      LOCAL: trains.filter(t => t.type === 'LOCAL').length,
      MAIL: trains.filter(t => t.type === 'MAIL').length
    },
    networkCapacity: TRACKS.reduce((sum, track) => sum + track.capacity, 0),
    totalNetworkLength: TRACKS.reduce((sum, track) => sum + track.length, 0)
  }
}