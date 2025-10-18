'use client'

import { useState, useEffect, useRef } from 'react'
import { User, Bot, Clock } from 'lucide-react'

export interface TranscriptionEntry {
  id: string
  speaker: string
  speakerType: 'user' | 'avatar'
  content: string
  timestamp: Date
  isFinal: boolean
}

interface TranscriptionPanelProps {
  transcriptions: TranscriptionEntry[]
  className?: string
}

export default function TranscriptionPanel({ transcriptions, className = '' }: TranscriptionPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isAutoScroll, setIsAutoScroll] = useState(true)

  // Auto-scroll to bottom when new transcriptions arrive
  useEffect(() => {
    if (isAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [transcriptions, isAutoScroll])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
      setIsAutoScroll(isAtBottom)
    }
  }

  return (
    <div className={`bg-black/80 backdrop-blur-xl rounded-2xl border border-yellow-400/30 shadow-2xl shadow-yellow-400/10 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-yellow-400/20">
        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-300 mb-2">
          📝 LIVE TRANSCRIPTION
        </h3>
        <p className="text-cyan-300 text-sm font-semibold tracking-wide">
          Real-time conversation feed
        </p>
      </div>

      {/* Transcription List */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {transcriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-white/60 text-lg font-semibold mb-2">Waiting for conversation...</p>
            <p className="text-white/40 text-sm">Speech will appear here in real-time</p>
          </div>
        ) : (
          transcriptions.map((entry) => (
            <div
              key={entry.id}
              className={`group relative p-4 rounded-xl transition-all duration-300 ${
                entry.speakerType === 'user' 
                  ? 'bg-blue-500/20 border border-blue-500/30' 
                  : 'bg-yellow-500/20 border border-yellow-500/30'
              } ${!entry.isFinal ? 'opacity-70 animate-pulse' : ''}`}
            >
              {/* Speaker Header */}
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  entry.speakerType === 'user' 
                    ? 'bg-blue-500/30 text-blue-300' 
                    : 'bg-yellow-500/30 text-yellow-300'
                }`}>
                  {entry.speakerType === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg ${
                      entry.speakerType === 'user' ? 'text-blue-300' : 'text-yellow-300'
                    }`}>
                      {entry.speaker}
                    </span>
                    {!entry.isFinal && (
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full text-white/70 font-semibold">
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/50 font-mono">
                    {formatTime(entry.timestamp)}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="ml-11">
                <p className={`text-white leading-relaxed ${
                  !entry.isFinal ? 'italic' : ''
                }`}>
                  {entry.content}
                </p>
              </div>

              {/* Live indicator for interim results */}
              {!entry.isFinal && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-yellow-400/20 bg-black/40">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-white/60">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live transcription active</span>
          </div>
          
          {transcriptions.length > 0 && (
            <button
              onClick={() => setIsAutoScroll(!isAutoScroll)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                isAutoScroll 
                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30' 
                  : 'bg-white/10 text-white/70 border border-white/20'
              }`}
            >
              {isAutoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
