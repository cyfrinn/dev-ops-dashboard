'use client'

import { useEffect, useState } from 'react'
import Modal from './Modal'
import { getAuthHeaders } from '../lib/auth'
import { convertToCSV, downloadCSV } from '../lib/csv-utils'

interface Project {
  _id: string
  name: string
  description?: string
  stage: 'idea' | 'mvp' | 'shipped'
  progress: number
  repo?: string
  deadline?: string
  createdAt: string
}

interface ProjectFormData {
  name: string
  description: string
  stage: 'idea' | 'mvp' | 'shipped'
  progress: number
  repo: string
  deadline: string
}

export default function ProjectPipeline() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    stage: 'idea',
    progress: 0,
    repo: '',
    deadline: ''
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', { headers: getAuthHeaders() })
      const data = await res.json()
      setProjects(data.sort((a: Project, b: Project) => {
        const stageOrder = { shipped: 0, mvp: 1, idea: 2 }
        return stageOrder[a.stage] - stageOrder[b.stage]
      }))
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingProject(null)
    setFormData({ name: '', description: '', stage: 'idea', progress: 0, repo: '', deadline: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || '',
      stage: project.stage,
      progress: project.progress,
      repo: project.repo || '',
      deadline: project.deadline || ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const body = { ...formData, progress: Number(formData.progress) }
      if (editingProject) {
        await fetch(`/api/projects/${editingProject._id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(body)
        })
      } else {
        await fetch('/api/projects', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(body)
        })
      }
      setIsModalOpen(false)
      fetchProjects()
    } catch (error) {
      console.error('Failed to save project:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE', headers: getAuthHeaders() })
      fetchProjects()
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  const exportToCSV = async () => {
    try {
      const res = await fetch('/api/projects', { headers: getAuthHeaders() })
      if (!res.ok) throw new Error('Failed to fetch projects')
      const projectsData = await res.json()
      const headers = [
        { key: 'name', label: 'Name' },
        { key: 'description', label: 'Description' },
        { key: 'stage', label: 'Stage' },
        { key: 'progress', label: 'Progress' },
        { key: 'link', label: 'Link' }
      ]
      const csv = convertToCSV(projectsData, headers)
      downloadCSV(`projects-${new Date().toISOString().split('T')[0]}.csv`, csv)
    } catch (error) {
      console.error('Failed to export projects:', error)
      alert('Failed to export projects')
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'shipped':
        return 'bg-green-500/20 text-green-300'
      case 'mvp':
        return 'bg-blue-500/20 text-blue-300'
      case 'idea':
        return 'bg-purple-500/20 text-purple-300'
      default:
        return 'bg-slate-500/20 text-slate-300'
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-white/10 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-slate-700/30 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-white/10 p-6 backdrop-blur-sm hover:border-white/20 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Project Pipeline</h2>
        <button
          onClick={exportToCSV}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-medium transition-colors"
          title="Export projects to CSV"
        >
          Export
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="text-slate-400 text-center py-8">No projects yet. Start building something!</p>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project._id} className="p-4 rounded-lg border border-white/10 bg-slate-800/30 group">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{project.name}</h3>
                <span className={`text-xs px-2 py-1 rounded font-medium ${getStageColor(project.stage)}`}>
                  {project.stage.toUpperCase()}
                </span>
              </div>

              {project.description && (
                <p className="text-xs text-slate-400 mb-3">{project.description}</p>
              )}

              <div className="w-full bg-slate-700/30 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-slate-400">{project.progress}% Complete</p>
                {project.repo && (
                  <a
                    href={`https://${project.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    View Repo →
                  </a>
                )}
              </div>

              <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(project)}
                  className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project._id)}
                  className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors text-sm" onClick={openAddModal}>
        + New Project
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Add New Project'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Project Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none h-20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Stage</label>
              <select
                value={formData.stage}
                onChange={e => setFormData({ ...formData, stage: e.target.value as any })}
                className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="idea">Idea</option>
                <option value="mvp">MVP</option>
                <option value="shipped">Shipped</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Progress %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={e => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Repo URL (optional)</label>
            <input
              type="text"
              value={formData.repo}
              onChange={e => setFormData({ ...formData, repo: e.target.value })}
              placeholder="github.com/username/repo"
              className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              {editingProject ? 'Save Changes' : 'Add Project'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
