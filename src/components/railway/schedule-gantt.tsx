import React, { useMemo, useState } from 'react'
import { Clock, Train as TrainIcon, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { Train as TrainType } from '@/types'

interface ScheduleGanttProps {
  trains: TrainType[]
  showComparison?: boolean
  disruptedTrains?: TrainType[]
  title?: string
  timeRange?: { start: Date; end: Date }
}

interface GanttItem {
  id: string
  train: TrainType
  schedule: { start: Date; end: Date; stations: Array<{ name: string; arrival: Date; departure: Date; delay: number }> }
  isDisrupted: boolean
}

const statusColor: Record<string, { bar: string; badge: string; glow: string }> = {
  ON_TIME: { bar: 'hsl(142 71% 45%)', badge: 'badge-on-time', glow: 'hsl(142 71% 45% / 0.25)' },
  DELAYED: { bar: 'hsl(38 92% 50%)', badge: 'badge-delayed', glow: 'hsl(38 92% 50% / 0.25)' },
  CRITICAL: { bar: 'hsl(0 84% 60%)', badge: 'badge-critical', glow: 'hsl(0 84% 60% / 0.25)' },
  REROUTED: { bar: 'hsl(217 91% 60%)', badge: 'badge-rerouted', glow: 'hsl(217 91% 60% / 0.25)' },
  default: { bar: 'hsl(215 20% 40%)', badge: '', glow: 'transparent' },
}

const fmtTime = (d: Date) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
const fmtDate = (d: Date) => d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })

