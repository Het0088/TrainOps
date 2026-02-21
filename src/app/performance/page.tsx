'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { ExportButton } from '@/components/ui/export-button'

const chartStyle = {
  backgroundColor: 'hsl(222 47% 9%)',
  border: 'none',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'hsl(222 47% 14%)', border: '1px solid hsl(222 47% 22%)', color: 'white' }}>
      <div className="font-medium mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

const timeRanges = ['1h', '24h', '7d', '30d']
const tabs = ['Punctuality', 'Throughput', 'Efficiency']

export default function PerformancePage() {
  const [range, setRange] = useState('24h')
  const [tab, setTab] = useState('Punctuality')

  const metrics = [
    { name: 'On-Time Rate', value: 87.5, unit: '%', change: 2.3, up: true, target: 90 },
    { name: 'Daily Throughput', value: 1247, unit: ' trains', change: -1.2, up: false, target: 1300 },
    { name: 'Fuel Efficiency', value: 92.8, unit: '%', change: 0.8, up: true, target: 95 },
    { name: 'Pax Satisfaction', value: 4.2, unit: '/5', change: 0.1, up: true, target: 4.5 },
    { name: 'Track Utilization', value: 78.5, unit: '%', change: 1.5, up: true, target: 80 },
    { name: 'Safety Incidents', value: 3, unit: ' inc.', change: -2, up: false, target: 0 },
  ]

  const delayData = [
    { station: 'Mumbai', avgDelay: 18, onTime: 78 },
    { station: 'Surat', avgDelay: 8, onTime: 92 },
    { station: 'Vadodara', avgDelay: 14, onTime: 86 },
    { station: 'Ratlam', avgDelay: 22, onTime: 75 },
    { station: 'Kota', avgDelay: 10, onTime: 88 },
    { station: 'Mathura', avgDelay: 6, onTime: 94 },
    { station: 'Delhi', avgDelay: 12, onTime: 85 },
  ]

  const throughputData = [
    { hour: '00:00', trains: 45, passengers: 12 },
    { hour: '04:00', trains: 32, passengers: 8 },
    { hour: '08:00', trains: 78, passengers: 28 },
    { hour: '12:00', trains: 65, passengers: 22 },
    { hour: '16:00', trains: 82, passengers: 31 },
    { hour: '20:00', trains: 71, passengers: 26 },
  ]

  const effData = [
    { category: 'Punctuality', score: 87, target: 90 },
    { category: 'Energy', score: 93, target: 95 },
    { category: 'Capacity', score: 78, target: 85 },
    { category: 'Safety', score: 96, target: 98 },
    { category: 'Cost', score: 84, target: 88 },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Performance</h1>
            <p className="text-sm mt-0.5" style={{ color: 'hsl(215 20% 50%)' }}>Operational analytics and efficiency metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid hsl(222 47% 20%)' }}>
              {timeRanges.map(r => (
                <button key={r} onClick={() => setRange(r)}
                  className="px-3 py-1.5 text-xs transition-colors"
                  style={{
                    background: range === r ? 'hsl(217 91% 60%)' : 'hsl(222 47% 12%)',
                    color: range === r ? 'white' : 'hsl(215 20% 55%)',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
            <ExportButton data={{ metrics, delayData, throughputData, effData }} filename="performance-report" title="Performance Report" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {metrics.map(m => (
            <div key={m.name} className="kpi-card" style={{ '--kpi-accent': m.up ? 'linear-gradient(90deg, hsl(142 71% 45%), transparent)' : 'linear-gradient(90deg, hsl(0 84% 60%), transparent)' } as any}>
              <div className="text-xs mb-2" style={{ color: 'hsl(215 20% 55%)' }}>{m.name}</div>
              <div className="text-2xl font-bold text-white">{m.value}<span className="text-sm font-normal ml-0.5" style={{ color: 'hsl(215 20% 50%)' }}>{m.unit}</span></div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs" style={{ color: 'hsl(215 20% 45%)' }}>Target {m.target}{m.unit}</span>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${m.up ? 'text-green-400' : 'text-red-400'}`}>
                  {m.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {m.change > 0 ? '+' : ''}{m.change}%
                </span>
              </div>
              {m.target > 0 && (
                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'hsl(222 47% 18%)' }}>
                  <div className="h-full rounded-full" style={{
                    width: `${Math.min((m.value / m.target) * 100, 100)}%`,
                    background: m.value >= m.target ? 'hsl(142 71% 45%)' : 'hsl(38 92% 50%)'
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <div className="flex gap-0.5 rounded-lg p-1" style={{ background: 'hsl(222 47% 12%)' }}>
              {tabs.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-4 py-1.5 rounded text-xs font-medium transition-all"
                  style={{
                    background: tab === t ? 'hsl(217 91% 60%)' : 'transparent',
                    color: tab === t ? 'white' : 'hsl(215 20% 55%)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            {tab === 'Punctuality' && (
              <div className="space-y-5">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={delayData} barGap={4}>
                    <CartesianGrid stroke="hsl(222 47% 16%)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="station" tick={{ fill: 'hsl(215 20% 50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(215 20% 50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: 'hsl(215 20% 55%)' }} />
                    <Bar dataKey="avgDelay" fill="hsl(0 84% 60%)" name="Avg Delay (min)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="onTime" fill="hsl(142 71% 45%)" name="On-Time %" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-4 gap-3">
                  {delayData.slice(0, 4).map(s => (
                    <div key={s.station} className="p-3 rounded-lg" style={{ background: 'hsl(222 47% 12%)' }}>
                      <div className="text-xs text-white font-medium mb-1">{s.station}</div>
                      <div className={`text-lg font-bold ${s.onTime >= 90 ? 'text-green-400' : s.onTime >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>{s.onTime}%</div>
                      <div className="text-xs" style={{ color: 'hsl(215 20% 50%)' }}>+{s.avgDelay}m avg</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'Throughput' && (
              <div className="space-y-5">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={throughputData}>
                    <CartesianGrid stroke="hsl(222 47% 16%)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fill: 'hsl(215 20% 50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(215 20% 50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: 'hsl(215 20% 55%)' }} />
                    <Line type="monotone" dataKey="trains" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={false} name="Trains" />
                    <Line type="monotone" dataKey="passengers" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={false} name="Passengers (k)" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-3">
                  {[{ label: 'Peak Hour', value: '16:00' }, { label: 'Max Trains/hr', value: '82' }, { label: 'Peak Passengers', value: '31K' }].map(s => (
                    <div key={s.label} className="p-3 rounded-lg text-center" style={{ background: 'hsl(222 47% 12%)' }}>
                      <div className="text-lg font-bold text-white">{s.value}</div>
                      <div className="text-xs" style={{ color: 'hsl(215 20% 50%)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'Efficiency' && (
              <div className="space-y-5">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={effData} barGap={4}>
                    <CartesianGrid stroke="hsl(222 47% 16%)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="category" tick={{ fill: 'hsl(215 20% 50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: 'hsl(215 20% 50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: 'hsl(215 20% 55%)' }} />
                    <Bar dataKey="score" fill="hsl(142 71% 45%)" name="Score" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="target" fill="hsl(222 47% 25%)" name="Target" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {effData.map(e => (
                    <div key={e.category} className="flex items-center gap-4 p-2.5 rounded-lg" style={{ background: 'hsl(222 47% 12%)' }}>
                      <div className="w-20 text-xs text-white font-medium">{e.category}</div>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(222 47% 18%)' }}>
                        <div className="h-full rounded-full" style={{
                          width: `${e.score}%`,
                          background: e.score >= e.target ? 'hsl(142 71% 45%)' : 'hsl(38 92% 50%)'
                        }} />
                      </div>
                      <div className="text-xs font-bold text-white w-10 text-right">{e.score}%</div>
                      <div className="text-xs w-14 text-right" style={{ color: 'hsl(215 20% 50%)' }}>/ {e.target}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}