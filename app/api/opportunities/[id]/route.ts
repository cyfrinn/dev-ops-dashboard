import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../lib/withAuth'
import { db } from '../../../lib/db'
import type { Opportunity } from '../../../types'

export const GET = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const opportunities = await db.opportunities.get()
    const opportunity = opportunities.find(o => o._id === params.id)
    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }
    return NextResponse.json(opportunity)
  } catch (error) {
    console.error('Failed to fetch opportunity:', error)
    return NextResponse.json({ error: 'Failed to fetch opportunity' }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const body = (await request.json()) as Partial<Opportunity>
    const opportunities = await db.opportunities.get()
    const index = opportunities.findIndex(o => o._id === params.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }
    opportunities[index] = { ...opportunities[index], ...body, updatedAt: new Date().toISOString() }
    await db.opportunities.set(opportunities)
    return NextResponse.json(opportunities[index])
  } catch (error) {
    console.error('Failed to update opportunity:', error)
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    let opportunities = await db.opportunities.get()
    const initialLength = opportunities.length
    opportunities = opportunities.filter(o => o._id !== params.id)
    if (opportunities.length === initialLength) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }
    await db.opportunities.set(opportunities)
    return NextResponse.json({ message: 'Opportunity deleted' })
  } catch (error) {
    console.error('Failed to delete opportunity:', error)
    return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 })
  }
})
