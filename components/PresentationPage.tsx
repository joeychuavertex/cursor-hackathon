'use client'

import { useState, useEffect, useRef } from 'react'
import SpeechRecognition from './SpeechRecognition'
import { useHeyGenAvatar } from '../hooks/useHeyGenAvatar'
import { Judge } from '../types/judge'

interface PresentationPageProps {
  judges: Judge[]
  onBackToSelection: () => void
}

const PRESENTATION_DURATION = 60 // 60 seconds

export default function PresentationPage({ judges, onBackToSelection }: PresentationPageProps) {
  const [presentationText, setPresentationText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(PRESENTATION_DURATION)
  const [currentPhase, setCurrentPhase] = useState<'presentation' | 'questions' | 'scoring' | 'results'>('presentation')
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const { startAvatar, stopAvatar, speak, stream, isLoading, error } = useHeyGenAvatar()

  // Handle video stream assignment
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log('🎬 Assigning stream to video element:', stream.id)
      
      // Only assign if it's different
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream
        
        // Wait for metadata before playing
        videoRef.current.onloadedmetadata = () => {
          console.log('📺 Video metadata loaded, attempting to play...')
          videoRef.current?.play().catch(err => {
            if (err.name !== 'AbortError') {
              console.error('❌ Video play error:', err)
            } else {
              console.log('⚠️ Video play aborted (normal during stream changes)')
            }
          })
        }
      }
    }
  }, [stream])

  // Start HeyGen avatar for Barbara on component mount
  useEffect(() => {
    const barbaraJudge = judges.find(j => j.id === 'barbara')
    console.log('🔍 PresentationPage mounted - Barbara judge:', barbaraJudge)
    
    if (barbaraJudge?.isHeyGenAvatar && barbaraJudge.heygenAvatarId) {
      console.log('🎭 Starting HeyGen avatar for Barbara with ID:', barbaraJudge.heygenAvatarId)
      startAvatar(barbaraJudge.heygenAvatarId).catch(err => {
        console.error('❌ Failed to start HeyGen avatar:', err)
      })
    } else {
      console.log('⚠️ Barbara is not configured as HeyGen avatar:', {
        isHeyGenAvatar: barbaraJudge?.isHeyGenAvatar,
        heygenAvatarId: barbaraJudge?.heygenAvatarId
      })
    }
  }, [judges, startAvatar])

  // Timer logic
  useEffect(() => {
    if (currentPhase === 'presentation' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setCurrentPhase('questions')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [currentPhase, timeRemaining])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAvatar()
    }
  }, [stopAvatar])

  const handlePresentationComplete = (text: string) => {
    setPresentationText(text)
    setCurrentPhase('questions')
  }

  const handleSpeakQuestion = (judgeId: string, text: string) => {
    if (judgeId === 'barbara') {
      speak(text)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-black/20 backdrop-blur-lg">
        <button
          onClick={onBackToSelection}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          ← Back to Selection
        </button>
        
        <h1 className="text-2xl font-bold text-white">Shark Tank Presentation</h1>
        
        {/* Timer */}
        <div className="bg-black/70 backdrop-blur-lg rounded-2xl px-6 py-4 text-white">
          <div className="text-sm text-gray-300 mb-1">Time Remaining</div>
          <div className="text-4xl font-bold text-yellow-400">
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Judges Panel */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            The Sharks Are Watching
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
            {judges.map((judge) => (
              <div key={judge.id} className="relative">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  {/* Avatar Container */}
                  <div className="relative mb-4">
                    {judge.isHeyGenAvatar ? (
                      <div className="aspect-video bg-black/50 rounded-xl overflow-hidden border-2 border-yellow-400">
                        {stream ? (
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
                            <div className="text-yellow-400 font-semibold">Loading Avatar...</div>
                            <div className="text-white/70 text-sm mt-2">Connecting to HeyGen</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center border-2 border-gray-400">
                        <div className="text-center">
                          <div className="text-4xl mb-2">👤</div>
                          <div className="text-white/70 text-sm">3D Avatar</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Judge Info */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">{judge.name}</h3>
                    <div className="text-sm text-blue-200 mb-2">
                      {judge.expertise.join(' • ')}
                    </div>
                    
                    {/* Connection Status */}
                    {judge.isHeyGenAvatar && (
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${stream ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                        <span className={stream ? 'text-green-400' : 'text-yellow-400'}>
                          {stream ? 'Connected' : 'Connecting...'}
                        </span>
                      </div>
                    )}
                    
                    {/* HeyGen Avatar ID */}
                    {judge.heygenAvatarId && (
                      <div className="text-xs text-white/50 mt-1">
                        ID: {judge.heygenAvatarId}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recording Controls */}
        <div className="w-full max-w-4xl">
          <SpeechRecognition
            onTextUpdate={setPresentationText}
            onComplete={handlePresentationComplete}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            <div className="font-semibold">HeyGen Error:</div>
            <div className="text-sm">{error}</div>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-black/30 rounded-lg text-white/70 text-sm">
          <div>HeyGen Status: {isLoading ? 'Loading...' : stream ? 'Connected' : 'Disconnected'}</div>
          <div>Stream ID: {stream?.id || 'None'}</div>
          <div>Current Phase: {currentPhase}</div>
        </div>
      </div>
    </div>
  )
}