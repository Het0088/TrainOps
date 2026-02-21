import { create } from 'zustand'
import { Train, TrainSection } from '@/types'

interface TrainState {
  trains: Train[]
  sections: TrainSection[]
  selectedTrain: Train | null
  loading: boolean
  error: string | null
  
  // Actions
  setTrains: (trains: Train[]) => void
  setSections: (sections: TrainSection[]) => void
  setSelectedTrain: (train: Train | null) => void
  updateTrain: (train: Train) => void
  updateTrainPosition: (trainId: string, position: Train['position']) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useTrainStore = create<TrainState>((set, get) => ({
  trains: [],
  sections: [],
  selectedTrain: null,
  loading: false,
  error: null,
  
  setTrains: (trains) => set({ trains }),
  setSections: (sections) => set({ sections }),
  setSelectedTrain: (selectedTrain) => set({ selectedTrain }),
  
  updateTrain: (updatedTrain) => {
    const { trains } = get()
    const updatedTrains = trains.map(train =>
      train.id === updatedTrain.id ? updatedTrain : train
    )
    set({ trains: updatedTrains })
  },
  
  updateTrainPosition: (trainId, position) => {
    const { trains } = get()
    const updatedTrains = trains.map(train =>
      train.id === trainId ? { ...train, position } : train
    )
    set({ trains: updatedTrains })
  },
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}))