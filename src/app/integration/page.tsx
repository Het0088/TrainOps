'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import RoleGuard from '@/components/providers/role-guard'
import { CheckCircle, AlertCircle, XCircle, RefreshCw, Settings, Wifi, Activity } from 'lucide-react'
import { ExportButton } from '@/components/ui/export-button'
import { useOptimizationStore, useOptimizationMode } from '@/store/optimization-store'

interface System { id: string; name: string; category: string; status: string; uptime: number; latency?: number; version?: string; issue?: string }
interface Endpoint { id: string; name: string; type: string; url?: string; status: string; responseTime: number; successRate: number; errorCount: number }

const systems: System[] = [
  { id: 'train-ctrl', name: 'Train Control System', category: 'core', status: 'online', uptime: 99.8, version: 'v2.1.3', latency: 12 },
  { id: 'signal', name: 'Signal Management', category: 'safety', status: 'online', uptime: 99.9, version: 'v1.8.2', latency: 8 },
  { id: 'pax-info', name: 'Passenger Information', category: 'comm', status: 'warning', uptime: 97.5, version: 'v3.0.1', latency: 156, issue: 'High latency detected' },
  { id: 'track-mon', name: 'Track Monitoring', category: 'monitor', status: 'online', uptime: 98.7, version: 'v1.5.4', latency: 25 },
  { id: 'weather', name: 'Weather Integration', category: 'monitor', status: 'maintenance', uptime: 95.2, version: 'v2.3.0', issue: 'Scheduled maintenance' },
  { id: 'ticketing', name: 'Ticketing System', category: 'core', status: 'offline', uptime: 89.3, version: 'v4.2.1', issue: 'Connection timeout' },
]

const endpoints: Endpoint[] = [
  { id: 'train-api', name: 'Train Position API', type: 'api', url: 'localhost:8000/api', status: 'connected', responseTime: 245, successRate: 99.2, errorCount: 2 },
  { id: 'sched-db', name: 'Schedule Database', type: 'database', status: 'connected', responseTime: 89, successRate: 100, errorCount: 0 },
  { id: 'ws', name: 'WebSocket /ws/optimization', type: 'websocket', url: 'localhost:8000/ws', status: 'connected', responseTime: 12, successRate: 99.8, errorCount: 0 },
  { id: 'alert-q', name: 'Alert Queue', type: 'queue', status: 'degraded', responseTime: 1250, successRate: 94.8, errorCount: 15 },
]

const statusIcon = (s: string) => {
  if (['online', 'connected', 'active'].includes(s)) return <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
  if (['warning', 'degraded'].includes(s)) return <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
  if (['maintenance'].includes(s)) return <Settings className="w-4 h-4 text-blue-400 flex-shrink-0" />
  return <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
}

const statusClass = (s: string) => {
  if (['online', 'connected', 'active'].includes(s)) return 'badge-on-time'
  if (['warning', 'degraded'].includes(s)) return 'badge-delayed'
  if (['maintenance'].includes(s)) return 'badge-rerouted'
  return 'badge-critical'
}

const tabs = ['Systems', 'Endpoints', 'OR-Tools']

