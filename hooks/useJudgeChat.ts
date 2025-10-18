import { useState, useCallback } from 'react'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ConversationHistory {
  messages: Message[]
}

interface JudgeChatResponse {
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

interface UseJudgeChatReturn {
  sendMessage: (judge: string, message: string) => Promise<string>
  conversationHistory: ConversationHistory
  isLoading: boolean
  error: string | null
  clearHistory: () => void
}

export function useJudgeChat(): UseJudgeChatReturn {
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory>({
    messages: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (judge: string, message: string): Promise<string> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/judges/generate-personality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: judge,
          specialties: ['Technology', 'Business'],
          investmentStyle: 'analytical',
          causes: ['Innovation', 'Entrepreneurship']
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get judge response')
      }

      const data: JudgeChatResponse = await response.json()
      const judgeReply = data.personality

      // Update conversation history
      setConversationHistory(prev => ({
        messages: [
          ...prev.messages,
          { role: 'user', content: message },
          { role: 'assistant', content: judgeReply }
        ]
      }))

      return judgeReply
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [conversationHistory])

  const clearHistory = useCallback(() => {
    setConversationHistory({ messages: [] })
    setError(null)
  }, [])

  return {
    sendMessage,
    conversationHistory,
    isLoading,
    error,
    clearHistory,
  }
}
