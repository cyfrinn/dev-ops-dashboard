import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../lib/withAuth'
import { db } from '../../lib/db'
import { randomUUID } from 'crypto'
import type { Task } from '../../types'

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const tasks = await db.tasks.get()
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = (await request.json()) as Omit<Task, '_id' | 'createdAt' | 'updatedAt'>
    const now = new Date().toISOString()
    const newTask: Task = {
      ...body,
      _id: randomUUID(),
      createdAt: now,
      updatedAt: now
    }
    const tasks = await db.tasks.get()
    tasks.push(newTask)
    await db.tasks.set(tasks)
    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
})
