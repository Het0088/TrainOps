'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { useTrainStore } from '@/store/train-store'
import { useApi } from '@/hooks/useApi'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Train, MapPin, Clock, Activity, AlertTriangle,
  CheckCircle, XCircle, RefreshCw, Users, ChevronRight
} from 'lucide-react'

const statusLabel: Record<string, string> = { ON_TIME: 'On Time', DELAYED: 'Delayed', CRITICAL: 'Critical', REROUTED: 'Rerouted' }
const statusClass: Record<string, string> = { ON_TIME: 'badge-on-time', DELAYED: 'badge-delayed', CRITICAL: 'badge-critical', REROUTED: 'badge-rerouted' }
const dotClass: Record<string, string> = { ON_TIME: 'status-on-time', DELAYED: 'status-delayed', CRITICAL: 'status-critical', REROUTED: 'status-rerouted' }

const STATIONS = ['Mumbai', 'Borivali', 'Surat', 'Vadodara', 'Ratlam', 'Kota', 'Sawai Madhopur', 'Bharatpur', 'Mathura', 'Delhi']

export default function LiveTrackingPage() {
  const { isAuthenticated, loading: authLoading } = useAuthStore()
  const { trains, loading, error, setTrains, setLoading, setError } = useTrainStore()
  const { apiCall } = useApi()
  const router = useRouter()
  const [selected, setSelected] = useState<any>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')

  const load = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    setError(null)
    try {
      const r = await apiCall('/trains')
      setTrains(r.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, apiCall, setTrains, setLoading, setError])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) { router.push('/login'); return }
    load()
  }, [isAuthenticated, authLoading, router, load])

  useEffect(() => {
    if (!autoRefresh) return
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [autoRefresh, load])

  if (authLoading || !isAuthenticated) return null

  const filtered = filter === 'ALL' ? trains : trains.filter(t => t.status === filter)
  const counts = {
    ON_TIME: trains.filter(t => t.status === 'ON_TIME').length,
    DELAYED: trains.filter(t => t.status === 'DELAYED').length,
    CRITICAL: trains.filter(t => t.status === 'CRITICAL').length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="page-header mb-0">
            <h1 className="text-xl font-bold text-white">Live Train Tracking</h1>
            <p>Real-time positions across Western Railway corridor</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setAutoRefresh(v => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${autoRefresh ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-gray-400 border-gray-700 bg-transparent'}`}
            >
              <Activity className="w-3 h-3 inline mr-1" />
              {autoRefresh ? 'Live' : 'Paused'}
            </button>
            <button onClick={load} disabled={loading}
              className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
              style={{ background: 'hsl(222 47% 12%)', border: '1px solid hsl(222 47% 20%)' }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[{ key: 'ON_TIME', label: 'On Time', count: counts.ON_TIME, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
          { key: 'DELAYED', label: 'Delayed', count: counts.DELAYED, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
          { key: 'CRITICAL', label: 'Critical', count: counts.CRITICAL, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' }
          ].map(s => (
            <button key={s.key} onClick={() => setFilter(filter === s.key ? 'ALL' : s.key)}
              className={`p-4 rounded-xl border text-left transition-all ${s.bg} ${s.border} ${filter === s.key ? 'ring-1 ring-white/10' : 'opacity-80 hover:opacity-100'}`}
            >
              <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
              <div className="text-xs mt-0.5" style={{ color: 'hsl(215 20% 55%)' }}>{s.label}</div>
            </button>
          ))}
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              Mumbai → Delhi Corridor
            </div>
            <div className="text-xs" style={{ color: 'hsl(215 20% 50%)' }}>{trains.length} trains active</div>
          </div>
          <div className="p-6">
            <div className="relative">
              <div className="flex justify-between mb-2">
                {STATIONS.map(s => (
                  <div key={s} className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500/60 mb-1" />
                    <div className="text-xs text-center" style={{ color: 'hsl(215 20% 45%)' }}>{s.split(' ')[0]}</div>
                  </div>
                ))}
              </div>
              <div className="relative h-3 rounded-full" style={{ background: 'hsl(222 47% 16%)' }}>
                <div className="absolute inset-0 rounded-full"
                  style={{ background: 'linear-gradient(90deg, hsl(217 91% 60% / 0.3) 0%, hsl(142 71% 45% / 0.2) 100%)' }}
                />
                {trains.slice(0, 15).map((train, i) => (
                  <button
                    key={train.id}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white/20 transition-all hover:scale-125 hover:z-10"
                    style={{
                      left: `${(train.position?.progress) ?? (i * 6 + 5)}%`,
                      background: train.status === 'ON_TIME' ? 'hsl(142 71% 45%)' : train.status === 'CRITICAL' ? 'hsl(0 84% 60%)' : 'hsl(38 92% 50%)',
                      boxShadow: `0 0 6px ${train.status === 'ON_TIME' ? 'hsl(142 71% 45% / 0.6)' : train.status === 'CRITICAL' ? 'hsl(0 84% 60% / 0.6)' : 'hsl(38 92% 50% / 0.6)'}`,
                    }}
                    onClick={() => setSelected(train)}
                    title={`${train.number} — ${statusLabel[train.status]}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-5 mt-4">
              {[['hsl(142 71% 45%)', 'On Time'], ['hsl(38 92% 50%)', 'Delayed'], ['hsl(0 84% 60%)', 'Critical']].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1.5 text-xs" style={{ color: 'hsl(215 20% 55%)' }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c as string }} />
                  {l}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title">Active Trains</div>
            <div className="text-xs" style={{ color: 'hsl(215 20% 50%)' }}>{filtered.length} shown</div>
          </div>
          <div className="p-3 space-y-1.5 max-h-[420px] overflow-y-auto">
            {loading && filtered.length === 0 ? (
              [...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'hsl(222 47% 12%)' }} />)
            ) : filtered.map(train => (
              <button key={train.id} className="train-row w-full text-left" onClick={() => setSelected(train)}>
                <div className="flex items-center gap-3">
                  <div className={`status-dot ${dotClass[train.status] || 'bg-gray-500'} flex-shrink-0`} />
                  <div>
                    <div className="text-sm font-semibold text-white">{train.number}</div>
                    <div className="text-xs" style={{ color: 'hsl(215 20% 50%)' }}>{train.type} · {train.passengers ?? '—'} pax</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-white">{train.currentStation}</div>
                    <div className="text-xs" style={{ color: 'hsl(215 20% 45%)' }}>→ {train.nextStation}</div>
                  </div>
                  {train.delay > 0 && (
                    <div className="text-xs font-medium text-yellow-400">+{train.delay}m</div>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${statusClass[train.status] || ''}`}>
                    {statusLabel[train.status] ?? train.status}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-sm" style={{ background: 'hsl(222 47% 9%)', border: '1px solid hsl(222 47% 18%)' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Train className="w-4 h-4 text-blue-400" />
              {selected?.number} — {selected?.name}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Type', value: selected.type },
                  { label: 'Priority', value: selected.priority },
                  { label: 'Current', value: selected.currentStation },
                  { label: 'Next', value: selected.nextStation },
                  { label: 'Platform', value: selected.platform ?? '—' },
                  { label: 'Progress', value: `${selected.position?.progress ?? 0}%` },
                ].map(r => (
                  <div key={r.label}>
                    <div className="text-xs mb-0.5" style={{ color: 'hsl(215 20% 50%)' }}>{r.label}</div>
                    <div className="font-medium text-white">{r.value}</div>
                  </div>
                ))}
              </div>
              {selected.delay > 0 && (
                <div className="p-3 rounded-lg text-xs text-yellow-400" style={{ background: 'hsl(38 92% 50% / 0.1)', border: '1px solid hsl(38 92% 50% / 0.2)' }}>
                  Running <strong>{selected.delay} minutes</strong> behind schedule.
                </div>
              )}
              <div>
                <div className="text-xs mb-1" style={{ color: 'hsl(215 20% 50%)' }}>Route</div>
                <div className="text-white leading-relaxed">
                  {selected.route?.map((r: any) => r.stationName).join(' → ')}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}