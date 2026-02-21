'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import RoleGuard from '@/components/providers/role-guard'
import { Play, RotateCcw, TrendingUp, AlertTriangle, Activity, CheckCircle, Clock, Zap } from 'lucide-react'
import { useSimulationStore } from '@/store/simulation-store'
import { OptimizationSettings } from '@/components/ui/optimization-settings'
import DisruptionSimulator from '@/components/railway/disruption-simulator'
import ScheduleGantt from '@/components/railway/schedule-gantt'
import LiveSimulationPanel from '@/components/railway/live-simulation-panel'
import { generateTrainData } from '@/lib/scaled-mock-data'

const sysStatusStyle: Record<string, { label: string; color: string; bg: string; border: string }> = {
  NORMAL: { label: 'All Systems Normal', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  DISRUPTED: { label: 'Disruption Active', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  OPTIMIZING: { label: 'Optimizing...', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
}

export default function SimulatorPage() {
  const { currentScenario, isOptimizing, optimizationProgress, systemStatus, activeDisruptions, optimizationResults, simulateDisruption, reset } = useSimulationStore()

  const sys = sysStatusStyle[systemStatus] ?? sysStatusStyle.NORMAL

  const sections = [
    { id: 'S1', name: 'Mumbai — Surat', trains: ['T001', 'T003'] },
    { id: 'S2', name: 'Surat — Vadodara', trains: ['T002'] },
    { id: 'S3', name: 'Vadodara — Ratlam', trains: ['T004', 'T005'] },
    { id: 'S4', name: 'Ratlam — Delhi', trains: [] },
  ]

  const platforms = [
    { id: 'P001', name: 'Platform 1 — Mumbai Central', occupied: true, trainId: 'T001' },
    { id: 'P002', name: 'Platform 2 — Mumbai Central', occupied: false },
    { id: 'P008', name: 'Platform 1 — Surat', occupied: true, trainId: 'T002' },
    { id: 'P011', name: 'Platform 1 — Vadodara', occupied: false },
  ]

  return (
    <DashboardLayout>
      <RoleGuard allowed={['CONTROLLER', 'ADMIN']}>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Disruption Simulator</h1>
              <p className="text-sm mt-0.5" style={{ color: 'hsl(215 20% 50%)' }}>Inject disruptions and test OR-Tools optimization response</p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${sys.color} ${sys.bg} ${sys.border}`}>
                {systemStatus === 'NORMAL' && <CheckCircle className="w-3.5 h-3.5" />}
                {systemStatus === 'DISRUPTED' && <AlertTriangle className="w-3.5 h-3.5" />}
                {systemStatus === 'OPTIMIZING' && <Activity className="w-3.5 h-3.5 animate-spin" />}
                {sys.label}
              </div>
              <OptimizationSettings />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            <div className="xl:col-span-5 space-y-5">
              <div className="section-card">
                <div className="section-card-header">
                  <div className="section-card-title">Disruption Scenarios</div>
                  <Zap className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="p-4">
                  <DisruptionSimulator
                    onTriggerDisruption={simulateDisruption}
                    activeDisruptions={activeDisruptions}
                    isSimulating={isOptimizing}
                  />
                </div>
              </div>

              <LiveSimulationPanel
                isActive={isOptimizing}
                scenarioName={currentScenario?.name}
                onComplete={() => { }}
              />

              {currentScenario && (
                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-card-title flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      Active Scenario
                    </div>
                    <button onClick={reset} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg text-gray-400 hover:text-white transition-colors"
                      style={{ background: 'hsl(222 47% 14%)', border: '1px solid hsl(222 47% 22%)' }}>
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-medium text-white mb-1">{currentScenario.name}</div>
                    <div className="text-xs mb-3" style={{ color: 'hsl(215 20% 50%)' }}>{currentScenario.description}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${currentScenario.status === 'COMPLETED' ? 'badge-on-time' : 'badge-delayed'
                      }`}>{currentScenario.status}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="xl:col-span-7 space-y-5">
              {isOptimizing && (
                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-card-title flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-400 animate-pulse" />
                      OR-Tools CP-SAT Solver Running
                    </div>
                    <span className="text-sm font-bold text-blue-400">{Math.round(optimizationProgress)}%</span>
                  </div>
                  <div className="p-4">
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'hsl(222 47% 16%)' }}>
                      <div className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${optimizationProgress}%`, background: 'linear-gradient(90deg, hsl(217 91% 60%), hsl(142 71% 45%))' }}
                      />
                    </div>
                    <div className="text-xs mt-2" style={{ color: 'hsl(215 20% 50%)' }}>
                      Solving constraint satisfaction model — minimizing weighted delay across {generateTrainData().length} trains…
                    </div>
                  </div>
                </div>
              )}

              <div className="section-card">
                <div className="section-card-header">
                  <div className="section-card-title">Network Status</div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {sections.map(s => {
                      const blocked = activeDisruptions.some(d => d.sectionId === s.id)
                      return (
                        <div key={s.id} className="flex items-center justify-between p-3 rounded-lg"
                          style={{ background: 'hsl(222 47% 12%)', border: `1px solid ${blocked ? 'hsl(0 84% 60% / 0.3)' : 'hsl(222 47% 20%)'}` }}
                        >
                          <div>
                            <div className="text-xs font-medium text-white">{s.name}</div>
                            <div className="text-xs mt-0.5" style={{ color: 'hsl(215 20% 50%)' }}>{s.trains.length} trains</div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${blocked ? 'badge-critical' : 'badge-on-time'}`}>
                            {blocked ? 'BLOCKED' : 'CLEAR'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {platforms.map(p => {
                      const maintenance = activeDisruptions.some(d => d.platformId === p.id)
                      return (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-lg"
                          style={{ background: 'hsl(222 47% 12%)', border: `1px solid ${maintenance ? 'hsl(38 92% 50% / 0.3)' : 'hsl(222 47% 20%)'}` }}
                        >
                          <div>
                            <div className="text-xs font-medium text-white truncate max-w-[120px]">{p.name}</div>
                            <div className="text-xs mt-0.5" style={{ color: 'hsl(215 20% 50%)' }}>{p.occupied ? `Train ${p.trainId}` : 'Empty'}</div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${maintenance ? 'badge-delayed' : p.occupied ? 'badge-rerouted' : 'badge-on-time'
                            }`}>
                            {maintenance ? 'MAINT.' : p.occupied ? 'OCCUPIED' : 'AVAIL.'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {optimizationResults && (
                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-card-title flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      Optimization Results
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${optimizationResults.status === 'SUCCESS' ? 'badge-on-time' : 'badge-delayed'}`}>
                      {optimizationResults.status}
                    </span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: 'Affected', value: optimizationResults.summary.affectedTrains, color: 'text-blue-400' },
                        { label: 'Delay', value: `${optimizationResults.summary.totalDelayMinutes}m`, color: 'text-yellow-400' },
                        { label: 'Rescheduled', value: optimizationResults.summary.rescheduledTrains, color: 'text-green-400' },
                        { label: 'Solve Time', value: `${Math.round(optimizationResults.executionTime)}ms`, color: 'text-purple-400' },
                      ].map(s => (
                        <div key={s.label} className="text-center p-2 rounded-lg" style={{ background: 'hsl(222 47% 12%)' }}>
                          <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                          <div className="text-xs" style={{ color: 'hsl(215 20% 50%)' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-white mb-2">KPI Impact</div>
                      <div className="space-y-2">
                        {Object.entries(optimizationResults.kpiImpact).map(([key, kpi]: [string, any]) => (
                          <div key={key} className="flex items-center justify-between p-2 rounded text-xs"
                            style={{ background: 'hsl(222 47% 12%)' }}
                          >
                            <span className="capitalize" style={{ color: 'hsl(215 20% 60%)' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-white">{kpi.original} → {kpi.optimized} {kpi.unit}</span>
                              <span className={`font-medium ${kpi.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {kpi.change >= 0 ? '+' : ''}{kpi.change}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {optimizationResults.recommendations.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-white mb-2">AI Recommendations</div>
                        <div className="space-y-2">
                          {optimizationResults.recommendations.slice(0, 3).map(rec => (
                            <div key={rec.id} className="p-3 rounded-lg" style={{ background: 'hsl(222 47% 12%)', border: '1px solid hsl(222 47% 20%)' }}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-white">{rec.title}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${rec.priority === 'HIGH' ? 'badge-critical' : 'badge-delayed'}`}>
                                  {rec.priority}
                                </span>
                              </div>
                              <p className="text-xs" style={{ color: 'hsl(215 20% 50%)' }}>{rec.description}</p>
                              <div className="flex justify-between mt-1.5 text-xs" style={{ color: 'hsl(215 20% 45%)' }}>
                                <span>Confidence: {rec.confidence}%</span>
                                <span>Saves {rec.estimatedSaving}min</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <ScheduleGantt
                trains={generateTrainData()}
                disruptedTrains={activeDisruptions.length > 0 ? generateTrainData().slice(0, 3) : []}
                title={activeDisruptions.length > 0 ? 'Schedule Impact Analysis' : 'Current Train Schedule'}
                showComparison={activeDisruptions.length > 0}
              />
            </div>
          </div>
        </div>
      </RoleGuard>
    </DashboardLayout>
  )
}
