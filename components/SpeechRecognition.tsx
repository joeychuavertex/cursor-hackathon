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
    <section className="fixed bottom-0 left-0 right-0 z-50">
      {/* Main Bottom Bar */}
      <section className="bg-black/80 backdrop-blur-2xl border-t border-yellow-400/30 shadow-2xl shadow-yellow-400/10">
        <section className="max-w-7xl mx-auto px-4 py-4">
          
          {/* Transcript/Input Display Area - Expandable */}
          {(transcript || inputMode === 'write') && (
            <section className="mb-4 bg-black/60 backdrop-blur-xl rounded-3xl border border-yellow-400/20 shadow-lg overflow-hidden">
              {inputMode === 'write' ? (
                <textarea
                  value={transcript}
                  onChange={(e) => {
                    setTranscript(e.target.value)
                    onTextUpdate(e.target.value)
                  }}
                  placeholder="Type your pitch here..."
                  className="w-full px-6 py-4 bg-transparent text-white placeholder-white/40 resize-none outline-none text-base leading-relaxed max-h-48 min-h-[80px]"
                  rows={3}
                />
              ) : (
                <section className="px-6 py-4 max-h-48 overflow-y-auto">
                  <p className="text-white/90 text-base leading-relaxed whitespace-pre-wrap">
                    {transcript || (isRecording ? 'Listening...' : 'Click the mic to start recording')}
                  </p>
                </section>
              )}
            </section>
          )}

          {/* Control Bar */}
          <section className="flex items-center gap-3">
            
            {/* Mode Toggle */}
            <section className="flex gap-2 bg-black/60 backdrop-blur-xl rounded-full p-1 border border-yellow-400/20">
              <button
                onClick={() => setInputMode('record')}
                disabled={isRecording || isSttLoading}
                className={`p-3 rounded-full transition-all duration-300 ${
                  inputMode === 'record'
                    ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/30'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Record mode"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={() => setInputMode('write')}
                disabled={isRecording || isSttLoading}
                className={`p-3 rounded-full transition-all duration-300 ${
                  inputMode === 'write'
                    ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/30'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Write mode"
              >
                <Type className="w-5 h-5" />
              </button>
            </section>

            {/* Record/Stop Button (Only in record mode) */}
            {inputMode === 'record' && isSupported && (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isSttLoading}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-red-500/50 text-white' 
                    : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 shadow-yellow-400/50 text-black'
                }`}
                title={isRecording ? 'Stop recording' : 'Start recording'}
              >
                {isRecording ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>
            )}

            {/* Status Text */}
            <section className="flex-1 min-w-0">
              {inputMode === 'record' && (
                <section className="flex items-center gap-2">
                  {isRecording && (
                    <section className="flex items-center gap-2">
                      <section className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></section>
                      <span className="text-white/90 text-sm font-semibold">Recording...</span>
                    </section>
                  )}
                  {!isRecording && !transcript && (
                    <span className="text-white/50 text-sm">
                      {isSupported ? 'Ready to record your pitch' : 'Speech recognition not supported'}
                    </span>
                  )}
                </section>
              )}
              {inputMode === 'write' && !transcript && (
                <span className="text-white/50 text-sm">Type your pitch...</span>
              )}
            </section>

            {/* Action Buttons */}
            <section className="flex items-center gap-2">
              {transcript && (
                <>
                  <button
                    onClick={() => {
                      setTranscript('')
                      onTextUpdate('')
                      audioRecordingRef.current = null
                    }}
                    disabled={isSttLoading || isRecording}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleSubmitPitch}
                    disabled={isSttLoading || isRecording}
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-bold text-sm transition-all shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSttLoading ? '⏳ Processing...' : '🦈 Submit'}
                  </button>
                </>
              )}
            </section>
          </section>

          {/* Error Display */}
          {audioError && (
            <section className="mt-3 bg-red-500/20 border border-red-500/50 rounded-2xl px-4 py-2 flex items-center gap-2">
              <span className="text-red-200 text-sm font-semibold">⚠️ {audioError}</span>
            </section>
          )}
          
          {!isSupported && inputMode === 'record' && (
            <section className="mt-3 bg-yellow-500/20 border border-yellow-500/50 rounded-2xl px-4 py-2">
              <p className="text-yellow-200 text-sm font-semibold">
                ⚠️ Speech recognition not supported. Switch to write mode or use Chrome/Safari.
              </p>
            </section>
          )}
        </section>
      </section>
    </section>
  )
}
