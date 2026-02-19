'use client'

import { useEffect, useState } from 'react'
import { getAuthHeaders } from '../lib/auth'

interface Settings {
  github: {
    username: string
    token: string
  }
  telegram: {
    botToken: string
    chatId: string
  }
  automation: {
    schedule: string
    enabled: boolean
  }
  mongodb: {
    uri: string
  }
  sources: Array<{
    name: string
    url: string
    type: 'rss' | 'api'
  }>
}

export default function SettingsPage({ onClose, onLogout }: { onClose: () => void; onLogout: () => void }) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [newSourceName, setNewSourceName] = useState('')
  const [newSourceUrl, setNewSourceUrl] = useState('')
  const [scraping, setScraping] = useState(false)
  const [scrapeResult, setScrapeResult] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', { headers: getAuthHeaders() })
      const data = await res.json()
      setSettings(data)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings)
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
      } else {
        throw new Error(data.error || 'Failed to save')
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  const testTelegram = async () => {
    setMessage(null)
    try {
      const res = await fetch('/api/settings/test-telegram', { method: 'POST', headers: getAuthHeaders() })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: 'Test message sent to Telegram! Check your phone.' })
      } else {
        throw new Error(data.error || 'Failed to send test')
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const handleChange = (field: string, value: any) => {
    if (!settings) return
    const keys = field.split('.')
    const newSettings = { ...settings }
    let current: any = newSettings
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] }
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value
    setSettings(newSettings)
  }

  const addSource = () => {
    if (!settings || !newSourceName.trim() || !newSourceUrl.trim()) return
    const source = { name: newSourceName.trim(), url: newSourceUrl.trim(), type: 'rss' as const }
    setSettings({ ...settings, sources: [...settings.sources, source] })
    setNewSourceName('')
    setNewSourceUrl('')
  }

  const removeSource = (idx: number) => {
    if (!settings) return
    const newSources = settings.sources.filter((_, i) => i !== idx)
    setSettings({ ...settings, sources: newSources })
  }

  const runScrape = async () => {
    setScraping(true)
    setScrapeResult(null)
    try {
      const res = await fetch('/api/scrape', { headers: getAuthHeaders(), method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setScrapeResult(`Success: ${data.added} new opportunities added`)
      } else {
        setScrapeResult(`Error: ${data.error || 'Unknown'}`)
      }
    } catch (err: any) {
      setScrapeResult(`Network error: ${err.message}`)
    } finally {
      setScraping(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-white/10 rounded-xl max-w-2xl w-full p-8">
          <p className="text-slate-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-slate-900">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl transition-colors">&times;</button>
        </div>

        <div className="p-6 space-y-8">
          {message && (
            <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-300' : 'bg-red-500/10 border border-red-500/30 text-red-300'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={saveSettings} className="space-y-8">
            {/* GitHub */}
            <section>
              <h3 className="text-xl font-semibold mb-4">GitHub</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Username</label>
                  <input
                    type="text"
                    value={settings?.github.username || ''}
                    onChange={e => handleChange('github.username', e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Personal Access Token</label>
                  <input
                    type="password"
                    value={settings?.github.token === '••••••••••••••••' ? '' : settings?.github.token || ''}
                    onChange={e => handleChange('github.token', e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Automation */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Automation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Schedule (Cron)</label>
                  <input
                    type="text"
                    value={settings?.automation.schedule || ''}
                    onChange={e => handleChange('automation.schedule', e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
                    placeholder="0 18 * * *"
                  />
                  <p className="text-xs text-slate-500 mt-1">Cron expression (UTC). 2am PH = 0 18 * * *</p>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings?.automation.enabled}
                      onChange={e => handleChange('automation.enabled', e.target.checked)}
                      className="w-5 h-5 rounded accent-blue-600"
                    />
                    <span>Enabled</span>
                  </label>
                </div>
              </div>
            </section>

            {/* Telegram */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Telegram</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Bot Token</label>
                  <input
                    type="text"
                    value={settings?.telegram.botToken === '••••••••••••••••' ? '' : settings?.telegram.botToken || ''}
                    onChange={e => handleChange('telegram.botToken', e.target.value)}
                    placeholder="Bot token from @BotFather"
                    className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Chat ID</label>
                  <input
                    type="text"
                    value={settings?.telegram.chatId || ''}
                    onChange={e => handleChange('telegram.chatId', e.target.value)}
                    placeholder="Your Telegram chat ID"
                    className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </section>

            {/* News Sources */}
            <section>
              <h3 className="text-xl font-semibold mb-4">News Sources</h3>
              <p className="text-sm text-slate-400 mb-4">
                Configure RSS feeds to automatically scrape opportunities. Add the feed URLs you want to monitor.
              </p>

              {settings?.sources && settings.sources.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {settings.sources.map((source, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-white/10 bg-slate-800/30 flex items-center gap-3">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{source.name}</div>
                        <div className="text-xs text-slate-400 truncate">{source.url}</div>
                      </div>
                      <div className="text-xs text-slate-500 capitalize">{source.type}</div>
                      <button
                        type="button"
                        onClick={() => removeSource(idx)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 mb-4">No sources configured.</p>
              )}

              <div className="p-4 rounded-lg border border-white/10 bg-slate-800/30">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-400 mb-1">Source Name</label>
                    <input
                      type="text"
                      value={newSourceName}
                      onChange={e => setNewSourceName(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., TechCrunch"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-400 mb-1">RSS Feed URL</label>
                    <input
                      type="url"
                      value={newSourceUrl}
                      onChange={e => setNewSourceUrl(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="https://example.com/feed"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={addSource}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-sm"
                  >
                    Add Source
                  </button>
                  <button
                    type="button"
                    onClick={runScrape}
                    disabled={scraping || (settings?.sources.length === 0)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg font-medium transition-colors text-sm"
                  >
                    {scraping ? 'Scraping...' : 'Scrape Now'}
                  </button>
                </div>
                {scrapeResult && (
                  <p className={`mt-3 text-sm ${scrapeResult.startsWith('Success') ? 'text-green-400' : 'text-red-400'}`}>
                    {scrapeResult}
                  </p>
                )}
              </div>
            </section>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={testTelegram}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
              >
                Test Telegram
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition-colors"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
