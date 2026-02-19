import { NextRequest, NextResponse } from 'next/server'
import { registerToken, getStoredPassword, initAuth } from '../../../lib/server-auth'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Ensure auth is initialized
    await initAuth()

    const { password } = await request.json()
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }
    const stored = await getStoredPassword()
    if (password !== stored) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
    const token = randomUUID()
    await registerToken(token)
    return NextResponse.json({ token })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
