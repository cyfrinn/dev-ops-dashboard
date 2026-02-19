'use client'

import { useEffect, useState } from 'react'
import Modal from './Modal'
import { getAuthHeaders } from '../lib/auth'
import { convertToCSV, downloadCSV } from '../lib/csv-utils'

interface LearningItem {
  _id: string
  title: string
  source?: string
  topic: string
  status: 'pending' | 'in-progress' | 'completed'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  completedAt?: string
  createdAt: string
}

interface LearningFormData {
  title: string
  source: string
  topic: string
  status: 'pending' | 'in-progress' | 'completed'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export default function LearningQueue() {
  const [items, setItems] = useState<LearningItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LearningItem | null>(null)
  const [formData, setFormData] = useState<LearningFormData>({
    title: '',
    source: '',
    topic: '',
    status: 'pending',
    difficulty: 'intermediate'
  })

  useEffect(() => {
    fetchLearning()
  }, [])

  const fetchLearning = async () => {
    try {
      const res = await fetch('/api/learning', { headers: getAuthHeaders() })
      const data = await res.json()
      setItems(data.sort((a: LearningItem, b: LearningItem) => {
        const statusOrder = { 'pending': 0, 'in-progress': 1, 'completed': 2 }
        return statusOrder[a.status] - statusOrder[b.status]
      }))
    } catch (error) {
      console.error('Failed to fetch learning items:', error)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingItem(null)
    setFormData({ title: '', source: '', topic: '', status: 'pending', difficulty: 'intermediate' })
    setIsModalOpen(true)
  }

  const openEditModal = (item: LearningItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      source: item.source || '',
      topic: item.topic,
      status: item.status,
      difficulty: item.difficulty
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await fetch(`/api/learning/${editingItem._id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData)
        })
      } else {
        await fetch('/api/learning', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData)
        })
      }
      setIsModalOpen(false)
      fetchLearning()
    } catch (error) {
      console.error('Failed to save learning item:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this learning item?')) return
    try {
      await fetch(`/api/learning/${id}`, { method: 'DELETE', headers: getAuthHeaders() })
      fetchLearning()
    } catch (error) {
      console.error('Failed to delete learning item:', error)
    }
  }

  const completeItem = async (id: string) => {
    try {
      await fetch(`/api/learning/${id}/complete`, { method: 'POST', headers: getAuthHeaders() })
      fetchLearning()
    } catch (error) {
      console.error('Failed to complete item:', error)
    }
  }

  const exportToCSV = async () => {
    try {
      const res = await fetch('/api/learning', { headers: getAuthHeaders() })
      if (!res.ok) throw new Error('Failed to fetch learning items')
      const learningData = await res.json()
      const headers = [
        { key: 'title', label: 'Title' },
        { key: 'url', label: 'URL' },
        { key: 'difficulty', label: 'Difficulty' },
        { key: 'status', label: 'Status' },
        { key: 'notes', label: 'Notes' }
      ]
      const csv = convertToCSV(learningData, headers)
      downloadCSV(`learning-${new Date().toISOString().split('T')[0]}.csv`, csv)
    } catch (error) {
      console.error('Failed to export learning items:', error)
      alert('Failed to export learning items')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 border-green-500/30 text-green-300'
      case 'in-progress':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300'
      default:
        return 'bg-slate-500/10 border-slate-500/30 text-slate-300'
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-white/10 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 bg-slate-700/30 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-white/10 p-6 backdrop-blur-sm hover:border-white/20 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Learning Queue</h2>
        <button
          onClick={exportToCSV}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-medium transition-colors"
          title="Export learning items to CSV"
        >
          Export
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-slate-400 text-center py-8">No learning items yet. Add something to study!</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item._id}
              className="p-4 rounded-lg border border-white/10 bg-slate-800/30 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  {item.source && (
                    <p className="text-xs text-slate-400 mt-1">{item.source}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded border whitespace-nowrap ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  {item.status !== 'completed' && (
                    <button
                      onClick={() => completeItem(item._id)}
                      className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-white"
                    >
                      Complete
                    </button>
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs bg-slate-700/50 px-2 py-1 rounded">{item.topic}</span>
                <span className="text-xs text-slate-400">{item.difficulty}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors text-sm" onClick={openAddModal}>
        + Add Learning Item
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Learning Item' : 'Add Learning Item'}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Topic *</label>
              <input
                type="text"
                value={formData.topic}
                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Source</label>
              <input
                type="text"
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g., Dev.to, YouTube"
                className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              {editingItem ? 'Save Changes' : 'Add Item'}
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
