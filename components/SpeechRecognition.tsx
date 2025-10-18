'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, Edit3, Type } from 'lucide-react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { useElevenLabs } from '@/hooks/useElevenLabs'

interface SpeechRecognitionProps {
  onTextUpdate: (text: string) => void
  onComplete: (text: string) => void
  isRecording: boolean
  setIsRecording: (recording: boolean) => void
}

export default function SpeechRecognition({ 
  onTextUpdate, 
  onComplete, 
  isRecording, 
  setIsRecording 
}: SpeechRecognitionProps) {
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [inputMode, setInputMode] = useState<'write' | 'record'>('record')
  
  // Audio recording hooks
  const { 
    startRecording: startAudioRecording, 
    stopRecording: stopAudioRecording,
    audioBlob,
    error: audioError
  } = useAudioRecorder()
  
  const { transcribeAudio, isSttLoading } = useElevenLabs()
  const audioRecordingRef = useRef<Blob | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'en-US'
      
      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        const fullTranscript = finalTranscript + interimTranscript
        setTranscript(fullTranscript)
        onTextUpdate(fullTranscript)
      }
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }
      
      recognitionInstance.onend = () => {
        setIsRecording(false)
        if (transcript.trim()) {
          onComplete(transcript)
        }
      }
      
      setRecognition(recognitionInstance)
      setIsSupported(true)
    }
  }, [transcript, onTextUpdate, onComplete])

  const startRecording = async () => {
    if (recognition && !isRecording) {
      setTranscript('')
      recognition.start()
      setIsRecording(true)
      
      // Also start raw audio recording
      await startAudioRecording()
    }
  }

  const stopRecording = async () => {
    if (recognition && isRecording) {
      recognition.stop()
      setIsRecording(false)
      
      // Stop raw audio recording
      const audioBlob = await stopAudioRecording()
      if (audioBlob) {
        audioRecordingRef.current = audioBlob
      }
    }
  }
  
  const handleSubmitPitch = async () => {
    // If we have an audio recording, send it to STT API
    if (audioRecordingRef.current && inputMode === 'record') {
      try {
        const sttTranscript = await transcribeAudio(audioRecordingRef.current)
        if (sttTranscript) {
          // Use STT transcript if available, otherwise use webkit transcript
          onComplete(sttTranscript)
          return
        }
      } catch (error) {
        console.error('Error transcribing audio:', error)
      }
    }
    
    // Fallback to webkit transcript or written text
    if (transcript.trim()) {
      onComplete(transcript)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-8 border border-yellow-400/30 shadow-2xl shadow-yellow-400/10">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 mb-4 drop-shadow-2xl">
            🦈 YOUR PITCH
          </h3>
        </div>

        {/* Input Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/40 backdrop-blur-lg rounded-xl p-2 border border-yellow-400/20">
            <div className="flex gap-2">
              <button
                onClick={() => setInputMode('write')}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${
                  inputMode === 'write'
                    ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/30'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Type className="w-5 h-5" />
                Write
              </button>
              <button
                onClick={() => setInputMode('record')}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${
                  inputMode === 'record'
                    ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/30'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Mic className="w-5 h-5" />
                Record
              </button>
            </div>
          </div>
        </div>

        {/* Write Mode */}
        {inputMode === 'write' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-cyan-300 mb-4">
                <Edit3 className="w-6 h-6" />
                <span className="text-xl font-bold">Write Your Business Proposal</span>
              </div>
              <p className="text-white/70">
                Type your pitch content below. Be clear, concise, and compelling!
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-yellow-400/20">
              <textarea
                value={transcript}
                onChange={(e) => {
                  setTranscript(e.target.value)
                  onTextUpdate(e.target.value)
                }}
                placeholder="Enter your business proposal here...\n\nInclude:\n• Your business idea\n• Target market\n• Revenue model\n• Funding requirements\n• Why the sharks should invest"
                className="w-full h-64 bg-transparent text-white placeholder-white/50 resize-none outline-none text-lg leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Record Mode */}
        {inputMode === 'record' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-cyan-300 mb-4">
                <Volume2 className="w-6 h-6" />
                <span className="text-xl font-bold">Record Your Presentation</span>
              </div>
              <p className="text-white/70">
                {isSupported 
                  ? "Click the microphone to start recording your pitch"
                  : "Speech recognition not supported. Please use Chrome or Safari for voice recording."
                }
              </p>
            </div>

            {isSupported ? (
              <>
                {/* Recording Controls */}
                <div className="flex justify-center">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-105 shadow-2xl ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-red-500/50' 
                        : 'bg-yellow-400 hover:bg-yellow-500 shadow-yellow-400/50'
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="w-10 h-10" />
                    ) : (
                      <Mic className="w-10 h-10" />
                    )}
                  </button>
                </div>

                {/* Status Indicator */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-white">
                    <Volume2 className={`w-6 h-6 ${isRecording ? 'animate-pulse' : ''}`} />
                    <span className="text-lg font-bold">
                      {isRecording ? 'Recording...' : 'Ready to record'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6">
                  <p className="text-red-200 font-bold text-lg mb-2">⚠️ Speech Recognition Not Supported</p>
                  <p className="text-red-300">
                    Your browser doesn't support speech recognition. Please use Chrome or Safari for voice recording.
                  </p>
                </div>
              </div>
            )}

            {/* Transcript Display */}
            <div className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-yellow-400/20 min-h-32">
              <div className="text-white whitespace-pre-wrap text-lg leading-relaxed">
                {transcript || 'Your speech will appear here...'}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          {transcript && (
            <button
              onClick={handleSubmitPitch}
              disabled={isSttLoading}
              className="px-10 py-4 bg-yellow-400 text-black rounded-xl hover:bg-yellow-500 transition-all font-black text-lg shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSttLoading ? '⏳ PROCESSING...' : '🦈 SUBMIT PITCH'}
            </button>
          )}
          
          {transcript && (
            <button
              onClick={() => {
                setTranscript('')
                onTextUpdate('')
                audioRecordingRef.current = null
              }}
              disabled={isSttLoading}
              className="px-10 py-4 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all font-bold text-lg border border-white/30 hover:border-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          )}
        </div>
        
        {/* Error Display */}
        {audioError && (
          <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-center">
            <p className="text-red-200 font-bold">⚠️ Audio Recording Error</p>
            <p className="text-red-300 text-sm mt-1">{audioError}</p>
          </div>
        )}
      </div>
    </div>
  )
}
