import { NextRequest, NextResponse } from 'next/server'
import { mockSystemStatus } from '@/lib/scaled-mock-data'

let cache: { data: any; at: number } | null = null
const TTL = 30_000

export async function GET() {
  if (!cache || Date.now() - cache.at > TTL) {
    cache = {
      data: mockSystemStatus.services.map(s => ({
        ...s,
        health: s.status === 'OPERATIONAL'
          ? Math.max(85, s.uptime + (Math.random() - 0.5) * 5)
          : Math.max(20, s.uptime + (Math.random() - 0.5) * 10),
        lastUpdate: mockSystemStatus.lastUpdated
      })),
      at: Date.now(),
    }
  }
  return NextResponse.json({ success: true, data: cache.data, count: cache.data.length, timestamp: new Date().toISOString() }, {
    headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' }
  })
}