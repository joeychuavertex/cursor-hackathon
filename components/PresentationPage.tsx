'use client'

import { useState, useEffect, useRef } from 'react'
import SpeechRecognition from './SpeechRecognition'
import TranscriptionPanel, { TranscriptionEntry } from './TranscriptionPanel'
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
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([
    {
      id: 'mock-1',
      speaker: 'Barbara Corcoran',
      speakerType: 'avatar',
      content: 'Welcome to Shark Tank! I\'m excited to hear about your business idea. Please go ahead and present your pitch.',
      timestamp: new Date(Date.now() - 30000),
      isFinal: true
    },
    {
      id: 'mock-2',
      speaker: 'You',
      speakerType: 'user',
      content: 'Thank you Barbara! My name is Sarah and I\'m the founder of EcoClean, a revolutionary cleaning product that...',
      timestamp: new Date(Date.now() - 25000),
      isFinal: true
    },
    {
      id: 'mock-3',
      speaker: 'Barbara Corcoran',
      speakerType: 'avatar',
      content: 'That sounds interesting! What makes your product different from what\'s already on the market?',
      timestamp: new Date(Date.now() - 20000),
      isFinal: true
    },
    {
      id: 'mock-4',
      speaker: 'You',
      speakerType: 'user',
      content: 'Great question! Our unique formula uses 100% natural ingredients and is completely biodegradable, unlike traditional cleaners that...',
      timestamp: new Date(Date.now() - 15000),
      isFinal: true
    },
    {
      id: 'mock-5',
      speaker: 'Barbara Corcoran',
      speakerType: 'avatar',
      content: 'I like the environmental angle. What\'s your current revenue and how are you planning to scale?',
      timestamp: new Date(Date.now() - 10000),
      isFinal: true
    },
    {
      id: 'mock-6',
      speaker: 'You',
      speakerType: 'user',
      content: 'We\'ve generated $50,000 in sales in our first 6 months, and we\'re looking to expand into major retail chains...',
      timestamp: new Date(Date.now() - 5000),
      isFinal: false
    }
  ])
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const transcriptionIdRef = useRef(0)
  const { startAvatar, stopAvatar, speak, stream, isLoading, error } = useHeyGenAvatar()

  // Helper functions for transcription management
  const addTranscription = (speaker: string, speakerType: 'user' | 'avatar', content: string, isFinal: boolean = true) => {
    const id = `transcription-${++transcriptionIdRef.current}`
    const entry: TranscriptionEntry = {
      id,
      speaker,
      speakerType,
      content,
      timestamp: new Date(),
      isFinal
    }
    
    setTranscriptions(prev => {
      // If it's an interim result, update the last entry if it's also interim
      if (!isFinal) {
        const lastEntry = prev[prev.length - 1]
        if (lastEntry && !lastEntry.isFinal && lastEntry.speaker === speaker && lastEntry.speakerType === speakerType) {
          return [...prev.slice(0, -1), { ...lastEntry, content, timestamp: new Date() }]
        }
      }
      
      return [...prev, entry]
    })
  }

  const updateUserTranscription = (content: string, isFinal: boolean = false) => {
    addTranscription('You', 'user', content, isFinal)
  }

  const addAvatarTranscription = (judgeName: string, content: string) => {
    addTranscription(judgeName, 'avatar', content, true)
  }

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
      startAvatar(barbaraJudge.heygenAvatarId, (text) => {
        addAvatarTranscription(barbaraJudge.name, text)
      }).catch(err => {
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
    updateUserTranscription(text, true) // Mark as final
    setCurrentPhase('questions')
  }

  const handlePresentationUpdate = (text: string) => {
    setPresentationText(text)
    updateUserTranscription(text, false) // Mark as interim
  }

  const handleSpeakQuestion = (judgeId: string, text: string) => {
    if (judgeId === 'barbara') {
      speak(text)
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Theatrical Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        {/* Floating particles */}
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-6 bg-black/40 backdrop-blur-xl border-b border-yellow-400/20">
        <button
          onClick={onBackToSelection}
          className="px-6 py-3 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-lg transition-all duration-300 border border-gray-600/50 hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-400/20"
        >
          ← Back to Selection
        </button>
        
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 drop-shadow-2xl">
          🦈 SHARK TANK PRESENTATION
        </h1>
        
        {/* Timer */}
        <div className="bg-black/80 backdrop-blur-xl rounded-2xl px-8 py-6 text-white border border-yellow-400/30 shadow-2xl shadow-yellow-400/20">
          <div className="text-sm text-cyan-300 mb-2 font-semibold tracking-wider">TIME REMAINING</div>
          <div className="text-5xl font-black text-yellow-400 drop-shadow-lg">
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex p-8 gap-6">
        {/* Left Panel - Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
        {/* Judges Panel */}
        <div className="mb-12">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 text-center mb-8 drop-shadow-2xl">
            THE SHARKS ARE WATCHING
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
            {judges.map((judge) => (
              <div key={judge.id} className="relative group">
                <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-yellow-400/30 shadow-2xl shadow-yellow-400/10 hover:shadow-yellow-400/20 transition-all duration-300 hover:scale-105">
                  {/* Avatar Container */}
                  <div className="relative mb-4">
                    {judge.isHeyGenAvatar ? (
                      <div className="aspect-video bg-black/80 rounded-xl overflow-hidden border-2 border-yellow-400 shadow-lg shadow-yellow-400/20">
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
                            <div className="text-yellow-400 font-bold text-lg">Loading Avatar...</div>
                            <div className="text-cyan-300 text-sm mt-2 font-semibold">Connecting to HeyGen</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-gray-800 to-black rounded-xl flex items-center justify-center border-2 border-yellow-400/50 shadow-lg shadow-yellow-400/10">
                        <div className="text-center">
                          <div className="text-5xl mb-2">🦈</div>
                          <div className="text-yellow-400 font-bold text-sm">3D Avatar</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Judge Info */}
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-300 mb-3 drop-shadow-lg">
                      {judge.name}
                    </h3>
                    <div className="text-sm text-cyan-300 mb-3 font-semibold tracking-wide">
                      {judge.expertise.join(' • ')}
                    </div>
                    
                    {/* Connection Status */}
                    {judge.isHeyGenAvatar && (
                      <div className="flex items-center justify-center gap-2 text-sm mb-2">
                        <div className={`w-3 h-3 rounded-full ${stream ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-yellow-400 shadow-lg shadow-yellow-400/50'} animate-pulse`}></div>
                        <span className={`font-bold ${stream ? 'text-green-400' : 'text-yellow-400'}`}>
                          {stream ? 'CONNECTED' : 'CONNECTING...'}
                        </span>
                      </div>
                    )}
                    
                    {/* HeyGen Avatar ID */}
                    {judge.heygenAvatarId && (
                      <div className="text-xs text-white/60 mt-2 font-mono bg-black/40 px-2 py-1 rounded">
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
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-8 border border-yellow-400/30 shadow-2xl shadow-yellow-400/10">
            <SpeechRecognition
              onTextUpdate={handlePresentationUpdate}
              onComplete={handlePresentationComplete}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
            />
          </div>
        </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-6 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 backdrop-blur-xl shadow-2xl">
              <div className="font-bold text-lg mb-2">⚠️ HeyGen Error:</div>
              <div className="text-sm font-mono">{error}</div>
            </div>
          )}

          {/* Debug Info */}
          <div className="mt-6 p-6 bg-black/60 backdrop-blur-xl rounded-xl text-white/70 text-sm border border-cyan-400/20 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-cyan-300 font-bold mb-1">HeyGen Status</div>
                <div className="text-yellow-400">{isLoading ? 'Loading...' : stream ? 'Connected' : 'Disconnected'}</div>
              </div>
              <div>
                <div className="text-cyan-300 font-bold mb-1">Stream ID</div>
                <div className="text-yellow-400 font-mono text-xs">{stream?.id || 'None'}</div>
              </div>
              <div>
                <div className="text-cyan-300 font-bold mb-1">Current Phase</div>
                <div className="text-yellow-400 uppercase font-bold">{currentPhase}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Transcription */}
        <div className="w-96 h-full hidden lg:block">
          <TranscriptionPanel transcriptions={transcriptions} />
        </div>
      </div>

      {/* Mobile Transcription Panel */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20">
        <div className="h-48">
          <TranscriptionPanel transcriptions={transcriptions} className="h-full rounded-t-2xl" />
        </div>
      </div>
    </div>
  )
}