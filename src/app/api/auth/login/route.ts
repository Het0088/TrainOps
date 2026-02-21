import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, LoginCredentials } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const credentials: LoginCredentials = await request.json()
    
    if (!credentials.email || !credentials.password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const result = authenticateUser(credentials)
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request data' },
      { status: 400 }
    )
  }
}