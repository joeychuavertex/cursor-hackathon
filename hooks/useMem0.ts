import { useState } from 'react'

export function useMem0() {
  const [isLoading, setIsLoading] = useState(false)

  const saveMemory = async (key: string, value: any, userId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/mem0/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          value,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save memory')
      }

      return await response.json()
    } catch (error) {
      console.error('Error saving memory:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const getMemory = async (key: string, userId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/mem0/get?key=${key}&userId=${userId}`)

      if (!response.ok) {
        throw new Error('Failed to get memory')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting memory:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateJudgeMemory = async (judgeId: string, interaction: any, userId: string) => {
    const memoryKey = `judge_${judgeId}_interactions`
    
    try {
      const existingMemory = await getMemory(memoryKey, userId)
      const interactions = existingMemory?.value || []
      
      interactions.push({
        ...interaction,
        timestamp: Date.now(),
      })
      
      await saveMemory(memoryKey, interactions, userId)
    } catch (error) {
      console.error('Error updating judge memory:', error)
    }
  }

  const getJudgePreferences = async (judgeId: string, userId: string) => {
    const memoryKey = `judge_${judgeId}_preferences`
    
    try {
      const memory = await getMemory(memoryKey, userId)
      return memory?.value || {}
    } catch (error) {
      console.error('Error getting judge preferences:', error)
      return {}
    }
  }

  return {
    saveMemory,
    getMemory,
    updateJudgeMemory,
    getJudgePreferences,
    isLoading
  }
}
