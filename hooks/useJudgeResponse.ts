import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'

interface GenerateResponseParams {
  conversationId: string
  message: string
}

interface UseJudgeResponseReturn {
  generateResponse: (params: GenerateResponseParams) => Promise<string>
  isGenerating: boolean
  error: string | null
}

export function useJudgeResponse(): UseJudgeResponseReturn {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateResponse = async ({ conversationId, message }: GenerateResponseParams): Promise<string> => {
    console.log('🎯 generateResponse called with:', {
      conversationId,
      messageLength: message.length,
      backendUrl
    })

    try {
      setIsGenerating(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔑 Session status:', { hasSession: !!session, hasToken: !!session?.access_token })

      if (!session?.access_token) {
        const errorMsg = 'Not authenticated - no access token'
        console.error('❌', errorMsg)
        throw new Error(errorMsg)
      }

      const requestBody = {
        conversation_id: conversationId,
        new_message: message
      }

      console.log('📡 Sending request to:', `${backendUrl}/judges/generate`)
      console.log('📦 Request body:', requestBody)

      const response = await fetch(`${backendUrl}/judges/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📨 Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('❌ Error response:', errorData)
        throw new Error(errorData?.detail || `Failed to generate response: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Response data:', data)

      const judgeReply = data.judge_reply || ''
      if (!judgeReply) {
        console.warn('⚠️ Empty judge reply received')
      }

      return judgeReply
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate judge response'
      console.error('❌ Error generating judge response:', err)
      setError(errorMessage)
      throw err
    } finally {
      console.log('🏁 generateResponse finished, setting isGenerating to false')
      setIsGenerating(false)
    }
  }

  return {
    generateResponse,
    isGenerating,
    error
  }
}
