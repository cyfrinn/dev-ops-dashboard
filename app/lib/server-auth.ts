import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const DATA_DIR = path.join(process.cwd(), 'data')
const TOKENS_FILE = path.join(DATA_DIR, 'tokens.json')
const AUTH_FILE = path.join(DATA_DIR, 'auth.json')

async function ensureFile(file: string, defaultValue: any) {
  try {
    await mkdir(DATA_DIR, { recursive: true })
    await readFile(file, 'utf-8')
  } catch {
    await writeFile(file, JSON.stringify(defaultValue, null, 2), 'utf-8')
  }
}

async function loadTokens(): Promise<string[]> {
  try {
    await ensureFile(TOKENS_FILE, [])
    const content = await readFile(TOKENS_FILE, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Failed to load tokens:', error)
    return []
  }
}

async function saveTokens(tokens: string[]) {
  await writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf-8')
}

// Token management
export async function verifyToken(token: string): Promise<boolean> {
  const tokens = await loadTokens()
  return tokens.includes(token)
}

export async function registerToken(token: string) {
  const tokens = await loadTokens()
  if (!tokens.includes(token)) {
    tokens.push(token)
    await saveTokens(tokens)
  }
}

export async function revokeToken(token: string) {
  const tokens = await loadTokens()
  const filtered = tokens.filter(t => t !== token)
  await saveTokens(filtered)
}

// Password management
export async function getStoredPassword(): Promise<string> {
  try {
    await ensureFile(AUTH_FILE, { passwordHash: '' })
    const content = await readFile(AUTH_FILE, 'utf-8')
    const data = JSON.parse(content)
    return data.passwordHash || data.password || ''
  } catch (error) {
    console.error('Failed to read auth:', error)
    return ''
  }
}

export async function setPassword(password: string) {
  await writeFile(AUTH_FILE, JSON.stringify({ passwordHash: password }, null, 2), 'utf-8')
}

// Initialize default if not set
export async function initAuth() {
  const stored = await getStoredPassword()
  if (!stored) {
    const defaultPassword = process.env.DASHBOARD_PASSWORD || 'admin123'
    await setPassword(defaultPassword)
  }
}
