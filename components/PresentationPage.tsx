'use client'

import { useState, useEffect, useRef } from 'react'
import SpeechRecognition from './SpeechRecognition'
import TranscriptionPanel, { TranscriptionEntry } from './TranscriptionPanel'
import { useHeyGenAvatar } from '../hooks/useHeyGenAvatar'
import { useJudgeResponse } from '../hooks/useJudgeResponse'
import { Judge } from '../types/judge'
import { useElevenLabs } from '../hooks/useElevenLabs'

interface PresentationPageProps {
  judges: Judge[]
  onBackToSelection: () => void
  onPresentationComplete: () => void
}

export default function PresentationPage({ judges, onBackToSelection, onPresentationComplete }: PresentationPageProps) {
  const [presentationText, setPresentationText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<'presentation' | 'questions' | 'scoring' | 'results'>('presentation')
  const judgeConversationMap = localStorage.getItem('judgeConversationMap')
  const [speaker, setSpeaker] = useState('')
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([
    {
      id: 'mock-1',
      speaker: judges[0].name,
      speakerType: 'avatar',
      content: 'Welcome to Shark Tank! I\'m excited to hear about your business idea. Please go ahead and present your pitch.',
      timestamp: new Date(Date.now() - 30000),
      isFinal: true
    }
  ])
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const transcriptionIdRef = useRef(0)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const { startAvatar, stopAvatar, speak, stream, isLoading, error } = useHeyGenAvatar()
  const { generateResponse, isGenerating, error: judgeError } = useJudgeResponse()
  const { playAudioFromBase64 } = useElevenLabs()

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

  // Audio control functions
  const stopAllAudio = () => {
    // Stop any currently playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current.currentTime = 0
      currentAudioRef.current = null
    }
    
    // Stop all audio elements on the page
    const audioElements = document.querySelectorAll('audio')
    audioElements.forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
    
    console.log('🔇 All audio stopped')
  }

  const playAudioWithControl = async (base64: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        // Stop any existing audio first
        stopAllAudio()
        
        // Convert base64 to data URL if it's not already
        const audioDataUrl = base64.startsWith('data:') ? base64 : `data:audio/mpeg;base64,${base64}`
        const audio = new Audio(audioDataUrl)
        
        // Store reference to current audio
        currentAudioRef.current = audio
        
        audio.onended = () => {
          currentAudioRef.current = null
          resolve()
        }
        audio.onerror = (error) => {
          console.error('❌ Audio playback error:', error)
          currentAudioRef.current = null
          reject(new Error('Audio playback failed'))
        }
        
        audio.play().catch(reject)
      } catch (error) {
        console.error('❌ Error creating audio from base64:', error)
        reject(error)
      }
    })
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAvatar()
      stopAllAudio()
    }
  }, [stopAvatar])

  const handlePresentationComplete = async (text: string) => {
    setPresentationText(text)
    updateUserTranscription(text, true) // Mark as final

    // get a random conversation id from the judgeConversationMap
    const map = JSON.parse(judgeConversationMap || '[]');
    const conversationId = map.length ? map[Math.floor(Math.random() * map.length)].conversation_id : undefined;
    // corresponds to the judge_id in the judgeConversationMap by using the conversation id
    const judgeId = map.length ? map.find((item: { conversation_id: string, judge_id: string }) => item.conversation_id === conversationId)?.judge_id : undefined;
    // Send pitch to judges and get their responses
    if (conversationId) {
      try {
        console.log('📤 Sending pitch to judges...', { conversationId, pitchLength: text.length })

        // Stop any audio that might be playing
        stopAllAudio()
        setSpeaker('')
        // Generate response from the judge
        const { judgeReply, audioBase64 } = await generateResponse({
          conversationId,
          message: text
        })

        console.log('✅ Received judge response:', judgeReply)

        // Add judge's response to transcription
        const activeJudge = judges.find(j => j.isHeyGenAvatar) || judges[0]
        addAvatarTranscription(judgeId, judgeReply)

        // Play audio based on judge type
        if (activeJudge.isHeyGenAvatar && speak) {
          // If HeyGen avatar is active, make it speak the response
          console.log('🎬 Using HeyGen avatar to speak')
          await speak(judgeReply)
        } else if (audioBase64) {
          // Otherwise use the ElevenLabs audio
          console.log('🔊 Playing audio from ElevenLabs')
          try {
            setSpeaker(judgeId)
            await playAudioWithControl(audioBase64)
            setSpeaker('')
            console.log('✅ Audio playback completed')
          } catch (audioError) {
            console.error('❌ Error playing audio:', audioError)
          }
        } else {
          console.warn('⚠️ No audio available to play')
        }

        setCurrentPhase('questions')
      } catch (err) {
        console.error('❌ Error getting judge response:', err)
        // Continue to questions phase even if there's an error
        setCurrentPhase('questions')
      }
    } else {
      console.warn('⚠️ No conversation ID found, skipping judge response')
      setCurrentPhase('questions')
    }
  }

  const handlePresentationUpdate = (text: string) => {
    setPresentationText(text)
    updateUserTranscription(text, false) // Mark as interim
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
      <div className="relative z-10 flex items-center p-4 bg-black/40 backdrop-blur-xl border-b border-yellow-400/20">
        <button
          onClick={onBackToSelection}
          className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 text-white text-sm rounded-lg transition-all duration-300 border border-gray-600/50 hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-400/20 flex-shrink-0"
          style={{ width: '10%', minWidth: 'fit-content' }}
        >
          ← Back
        </button>
        
        {/* Scrolling Marquee */}
        <div className="marquee-container" style={{ width: '80%' }}>
          <div className="marquee-content">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 drop-shadow-2xl px-8">
              🦈 THE SHARKS ARE WATCHING
            </span>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 drop-shadow-2xl px-8">
              🦈 THE SHARKS ARE WATCHING
            </span>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 drop-shadow-2xl px-8">
              🦈 THE SHARKS ARE WATCHING
            </span>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 drop-shadow-2xl px-8">
              🦈 THE SHARKS ARE WATCHING
            </span>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 drop-shadow-2xl px-8">
              🦈 THE SHARKS ARE WATCHING
            </span>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 drop-shadow-2xl px-8">
              🦈 THE SHARKS ARE WATCHING
            </span>
          </div>
        </div>

         {/* Complete Button */}
         <button
           onClick={onPresentationComplete}
           className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 text-white text-sm rounded-lg transition-all duration-300 border border-gray-600/50 hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-400/20 flex-shrink-0"
           style={{ width: '10%', minWidth: 'fit-content' }}
         >
           Complete →
         </button>
      </div>

      {/* Main Content */}
      <section className="relative z-10 flex-1 flex p-8 gap-6 pb-32">
        {/* Left Panel - Main Content */}
        <div className="flex-1 flex flex-col items-center">
        {/* Judges Panel */}
        <div className="mb-8 flex justify-center">
          <div className={`grid gap-8 ${
            judges.length === 1 ? 'grid-cols-1' : 
            judges.length === 2 ? 'grid-cols-2' : 
            'grid-cols-3'
          }`}>
            {judges.map((judge) => {
              // Assume 'speaker' is the id of the currently speaking judge passed via props or from state
              const isSpeaking = judge.id === speaker;

              return (
                <div key={judge.id} className="relative group">
                  <div
                    className={
                      `bg-black/60 backdrop-blur-xl rounded-2xl p-6 border shadow-2xl shadow-yellow-400/10 hover:shadow-yellow-400/20 transition-all duration-300 hover:scale-105 ` +
                      (isSpeaking
                        ? "border-yellow-400 animate-pulse-ring"
                        : "border-yellow-400/30")
                    }
                    // Optionally, if you want even more custom pulsing logic, you could inline style border color with animation here as well.
                  >
                    {/* Avatar Container */}
                    <div className="relative mb-4">
                      {judge.isHeyGenAvatar ? (
                        <div 
                          className="bg-black/80 rounded-xl overflow-hidden border-2 border-yellow-400 shadow-lg shadow-yellow-400/20 flex items-center justify-center"
                          style={{ 
                            height: `calc(${judges.length === 1 ? '70' : judges.length === 2 ? '50' : '40'}vh - 2rem)`, 
                            maxHeight: `calc(${judges.length === 1 ? '70' : judges.length === 2 ? '50' : '40'}vh - 2rem)` 
                          }}
                        >
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
                        <div 
                          className="bg-gradient-to-br from-gray-800 to-black rounded-xl flex items-center justify-center border-2 border-yellow-400/50 shadow-lg shadow-yellow-400/10"
                          style={{ 
                            height: `calc(${judges.length === 1 ? '60' : judges.length === 2 ? '45' : '30'}vh - 2rem)`, 
                            maxHeight: `calc(${judges.length === 1 ? '60' : judges.length === 2 ? '45' : '30'}vh - 2rem)` 
                          }}
                        >
                          <div className="text-center">
                            <div className={`mb-4 ${judges.length === 1 ? 'text-8xl' : judges.length === 2 ? 'text-6xl' : 'text-5xl'}`}>🦈</div>
                            <div className="text-yellow-400 font-bold text-lg">3D Avatar</div>
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
              );
            })}
            {/* Pulse ring animation for "isSpeaking" border */}
            <style jsx>{`
              @keyframes pulseBorder {
                0% {
                  box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.5);
                  border-color: #fbbf24;
                }
                40% {
                  box-shadow: 0 0 0 8px rgba(251, 191, 36, 0.15);
                  border-color: #fde68a;
                }
                100% {
                  box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.2);
                  border-color: #fbbf24;
                }
              }
              .animate-pulse-ring {
                animation: pulseBorder 1.05s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                border-width: 2.5px !important;
              }
            `}</style>
          </div>
        </div>

        {/* Recording Controls - Fixed at Bottom */}
        <SpeechRecognition
          onTextUpdate={handlePresentationUpdate}
          onComplete={handlePresentationComplete}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
        />

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-6 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 backdrop-blur-xl shadow-2xl">
              <div className="font-bold text-lg mb-2">⚠️ HeyGen Error:</div>
              <div className="text-sm font-mono">{error}</div>
            </div>
          )}

          {/* Judge Response Error */}
          {judgeError && (
            <div className="mt-4 p-6 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 backdrop-blur-xl shadow-2xl">
              <div className="font-bold text-lg mb-2">⚠️ Judge Response Error:</div>
              <div className="text-sm font-mono">{judgeError}</div>
            </div>
          )}

          {/* Debug Info */}
          {/* <div className="mt-4 p-6 bg-black/60 backdrop-blur-xl rounded-xl text-white/70 text-sm border border-cyan-400/20 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
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
              <div>
                <div className="text-cyan-300 font-bold mb-1">Conversation ID</div>
                <div className={`font-mono text-xs ${conversationId ? 'text-green-400' : 'text-red-400'}`}>
                  {conversationId ? `${conversationId.substring(0, 8)}...` : 'Not Set!'}
                </div>
              </div>
            </div>
          </div> */}
        </div>

        {/* Right Panel - Transcription */}
        <div className="w-96 h-full hidden lg:block">
          <TranscriptionPanel transcriptions={transcriptions} />
        </div>
      </section>

      {/* Mobile Transcription Panel - Positioned above bottom input bar */}
      <section className="lg:hidden fixed bottom-20 left-0 right-0 z-20 px-4 pb-4 h-52">
        <TranscriptionPanel transcriptions={transcriptions} className="rounded-2xl h-full" />
      </section>
    </div>
  )
}