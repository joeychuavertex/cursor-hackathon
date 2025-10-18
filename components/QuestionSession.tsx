'use client'

import { useState, useEffect } from 'react'
import { Judge } from '@/types/judge'
import { Question } from '@/types/session'
import { useGeminiAI } from '@/hooks/useGeminiAI'
import { useElevenLabs } from '@/hooks/useElevenLabs'
import { MessageCircle, Volume2, Clock } from 'lucide-react'

interface QuestionSessionProps {
  judges: Judge[]
  presentationText: string
  onComplete: () => void
  onSpeakQuestion?: (judgeId: string, text: string) => void
}

export default function QuestionSession({ judges, presentationText, onComplete, onSpeakQuestion }: QuestionSessionProps) {
  const [currentJudgeIndex, setCurrentJudgeIndex] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<{[key: string]: string}>({})
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  
  const { generateQuestion } = useGeminiAI()
  const { synthesizeSpeech, playAudio } = useElevenLabs()

  const currentJudge = judges[currentJudgeIndex]

  useEffect(() => {
    if (currentJudge && questions.length === 0) {
      generateNextQuestion()
    }
  }, [currentJudge])

  const generateNextQuestion = async () => {
    if (!currentJudge) return

    setIsGeneratingQuestion(true)
    try {
      const questionText = await generateQuestion(
        presentationText,
        currentJudge,
        questions.filter(q => q.judgeId === currentJudge.id)
      )
      
      const newQuestion: Question = {
        id: `q_${Date.now()}`,
        sessionId: 'current_session', // This would be passed as a prop in a real implementation
        judgeId: currentJudge.id,
        text: questionText,
        timestamp: Date.now(),
        answered: false
      }
      
      setQuestions(prev => [...prev, newQuestion])
      setCurrentQuestion(newQuestion)
      
      // Generate and play audio
      if (currentJudge.isHeyGenAvatar && onSpeakQuestion) {
        // Use HeyGen avatar for speaking
        onSpeakQuestion(currentJudge.id, questionText)
      } else {
        // Use ElevenLabs for non-HeyGen judges
        const audioUrl = await synthesizeSpeech(questionText, currentJudge.voiceId)
        if (audioUrl) {
          setIsPlayingAudio(true)
          await playAudio(audioUrl)
          setIsPlayingAudio(false)
        }
      }
    } catch (error) {
      console.error('Error generating question:', error)
    } finally {
      setIsGeneratingQuestion(false)
    }
  }

  const handleAnswerSubmit = (answer: string) => {
    if (!currentQuestion) return

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }))

    setQuestions(prev => 
      prev.map(q => 
        q.id === currentQuestion.id 
          ? { ...q, answered: true }
          : q
      )
    )

    // Move to next judge or complete session
    if (currentJudgeIndex < judges.length - 1) {
      setCurrentJudgeIndex(prev => prev + 1)
      setCurrentQuestion(null)
      setQuestions([]) // Reset for next judge
    } else {
      onComplete()
    }
  }

  const playQuestionAudio = async () => {
    if (!currentQuestion) return

    setIsPlayingAudio(true)
    try {
      if (currentJudge.isHeyGenAvatar && onSpeakQuestion) {
        // Use HeyGen avatar for speaking
        onSpeakQuestion(currentJudge.id, currentQuestion.text)
      } else {
        // Use ElevenLabs for non-HeyGen judges
        const audioUrl = await synthesizeSpeech(currentQuestion.text, currentJudge.voiceId)
        if (audioUrl) {
          await playAudio(audioUrl)
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error)
    } finally {
      setIsPlayingAudio(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Q&A Session</h2>
          <div className="flex items-center justify-center gap-4 text-blue-200">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span>Judge {currentJudgeIndex + 1} of {judges.length}</span>
            </div>
            <div className="text-2xl">•</div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{currentJudge?.name}</span>
            </div>
          </div>
        </div>

        {/* Current Judge Info */}
        <div className="bg-white/20 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-judge-gold rounded-full flex items-center justify-center text-2xl">
              {currentJudge?.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{currentJudge?.name}</h3>
              <p className="text-blue-200">{currentJudge?.personality}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {currentJudge?.expertise.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Question Display */}
        {isGeneratingQuestion ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-judge-gold border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white text-lg">Generating question...</p>
          </div>
        ) : currentQuestion ? (
          <div className="space-y-6">
            <div className="bg-white/20 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Question:</h4>
                <button
                  onClick={playQuestionAudio}
                  disabled={isPlayingAudio}
                  className="flex items-center gap-2 px-4 py-2 bg-judge-gold text-white rounded-lg hover:bg-yellow-500 transition-all disabled:opacity-50"
                >
                  <Volume2 className="w-4 h-4" />
                  {isPlayingAudio ? 'Playing...' : 'Play Audio'}
                </button>
              </div>
              <p className="text-white text-lg leading-relaxed">
                "{currentQuestion.text}"
              </p>
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              <label className="block text-white font-semibold">
                Your Answer:
              </label>
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => setAnswers(prev => ({
                  ...prev,
                  [currentQuestion.id]: e.target.value
                }))}
                placeholder="Type your answer here..."
                className="w-full h-32 bg-white/20 text-white placeholder-blue-300 rounded-lg p-4 resize-none outline-none focus:ring-2 focus:ring-judge-gold"
              />
              <button
                onClick={() => handleAnswerSubmit(answers[currentQuestion.id] || '')}
                disabled={!answers[currentQuestion.id]?.trim()}
                className="w-full px-6 py-3 bg-judge-gold text-white rounded-lg hover:bg-yellow-500 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            </div>
          </div>
        ) : null}

        {/* Progress */}
        <div className="mt-8">
          <div className="flex justify-between text-sm text-blue-200 mb-2">
            <span>Progress</span>
            <span>{currentJudgeIndex + 1} / {judges.length} judges</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-judge-gold h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentJudgeIndex + 1) / judges.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