export default function ScheduleGantt({
  trains, showComparison = false, disruptedTrains = [], title = 'Train Schedule', timeRange
}: ScheduleGanttProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 10

  const ganttItems = useMemo<GanttItem[]>(() => {
    return trains
      .filter(t => t.route.length > 0)
      .map(train => {
        const first = train.route[0]
        const last = train.route[train.route.length - 1]
        const start = first.scheduledDeparture ? new Date(first.scheduledDeparture) : new Date()
        const end = last.scheduledArrival ? new Date(last.scheduledArrival) : new Date(start.getTime() + train.route.length * 3600000)
        return {
          id: train.id,
          train,
          schedule: {
            start, end,
            stations: train.route.map(r => ({
              name: r.stationName,
              arrival: r.scheduledArrival ? new Date(r.scheduledArrival) : start,
              departure: r.scheduledDeparture ? new Date(r.scheduledDeparture) : start,
              delay: train.delay || 0
            }))
          },
          isDisrupted: disruptedTrains.some(d => d.id === train.id)
        }
      })
      .sort((a, b) => a.schedule.start.getTime() - b.schedule.start.getTime())
  }, [trains, disruptedTrains])

  const range = useMemo(() => {
    if (timeRange) return timeRange
    if (ganttItems.length === 0) {
      const now = new Date()
      return { start: new Date(now.getTime() - 2 * 3600000), end: new Date(now.getTime() + 8 * 3600000) }
    }
    const all = ganttItems.flatMap(i => [i.schedule.start, i.schedule.end])
    const min = Math.min(...all.map(t => t.getTime()))
    const max = Math.max(...all.map(t => t.getTime()))
    const pad = (max - min) * 0.05
    return { start: new Date(min - pad), end: new Date(max + pad) }
  }, [ganttItems, timeRange])

  const total = range.end.getTime() - range.start.getTime()
  const pct = (t: Date) => ((t.getTime() - range.start.getTime()) / total) * 100

  const markers = useMemo(() => {
    const marks: Array<{ time: Date; pos: number }> = []
    const start = new Date(range.start)
    start.setMinutes(0, 0, 0)
    for (let t = new Date(start); t <= range.end; t.setHours(t.getHours() + 1)) {
      const pos = pct(t)
      if (pos >= 0 && pos <= 100) marks.push({ time: new Date(t), pos })
    }
    return marks
  }, [range])

  const paginated = ganttItems.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(ganttItems.length / PAGE_SIZE)

  const byStatus = {
    ON_TIME: ganttItems.filter(i => i.train.status === 'ON_TIME').length,
    DELAYED: ganttItems.filter(i => i.train.status === 'DELAYED').length,
    CRITICAL: ganttItems.filter(i => i.train.status === 'CRITICAL').length,
  }

  return (
    <div className="section-card">
      <div className="section-card-header">
        <div>
          <div className="section-card-title flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            {title}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs" style={{ color: 'hsl(215 20% 50%)' }}>
              {fmtDate(range.start)} — {fmtDate(range.end)}
            </span>
            <span className="text-xs" style={{ color: 'hsl(215 20% 45%)' }}>·</span>
            <span className="text-xs text-green-400">{byStatus.ON_TIME} on time</span>
            {byStatus.DELAYED > 0 && <span className="text-xs text-yellow-400">{byStatus.DELAYED} delayed</span>}
            {byStatus.CRITICAL > 0 && <span className="text-xs text-red-400">{byStatus.CRITICAL} critical</span>}
          </div>
        </div>
        {disruptedTrains.length > 0 && (
          <span className="text-xs px-2 py-1 rounded-full border font-medium badge-critical">
            {disruptedTrains.length} disrupted
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Time ruler */}
        <div className="relative h-7 mb-4 ml-[140px]" style={{ borderBottom: '1px solid hsl(222 47% 18%)' }}>
          {markers.map((m, i) => (
            <div key={i} className="absolute top-0 flex flex-col items-center" style={{ left: `${m.pos}%` }}>
              <span className="text-[10px]" style={{ color: 'hsl(215 20% 40%)' }}>{fmtTime(m.time)}</span>
              <div className="w-px flex-1 mt-1" style={{ background: 'hsl(222 47% 18%)' }} />
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-1.5">
          {paginated.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-2" style={{ color: 'hsl(215 20% 45%)' }}>
              <TrainIcon className="w-8 h-8 opacity-30" />
              <span className="text-sm">No schedules</span>
            </div>
          )}
          {paginated.map(item => {
            const sc = (item.isDisrupted ? statusColor.CRITICAL : statusColor[item.train.status]) ?? statusColor.default
            const startPct = Math.max(0, pct(item.schedule.start))
            const endPct = Math.min(100, pct(item.schedule.end))
            const widthPct = Math.max(0.5, endPct - startPct)
            const isOpen = expanded === item.id
            const durationMin = Math.round((item.schedule.end.getTime() - item.schedule.start.getTime()) / 60000)

            return (
              <div key={item.id}
                className="rounded-lg transition-all duration-150 overflow-hidden"
                style={{
                  background: isOpen ? 'hsl(222 47% 13%)' : 'hsl(222 47% 11%)',
                  border: `1px solid ${isOpen ? sc.bar + '40' : 'hsl(222 47% 18%)'}`,
                }}
              >
                <div className="flex items-center gap-3 px-3 py-2.5 cursor-pointer group"
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                >
                  {/* Train label */}
                  <div className="w-[136px] flex-shrink-0 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sc.bar, boxShadow: `0 0 4px ${sc.bar}` }} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{item.train.number}</div>
                      <div className="text-[10px] truncate" style={{ color: 'hsl(215 20% 45%)' }}>{item.train.type}</div>
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="flex-1 relative h-6 rounded" style={{ background: 'hsl(222 47% 16%)' }}>
                    {/* Current time indicator */}
                    {(() => {
                      const nowPos = pct(new Date()); return nowPos > 0 && nowPos < 100 ? (
                        <div className="absolute top-0 bottom-0 w-px z-20 opacity-50" style={{ left: `${nowPos}%`, background: 'white' }} />
                      ) : null
                    })()}

                    {/* Main bar */}
                    <div className="absolute top-1 bottom-1 rounded transition-all"
                      style={{ left: `${startPct}%`, width: `${widthPct}%`, background: sc.bar, opacity: 0.85, boxShadow: `0 0 8px ${sc.glow}` }}
                    >
                      {/* Station dividers */}
                      {item.schedule.stations.slice(1, -1).map((st, si) => {
                        const rel = ((pct(st.arrival) - startPct) / widthPct) * 100
                        if (rel <= 0 || rel >= 100) return null
                        return (
                          <div key={si} className="absolute top-0 bottom-0 w-px" style={{ left: `${rel}%`, background: 'rgba(255,255,255,0.2)' }} />
                        )
                      })}
                    </div>

                    {/* Start/end time labels */}
                    <div className="absolute -bottom-4 text-[10px]" style={{ left: `${startPct}%`, color: 'hsl(215 20% 40%)' }}>
                      {fmtTime(item.schedule.start)}
                    </div>
                    <div className="absolute -bottom-4 text-[10px]" style={{ right: `${100 - endPct}%`, color: 'hsl(215 20% 40%)' }}>
                      {fmtTime(item.schedule.end)}
                    </div>
                  </div>

                  {/* Status + delay */}
                  <div className="flex items-center gap-2 flex-shrink-0 w-[110px] justify-end">
                    {item.train.delay > 0 && (
                      <span className="text-[10px] font-medium text-yellow-400 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        +{item.train.delay}m
                      </span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${sc.badge}`}>
                      {item.isDisrupted ? 'DISRUPTED' : item.train.status.replace('_', ' ')}
                    </span>
                    <div className="text-gray-600 group-hover:text-gray-400 transition-colors">
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="px-3 pb-3 mt-1">
                    <div className="rounded-lg p-3 space-y-3" style={{ background: 'hsl(222 47% 9%)' }}>
                      <div className="grid grid-cols-4 gap-3 text-xs">
                        {[
                          { label: 'Train Name', value: item.train.name },
                          { label: 'Duration', value: `${Math.floor(durationMin / 60)}h ${durationMin % 60}m` },
                          { label: 'Stations', value: item.schedule.stations.length },
                          { label: 'Priority', value: item.train.priority },
                        ].map(r => (
                          <div key={r.label}>
                            <div className="mb-0.5" style={{ color: 'hsl(215 20% 45%)' }}>{r.label}</div>
                            <div className="font-semibold text-white">{r.value}</div>
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="text-[10px] mb-1.5 font-semibold uppercase tracking-wider" style={{ color: 'hsl(215 20% 40%)' }}>Route</div>
                        <div className="flex flex-wrap gap-1">
                          {item.schedule.stations.map((st, si) => (
                            <div key={si} className="flex items-center gap-1">
                              <span className="text-[10px] px-1.5 py-0.5 rounded text-white"
                                style={{ background: si === 0 || si === item.schedule.stations.length - 1 ? sc.bar + 'aa' : 'hsl(222 47% 16%)' }}
                              >
                                {st.name.split(' ')[0]}
                              </span>
                              {si < item.schedule.stations.length - 1 && (
                                <span className="text-[10px]" style={{ color: 'hsl(215 20% 30%)' }}>→</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid hsl(222 47% 16%)' }}>
            <span className="text-xs" style={{ color: 'hsl(215 20% 45%)' }}>
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, ganttItems.length)} of {ganttItems.length} trains
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className="w-6 h-6 rounded text-[10px] font-medium transition-colors"
                  style={{
                    background: i === page ? 'hsl(217 91% 60%)' : 'hsl(222 47% 14%)',
                    color: i === page ? 'white' : 'hsl(215 20% 50%)',
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: '1px solid hsl(222 47% 16%)' }}>
          {[
            ['hsl(142 71% 45%)', 'On Time'],
            ['hsl(38 92% 50%)', 'Delayed'],
            ['hsl(0 84% 60%)', 'Critical'],
            ['hsl(217 91% 60%)', 'Rerouted'],
          ].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1.5 text-[10px]" style={{ color: 'hsl(215 20% 50%)' }}>
              <div className="w-2.5 h-2 rounded-sm" style={{ background: c as string }} />
              {l}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-[10px] ml-2" style={{ color: 'hsl(215 20% 50%)' }}>
            <div className="w-px h-3 bg-white opacity-40" />
            Now
          </div>
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'hsl(215 20% 50%)' }}>
            <div className="w-3 h-2 rounded-sm" style={{ background: 'hsl(222 47% 25%)' }}>
              <div className="w-px h-full mx-auto" style={{ background: 'rgba(255,255,255,0.25)' }} />
            </div>
            Station stop
          </div>
          <div className="ml-auto">
            <button onClick={() => setExpanded(null)} className="text-[10px]" style={{ color: 'hsl(215 20% 40%)' }}>
              collapse all
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}