'use client'

import { useEffect, useState } from 'react'
import Modal from './Modal'
import { getAuthHeaders } from '../lib/auth'
import { convertToCSV, downloadCSV } from '../lib/csv-utils'

interface Focus {
  _id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  dueDate?: string
}

export default function TodaysFocus() {
  const [focus, setFocus] = useState<Focus[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Focus | null>(null)
  const [formData, setFormData] = useState<{
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    dueDate: string
  }>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks', { headers: getAuthHeaders() })
      const tasks = await res.json()
      const sorted = tasks.sort((a: Focus, b: Focus) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
      setFocus(sorted.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingTask(null)
    setFormData({ title: '', description: '', priority: 'medium', dueDate: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (task: Focus) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate || ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingTask) {
        await fetch(`/api/tasks/${editingTask._id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData)
        })
      } else {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData)
        })
      }
      setIsModalOpen(false)
      fetchTasks()
    } catch (error) {
      console.error('Failed to save task:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE', headers: getAuthHeaders() })
      fetchTasks()
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const toggleComplete = async (id: string) => {
    try {
      const task = focus.find(t => t._id === id)
      if (!task) return
      await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ completed: !task.completed })
      })
      fetchTasks()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const exportToCSV = async () => {
    try {
      const res = await fetch('/api/tasks', { headers: getAuthHeaders() })
      if (!res.ok) throw new Error('Failed to fetch tasks')
      const allTasks = await res.json()
      const headers = [
        { key: 'title', label: 'Title' },
        { key: 'description', label: 'Description' },
        { key: 'priority', label: 'Priority' },
        { key: 'completed', label: 'Completed' },
        { key: 'dueDate', label: 'Due Date' }
      ]
      const csv = convertToCSV(allTasks, headers)
      downloadCSV(`tasks-${new Date().toISOString().split('T')[0]}.csv`, csv)
    } catch (error) {
      console.error('Failed to export tasks:', error)
      alert('Failed to export tasks')
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-white/10 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          {[1,2,3].map(i => (
            <div key={i} className="h-20 bg-slate-700/30 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-white/10 p-6 backdrop-blur-sm hover:border-white/20 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Today&apos;s Focus</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">{focus.filter(f => f.completed).length}/{focus.length}</span>
          <button
            onClick={exportToCSV}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-medium transition-colors"
            title="Export all tasks to CSV"
          >
            Export
          </button>
        </div>
      </div>

      {focus.length === 0 ? (
        <p className="text-slate-400 text-center py-8">No tasks yet. Add your first task!</p>
      ) : (
        <div className="space-y-3">
          {focus.map((item) => (
            <div
              key={item._id}
              className={`p-4 rounded-lg border transition-all group ${
                item.completed
                  ? 'bg-slate-800/30 border-slate-700/30 opacity-50'
                  : 'bg-slate-800/50 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleComplete(item._id)}
                  className="mt-1 w-5 h-5 rounded cursor-pointer accent-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className={`font-semibold ${item.completed ? 'line-through text-slate-500' : ''}`}>
                      {item.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded border ${
                      item.priority === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                      item.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' :
                      'bg-green-500/10 border-green-500/30 text-green-300'
                    }`}>
                      {item.priority.toUpperCase()}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-slate-400 text-sm mt-1">{item.description}</p>
                  )}
                  {item.dueDate && (
                    <p className="text-xs text-slate-500 mt-1">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(item)}
                    className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
        onClick={openAddModal}
      >
        + Add New Focus
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none h-24"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              {editingTask ? 'Save Changes' : 'Add Task'}
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
