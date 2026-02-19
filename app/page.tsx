'use client'

import { useEffect, useState } from 'react'
import DashboardHeader from './components/DashboardHeader'
import TodaysFocus from './components/TodaysFocus'
import GitStats from './components/GitStats'
import LearningQueue from './components/LearningQueue'
import ProjectPipeline from './components/ProjectPipeline'
import OpportunityRadar from './components/OpportunityRadar'
import HabitTracker from './components/HabitTracker'
import SettingsPage from './components/SettingsPage'
import LoginModal from './components/LoginModal'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('dashboard_token')
    if (token) {
      setIsAuthenticated(true)
    } else {
      // If no token, show login (handled by conditional render)
      setLoading(false)
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('dashboard_token')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginModal onLogin={handleLogin} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (showSettings) {
    return <SettingsPage onClose={() => setShowSettings(false)} onLogout={handleLogout} />
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Grid background effect */}
      <div className="fixed inset-0 -z-10 opacity-5">
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <DashboardHeader onSettingsClick={() => setShowSettings(true)} onLogout={handleLogout} />

        {/* Top row: Focus + Git Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TodaysFocus />
          </div>
          <div>
            <GitStats />
          </div>
        </div>

        {/* Middle row: Learning + Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LearningQueue />
          <ProjectPipeline />
        </div>

        {/* Bottom row: Opportunities + Habits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OpportunityRadar />
          <HabitTracker />
        </div>
      </div>
    </main>
  )
}
