import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../lib/withAuth'
import { db } from '../../../lib/db'
import type { Task } from '../../../types'

export const GET = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const tasks = await db.tasks.get()
    const task = tasks.find(t => t._id === params.id)
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to fetch task:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const body = (await request.json()) as Partial<Task>
    const tasks = await db.tasks.get()
    const index = tasks.findIndex(t => t._id === params.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    tasks[index] = { ...tasks[index], ...body, updatedAt: new Date().toISOString() }
    await db.tasks.set(tasks)
    return NextResponse.json(tasks[index])
  } catch (error) {
    console.error('Failed to update task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    let tasks = await db.tasks.get()
    const initialLength = tasks.length
    tasks = tasks.filter(t => t._id !== params.id)
    if (tasks.length === initialLength) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    await db.tasks.set(tasks)
    return NextResponse.json({ message: 'Task deleted' })
  } catch (error) {
    console.error('Failed to delete task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
})
