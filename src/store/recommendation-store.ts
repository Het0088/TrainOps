import { create } from 'zustand'
import { AIRecommendation } from '@/types'

interface RecommendationState {
  recommendations: AIRecommendation[]
  loading: boolean
  error: string | null
  
  // Actions
  setRecommendations: (recommendations: AIRecommendation[]) => void
  addRecommendation: (recommendation: AIRecommendation) => void
  updateRecommendation: (id: string, updates: Partial<AIRecommendation>) => void
  approveRecommendation: (id: string, userId: string, reason?: string) => void
  rejectRecommendation: (id: string, userId: string, reason?: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useRecommendationStore = create<RecommendationState>((set, get) => ({
  recommendations: [],
  loading: false,
  error: null,
  
  setRecommendations: (recommendations) => set({ recommendations }),
  
  addRecommendation: (recommendation) => {
    const { recommendations } = get()
    set({ recommendations: [...recommendations, recommendation] })
  },
  
  updateRecommendation: (id, updates) => {
    const { recommendations } = get()
    const updatedRecommendations = recommendations.map(rec =>
      rec.id === id ? { ...rec, ...updates } : rec
    )
    set({ recommendations: updatedRecommendations })
  },
  
  approveRecommendation: (id, userId, reason) => {
    const { updateRecommendation } = get()
    updateRecommendation(id, {
      status: 'APPROVED',
      controllerAction: {
        action: 'APPROVE',
        timestamp: new Date().toISOString(),
        userId,
        reason
      }
    })
  },
  
  rejectRecommendation: (id, userId, reason) => {
    const { updateRecommendation } = get()
    updateRecommendation(id, {
      status: 'REJECTED',
      controllerAction: {
        action: 'OVERRIDE',
        timestamp: new Date().toISOString(),
        userId,
        reason
      }
    })
  },
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}))