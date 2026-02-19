import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../lib/withAuth'
import { db } from '../../lib/db'
import { randomUUID } from 'crypto'
import type { Project } from '../../types'

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const projects = await db.projects.get()
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = (await request.json()) as Omit<Project, '_id' | 'createdAt' | 'updatedAt'>
    const now = new Date().toISOString()
    const newProject: Project = {
      ...body,
      _id: randomUUID(),
      createdAt: now,
      updatedAt: now
    }
    const projects = await db.projects.get()
    projects.push(newProject)
    await db.projects.set(projects)
    return NextResponse.json(newProject, { status: 201 })
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
})
