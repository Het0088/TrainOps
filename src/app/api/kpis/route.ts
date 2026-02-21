import { NextRequest, NextResponse } from 'next/server'

let cache: { data: any; at: number } | null = null
const TTL = 30_000

function generate() {
  if (cache && Date.now() - cache.at < TTL) return cache.data
  cache = {
    data: {
      throughput: { current: Math.floor(Math.random() * 5) + 22, target: 28, unit: 'trains/hour' },
      avgDelay: { current: Math.floor(Math.random() * 6) + 8, target: 8, unit: 'minutes' },
      onTimePercentage: { current: Math.floor(Math.random() * 12) + 78, target: 85, unit: 'percentage' },
      sectionUtilization: { current: Math.floor(Math.random() * 18) + 62, target: 75, unit: 'percentage' },
    },
    at: Date.now(),
  }
  return cache.data
}

export async function GET() {
  const data = generate()
  return NextResponse.json({ success: true, data, timestamp: new Date().toISOString() }, {
    headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' }
  })
}