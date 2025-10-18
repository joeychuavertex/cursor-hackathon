import { Score } from './judge'

export interface Session {
  id: string
  userId: string
  judges: string[]
  presentationText: string
  duration: number
  scores: Score[]
  timestamp: number
  status: 'active' | 'completed' | 'paused'
}

export interface Presentation {
  id: string
  sessionId: string
  text: string
  audioUrl?: string
  duration: number
  timestamp: number
}

export interface Question {
  id: string
  sessionId: string
  judgeId: string
  text: string
  audioUrl?: string
  timestamp: number
  answered: boolean
}

export interface Answer {
  id: string
  questionId: string
  text: string
  audioUrl?: string
  timestamp: number
}
