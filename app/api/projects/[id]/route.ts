import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../lib/withAuth'
import { db } from '../../../lib/db'
import type { Project } from '../../../types'

export const GET = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const projects = await db.projects.get()
    const project = projects.find(p => p._id === params.id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    return NextResponse.json(project)
  } catch (error) {
    console.error('Failed to fetch project:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const body = (await request.json()) as Partial<Project>
    const projects = await db.projects.get()
    const index = projects.findIndex(p => p._id === params.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    projects[index] = { ...projects[index], ...body, updatedAt: new Date().toISOString() }
    await db.projects.set(projects)
    return NextResponse.json(projects[index])
  } catch (error) {
    console.error('Failed to update project:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    let projects = await db.projects.get()
    const initialLength = projects.length
    projects = projects.filter(p => p._id !== params.id)
    if (projects.length === initialLength) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    await db.projects.set(projects)
    return NextResponse.json({ message: 'Project deleted' })
  } catch (error) {
    console.error('Failed to delete project:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
})
