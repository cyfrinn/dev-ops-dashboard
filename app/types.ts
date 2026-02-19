// Data models for the dashboard

export interface GitHubSettings {
  username: string
  token: string
}

export interface TelegramSettings {
  botToken: string
  chatId: string
}

export interface AutomationSettings {
  schedule: string
  enabled: boolean
}

export interface MongoSettings {
  uri: string
}

export interface Settings {
  github: GitHubSettings
  telegram: TelegramSettings
  automation: AutomationSettings
  mongodb: MongoSettings
  sources: Array<{
    name: string
    url: string
    type: 'rss' | 'api'
  }>
}

// Task (Today's Focus)
export interface Task {
  _id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  dueDate?: string
  createdAt?: string
  updatedAt?: string
}

// Habit
export interface Habit {
  _id: string
  name: string
  category: 'coding' | 'health' | 'learning' | 'productivity'
  currentStreak: number
  bestStreak: number
  lastCompleted?: string
  createdAt?: string
  updatedAt?: string
}

// Project
export interface Project {
  _id: string
  name: string
  description: string
  stage: 'idea' | 'mvp' | 'shipped'
  progress: number
  link?: string
  createdAt?: string
  updatedAt?: string
}

// Learning item
export interface LearningItem {
  _id: string
  title: string
  url: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  status: 'pending' | 'in-progress' | 'completed'
  notes?: string
  createdAt?: string
  updatedAt?: string
}

// Opportunity
export interface Opportunity {
  _id: string
  title: string
  source: string
  url?: string
  relevance: 'high' | 'medium' | 'low'
  notes?: string
  createdAt?: string
  updatedAt?: string
}
