export interface Judge {
  id: string
  name: string
  personality: string
  expertise: string[]
  avatarUrl: string
  voiceId: string
  microExpressions: MicroExpression[]
  scoringCriteria: ScoringCriteria
  isHeyGenAvatar?: boolean
  heygenAvatarId?: string
}

export interface MicroExpression {
  id: string
  name: string
  trigger: string
  duration: number
  intensity: number
}

export interface ScoringCriteria {
  innovation: number
  marketPotential: number
  team: number
  financials: number
  presentation: number
}

export interface JudgeReaction {
  judgeId: string
  expression: string
  intensity: number
  timestamp: number
}

export interface Score {
  judgeId: string
  scores: ScoringCriteria
  totalScore: number
  feedback: string
  timestamp: number
}
