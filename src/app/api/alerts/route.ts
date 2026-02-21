import { NextRequest, NextResponse } from 'next/server'
import { mockAlerts } from '@/lib/scaled-mock-data'

export async function GET(request: NextRequest) {
  try {

    const url = new URL(request.url)
    const severity = url.searchParams.get('severity')
    const acknowledged = url.searchParams.get('acknowledged')

    let alerts = [...mockAlerts]

    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity)
    }

    if (acknowledged !== null) {
      const isAcknowledged = acknowledged === 'true'
      alerts = alerts.filter(alert => alert.acknowledged === isAcknowledged)
    }

    // Sort by timestamp, newest first
    alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      success: true,
      data: alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    }, { headers: { 'Cache-Control': 's-maxage=15, stale-while-revalidate=30' } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}