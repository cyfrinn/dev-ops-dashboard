import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../lib/withAuth'
import { db } from '../../../lib/db'

interface GitHubRepo {
  id: string
  name: string
  stargazers_count: number
  forks_count: number
  language: string | null
}

interface GitHubUser {
  login: string
  public_repos: number
}

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const settings = await db.settings.get()
    const username = settings.github.username
    if (!username) {
      return NextResponse.json({ error: 'GitHub username not configured in settings' }, { status: 400 })
    }
    const githubToken = settings.github.token || undefined

    // Fetch user info
    const userRes = await fetch(`https://api.github.com/users/${username}`, {
      headers: githubToken ? { Authorization: `Bearer ${githubToken}` } : {}
    })
    if (!userRes.ok) {
      throw new Error(`GitHub API error: ${userRes.statusText}`)
    }
    const user: GitHubUser = await userRes.json()

    // Fetch repos (first page up to 100)
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
      headers: githubToken ? { Authorization: `Bearer ${githubToken}` } : {}
    })
    if (!reposRes.ok) {
      throw new Error(`GitHub API error: ${reposRes.statusText}`)
    }
    const repos: GitHubRepo[] = await reposRes.json()

    // Calculate totals
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0)

    // Aggregate top languages
    const languageCounts: Record<string, number> = {}
    repos.forEach(repo => {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1
      }
    })
    const topLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([language, repos]) => ({ language, repos }))

    return NextResponse.json({
      username,
      totalRepos: user.public_repos,
      totalStars,
      totalForks,
      topLanguages
    })
  } catch (error: any) {
    console.error('Failed to fetch GitHub stats:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch GitHub stats' }, { status: 500 })
  }
})
