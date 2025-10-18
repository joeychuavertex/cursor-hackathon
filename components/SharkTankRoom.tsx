'use client'

import { useState, useEffect, useRef } from 'react'
import { Judge } from '@/types/judge'
import { PRESENTATION_DURATION } from '@/lib/config'
import ThreeJSRoom from './ThreeJSRoom'
import ThreeJSJudge from './ThreeJSJudge'
import ThreeJSPodium from './ThreeJSPodium'
import PresentationTimer from './PresentationTimer'
import SpeechRecognition from './SpeechRecognition'
import QuestionSession from './QuestionSession'
import ScoringResults from './ScoringResults'
import { ArrowLeft, Mic, MicOff } from 'lucide-react'

interface SharkTankRoomProps {
  judges: Judge[]
  onBackToSelection: () => void
}

type RoomPhase = 'preparation' | 'presentation' | 'questions' | 'scoring' | 'results'

export default function SharkTankRoom({ judges, onBackToSelection }: SharkTankRoomProps) {
  const [currentPhase, setCurrentPhase] = useState<RoomPhase>('preparation')
  const [presentationText, setPresentationText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(PRESENTATION_DURATION)
  const [judgeReactions, setJudgeReactions] = useState<{[key: string]: string}>({})
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)

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
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [currentPhase, timeRemaining])

  const startPresentation = () => {
    setCurrentPhase('presentation')
    setTimeRemaining(PRESENTATION_DURATION)
  }

  const handlePresentationComplete = (text: string) => {
    setPresentationText(text)
    setCurrentPhase('questions')
  }

  const handleQuestionsComplete = () => {
    setCurrentPhase('scoring')
  }

  const handleScoringComplete = () => {
    setCurrentPhase('results')
  }

  const triggerJudgeReaction = (judgeId: string, expression: string) => {
    setJudgeReactions(prev => ({
      ...prev,
      [judgeId]: expression
    }))
    
    // Clear reaction after animation
    setTimeout(() => {
      setJudgeReactions(prev => {
        const newReactions = { ...prev }
        delete newReactions[judgeId]
        return newReactions
      })
    }, 3000)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Room */}
      <div className="absolute inset-0">
        <ThreeJSRoom 
          judges={judges}
          onJudgeClick={(judge) => triggerJudgeReaction(judge.id, 'intrigued_look')}
          currentPhase={currentPhase}
        />
      </div>

      {/* Overlay UI */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Header */}
        <div className="p-6 pointer-events-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBackToSelection}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-lg text-white rounded-lg hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Selection
            </button>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">The Tank</h1>
              <p className="text-blue-200 drop-shadow-lg">
                {currentPhase === 'preparation' && 'Prepare your pitch...'}
                {currentPhase === 'presentation' && 'Present your idea!'}
                {currentPhase === 'questions' && 'Answer the judges\' questions'}
                {currentPhase === 'scoring' && 'Judges are scoring...'}
                {currentPhase === 'results' && 'Results are in!'}
              </p>
            </div>

            <div className="w-32"></div>
          </div>
        </div>

        {/* Main Content Overlay */}
        <div className="px-6 pb-6 pointer-events-auto">
          {currentPhase === 'preparation' && (
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-6">Ready to Pitch?</h2>
                <p className="text-xl text-blue-200 mb-8">
                  You have {PRESENTATION_DURATION} seconds to present your idea to the judges.
                  Make it count!
                </p>
                <button
                  onClick={startPresentation}
                  className="px-8 py-4 bg-judge-gold text-white text-xl font-bold rounded-xl hover:bg-yellow-500 transform hover:scale-105 transition-all shadow-2xl"
                >
                  Start Presentation
                </button>
              </div>
            </div>
          )}

          {currentPhase === 'presentation' && (
            <div className="space-y-8">
              {/* Speech Recognition */}
              <SpeechRecognition
                onTextUpdate={setPresentationText}
                onComplete={handlePresentationComplete}
                isRecording={isRecording}
                setIsRecording={setIsRecording}
              />
            </div>
          )}

          {currentPhase === 'questions' && (
            <QuestionSession
              judges={judges}
              presentationText={presentationText}
              onComplete={handleQuestionsComplete}
            />
          )}

          {currentPhase === 'scoring' && (
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-6">Judges are Deliberating...</h2>
                <p className="text-xl text-blue-200 mb-8">
                  The judges are analyzing your pitch and preparing their scores.
                </p>
                <div className="animate-spin w-16 h-16 border-4 border-judge-gold border-t-transparent rounded-full mx-auto"></div>
              </div>
            </div>
          )}

          {currentPhase === 'results' && (
            <ScoringResults
              judges={judges}
              presentationText={presentationText}
              onNewPitch={onBackToSelection}
            />
          )}
        </div>
      </div>
    </div>
  )
}
