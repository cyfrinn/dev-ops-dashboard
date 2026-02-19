import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../lib/withAuth'
import { db } from '../../lib/db'
import { randomUUID } from 'crypto'
import type { LearningItem } from '../../types'

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const learning = await db.learning.get()
    return NextResponse.json(learning)
  } catch (error) {
    console.error('Failed to fetch learning items:', error)
    return NextResponse.json({ error: 'Failed to fetch learning items' }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = (await request.json()) as Omit<LearningItem, '_id' | 'createdAt' | 'updatedAt'>
    const now = new Date().toISOString()
    const newItem: LearningItem = {
      ...body,
      _id: randomUUID(),
      createdAt: now,
      updatedAt: now
    }
    const learning = await db.learning.get()
    learning.push(newItem)
    await db.learning.set(learning)
    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('Failed to create learning item:', error)
    return NextResponse.json({ error: 'Failed to create learning item' }, { status: 500 })
  }
})
