'use client'

import { useRef, useEffect, useState } from 'react'

interface GlobalBackgroundMusicProps {
  currentStep: 'landing' | 'selection' | 'room' | 'dashboard'
}

export default function GlobalBackgroundMusic({ currentStep }: GlobalBackgroundMusicProps) {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [userWantsMusic, setUserWantsMusic] = useState(true)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null)

  // Background music control
  useEffect(() => {
    if (!userWantsMusic) return

    // Create background music element
    const audio = new Audio()
    audio.src = '/audio/shark_tank_theme.mp3'
    audio.loop = true
    audio.preload = 'auto'
    
    // Adjust volume based on current step
    const volume = currentStep === 'room' ? 0.15 : 0.3 // Softer in room, normal elsewhere
    audio.volume = volume
    
    backgroundMusicRef.current = audio

    const playMusic = async () => {
      try {
        await audio.play()
        setIsMusicPlaying(true)
        console.log('🎵 Background music started')
      } catch (error) {
        console.log('🔇 Background music autoplay blocked:', error)
        setIsMusicPlaying(false)
      }
    }

    // Try to play music after a short delay
    const musicTimer = setTimeout(playMusic, 2000)

    return () => {
      clearTimeout(musicTimer)
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [userWantsMusic, currentStep])

  // Update volume when step changes
  useEffect(() => {
    if (backgroundMusicRef.current) {
      const volume = currentStep === 'room' ? 0.15 : 0.3
      backgroundMusicRef.current.volume = volume
    }
  }, [currentStep])

  // Handle user interaction to start music (required for autoplay policies)
  const handleUserInteraction = () => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true)
    }
    
    if (backgroundMusicRef.current && !isMusicPlaying && userWantsMusic) {
      backgroundMusicRef.current.play()
        .then(() => {
          setIsMusicPlaying(true)
          console.log('🎵 Background music started after user interaction')
        })
        .catch(error => {
          console.log('🔇 Failed to start background music:', error)
        })
    }
  }

  // Toggle music on/off
  const toggleMusic = () => {
    if (isMusicPlaying) {
      stopBackgroundMusic()
    } else {
      handleUserInteraction()
    }
  }

  // Stop music
  const stopBackgroundMusic = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause()
      backgroundMusicRef.current.currentTime = 0
      setIsMusicPlaying(false)
      console.log('🔇 Background music stopped')
    }
  }

  // Add global click listener for user interaction
  useEffect(() => {
    const handleGlobalClick = () => {
      if (!hasUserInteracted) {
        handleUserInteraction()
      }
    }

    document.addEventListener('click', handleGlobalClick)
    return () => document.removeEventListener('click', handleGlobalClick)
  }, [hasUserInteracted])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleMusic}
        className="p-4 bg-black/80 backdrop-blur-xl border border-yellow-400/30 rounded-full hover:bg-yellow-400/10 transition-all duration-300 group shadow-2xl shadow-yellow-400/20"
        title={isMusicPlaying ? "Pause Background Music" : "Play Background Music"}
      >
        {isMusicPlaying ? (
          // Pause icon when music is playing
          <svg className="w-6 h-6 text-yellow-400 group-hover:text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
        ) : (
          // Play icon when music is not playing
          <svg className="w-6 h-6 text-yellow-400 group-hover:text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>
    </div>
  )
}
