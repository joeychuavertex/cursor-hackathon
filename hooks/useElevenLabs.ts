import { useState } from 'react'

export function useElevenLabs() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSttLoading, setIsSttLoading] = useState(false)

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

  const transcribeAudio = async (audioBlob: Blob): Promise<string | null> => {
    setIsSttLoading(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')

      const response = await fetch('/api/elevenlabs/stt', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to transcribe audio')
      }

      const data = await response.json()
      return data.transcript || null
    } catch (error) {
      console.error('Error transcribing audio:', error)
      return null
    } finally {
      setIsSttLoading(false)
    }
  }

  // play audio from base64
  const playAudioFromBase64 = async (base64: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        // Convert base64 to data URL if it's not already
        const audioDataUrl = base64.startsWith('data:') ? base64 : `data:audio/mpeg;base64,${base64}`
        const audio = new Audio(audioDataUrl)
        
        audio.onended = () => resolve()
        audio.onerror = (error) => {
          console.error('❌ Audio playback error:', error)
          reject(new Error('Audio playback failed'))
        }
        
        audio.play().catch(reject)
      } catch (error) {
        console.error('❌ Error creating audio from base64:', error)
        reject(error)
      }
    })
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
    transcribeAudio,
    playAudio,
    playAudioFromBase64,
    isLoading,
    isSttLoading
  }
}
