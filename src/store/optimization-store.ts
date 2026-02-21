import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type OptimizationMode = 'mock' | 'ortools'

interface OptimizationConfig {
  mode: OptimizationMode
  backendUrl: string
  timeout: number
  enableWebSocket: boolean
  autoFallback: boolean
}

interface OptimizationStore {
  // Configuration
  config: OptimizationConfig
  
  // Connection status
  isConnected: boolean
  connectionError: string | null
  lastOptimizationTime: number | null
  
  // Performance metrics
  avgOptimizationTime: number
  successRate: number
  totalOptimizations: number
  
  // Actions
  setMode: (mode: OptimizationMode) => void
  setBackendUrl: (url: string) => void
  setTimeout: (timeout: number) => void
  setWebSocketEnabled: (enabled: boolean) => void
  setAutoFallback: (enabled: boolean) => void
  updateConnectionStatus: (connected: boolean, error?: string) => void
  recordOptimization: (time: number, success: boolean) => void
  resetMetrics: () => void
  getOptimizationEndpoint: (endpoint: string) => string
}

const defaultConfig: OptimizationConfig = {
  mode: 'mock',
  backendUrl: 'http://localhost:8000',
  timeout: 30000, // 30 seconds
  enableWebSocket: true,
  autoFallback: true
}

export const useOptimizationStore = create<OptimizationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      config: defaultConfig,
      isConnected: false,
      connectionError: null,
      lastOptimizationTime: null,
      avgOptimizationTime: 0,
      successRate: 100,
      totalOptimizations: 0,

      // Actions
      setMode: (mode: OptimizationMode) => {
        set((state) => ({
          config: { ...state.config, mode },
          // Reset metrics when switching modes
          avgOptimizationTime: 0,
          successRate: 100,
          totalOptimizations: 0,
          connectionError: null
        }))
        
        // Log mode switch
        console.log(`🔧 Optimization mode switched to: ${mode.toUpperCase()}`)
      },

      setBackendUrl: (backendUrl: string) => {
        set((state) => ({
          config: { ...state.config, backendUrl },
          isConnected: false,
          connectionError: null
        }))
      },

      setTimeout: (timeout: number) => {
        set((state) => ({
          config: { ...state.config, timeout }
        }))
      },

      setWebSocketEnabled: (enableWebSocket: boolean) => {
        set((state) => ({
          config: { ...state.config, enableWebSocket }
        }))
      },

      setAutoFallback: (autoFallback: boolean) => {
        set((state) => ({
          config: { ...state.config, autoFallback }
        }))
      },

      updateConnectionStatus: (isConnected: boolean, error?: string) => {
        set({
          isConnected,
          connectionError: error || null
        })
      },

      recordOptimization: (time: number, success: boolean) => {
        set((state) => {
          const newTotal = state.totalOptimizations + 1
          const newAvgTime = ((state.avgOptimizationTime * state.totalOptimizations) + time) / newTotal
          const successCount = Math.round(state.successRate * state.totalOptimizations / 100) + (success ? 1 : 0)
          const newSuccessRate = (successCount / newTotal) * 100

          return {
            totalOptimizations: newTotal,
            avgOptimizationTime: newAvgTime,
            successRate: newSuccessRate,
            lastOptimizationTime: Date.now()
          }
        })
      },

      resetMetrics: () => {
        set({
          avgOptimizationTime: 0,
          successRate: 100,
          totalOptimizations: 0,
          lastOptimizationTime: null,
          connectionError: null
        })
      },

      getOptimizationEndpoint: (endpoint: string) => {
        const { config } = get()
        if (config.mode === 'mock') {
          // Use existing Next.js API routes for mock mode
          return `/api/${endpoint}`
        } else {
          // Use OR-Tools backend for real optimization
          return `${config.backendUrl}/api/${endpoint}`
        }
      }
    }),
    {
      name: 'optimization-store',
      partialize: (state) => ({
        config: state.config,
        avgOptimizationTime: state.avgOptimizationTime,
        successRate: state.successRate,
        totalOptimizations: state.totalOptimizations
      })
    }
  )
)

// Helper hooks for common use cases
export const useOptimizationMode = () => {
  const mode = useOptimizationStore((state) => state.config.mode)
  const setMode = useOptimizationStore((state) => state.setMode)
  const isORTools = mode === 'ortools'
  const isMock = mode === 'mock'
  
  return {
    mode,
    setMode,
    isORTools,
    isMock
  }
}

export const useOptimizationConnection = () => {
  const isConnected = useOptimizationStore((state) => state.isConnected)
  const connectionError = useOptimizationStore((state) => state.connectionError)
  const backendUrl = useOptimizationStore((state) => state.config.backendUrl)
  const updateStatus = useOptimizationStore((state) => state.updateConnectionStatus)
  
  return {
    isConnected,
    connectionError,
    backendUrl,
    updateStatus
  }
}

export const useOptimizationMetrics = () => {
  const avgTime = useOptimizationStore((state) => state.avgOptimizationTime)
  const successRate = useOptimizationStore((state) => state.successRate)
  const totalOptimizations = useOptimizationStore((state) => state.totalOptimizations)
  const lastOptimizationTime = useOptimizationStore((state) => state.lastOptimizationTime)
  const recordOptimization = useOptimizationStore((state) => state.recordOptimization)
  const resetMetrics = useOptimizationStore((state) => state.resetMetrics)
  
  return {
    avgTime,
    successRate,
    totalOptimizations,
    lastOptimizationTime,
    recordOptimization,
    resetMetrics
  }
}