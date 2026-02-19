import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../../lib/withAuth'
import { db } from '../../../../lib/db'

export const POST = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const learning = await db.learning.get()
    const index = learning.findIndex(l => l._id === params.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 })
    }
    const item = learning[index]
    // Toggle between completed and pending
    const newStatus: 'pending' | 'in-progress' | 'completed' =
      item.status === 'completed' ? 'pending' : 'completed'
    learning[index] = {
      ...item,
      status: newStatus,
      updatedAt: new Date().toISOString()
    }
    await db.learning.set(learning)
    return NextResponse.json(learning[index])
  } catch (error) {
    console.error('Failed to toggle learning item:', error)
    return NextResponse.json({ error: 'Failed to toggle learning item' }, { status: 500 })
  }
})
