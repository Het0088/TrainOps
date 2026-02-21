'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { useRecommendationStore } from '@/store/recommendation-store'
import { useApi } from '@/hooks/useApi'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Info,
  TrendingUp,
  Route,
  Train,
  Users,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Eye
} from 'lucide-react'
import { ExportButton } from '@/components/ui/export-button'

export default function AIRecommendationsPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuthStore()
  const {
    recommendations,
    loading,
    error,
    setRecommendations,
    approveRecommendation,
    rejectRecommendation,
    setLoading,
    setError
  } = useRecommendationStore()
  const { apiCall } = useApi()
  const router = useRouter()

  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null)
  const [filter, setFilter] = useState<string>('all')
  const [actionHistory, setActionHistory] = useState<any[]>([])

  const loadRecommendations = useCallback(async () => {
    if (!isAuthenticated) return

    setLoading(true)
    setError(null)

    try {
      const response = await apiCall('/recommendations')
      setRecommendations(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, apiCall, setRecommendations, setLoading, setError])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadRecommendations()
  }, [isAuthenticated, authLoading, router, loadRecommendations])

  if (authLoading || !isAuthenticated) return null

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PRECEDENCE': return <TrendingUp className="w-4 h-4" />
      case 'HOLDING': return <Clock className="w-4 h-4" />
      case 'PLATFORM': return <Train className="w-4 h-4" />
      case 'ROUTE': return <Route className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PRECEDENCE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'HOLDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'PLATFORM': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'ROUTE': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400'
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const handleApprove = async (recommendation: any) => {
    try {
      // Use the store method to approve recommendation
      approveRecommendation(recommendation.id, user?.id || '', 'Approved by controller')

      // Add to action history
      const action = {
        id: Date.now(),
        recommendationId: recommendation.id,
        action: 'APPROVED',
        timestamp: new Date().toISOString(),
        user: user?.name,
        recommendation: recommendation.title
      }

      setActionHistory(prev => [action, ...prev])
    } catch (err) {
      console.error('Failed to approve recommendation:', err)
    }
  }

  const handleReject = async (recommendation: any) => {
    try {
      // Use the store method to reject recommendation
      rejectRecommendation(recommendation.id, user?.id || '', 'Rejected by controller')

      // Add to action history
      const action = {
        id: Date.now(),
        recommendationId: recommendation.id,
        action: 'REJECTED',
        timestamp: new Date().toISOString(),
        user: user?.name,
        recommendation: recommendation.title
      }

      setActionHistory(prev => [action, ...prev])
    } catch (err) {
      console.error('Failed to reject recommendation:', err)
    }
  }

  const filteredRecommendations = recommendations.filter(rec => {
    if (filter === 'all') return true
    return rec.type === filter
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Recommendations</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Intelligent suggestions to optimize railway operations
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <ExportButton
              data={{
                recommendations: filteredRecommendations,
                actionHistory,
                filter,
                generatedAt: new Date()
              }}
              filename="ai-recommendations-report"
              title="AI Recommendations Report"
              variant="outline"
              size="sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={loadRecommendations}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              {['all', 'PRECEDENCE', 'HOLDING', 'PLATFORM', 'ROUTE'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${filter === type
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  {type === 'all' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recommendations List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Active Recommendations</span>
                  <Badge variant="outline">{filteredRecommendations.length}</Badge>
                </CardTitle>
                <CardDescription>
                  AI-generated suggestions for optimizing train operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading && recommendations.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading recommendations...</span>
                  </div>
                ) : filteredRecommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No recommendations</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {filter === 'all' ? 'All recommendations have been processed.' : `No ${filter.toLowerCase()} recommendations available.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRecommendations.map((recommendation) => (
                      <div
                        key={recommendation.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedRecommendation(recommendation)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getTypeColor(recommendation.type)}>
                                {getTypeIcon(recommendation.type)}
                                <span className="ml-1">{recommendation.type}</span>
                              </Badge>
                              <span className={`text-sm font-medium ${getConfidenceColor(recommendation.confidence)}`}>
                                {recommendation.confidence}% confidence
                              </span>
                            </div>

                            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                              {recommendation.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {recommendation.description}
                            </p>

                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>Train: {recommendation.trainId}</span>
                              <span>Impact: {recommendation.impact}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2 ml-4">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleApprove(recommendation)
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleReject(recommendation)
                              }}
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action History Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Recent Actions</span>
                </CardTitle>
                <CardDescription>
                  Your recent decisions on AI recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {actionHistory.length === 0 ? (
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">No actions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {actionHistory.slice(0, 10).map((action) => (
                      <div key={action.id} className="flex items-start space-x-2 text-sm">
                        <div className={`w-2 h-2 rounded-full mt-2 ${action.action === 'APPROVED' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white">{action.recommendation}</p>
                          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className={
                              action.action === 'APPROVED' ? 'text-green-600' : 'text-red-600'
                            }>
                              {action.action}
                            </span>
                            <span>•</span>
                            <span>{new Date(action.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>AI Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">85%</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Accuracy Rate</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="font-medium">12</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">This Week</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="font-medium">89%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Approved</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommendation Detail Modal */}
        <Dialog open={!!selectedRecommendation} onOpenChange={() => setSelectedRecommendation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>Recommendation Details</span>
              </DialogTitle>
              <DialogDescription>
                Detailed analysis and suggested actions
              </DialogDescription>
            </DialogHeader>

            {selectedRecommendation && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Badge className={getTypeColor(selectedRecommendation.type)}>
                    {getTypeIcon(selectedRecommendation.type)}
                    <span className="ml-1">{selectedRecommendation.type}</span>
                  </Badge>
                  <div className={`font-medium ${getConfidenceColor(selectedRecommendation.confidence)}`}>
                    {selectedRecommendation.confidence}% Confidence
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    {selectedRecommendation.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedRecommendation.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-gray-600 dark:text-gray-400">Affected Train</label>
                    <p className="mt-1">{selectedRecommendation.trainId}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 dark:text-gray-400">Expected Impact</label>
                    <p className="mt-1">{selectedRecommendation.impact}</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">AI Analysis</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    This recommendation is based on current traffic patterns, historical data, and real-time
                    operational constraints. The suggested action is expected to reduce overall delay by
                    approximately 8 minutes and improve passenger satisfaction.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      handleApprove(selectedRecommendation)
                      setSelectedRecommendation(null)
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Approve & Implement
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleReject(selectedRecommendation)
                      setSelectedRecommendation(null)
                    }}
                    className="flex-1"
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}