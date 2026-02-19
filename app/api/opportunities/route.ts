import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../lib/withAuth'
import { db } from '../../lib/db'
import { randomUUID } from 'crypto'
import type { Opportunity } from '../../types'

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const opportunities = await db.opportunities.get()
    return NextResponse.json(opportunities)
  } catch (error) {
    console.error('Failed to fetch opportunities:', error)
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = (await request.json()) as Omit<Opportunity, '_id' | 'createdAt' | 'updatedAt'>
    const now = new Date().toISOString()
    const newOpportunity: Opportunity = {
      ...body,
      _id: randomUUID(),
      createdAt: now,
      updatedAt: now
    }
    const opportunities = await db.opportunities.get()
    opportunities.push(newOpportunity)
    await db.opportunities.set(opportunities)
    return NextResponse.json(newOpportunity, { status: 201 })
  } catch (error) {
    console.error('Failed to create opportunity:', error)
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 })
  }
})
