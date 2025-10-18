import { useState } from 'react'

export interface CreateJudgeRequest {
  name: string
  specialties: string[]
  investmentStyle: string
  causes?: string[]
}

export interface GeneratedJudgeProfile {
  personality: string
  personalityTraits: string[]
  catchphrases: string[]
  scoringCriteria: {
    innovation: number
    marketPotential: number
    team: number
    financials: number
    presentation: number
  }
  microExpressions: Array<{
    id: string
    name: string
    trigger: string
    duration: number
    intensity: number
  }>
}

export function useJudgeCreation() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateJudgePersonality = async (request: CreateJudgeRequest): Promise<GeneratedJudgeProfile | null> => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/judges/generate-personality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate judge personality')
      }

      const profile = await response.json()
      return profile
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate judge personality'
      setError(errorMessage)
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    generateJudgePersonality,
    isGenerating,
    error,
    clearError: () => setError(null)
  }
}
