import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './server-auth'

export function withAuth<P extends Record<string, string> = Record<string, string>>(
  handler: (req: NextRequest, params: { params: P }) => Promise<NextResponse>
) {
  return async (req: NextRequest, params: { params: P }) => {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return handler(req, params)
  }
}
