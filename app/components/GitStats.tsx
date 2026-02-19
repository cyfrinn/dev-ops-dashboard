'use client'

import { useEffect, useState } from 'react'
import { getAuthHeaders } from '../lib/auth'

interface GitStat {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'stable'
}

interface GitHubStats {
  username: string
  totalRepos: number
  totalStars: number
  totalForks: number
  topLanguages: Array<{ language: string; repos: number }>
}

export default function GitStats() {
  const [stats, setStats] = useState<GitStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGitHubStats()
  }, [])

  const fetchGitHubStats = async () => {
    try {
      // First fetch settings to get GitHub username
      const settingsRes = await fetch('/api/settings', { headers: getAuthHeaders() })
      if (!settingsRes.ok) throw new Error('Failed to fetch settings')
      const settings = await settingsRes.json()
      const username = settings.github?.username
      if (!username) {
        throw new Error('GitHub username not set in Settings')
      }

      // Then fetch GitHub stats for that username
      const res = await fetch(`/api/stats/github`, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error('Failed to fetch GitHub stats')
      const data: GitHubStats = await res.json()

      // Transform to our UI format
      const formatted: GitStat[] = [
        { label: 'Repositories', value: data.totalRepos, trend: 'stable' },
        { label: 'Stars', value: data.totalStars, trend: 'stable' },
        { label: 'Forks', value: data.totalForks, trend: 'stable' },
        ...data.topLanguages.map((lang, idx) => ({
          label: `Top Lang ${idx + 1}`,
          value: `${lang.language} (${lang.repos})`,
          trend: 'stable' as const
        }))
      ]

      setStats(formatted)
    } catch (err: any) {
      setError(err.message)
      // Fallback to placeholder
      setStats([
        { label: 'Repos', value: '—', trend: 'stable' },
        { label: 'Stars', value: '—', trend: 'stable' },
        { label: 'Forks', value: '—', trend: 'stable' },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-white/10 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/2"></div>
          {[1,2,3,4].map(i => (
            <div key={i} className="h-10 bg-slate-700/30 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-white/10 p-6 backdrop-blur-sm hover:border-white/20 transition-colors h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Git Stats</h2>
        <span className="text-sm text-green-400">📊</span>
      </div>

      {error && (
        <p className="text-xs text-red-400 mb-4">Error loading stats: {error}</p>
      )}

      <div className="space-y-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <span className="text-slate-400 text-sm">{stat.label}</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{stat.value}</span>
              {stat.trend === 'up' && <span className="text-green-400 text-xs">↑</span>}
              {stat.trend === 'down' && <span className="text-red-400 text-xs">↓</span>}
              {stat.trend === 'stable' && <span className="text-slate-400 text-xs">−</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-700/30">
        <p className="text-xs text-slate-500 mb-3">Last synced just now</p>
        <button
          onClick={fetchGitHubStats}
          className="w-full py-2 px-3 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors"
        >
          Refresh Stats
        </button>
      </div>
    </div>
  )
}
