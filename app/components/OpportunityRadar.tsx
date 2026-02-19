'use client'

import { useEffect, useState } from 'react'
import Modal from './Modal'
import { getAuthHeaders } from '../lib/auth'
import { convertToCSV, downloadCSV } from '../lib/csv-utils'

interface Opportunity {
  _id: string
  title: string
  source: string
  category: 'saas' | 'trend' | 'job' | 'tool'
  relevance: number
  date: string
  url?: string
}

interface OpportunityFormData {
  title: string
  source: string
  category: 'saas' | 'trend' | 'job' | 'tool'
  relevance: number
  date: string
  url: string
}

export default function OpportunityRadar() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null)
  const [formData, setFormData] = useState<OpportunityFormData>({
    title: '',
    source: '',
    category: 'trend',
    relevance: 50,
    date: new Date().toISOString().split('T')[0],
    url: ''
  })

  useEffect(() => {
    fetchOpportunities()
  }, [])

  const fetchOpportunities = async () => {
    try {
      const res = await fetch('/api/opportunities', { headers: getAuthHeaders() })
      const data = await res.json()
      setOpportunities(data.sort((a: Opportunity, b: Opportunity) => b.relevance - a.relevance))
    } catch (error) {
      console.error('Failed to fetch opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingOpp(null)
    setFormData({
      title: '',
      source: '',
      category: 'trend',
      relevance: 50,
      date: new Date().toISOString().split('T')[0],
      url: ''
    })
    setIsModalOpen(true)
  }

  const openEditModal = (opp: Opportunity) => {
    setEditingOpp(opp)
    setFormData({
      title: opp.title,
      source: opp.source,
      category: opp.category,
      relevance: opp.relevance,
      date: opp.date,
      url: opp.url || ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const body = { ...formData, relevance: Number(formData.relevance) }
      if (editingOpp) {
        await fetch(`/api/opportunities/${editingOpp._id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(body)
        })
      } else {
        await fetch('/api/opportunities', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(body)
        })
      }
      setIsModalOpen(false)
      fetchOpportunities()
    } catch (error) {
      console.error('Failed to save opportunity:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this opportunity?')) return
    try {
      await fetch(`/api/opportunities/${id}`, { method: 'DELETE', headers: getAuthHeaders() })
      fetchOpportunities()
    } catch (error) {
      console.error('Failed to delete opportunity:', error)
    }
  }

  const exportToCSV = async () => {
    try {
      const res = await fetch('/api/opportunities', { headers: getAuthHeaders() })
      if (!res.ok) throw new Error('Failed to fetch opportunities')
      const opportunitiesData = await res.json()
      const headers = [
        { key: 'title', label: 'Title' },
        { key: 'source', label: 'Source' },
        { key: 'url', label: 'URL' },
        { key: 'relevance', label: 'Relevance' },
        { key: 'notes', label: 'Notes' }
      ]
      const csv = convertToCSV(opportunitiesData, headers)
      downloadCSV(`opportunities-${new Date().toISOString().split('T')[0]}.csv`, csv)
    } catch (error) {
      console.error('Failed to export opportunities:', error)
      alert('Failed to export opportunities')
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'saas':
        return 'bg-pink-500/20 text-pink-300'
      case 'trend':
        return 'bg-yellow-500/20 text-yellow-300'
      case 'job':
        return 'bg-green-500/20 text-green-300'
      case 'tool':
        return 'bg-cyan-500/20 text-cyan-300'
      default:
        return 'bg-slate-500/20 text-slate-300'
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
        <h2 className="text-2xl font-bold">Opportunity Radar 🎯</h2>
        <button
          onClick={exportToCSV}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-medium transition-colors"
          title="Export opportunities to CSV"
        >
          Export
        </button>
      </div>

      {opportunities.length === 0 ? (
        <p className="text-slate-400 text-center py-8">No opportunities yet. Automation will populate this soon!</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {opportunities.map((opp) => (
            <div
              key={opp._id}
              className="p-4 rounded-lg border border-white/10 bg-slate-800/30 group"
              onClick={() => opp.url && window.open(opp.url, '_blank')}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-sm flex-1">{opp.title}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${getCategoryColor(opp.category)}`}>
                  {opp.relevance}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(opp.category)}`}>
                  {opp.category.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400">{opp.source} • {opp.date}</span>
              </div>
              <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); openEditModal(opp); }}
                  className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(opp._id); }}
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
        + Add Opportunity
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOpp ? 'Edit Opportunity' : 'Add Opportunity'}
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
              <label className="block text-sm text-slate-400 mb-1">Source *</label>
              <input
                type="text"
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
                placeholder="Hacker News, TechCrunch..."
                className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="trend">Trend</option>
                <option value="saas">SaaS</option>
                <option value="job">Job</option>
                <option value="tool">Tool</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Relevance (0-100) *</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.relevance}
                onChange={e => setFormData({ ...formData, relevance: parseInt(e.target.value) || 0 })}
                className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">URL (optional)</label>
            <input
              type="text"
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
              className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              {editingOpp ? 'Save Changes' : 'Add Opportunity'}
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