export default function IntegrationPage() {
  const [tab, setTab] = useState('Systems')
  const [refreshing, setRefreshing] = useState(false)
  const { mode, setMode } = useOptimizationMode()
  const { config, setBackendUrl, updateConnectionStatus, isConnected } = useOptimizationStore()

  const onRefresh = async () => {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 1500))
    setRefreshing(false)
  }

  const onTime = systems.filter(s => s.status === 'online').length
  const warn = systems.filter(s => s.status === 'warning').length
  const off = systems.filter(s => ['offline', 'maintenance'].includes(s.status)).length

  return (
    <DashboardLayout>
      <RoleGuard allowed={['ADMIN']}>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Integration</h1>
              <p className="text-sm mt-0.5" style={{ color: 'hsl(215 20% 50%)' }}>System connectivity and OR-Tools backend configuration</p>
            </div>
            <div className="flex items-center gap-2">
              <ExportButton data={{ systems, endpoints }} filename="integration-report" title="Integration Report" />
              <button onClick={onRefresh} disabled={refreshing}
                className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                style={{ background: 'hsl(222 47% 12%)', border: '1px solid hsl(222 47% 20%)' }}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total Systems', value: systems.length, color: 'text-blue-400' },
              { label: 'Online', value: onTime, color: 'text-green-400' },
              { label: 'Warnings', value: warn, color: 'text-yellow-400' },
              { label: 'Offline', value: off, color: 'text-red-400' },
            ].map(s => (
              <div key={s.label} className="kpi-card">
                <div className="text-xs mb-1" style={{ color: 'hsl(215 20% 55%)' }}>{s.label}</div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <div className="flex gap-0.5 rounded-lg p-0.5" style={{ background: 'hsl(222 47% 12%)' }}>
                {tabs.map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className="px-4 py-1.5 rounded text-xs font-medium transition-all"
                    style={{ background: tab === t ? 'hsl(217 91% 60%)' : 'transparent', color: tab === t ? 'white' : 'hsl(215 20% 55%)' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 space-y-2">
              {tab === 'Systems' && systems.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'hsl(222 47% 12%)', border: '1px solid hsl(222 47% 20%)' }}
                >
                  <div className="flex items-center gap-3">
                    {statusIcon(s.status)}
                    <div>
                      <div className="text-sm font-medium text-white">{s.name}</div>
                      <div className="text-xs" style={{ color: 'hsl(215 20% 50%)' }}>
                        {s.version} · {s.category}
                        {s.issue && <span className="text-yellow-400 ml-1">· {s.issue}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs font-medium text-white">{s.uptime}% up</div>
                      {s.latency && <div className="text-xs" style={{ color: 'hsl(215 20% 50%)' }}>{s.latency}ms</div>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusClass(s.status)}`}>{s.status}</span>
                  </div>
                </div>
              ))}

              {tab === 'Endpoints' && endpoints.map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'hsl(222 47% 12%)', border: '1px solid hsl(222 47% 20%)' }}
                >
                  <div className="flex items-center gap-3">
                    {statusIcon(e.status)}
                    <div>
                      <div className="text-sm font-medium text-white">{e.name}</div>
                      <div className="text-xs" style={{ color: 'hsl(215 20% 50%)' }}>
                        {e.type.toUpperCase()} · {e.url || 'internal'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs">
                      <div className="font-medium text-white">{e.successRate}% ok</div>
                      <div style={{ color: 'hsl(215 20% 50%)' }}>{e.responseTime}ms</div>
                      {e.errorCount > 0 && <div className="text-red-400">{e.errorCount} errors</div>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusClass(e.status)}`}>{e.status}</span>
                  </div>
                </div>
              ))}

              {tab === 'OR-Tools' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl" style={{ background: 'hsl(222 47% 12%)', border: '1px solid hsl(222 47% 20%)' }}>
                    <div className="text-xs font-semibold text-white mb-3">Optimization Mode</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(['mock', 'ortools'] as const).map(m => (
                        <button key={m} onClick={() => setMode(m)}
                          className="p-3 rounded-lg text-sm font-medium transition-all border text-left"
                          style={{
                            background: mode === m ? 'hsl(217 91% 60% / 0.15)' : 'hsl(222 47% 16%)',
                            borderColor: mode === m ? 'hsl(217 91% 60% / 0.4)' : 'hsl(222 47% 22%)',
                            color: mode === m ? 'hsl(217 91% 70%)' : 'hsl(215 20% 60%)',
                          }}
                        >
                          <div className="font-semibold">{m === 'mock' ? 'Mock Mode' : 'OR-Tools Mode'}</div>
                          <div className="text-xs mt-0.5 opacity-70">{m === 'mock' ? 'Instant random results' : 'Real CP-SAT solver'}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: 'hsl(222 47% 12%)', border: '1px solid hsl(222 47% 20%)' }}>
                    <div className="text-xs font-semibold text-white mb-3">Backend URL</div>
                    <div className="flex gap-2">
                      <input
                        defaultValue={config.backendUrl}
                        onBlur={e => setBackendUrl(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none"
                        style={{ background: 'hsl(222 47% 16%)', border: '1px solid hsl(222 47% 24%)' }}
                      />
                      <button onClick={() => updateConnectionStatus(true)}
                        className="px-3 py-2 rounded-lg text-xs font-medium text-white transition-colors"
                        style={{ background: 'hsl(217 91% 60%)' }}
                      >
                        Test
                      </button>
                    </div>
                    <div className={`flex items-center gap-1.5 mt-2 text-xs ${isConnected ? 'text-green-400' : 'text-gray-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-600'}`} />
                      {isConnected ? 'Backend connected' : 'Not connected'}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: 'hsl(222 47% 12%)', border: '1px solid hsl(222 47% 20%)' }}>
                    <div className="text-xs font-semibold text-white mb-3">OR-Tools Info</div>
                    {[
                      ['Solver', 'CP-SAT (Constraint Programming)'],
                      ['Objective', 'Minimize weighted delay'],
                      ['Variables', 'Arrival/departure times + platform assignments'],
                      ['Timeout', `${config.timeout / 1000}s`],
                      ['Auto-fallback', config.autoFallback ? 'Enabled (→ Mock)' : 'Disabled'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs py-1.5" style={{ borderBottom: '1px solid hsl(222 47% 16%)' }}>
                        <span style={{ color: 'hsl(215 20% 55%)' }}>{k}</span>
                        <span className="text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </RoleGuard>
    </DashboardLayout>
  )
}