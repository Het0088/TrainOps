'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CalendarDays, Clock, AlertTriangle, Route, Users } from 'lucide-react'
import { ExportButton } from '@/components/ui/export-button'

interface Task { id: string; name: string; start: string; end: string; status: string; route: string; platform: string; progress: number }
interface Event { id: string; trainName: string; type: string; time: string; platform: string; status: string; delay?: number }

const tasks: Task[] = [
  { id: 'T1001', name: 'Rajdhani Express', start: '06:00', end: '22:30', status: 'on-time', route: 'Mumbai → Delhi', platform: 'P1', progress: 65 },
  { id: 'T1002', name: 'Shatabdi Express', start: '07:15', end: '15:45', status: 'delayed', route: 'Mumbai → Surat', platform: 'P3', progress: 80 },
  { id: 'T1003', name: 'Duronto Express', start: '08:30', end: '20:15', status: 'on-time', route: 'Surat → Vadodara', platform: 'P2', progress: 45 },
  { id: 'T1004', name: 'Garib Rath', start: '09:45', end: '06:30', status: 'on-time', route: 'Vadodara → Delhi', platform: 'P4', progress: 25 },
  { id: 'T1005', name: 'Humsafar Express', start: '11:00', end: '23:45', status: 'delayed', route: 'Kota → Delhi', platform: 'P5', progress: 90 },
]

const events: Event[] = [
  { id: 'E1', trainName: 'Rajdhani Express', type: 'DEPARTURE', time: '06:00', platform: 'Platform 1', status: 'on-time' },
  { id: 'E2', trainName: 'Shatabdi Express', type: 'ARRIVAL', time: '15:45', platform: 'Platform 3', status: 'delayed', delay: 15 },
  { id: 'E3', trainName: 'Track Maintenance', type: 'MAINTENANCE', time: '02:00', platform: 'Track 2', status: 'scheduled' },
]

const statusBar: Record<string, string> = { 'on-time': 'hsl(142 71% 45%)', 'delayed': 'hsl(0 84% 60%)', 'completed': 'hsl(217 91% 60%)', 'scheduled': 'hsl(222 47% 35%)' }
const badge: Record<string, string> = { 'on-time': 'badge-on-time', 'delayed': 'badge-critical', 'scheduled': 'badge-rerouted', 'completed': 'badge-rerouted' }

function timeToPos(t: string) {
  const [h, m] = t.split(':').map(Number)
  return ((h + m / 60) / 24) * 100
}

function duration(start: string, end: string) {
  const s = timeToPos(start), e = timeToPos(end)
  return e > s ? e - s : e + 100 - s
}

