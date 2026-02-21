'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Zap, 
  Brain, 
  Wifi, 
  WifiOff, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Server,
  Wrench
} from 'lucide-react'
import { 
  useOptimizationMode, 
  useOptimizationConnection, 
  useOptimizationMetrics,
  useOptimizationStore 
} from '@/store/optimization-store'
import { useWebSocketService } from '@/lib/websocket-service'

export function OptimizationSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const [backendUrl, setBackendUrl] = useState('')
  const [timeout, setTimeout] = useState(30)
  
  const { mode, setMode, isORTools, isMock } = useOptimizationMode()
  const { isConnected, connectionError, backendUrl: currentBackendUrl } = useOptimizationConnection()
  const { avgTime, successRate, totalOptimizations, resetMetrics } = useOptimizationMetrics()
  const { 
    config, 
    setBackendUrl: updateBackendUrl, 
    setTimeout: updateTimeout,
    setWebSocketEnabled,
    setAutoFallback 
  } = useOptimizationStore()
  const { connectionStatus, connect, disconnect } = useWebSocketService()

  const handleModeSwitch = (newMode: 'mock' | 'ortools') => {
    setMode(newMode)
    
    if (newMode === 'ortools' && config.enableWebSocket) {
      // Auto-connect WebSocket when switching to OR-Tools
      connect().catch(console.error)
    } else if (newMode === 'mock') {
      // Disconnect WebSocket when switching to mock
      disconnect()
    }
  }

  const handleSaveSettings = () => {
    if (backendUrl) {
      updateBackendUrl(backendUrl)
    }
    updateTimeout(timeout * 1000) // Convert to milliseconds
    setIsOpen(false)
  }

  const testConnection = async () => {
    try {
      const testUrl = backendUrl || currentBackendUrl
      const response = await fetch(`${testUrl}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Backend connection test successful:', data)
        alert(`✅ Connection successful!\n\nBackend: ${data.message}\nSolver: ${data.solver_version || 'Unknown'}\nStatus: ${data.status}`)
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('❌ Backend connection test failed:', error)
      alert(`❌ Connection failed!\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check the backend URL and ensure the OR-Tools service is running.`)
    }
  }

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'connecting': return 'bg-yellow-500'
      case 'reconnecting': return 'bg-orange-500'
      case 'disconnected': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getConnectionStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Connected'
      case 'connecting': return 'Connecting...'
      case 'reconnecting': return 'Reconnecting...'
      case 'disconnected': return 'Disconnected'
      default: return 'Unknown'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Optimization Settings
          <Badge variant={isORTools ? "default" : "secondary"} className="text-xs">
            {isORTools ? "OR-Tools" : "Mock"}
          </Badge>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Optimization Engine Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="mode" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mode">Mode</TabsTrigger>
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Mode Selection Tab */}
          <TabsContent value="mode" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mock Optimization */}
              <Card className={`cursor-pointer transition-all ${isMock ? 'ring-2 ring-primary' : ''}`} 
                    onClick={() => handleModeSwitch('mock')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-500" />
                    Mock Optimization
                    {isMock && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Simulated optimization with realistic results for demonstration and testing.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4 text-green-500" />
                        <span>Fast execution (3-8 seconds)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>No external dependencies</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span>Realistic mock data</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* OR-Tools Optimization */}
              <Card className={`cursor-pointer transition-all ${isORTools ? 'ring-2 ring-primary' : ''}`} 
                    onClick={() => handleModeSwitch('ortools')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-orange-500" />
                    OR-Tools Optimization
                    {isORTools && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Real constraint programming optimization using Google OR-Tools CP-SAT solver.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <span>Advanced constraint solving</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        <span>Optimal solutions</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {isConnected ? (
                          <Wifi className="w-4 h-4 text-green-500" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-red-500" />
                        )}
                        <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                          {isConnected ? 'Backend Connected' : 'Requires Backend'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={isORTools ? "default" : "secondary"}>
                      {mode.toUpperCase()}
                    </Badge>
                    <span className="text-sm">Active Mode</span>
                  </div>
                  
                  {isORTools && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor(connectionStatus)}`}></div>
                        <span className="text-sm">{getConnectionStatusText(connectionStatus)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Timeout: {config.timeout / 1000}s</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connection Tab */}
          <TabsContent value="connection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backend Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Backend URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={backendUrl || currentBackendUrl}
                      onChange={(e) => setBackendUrl(e.target.value)}
                      placeholder="http://localhost:8000"
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                    />
                    <Button variant="outline" onClick={testConnection}>
                      Test Connection
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    URL of the OR-Tools FastAPI backend service
                  </p>
                </div>

                {isORTools && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Connection Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Connection Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor(connectionStatus)}`}></div>
                            <span className="text-sm font-medium">{getConnectionStatusText(connectionStatus)}</span>
                          </div>
                          
                          {connectionError && (
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                              <span className="text-sm text-red-600">{connectionError}</span>
                            </div>
                          )}
                          
                          <div className="flex gap-2 mt-3">
                            <Button variant="outline" size="sm" onClick={connect}>
                              <Wifi className="w-4 h-4 mr-1" />
                              Connect
                            </Button>
                            <Button variant="outline" size="sm" onClick={disconnect}>
                              <WifiOff className="w-4 h-4 mr-1" />
                              Disconnect
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* WebSocket Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Real-time Updates</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={config.enableWebSocket}
                              onChange={(e) => setWebSocketEnabled(e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-sm">Enable WebSocket</span>
                          </label>
                          
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={config.autoFallback}
                              onChange={(e) => setAutoFallback(e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-sm">Auto-fallback to mock</span>
                          </label>
                          
                          <p className="text-xs text-muted-foreground">
                            WebSocket provides real-time optimization progress updates
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Metrics Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Avg. Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {avgTime > 0 ? `${(avgTime / 1000).toFixed(1)}s` : '--'}
                  </div>
                  <p className="text-xs text-muted-foreground">Per optimization</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalOptimizations > 0 ? `${successRate.toFixed(1)}%` : '--'}
                  </div>
                  <p className="text-xs text-muted-foreground">Successful runs</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Total Runs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalOptimizations}</div>
                  <p className="text-xs text-muted-foreground">Optimizations</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Optimization Timeout: {timeout} seconds
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    value={timeout}
                    onChange={(e) => setTimeout(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>10s</span>
                    <span>60s</span>
                    <span>120s</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetMetrics}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset Metrics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Development Mode</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        These settings are for development and testing. In production, 
                        these would be configured through environment variables.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Current Mode Benefits</h4>
                    {isORTools ? (
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Real constraint programming optimization</li>
                        <li>• Handles complex railway scheduling constraints</li>
                        <li>• Optimal solutions for disruption recovery</li>
                        <li>• Scalable to large networks (500+ trains)</li>
                        <li>• Real-time progress updates via WebSocket</li>
                      </ul>
                    ) : (
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Fast simulation for demonstrations</li>
                        <li>• No external dependencies required</li>
                        <li>• Consistent behavior for testing</li>
                        <li>• Realistic mock results and recommendations</li>
                        <li>• Ideal for development and demos</li>
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}