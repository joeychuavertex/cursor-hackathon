import { useState } from 'react'

export function useElevenLabs() {
  const [isLoading, setIsLoading] = useState(false)

  const synthesizeSpeech = async (text: string, voiceId: string): Promise<string | null> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/elevenlabs/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to synthesize speech')
      }

      const blob = await response.blob()
      const audioUrl = URL.createObjectURL(blob)
      return audioUrl
    } catch (error) {
      console.error('Error synthesizing speech:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const playAudio = async (audioUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl)
      
      audio.onended = () => resolve()
      audio.onerror = () => reject(new Error('Audio playback failed'))
      
      audio.play().catch(reject)
    })
  }

  return {
    synthesizeSpeech,
    playAudio,
    isLoading
  }
}
