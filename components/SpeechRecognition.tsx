'use client'

import { useState, useEffect } from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'

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

  const startRecording = () => {
    if (recognition && !isRecording) {
      setTranscript('')
      recognition.start()
      setIsRecording(true)
    }
  }

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop()
      setIsRecording(false)
    }
  }

  if (!isSupported) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Speech Recognition Not Supported</h3>
          <p className="text-blue-200 mb-6">
            Your browser doesn't support speech recognition. Please use Chrome or Safari.
          </p>
          <div className="bg-white/20 rounded-lg p-4">
            <textarea
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value)
                onTextUpdate(e.target.value)
              }}
              placeholder="Type your pitch here..."
              className="w-full h-32 bg-transparent text-white placeholder-blue-300 resize-none outline-none"
            />
            <button
              onClick={() => onComplete(transcript)}
              className="mt-4 px-6 py-2 bg-judge-gold text-white rounded-lg hover:bg-yellow-500 transition-all"
            >
              Submit Pitch
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-4">Your Pitch</h3>
          <p className="text-blue-200 mb-6">
            Click the microphone to start recording your presentation
          </p>
        </div>

        {/* Recording Controls */}
        <div className="flex justify-center mb-6">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-105 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-judge-gold hover:bg-yellow-500'
            }`}
          >
            {isRecording ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
        </div>

        {/* Status Indicator */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 text-white">
            <Volume2 className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
            <span className="font-semibold">
              {isRecording ? 'Recording...' : 'Ready to record'}
            </span>
          </div>
        </div>

        {/* Transcript Display */}
        <div className="bg-white/20 rounded-lg p-4 min-h-32">
          <div className="text-white whitespace-pre-wrap">
            {transcript || 'Your speech will appear here...'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          {transcript && (
            <button
              onClick={() => onComplete(transcript)}
              className="px-8 py-3 bg-judge-gold text-white rounded-lg hover:bg-yellow-500 transition-all font-semibold"
            >
              Submit Pitch
            </button>
          )}
          
          {transcript && (
            <button
              onClick={() => {
                setTranscript('')
                onTextUpdate('')
              }}
              className="px-8 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
