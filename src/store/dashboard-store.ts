import { create } from 'zustand'
import { Alert, KPI, SystemStatus } from '@/types'

interface DashboardState {
  kpis: KPI | null
  alerts: Alert[]
  systemStatus: SystemStatus[]
  loading: boolean
  error: string | null
  lastUpdated: string | null
  
  // Actions
  setKpis: (kpis: KPI) => void
  setAlerts: (alerts: Alert[]) => void
  setSystemStatus: (systems: SystemStatus[]) => void
  addAlert: (alert: Alert) => void
  acknowledgeAlert: (alertId: string, userId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateLastUpdated: () => void
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  kpis: null,
  alerts: [],
  systemStatus: [],
  loading: false,
  error: null,
  lastUpdated: null,
  
  setKpis: (kpis) => set({ kpis }),
  setAlerts: (alerts) => set({ alerts }),
  setSystemStatus: (systemStatus) => set({ systemStatus }),
  
  addAlert: (alert) => {
    const { alerts } = get()
    set({ alerts: [alert, ...alerts] })
  },
  
  acknowledgeAlert: (alertId, userId) => {
    const { alerts } = get()
    const updatedAlerts = alerts.map(alert =>
      alert.id === alertId 
        ? { ...alert, acknowledged: true, acknowledgedBy: userId }
        : alert
    )
    set({ alerts: updatedAlerts })
  },
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  updateLastUpdated: () => set({ lastUpdated: new Date().toISOString() })
}))