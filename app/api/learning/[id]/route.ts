import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../lib/withAuth'
import { db } from '../../../lib/db'
import type { LearningItem } from '../../../types'

export const GET = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const learning = await db.learning.get()
    const item = learning.find(l => l._id === params.id)
    if (!item) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 })
    }
    return NextResponse.json(item)
  } catch (error) {
    console.error('Failed to fetch learning item:', error)
    return NextResponse.json({ error: 'Failed to fetch learning item' }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const body = (await request.json()) as Partial<LearningItem>
    const learning = await db.learning.get()
    const index = learning.findIndex(l => l._id === params.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 })
    }
    learning[index] = { ...learning[index], ...body, updatedAt: new Date().toISOString() }
    await db.learning.set(learning)
    return NextResponse.json(learning[index])
  } catch (error) {
    console.error('Failed to update learning item:', error)
    return NextResponse.json({ error: 'Failed to update learning item' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    let learning = await db.learning.get()
    const initialLength = learning.length
    learning = learning.filter(l => l._id !== params.id)
    if (learning.length === initialLength) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 })
    }
    await db.learning.set(learning)
    return NextResponse.json({ message: 'Learning item deleted' })
  } catch (error) {
    console.error('Failed to delete learning item:', error)
    return NextResponse.json({ error: 'Failed to delete learning item' }, { status: 500 })
  }
})
