import { useRef, useState, useEffect, useCallback } from 'react'
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
  TaskMode,
} from '@heygen/streaming-avatar'

interface UseHeyGenAvatarReturn {
  stream: MediaStream | null
  isLoading: boolean
  error: string | null
  startAvatar: (avatarId: string) => Promise<void>
  stopAvatar: () => Promise<void>
  speak: (text: string) => Promise<void>
  isAvatarActive: boolean
}

export function useHeyGenAvatar(): UseHeyGenAvatarReturn {
  const avatarRef = useRef<StreamingAvatar | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAvatarActive, setIsAvatarActive] = useState(false)

  const startAvatar = useCallback(async (avatarId: string) => {
    if (isAvatarActive) {
      console.warn('Avatar is already active')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get access token from Python FastAPI backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const tokenResponse = await fetch(`${backendUrl}/heygen/token`, {
        method: 'POST',
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json()
        throw new Error(errorData.detail || 'Failed to get access token')
      }

      const { token } = await tokenResponse.json()
      console.log('✅ Token received from backend')

      // Initialize StreamingAvatar
      avatarRef.current = new StreamingAvatar({
        token,
      })
      console.log('✅ StreamingAvatar instance created')

      // CRITICAL: Set up ALL event listeners BEFORE calling createStartAvatar
      avatarRef.current.on(StreamingEvents.STREAM_READY, (event) => {
        console.log('🎥 STREAM_READY event fired!', event)
        console.log('📹 MediaStream received:', event.detail)
        setStream(event.detail)
        setIsAvatarActive(true)
        setIsLoading(false)
      })

      avatarRef.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.warn('❌ Stream disconnected')
        setStream(null)
        setIsAvatarActive(false)
      })

      avatarRef.current.on(StreamingEvents.AVATAR_START_TALKING, (event) => {
        console.log('🗣️ Avatar started talking', event)
      })

      avatarRef.current.on(StreamingEvents.AVATAR_STOP_TALKING, (event) => {
        console.log('🤐 Avatar stopped talking', event)
      })

      // Additional event listeners from official demo
      avatarRef.current.on(StreamingEvents.USER_START, (event) => {
        console.log('👤 User started talking', event)
      })

      avatarRef.current.on(StreamingEvents.USER_STOP, (event) => {
        console.log('👤 User stopped talking', event)
      })

      console.log('✅ All event listeners registered')

      // Start the avatar session
      console.log('🚀 Calling createStartAvatar...')
      const startResponse = await avatarRef.current.createStartAvatar({
        quality: AvatarQuality.Low,
        avatarName: avatarId,
        language: 'en',
        // Note: Omitting 'voice' to use the avatar's built-in voice
        // To use a custom voice, add: voice: { voiceId: 'your_voice_id' }
      })

      console.log('✅ createStartAvatar completed:', startResponse)
      console.log('⏳ Waiting for STREAM_READY event...')
    } catch (err) {
      console.error('Error starting avatar:', err)
      setError(err instanceof Error ? err.message : 'Failed to start avatar')
      setIsLoading(false)
      setIsAvatarActive(false)
    }
  }, [isAvatarActive])

  const stopAvatar = useCallback(async () => {
    if (!avatarRef.current || !isAvatarActive) {
      return
    }

    try {
      await avatarRef.current.stopAvatar()
      avatarRef.current = null
      setStream(null)
      setIsAvatarActive(false)
      console.log('Avatar stopped successfully')
    } catch (err) {
      console.error('Error stopping avatar:', err)
      setError(err instanceof Error ? err.message : 'Failed to stop avatar')
    }
  }, [isAvatarActive])

  const speak = useCallback(async (text: string) => {
    if (!avatarRef.current || !isAvatarActive) {
      console.warn('Avatar is not active, cannot speak')
      return
    }

    try {
      await avatarRef.current.speak({
        text,
        taskType: TaskType.TALK,
        taskMode: TaskMode.ASYNC,
      })
      console.log('Avatar speaking:', text)
    } catch (err) {
      console.error('Error making avatar speak:', err)
      setError(err instanceof Error ? err.message : 'Failed to make avatar speak')
    }
  }, [isAvatarActive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (avatarRef.current && isAvatarActive) {
        avatarRef.current.stopAvatar().catch(console.error)
      }
    }
  }, [isAvatarActive])

  return {
    stream,
    isLoading,
    error,
    startAvatar,
    stopAvatar,
    speak,
    isAvatarActive,
  }
}

