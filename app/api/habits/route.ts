import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../lib/withAuth'
import { db } from '../../lib/db'
import { randomUUID } from 'crypto'
import type { Habit } from '../../types'

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const habits = await db.habits.get()
    return NextResponse.json(habits)
  } catch (error) {
    console.error('Failed to fetch habits:', error)
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = (await request.json()) as Omit<Habit, '_id' | 'createdAt' | 'updatedAt' | 'currentStreak' | 'bestStreak'>
    const now = new Date().toISOString()
    const newHabit: Habit = {
      ...body,
      _id: randomUUID(),
      currentStreak: 0,
      bestStreak: 0,
      createdAt: now,
      updatedAt: now
    }
    const habits = await db.habits.get()
    habits.push(newHabit)
    await db.habits.set(habits)
    return NextResponse.json(newHabit, { status: 201 })
  } catch (error) {
    console.error('Failed to create habit:', error)
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 })
  }
})
