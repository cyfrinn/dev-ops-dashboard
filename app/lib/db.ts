import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'
import type {
  Settings,
  Task,
  Habit,
  Project,
  LearningItem,
  Opportunity
} from '../types'

const DATA_DIR = path.join(process.cwd(), 'data')

async function readJSON<T>(file: string, defaultValue: T): Promise<T> {
  try {
    const fullPath = path.join(DATA_DIR, file)
    const content = await readFile(fullPath, 'utf-8')
    return JSON.parse(content) as T
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await mkdir(DATA_DIR, { recursive: true })
      return defaultValue
    }
    throw error
  }
}

async function writeJSON<T>(file: string, data: T) {
  const fullPath = path.join(DATA_DIR, file)
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8')
}

// Default settings values
const defaultSettings: Settings = {
  github: { username: '', token: '' },
  telegram: { botToken: '', chatId: '' },
  automation: { schedule: '0 18 * * *', enabled: true },
  mongodb: { uri: '' },
  sources: [
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', type: 'rss' },
    { name: 'Dev.to', url: 'https://dev.to/feed', type: 'rss' }
  ]
}

// DB object with typed methods
export const db = {
  // Settings
  settings: {
    get: async (): Promise<Settings> => readJSON<Settings>('settings.json', defaultSettings),
    set: async (settings: Settings) => writeJSON<Settings>('settings.json', settings)
  },

  // Tasks
  tasks: {
    get: async (): Promise<Task[]> => readJSON<Task[]>('tasks.json', []),
    set: async (tasks: Task[]) => writeJSON<Task[]>('tasks.json', tasks)
  },

  // Habits
  habits: {
    get: async (): Promise<Habit[]> => readJSON<Habit[]>('habits.json', []),
    set: async (habits: Habit[]) => writeJSON<Habit[]>('habits.json', habits)
  },

  // Projects
  projects: {
    get: async (): Promise<Project[]> => readJSON<Project[]>('projects.json', []),
    set: async (projects: Project[]) => writeJSON<Project[]>('projects.json', projects)
  },

  // Learning items
  learning: {
    get: async (): Promise<LearningItem[]> => readJSON<LearningItem[]>('learning.json', []),
    set: async (learning: LearningItem[]) => writeJSON<LearningItem[]>('learning.json', learning)
  },

  // Opportunities
  opportunities: {
    get: async (): Promise<Opportunity[]> => readJSON<Opportunity[]>('opportunities.json', []),
    set: async (opportunities: Opportunity[]) => writeJSON<Opportunity[]>('opportunities.json', opportunities)
  }
}
