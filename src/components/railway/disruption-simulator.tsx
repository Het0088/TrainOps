import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  CloudRain, 
  Zap, 
  Construction, 
  Train, 
  Clock,
  MapPin,
  Activity
} from 'lucide-react'
import { DisruptionEvent } from '@/types'
import { STATIONS, TRACKS } from '@/lib/scaled-mock-data'

interface DisruptionSimulatorProps {
  onTriggerDisruption: (disruption: DisruptionEvent) => void
  activeDisruptions: DisruptionEvent[]
  isSimulating: boolean
}

interface DisruptionTemplate {
  id: string
  name: string
  type: DisruptionEvent['type']
  severity: DisruptionEvent['severity']
  icon: React.ComponentType<any>
  description: string
  estimatedDuration: number
  color: string
  scenarios: {
    title: string
    description: string
    location?: { stationId?: string; trackId?: string; sectionId?: string; platformId?: string }
    delayMinutes?: number
    affectedTrains?: number
  }[]
}

const disruptionTemplates: DisruptionTemplate[] = [
  {
    id: 'accident',
    name: 'Track Accident',
    type: 'ACCIDENT',
    severity: 'CRITICAL',
    icon: AlertTriangle,
    description: 'Vehicle collision or derailment blocking tracks',
    estimatedDuration: 180,
    color: 'red',
    scenarios: [
      {
        title: 'Vehicle Collision at Level Crossing',
        description: 'Road vehicle collision at unmanned level crossing near Vadodara',
        location: { stationId: 'ST004', trackId: 'TK001' },
        delayMinutes: 45,
        affectedTrains: 8
      },
      {
        title: 'Minor Derailment in Yard',
        description: 'Freight car derailment in marshalling yard at Mumbai Central',
        location: { stationId: 'ST001', trackId: 'TK006' },
        delayMinutes: 120,
        affectedTrains: 12
      }
    ]
  },
  {
    id: 'signal_failure',
    name: 'Signal System Failure',
    type: 'SIGNAL_FAILURE',
    severity: 'HIGH',
    icon: Zap,
    description: 'Electronic signaling system malfunction',
    estimatedDuration: 90,
    color: 'orange',
    scenarios: [
      {
        title: 'ATP System Failure',
        description: 'Automatic Train Protection system failure on main line',
        location: { sectionId: 'SEC_ST005_ST006' },
        delayMinutes: 25,
        affectedTrains: 6
      },
      {
        title: 'Interlocking System Error',
        description: 'Computer-based interlocking error at junction',
        location: { stationId: 'ST009', trackId: 'TK003' },
        delayMinutes: 35,
        affectedTrains: 10
      }
    ]
  },
  {
    id: 'weather_delay',
    name: 'Severe Weather',
    type: 'WEATHER_DELAY',
    severity: 'MEDIUM',
    icon: CloudRain,
    description: 'Heavy fog, rain, or extreme weather conditions',
    estimatedDuration: 120,
    color: 'blue',
    scenarios: [
      {
        title: 'Dense Fog Warning',
        description: 'Visibility below 50m across Western Railway corridor',
        location: { sectionId: 'SEC_ST003_ST004' },
        delayMinutes: 15,
        affectedTrains: 15
      },
      {
        title: 'Heavy Monsoon Rain',
        description: 'Waterlogging and speed restrictions due to heavy rainfall',
        location: { sectionId: 'SEC_ST001_ST002' },
        delayMinutes: 20,
        affectedTrains: 12
      }
    ]
  },
  {
    id: 'platform_unavailable',
    name: 'Platform Issues',
    type: 'PLATFORM_UNAVAILABLE',
    severity: 'MEDIUM',
    icon: Construction,
    description: 'Platform maintenance or infrastructure failure',
    estimatedDuration: 60,
    color: 'yellow',
    scenarios: [
      {
        title: 'Platform Electrical Failure',
        description: 'Power supply failure affecting platform operations',
        location: { stationId: 'ST010', platformId: 'P032' },
        delayMinutes: 10,
        affectedTrains: 4
      },
      {
        title: 'Emergency Platform Repair',
        description: 'Urgent structural repair work on main platform',
        location: { stationId: 'ST005', platformId: 'P015' },
        delayMinutes: 30,
        affectedTrains: 8
      }
    ]
  },
  {
    id: 'block_section',
    name: 'Section Blockage',
    type: 'BLOCK_SECTION',
    severity: 'HIGH',
    icon: Train,
    description: 'Track section blocked due to infrastructure work',
    estimatedDuration: 150,
    color: 'purple',
    scenarios: [
      {
        title: 'Emergency Track Maintenance',
        description: 'Urgent rail replacement work on main line',
        location: { sectionId: 'SEC_ST007_ST008' },
        delayMinutes: 40,
        affectedTrains: 10
      },
      {
        title: 'Overhead Wire Repair',
        description: 'Electric traction overhead wire maintenance',
        location: { sectionId: 'SEC_ST004_ST005' },
        delayMinutes: 50,
        affectedTrains: 14
      }
    ]
  },
  {
    id: 'delay_train',
    name: 'Train Delay',
    type: 'DELAY_TRAIN',
    severity: 'LOW',
    icon: Clock,
    description: 'Operational delays and scheduling conflicts',
    estimatedDuration: 30,
    color: 'green',
    scenarios: [
      {
        title: 'Crew Change Delay',
        description: 'Locomotive pilot change taking longer than scheduled',
        location: { stationId: 'ST006' },
        delayMinutes: 12,
        affectedTrains: 2
      },
      {
        title: 'Passenger Loading Delay',
        description: 'Extended passenger boarding time during peak hours',
        location: { stationId: 'ST001' },
        delayMinutes: 8,
        affectedTrains: 1
      }
    ]
  }
]