export default function SchedulePage() {
  const [view, setView] = useState<'timeline' | 'list'>('timeline')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const onTime = tasks.filter(t => t.status === 'on-time').length
  const delayed = tasks.filter(t => t.status === 'delayed').length

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Schedule</h1>
            <p className="text-sm mt-0.5" style={{ color: 'hsl(215 20% 50%)' }}>Train timeline and platform assignments</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs text-white outline-none"
              style={{ background: 'hsl(222 47% 12%)', border: '1px solid hsl(222 47% 20%)' }}
            />
            <ExportButton data={{ tasks, events, date }} filename="schedule-report" title="Schedule Report" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Trains', value: tasks.length, color: 'text-blue-400', icon: Route },
            { label: 'On Time', value: onTime, color: 'text-green-400', icon: Clock },
            { label: 'Delayed', value: delayed, color: 'text-red-400', icon: AlertTriangle },
            { label: 'Pltfm Util.', value: '85%', color: 'text-purple-400', icon: Users },
          ].map(s => (
            <div key={s.label} className="kpi-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: 'hsl(215 20% 55%)' }}>{s.label}</span>
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title">Train Schedule</div>
            <div className="flex gap-0.5 rounded-lg p-0.5" style={{ background: 'hsl(222 47% 12%)' }}>
              {(['timeline', 'list'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className="px-3 py-1 rounded text-xs font-medium capitalize transition-all"
                  style={{ background: view === v ? 'hsl(217 91% 60%)' : 'transparent', color: view === v ? 'white' : 'hsl(215 20% 55%)' }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            {view === 'timeline' ? (
              <div>
                <div className="flex mb-3 overflow-hidden">
                  {Array.from({ length: 8 }, (_, i) => i * 3).map(h => (
                    <div key={h} className="flex-1 text-center text-xs" style={{ color: 'hsl(215 20% 40%)' }}>
                      {String(h).padStart(2, '0')}:00
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {tasks.map(task => {
                    const left = timeToPos(task.start)
                    const w = duration(task.start, task.end)
                    return (
                      <div key={task.id} className="flex items-center gap-4">
                        <div className="w-36 flex-shrink-0">
                          <div className="text-xs font-medium text-white truncate">{task.name}</div>
                          <div className="text-xs" style={{ color: 'hsl(215 20% 45%)' }}>{task.route}</div>
                        </div>
                        <div className="flex-1 relative h-7 rounded" style={{ background: 'hsl(222 47% 14%)' }}>
                          <div className="absolute h-full rounded flex items-center px-2 overflow-hidden"
                            style={{ left: `${left}%`, width: `${w}%`, background: statusBar[task.status] || statusBar['scheduled'], opacity: 0.85 }}
                          >
                            <div className="absolute inset-0 rounded" style={{ width: `${task.progress}%`, background: 'rgba(0,0,0,0.25)' }} />
                            <span className="relative text-white text-xs font-medium truncate">{task.start}</span>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium w-14 text-center flex-shrink-0 ${badge[task.status] || ''}`}>
                          {task.status === 'on-time' ? 'On Time' : 'Delayed'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {events.map(e => (
                  <div key={e.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'hsl(222 47% 12%)', border: '1px solid hsl(222 47% 20%)' }}>
                    <div className="flex items-center gap-3">
                      <div className={`status-dot ${e.status === 'on-time' ? 'status-on-time' : e.status === 'delayed' ? 'status-delayed' : 'bg-blue-500'}`} />
                      <div>
                        <div className="text-sm font-medium text-white">{e.trainName}</div>
                        <div className="text-xs" style={{ color: 'hsl(215 20% 50%)' }}>{e.type} · {e.platform}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{e.time}</div>
                      {e.delay && <div className="text-xs text-red-400">+{e.delay}m delay</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title">Platform Status — Mumbai Central</div>
          </div>
          <div className="p-4 flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map(p => {
              const t = tasks.find(task => task.platform === `P${p}`)
              const onTime = t?.status === 'on-time'
              return (
                <div key={p} className="flex-shrink-0 min-w-[110px] rounded-xl p-3 transition-all"
                  style={{
                    background: t ? (onTime ? 'hsl(142 71% 45% / 0.08)' : 'hsl(0 84% 60% / 0.08)') : 'hsl(222 47% 12%)',
                    border: t ? (onTime ? '1px solid hsl(142 71% 45% / 0.35)' : '1px solid hsl(0 84% 60% / 0.35)') : '1px solid hsl(222 47% 20%)'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">Platform {p}</span>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: t ? (onTime ? 'hsl(142 71% 45%)' : 'hsl(0 84% 60%)') : 'hsl(215 20% 30%)' }}
                    />
                  </div>
                  {t ? (
                    <div>
                      <div className="text-xs font-medium text-white truncate">{t.name}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'hsl(215 20% 50%)' }}>{t.route}</div>
                      <div className={`text-[10px] font-semibold mt-1.5 whitespace-nowrap ${onTime ? 'text-green-400' : 'text-red-400'}`}>
                        {onTime ? '● On Time' : '● Delayed'}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs text-green-400 font-medium">Available</div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'hsl(215 20% 40%)' }}>No train</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}