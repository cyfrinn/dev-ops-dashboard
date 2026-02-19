'use client'

import { useState, useEffect } from 'react'

interface LoginModalProps {
  onLogin: () => void
}

export default function LoginModal({ onLogin }: LoginModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('dashboard_token')
    if (token) {
      // Verify token is still valid (optional: we could ping /api/health)
      onLogin()
    }
  }, [onLogin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('dashboard_token', data.token)
        onLogin()
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-xl max-w-md w-full p-8 shadow-2xl">
        <h2 className="text-3xl font-bold mb-2 text-center">🔐 Dashboard Login</h2>
        <p className="text-slate-400 text-center mb-6">Enter your password to continue</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter password"
              autoFocus
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Verifying...' : 'Unlock Dashboard'}
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-4 text-center">
          Default password: <code className="bg-slate-800 px-1 rounded">admin123</code>
          <br />Change in Settings after login.
        </p>
      </div>
    </div>
  )
}
