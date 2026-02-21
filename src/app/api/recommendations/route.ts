import { NextRequest, NextResponse } from 'next/server'
import { mockRecommendations } from '@/lib/scaled-mock-data'

export async function GET(request: NextRequest) {
  try {
    await new Promise(resolve => setTimeout(resolve, 150))
    
    const url = new URL(request.url)
    const status = url.searchParams.get('status') || 'PENDING'
    
    const recommendations = mockRecommendations.filter(rec => 
      status === 'all' ? true : rec.status === status
    )
    
    return NextResponse.json({
      success: true,
      data: recommendations,
      count: recommendations.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { recommendationId, action, reason } = await request.json()
    
    if (!recommendationId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Simulate processing controller action
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return NextResponse.json({
      success: true,
      message: `Recommendation ${recommendationId} ${action.toLowerCase()}ed successfully`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process recommendation' },
      { status: 500 }
    )
  }
}