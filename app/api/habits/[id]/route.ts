import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../lib/withAuth'
import { db } from '../../../lib/db'
import type { Habit } from '../../../types'

export const GET = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const habits = await db.habits.get()
    const habit = habits.find(h => h._id === params.id)
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }
    return NextResponse.json(habit)
  } catch (error) {
    console.error('Failed to fetch habit:', error)
    return NextResponse.json({ error: 'Failed to fetch habit' }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const body = (await request.json()) as Partial<Habit>
    const habits = await db.habits.get()
    const index = habits.findIndex(h => h._id === params.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }
    habits[index] = { ...habits[index], ...body, updatedAt: new Date().toISOString() }
    await db.habits.set(habits)
    return NextResponse.json(habits[index])
  } catch (error) {
    console.error('Failed to update habit:', error)
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    let habits = await db.habits.get()
    const initialLength = habits.length
    habits = habits.filter(h => h._id !== params.id)
    if (habits.length === initialLength) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }
    await db.habits.set(habits)
    return NextResponse.json({ message: 'Habit deleted' })
  } catch (error) {
    console.error('Failed to delete habit:', error)
    return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 })
  }
})
