import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react'

interface RealTimeUpdate {
  id: string
  timestamp: Date
  type: 'optimization' | 'rerouting' | 'schedule_update' | 'alert'
  message: string
  severity: 'low' | 'medium' | 'high'
  progress?: number
}

interface LiveSimulationPanelProps {
  isActive: boolean
  scenarioName?: string
  onComplete?: () => void
}

const LiveSimulationPanel: React.FC<LiveSimulationPanelProps> = ({
  isActive,
  scenarioName = "Simulation",
  onComplete
}) => {
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([])
  const [currentPhase, setCurrentPhase] = useState('')
  const [overallProgress, setOverallProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  // Simulation phases with realistic timings
  const phases = [
    { name: 'Analyzing disruption impact', duration: 2000, progress: 20 },
    { name: 'Calculating alternative routes', duration: 3000, progress: 40 },
    { name: 'Optimizing train schedules', duration: 2500, progress: 60 },
    { name: 'Validating resource allocation', duration: 1500, progress: 80 },
    { name: 'Generating recommendations', duration: 1000, progress: 100 }
  ]

  // Generate realistic update messages
  const generateUpdate = (type: RealTimeUpdate['type'], phaseIndex: number): RealTimeUpdate => {
    const messages = {
      optimization: [
        'Recalculating optimal train paths...',
        'Analyzing platform capacity constraints...',
        'Optimizing crew assignments...',
        'Balancing passenger load distribution...',
        'Finalizing schedule adjustments...'
      ],
      rerouting: [
        'Identifying alternative track sections...',
        'Evaluating bypass route options...',
        'Checking signal interlocking systems...',
        'Validating route safety protocols...',
        'Implementing new routing plan...'
      ],
      schedule_update: [
        'Updating departure times for affected trains...',
        'Synchronizing connecting services...',
        'Adjusting maintenance windows...',
        'Coordinating with station operations...',
        'Publishing schedule changes...'
      ],
      alert: [
        'Notifying control room operators...',
        'Sending passenger announcements...',
        'Alerting maintenance teams...',
        'Updating information displays...',
        'Confirming implementation status...'
      ]
    }

    return {
      id: `update-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type,
      message: messages[type][phaseIndex] || messages[type][0],
      severity: phaseIndex < 2 ? 'high' : phaseIndex < 4 ? 'medium' : 'low',
      progress: phases[phaseIndex]?.progress
    }
  }

  useEffect(() => {
    if (!isActive || isCompleted) return

    let currentPhaseIndex = 0
    let phaseTimeout: NodeJS.Timeout
    let updateInterval: NodeJS.Timeout

    const runSimulation = async () => {
      setUpdates([])
      setOverallProgress(0)
      setIsCompleted(false)

      for (let i = 0; i < phases.length; i++) {
        const phase = phases[i]
        setCurrentPhase(phase.name)
        
        // Generate updates during this phase
        const updateTypes: RealTimeUpdate['type'][] = ['optimization', 'rerouting', 'schedule_update', 'alert']
        let updateCount = 0
        const maxUpdates = 3

        updateInterval = setInterval(() => {
          if (updateCount < maxUpdates) {
            const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)]
            const newUpdate = generateUpdate(randomType, i)
            
            setUpdates(prev => [newUpdate, ...prev.slice(0, 9)]) // Keep last 10 updates
            updateCount++
          }
        }, phase.duration / maxUpdates)

        // Animate progress during phase
        const progressStep = (phase.progress - overallProgress) / 20
        const progressInterval = setInterval(() => {
          setOverallProgress(prev => {
            const next = prev + progressStep
            return next >= phase.progress ? phase.progress : next
          })
        }, phase.duration / 20)

        await new Promise(resolve => {
          phaseTimeout = setTimeout(() => {
            clearInterval(updateInterval)
            clearInterval(progressInterval)
            setOverallProgress(phase.progress)
            resolve(void 0)
          }, phase.duration)
        })
      }

      // Completion
      setCurrentPhase('Simulation completed')
      setIsCompleted(true)
      setUpdates(prev => [{
        id: `completion-${Date.now()}`,
        timestamp: new Date(),
        type: 'optimization',
        message: 'All optimization processes completed successfully',
        severity: 'low'
      }, ...prev])

      onComplete?.()
    }

    runSimulation()

    return () => {
      clearTimeout(phaseTimeout)
      clearInterval(updateInterval)
    }
  }, [isActive, isCompleted, onComplete])

  if (!isActive) return null

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return <TrendingUp className="w-4 h-4 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
          Live Simulation: {scenarioName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{currentPhase}</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="w-full" />
        </div>

        {/* Real-time Updates */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Live Updates</h4>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {updates.map((update) => (
              <div
                key={update.id}
                className="flex items-start gap-2 p-2 rounded-lg border bg-card text-card-foreground"
              >
                {getSeverityIcon(update.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={getSeverityColor(update.severity)}>
                      {update.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {update.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {update.message}
                  </p>
                </div>
              </div>
            ))}
            {updates.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-4">
                Waiting for simulation updates...
              </div>
            )}
          </div>
        </div>

        {/* Status Summary */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm text-muted-foreground">
            {isCompleted ? 'Simulation completed' : 'Processing simulation...'}
          </div>
          <Badge variant={isCompleted ? 'default' : 'secondary'}>
            {isCompleted ? 'COMPLETED' : 'RUNNING'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export default LiveSimulationPanel