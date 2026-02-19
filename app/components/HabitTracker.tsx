'use client'

import { useEffect, useState } from 'react'
import Modal from './Modal'
import { getAuthHeaders } from '../lib/auth'
import { convertToCSV, downloadCSV } from '../lib/csv-utils'

interface Habit {
  _id: string
  name: string
  category: 'coding' | 'health' | 'learning' | 'productivity'
  currentStreak: number
  bestStreak: number
  lastCompleted: string | null
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    category: 'coding' | 'health' | 'learning' | 'productivity'
  }>({
    name: '',
    category: 'coding'
  })

  useEffect(() => {
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    try {
      const res = await fetch('/api/habits', { headers: getAuthHeaders() })
      const data = await res.json()
      setHabits(data)
    } catch (error) {
      console.error('Failed to fetch habits:', error)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingHabit(null)
    setFormData({ name: '', category: 'coding' })
    setIsModalOpen(true)
  }

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit)
    setFormData({ name: habit.name, category: habit.category })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingHabit) {
        await fetch(`/api/habits/${editingHabit._id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData)
        })
      } else {
        await fetch('/api/habits', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ ...formData, currentStreak: 0, bestStreak: 0 })
        })
      }
      setIsModalOpen(false)
      fetchHabits()
    } catch (error) {
      console.error('Failed to save habit:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this habit?')) return
    try {
      await fetch(`/api/habits/${id}`, { method: 'DELETE' })
      fetchHabits()
    } catch (error) {
      console.error('Failed to delete habit:', error)
    }
  }

  const completeHabit = async (id: string) => {
    try {
      await fetch(`/api/habits/${id}/complete`, { method: 'POST' })
      fetchHabits()
    } catch (error) {
      console.error('Failed to complete habit:', error)
    }
  }

  const exportToCSV = async () => {
    try {
      const res = await fetch('/api/habits', { headers: getAuthHeaders() })
      if (!res.ok) throw new Error('Failed to fetch habits')
      const habitsData = await res.json()
      const headers = [
        { key: 'name', label: 'Name' },
        { key: 'category', label: 'Category' },
        { key: 'currentStreak', label: 'Current Streak' },
        { key: 'bestStreak', label: 'Best Streak' },
        { key: 'lastCompleted', label: 'Last Completed' }
      ]
      const csv = convertToCSV(habitsData, headers)
      downloadCSV(`habits-${new Date().toISOString().split('T')[0]}.csv`, csv)
    } catch (error) {
      console.error('Failed to export habits:', error)
      alert('Failed to export habits')
    }
  }

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'coding': return '💻'
      case 'health': return '🏃'
      case 'learning': return '📚'
      case 'productivity': return '🚀'
      default: return '⭐'
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-white/10 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          {[1,2,3,4].map(i => (
            <div key={i} className="h-16 bg-slate-700/30 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-white/10 p-6 backdrop-blur-sm hover:border-white/20 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Habit Tracker</h2>
        <button
          onClick={exportToCSV}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-medium transition-colors"
          title="Export habits to CSV"
        >
          Export
        </button>
      </div>

      {habits.length === 0 ? (
        <p className="text-slate-400 text-center py-8">No habits yet. Start building streaks!</p>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <div key={habit._id} className="p-4 rounded-lg border border-white/10 bg-slate-800/30 group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCategoryEmoji(habit.category)}</span>
                  <div>
                    <h3 className="font-semibold text-sm">{habit.name}</h3>
                    <p className="text-xs text-slate-400">
                      {habit.lastCompleted ? 'Completed today' : 'Not today'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-cyan-400">{habit.currentStreak}</span>
                  <button
                    onClick={() => completeHabit(habit._id)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      habit.lastCompleted && new Date(habit.lastCompleted).toDateString() === new Date().toDateString()
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {habit.lastCompleted && new Date(habit.lastCompleted).toDateString() === new Date().toDateString()
                      ? '✓ Done'
                      : 'Mark Done'}
                  </button>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(habit)}
                      className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(habit._id)}
                      className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full bg-slate-700/30 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(habit.currentStreak / Math.max(habit.bestStreak, 1)) * 100}%` }}
                ></div>
              </div>

              <p className="text-xs text-slate-400 mt-2">Best: {habit.bestStreak} days</p>
            </div>
          ))}
        </div>
      )}

      <button className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors text-sm" onClick={openAddModal}>
        + Add New Habit
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHabit ? 'Edit Habit' : 'Add New Habit'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Habit Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="coding">💻 Coding</option>
              <option value="health">🏃 Health</option>
              <option value="learning">📚 Learning</option>
              <option value="productivity">🚀 Productivity</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              {editingHabit ? 'Save Changes' : 'Add Habit'}
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
