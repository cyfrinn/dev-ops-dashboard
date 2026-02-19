import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../../lib/withAuth'
import { db } from '../../../../lib/db'

export const POST = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const habits = await db.habits.get()
    const index = habits.findIndex(h => h._id === params.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }
    const habit = habits[index]
    const today = new Date().toDateString()
    const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted).toDateString() : null

    // If already completed today, don't increment again (optional: could reset)
    if (lastCompleted === today) {
      return NextResponse.json({ message: 'Already completed today', habit }, { status: 200 })
    }

    // Increment streak
    const newStreak = habit.currentStreak + 1
    const bestStreak = Math.max(habit.bestStreak, newStreak)

    habits[index] = {
      ...habit,
      currentStreak: newStreak,
      bestStreak,
      lastCompleted: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    await db.habits.set(habits)
    return NextResponse.json(habits[index])
  } catch (error) {
    console.error('Failed to complete habit:', error)
    return NextResponse.json({ error: 'Failed to complete habit' }, { status: 500 })
  }
})
