'use client'

import { useEffect, useCallback, useRef } from 'react'

export function useApi() {
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers)
    headers.set('Content-Type', 'application/json')

    try {
      const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers
      })

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      return await response.json()
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error - please check your connection')
      }
      throw error
    }
  }, [])

  return { apiCall }
}

export function useWebSocket() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const updateTrainPositions = useCallback(() => {
    window.dispatchEvent(new CustomEvent('trainPositionUpdate', {
      detail: {
        trainId: `T00${Math.floor(Math.random() * 5) + 1}`,
        position: {
          progress: Math.floor(Math.random() * 100),
          sectionId: `SEC00${Math.floor(Math.random() * 5) + 1}`
        },
        timestamp: new Date().toISOString()
      }
    }))
  }, [])

  const emitAlert = useCallback((alert: any) => {
    window.dispatchEvent(new CustomEvent('newAlert', { detail: alert }))
  }, [])

  const emitRecommendation = useCallback((recommendation: any) => {
    window.dispatchEvent(new CustomEvent('newRecommendation', { detail: recommendation }))
  }, [])

  useEffect(() => {
    if (intervalRef.current) return

    intervalRef.current = setInterval(() => {
      updateTrainPositions()

      if (Math.random() < 0.1) {
        emitAlert({
          id: `ALR${Date.now()}`,
          type: 'SYSTEM',
          severity: 'INFO',
          title: 'System Update',
          message: 'Live data simulation active',
          affectedTrains: [],
          affectedSections: [],
          timestamp: new Date().toISOString(),
          acknowledged: false
        })
      }
    }, 10000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [updateTrainPositions, emitAlert])

  return { updateTrainPositions, emitAlert, emitRecommendation }
}