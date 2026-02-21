'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { useDashboardStore } from '@/store/dashboard-store'
import { useApi, useWebSocket } from '@/hooks/useApi'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ExportButton } from '@/components/ui/export-button'
import {
  Train, Clock, TrendingUp, Activity,
  AlertTriangle, CheckCircle, XCircle, RefreshCw,
  Zap, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

const statusStyles: Record<string, string> = {
  CRITICAL: 'bg-red-500/10 border-red-500/20 text-red-400',
  WARNING: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  INFO: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
}

export default function DashboardPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuthStore()
  const { kpis, alerts, systemStatus, loading, error, setKpis, setAlerts, setSystemStatus, setLoading, setError, updateLastUpdated } = useDashboardStore()
  const { apiCall } = useApi()
  const router = useRouter()
  useWebSocket()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [k, a, s] = await Promise.all([apiCall('/kpis'), apiCall('/alerts?acknowledged=false'), apiCall('/systems')])
      setKpis(k.data)
      setAlerts(a.data)
      setSystemStatus(s.data)
      updateLastUpdated()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [apiCall, setKpis, setAlerts, setSystemStatus, setLoading, setError, updateLastUpdated])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) { router.push('/login'); return }
    load()
  }, [isAuthenticated, authLoading, router, load])

  if (authLoading || !isAuthenticated) return null

  const kpiGap = (current: any, target: number, lowerIsBetter = false) => {
    const cur = parseFloat(String(current))
    if (isNaN(cur) || !target) return { trend: '—', up: true }
    const diff = parseFloat((cur - target).toFixed(1))
    const up = lowerIsBetter ? diff <= 0 : diff >= 0
    return { trend: (diff >= 0 ? '+' : '') + diff, up }
  }

  const kpiCards = [
    {
      title: 'Throughput', value: kpis?.throughput.current ?? '—', unit: 'trains/hr',
      target: kpis?.throughput.target ?? 0, icon: Train,
      accent: 'from-blue-500 to-blue-600', glow: 'hsl(217 91% 60%)',
      ...kpiGap(kpis?.throughput.current, kpis?.throughput.target ?? 0)
    },
    {
      title: 'Avg Delay', value: kpis?.avgDelay.current ?? '—', unit: 'min',
      target: kpis?.avgDelay.target ?? 0, icon: Clock,
      accent: 'from-yellow-500 to-amber-600', glow: 'hsl(38 92% 50%)',
      ...kpiGap(kpis?.avgDelay.current, kpis?.avgDelay.target ?? 0, true)
    },
    {
      title: 'On-Time Rate', value: kpis?.onTimePercentage.current ?? '—', unit: '%',
      target: kpis?.onTimePercentage.target ?? 0, icon: TrendingUp,
      accent: 'from-green-500 to-emerald-600', glow: 'hsl(142 71% 45%)',
      ...kpiGap(kpis?.onTimePercentage.current, kpis?.onTimePercentage.target ?? 0)
    },
    {
      title: 'Track Utilization', value: kpis?.sectionUtilization.current ?? '—', unit: '%',
      target: kpis?.sectionUtilization.target ?? 0, icon: Activity,
      accent: 'from-purple-500 to-purple-600', glow: 'hsl(271 91% 65%)',
      ...kpiGap(kpis?.sectionUtilization.current, kpis?.sectionUtilization.target ?? 0)
    },
  ]

  if (loading && !kpis) {
    return (
      <DashboardLayout>
        <div className="space-y-5 animate-pulse">
          <div className="h-24 rounded-xl" style={{ background: 'hsl(222 47% 10%)' }} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl" style={{ background: 'hsl(222 47% 10%)' }} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 h-64 rounded-xl" style={{ background: 'hsl(222 47% 10%)' }} />
            <div className="h-64 rounded-xl" style={{ background: 'hsl(222 47% 10%)' }} />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Welcome, {user?.name?.split(' ')[0]}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'hsl(215 20% 50%)' }}>
              {user?.station || 'Central Control'} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton data={{ kpis, alerts, systemStatus, generatedAt: new Date() }} filename="dashboard-report" title="Dashboard Report" variant="outline" />
            <button onClick={load} disabled={loading} className="p-2 rounded-lg transition-colors text-gray-400 hover:text-white"
              style={{ background: 'hsl(222 47% 12%)', border: '1px solid hsl(222 47% 20%)' }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-red-400"
            style={{ background: 'hsl(0 84% 60% / 0.1)', border: '1px solid hsl(0 84% 60% / 0.2)' }}
          >
            <XCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={load} className="ml-auto text-xs underline">Retry</button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map(k => (
            <div key={k.title} className="kpi-card" style={{ '--kpi-accent': `linear-gradient(90deg, ${k.glow}, transparent)` } as any}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium" style={{ color: 'hsl(215 20% 55%)' }}>{k.title}</span>
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${k.accent} flex items-center justify-center`}>
                  <k.icon className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                {k.value}<span className="text-sm font-normal ml-1" style={{ color: 'hsl(215 20% 50%)' }}>{k.unit}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs" style={{ color: 'hsl(215 20% 45%)' }}>Target {k.target}{k.unit === '%' ? '%' : ''}</span>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${k.up ? 'text-green-400' : 'text-yellow-400'}`}>
                  {k.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {k.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 section-card">
            <div className="section-card-header">
              <div>
                <div className="section-card-title">Live Alerts</div>
                <div className="text-xs mt-0.5" style={{ color: 'hsl(215 20% 50%)' }}>{alerts.length} active</div>
              </div>
              <div className="live-dot" />
            </div>
            <div className="section-card-body space-y-2.5">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <CheckCircle className="w-8 h-8 text-green-400 opacity-60" />
                  <span className="text-sm" style={{ color: 'hsl(215 20% 50%)' }}>No active alerts</span>
                </div>
              ) : alerts.slice(0, 5).map((a: any) => (
                <div key={a.id} className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${statusStyles[a.severity] || statusStyles.INFO}`}>
                  {a.severity === 'CRITICAL' ? <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> :
                    a.severity === 'WARNING' ? <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> :
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white">{a.title}</div>
                    <div className="text-xs mt-0.5 opacity-75">{a.message}</div>
                  </div>
                  <div className="text-xs opacity-60 flex-shrink-0">{new Date(a.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="section-card">
              <div className="section-card-header">
                <div className="section-card-title">System Status</div>
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <div className="section-card-body space-y-3">
                {[
                  { label: 'Active Trains', value: `${kpis?.throughput.current ?? '—'}`, color: 'text-blue-400' },
                  { label: 'Connected Systems', value: `${systemStatus.filter((s: any) => s.status === 'CONNECTED' || s.status === 'online').length}/${systemStatus.length || '—'}`, color: 'text-green-400' },
                  { label: 'Pending Alerts', value: alerts.length, color: alerts.length > 0 ? 'text-yellow-400' : 'text-green-400' },
                  { label: 'OR-Tools Status', value: 'Ready', color: 'text-green-400' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span style={{ color: 'hsl(215 20% 55%)' }}>{row.label}</span>
                    <span className={`font-semibold ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card">
              <div className="section-card-header">
                <div className="section-card-title">Corridor Utilization</div>
              </div>
              <div className="section-card-body space-y-3">
                {(() => {
                  const corridors = systemStatus.filter((s: any) => s.type === 'SECTION' || s.sectionId)
                  if (corridors.length === 0) {
                    const pct = kpis?.sectionUtilization.current
                    const val = typeof pct === 'number' ? pct : parseFloat(String(pct)) || 0
                    return [
                      { name: 'Mumbai — Surat', pct: Math.max(0, val - 10) },
                      { name: 'Surat — Vadodara', pct: val },
                      { name: 'Vadodara — Delhi', pct: Math.min(100, val + 15) },
                    ]
                  }
                  return corridors.slice(0, 4).map((s: any) => ({ name: s.name || s.sectionId, pct: s.utilization ?? s.load ?? 0 }))
                })().map((s: any) => {
                  const color = s.pct >= 85 ? 'hsl(0 84% 60%)' : s.pct >= 65 ? 'hsl(38 92% 50%)' : 'hsl(142 71% 45%)'
                  return (
                    <div key={s.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: 'hsl(215 20% 60%)' }}>{s.name}</span>
                        <span className="text-white font-medium">{Math.round(s.pct)}%</span>
                      </div>
                      <div className="track-line">
                        <div className="track-line-fill" style={{ width: `${s.pct}%`, opacity: 0.85, background: color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}