export default function DisruptionSimulator({ 
  onTriggerDisruption, 
  activeDisruptions, 
  isSimulating 
}: DisruptionSimulatorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<DisruptionTemplate | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<number>(0)

  const handleTriggerDisruption = (template: DisruptionTemplate, scenarioIndex: number) => {
    const scenario = template.scenarios[scenarioIndex]
    const disruption: DisruptionEvent = {
      id: `D${Date.now()}`,
      type: template.type,
      severity: template.severity,
      title: scenario.title,
      description: scenario.description,
      startTime: new Date().toISOString(),
      duration: template.estimatedDuration,
      ...scenario.location,
      delayMinutes: scenario.delayMinutes
    }
    
    onTriggerDisruption(disruption)
  }

  const getLocationName = (location: any) => {
    if (location?.stationId) {
      const station = STATIONS.find(s => s.id === location.stationId)
      return station?.name || location.stationId
    }
    if (location?.trackId) {
      const track = TRACKS.find(t => t.id === location.trackId)
      return track?.name || location.trackId
    }
    if (location?.sectionId) {
      return location.sectionId.replace('SEC_', '').replace('_', ' → ')
    }
    return 'Network Wide'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500'
      case 'HIGH': return 'bg-orange-500'
      case 'MEDIUM': return 'bg-yellow-500'
      case 'LOW': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeColor = (color: string) => {
    switch (color) {
      case 'red': return 'border-red-500 hover:bg-red-50'
      case 'orange': return 'border-orange-500 hover:bg-orange-50'
      case 'blue': return 'border-blue-500 hover:bg-blue-50'
      case 'yellow': return 'border-yellow-500 hover:bg-yellow-50'
      case 'purple': return 'border-purple-500 hover:bg-purple-50'
      case 'green': return 'border-green-500 hover:bg-green-50'
      default: return 'border-gray-500 hover:bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Active Disruptions */}
      {activeDisruptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Active Disruptions ({activeDisruptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeDisruptions.map((disruption) => (
                <div 
                  key={disruption.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge 
                      className={`${getSeverityColor(disruption.severity)} text-white`}
                    >
                      {disruption.severity}
                    </Badge>
                    <div>
                      <div className="font-medium">{disruption.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {disruption.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {getLocationName(disruption)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {disruption.duration}min
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disruption Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Disruption Scenarios</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select a disruption type to simulate realistic operational challenges
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {disruptionTemplates.map((template) => {
              const Icon = template.icon
              return (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md border-2 h-full ${
                    selectedTemplate?.id === template.id 
                      ? `${getTypeColor(template.color)} border-2` 
                      : 'border-gray-200'
                  }`}
                  onClick={() => {
                    setSelectedTemplate(template)
                    setSelectedScenario(0)
                  }}
                >
                  <CardContent className="p-4 h-full">
                    <div className="flex items-start gap-3 h-full">
                      <div className={`p-2 rounded-lg bg-${template.color}-100 flex-shrink-0`}>
                        <Icon className={`w-5 h-5 text-${template.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm leading-tight">{template.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge 
                            variant="outline" 
                            className={`${getSeverityColor(template.severity)} text-white border-0 text-xs`}
                          >
                            {template.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ~{template.estimatedDuration}min
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Scenario Details */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <selectedTemplate.icon className="w-5 h-5" />
              {selectedTemplate.name} Scenarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedTemplate.scenarios.map((scenario, index) => (
                <div 
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedScenario === index 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedScenario(index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{scenario.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {scenario.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{getLocationName(scenario.location)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>+{scenario.delayMinutes}min delay</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Train className="w-3 h-3" />
                          <span>{scenario.affectedTrains} trains affected</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      disabled={isSimulating}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTriggerDisruption(selectedTemplate, index)
                      }}
                      className="ml-4"
                    >
                      {isSimulating ? 'Simulating...' : 'Trigger'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}