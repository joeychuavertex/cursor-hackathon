'use client'

import { useState, useEffect } from 'react'
import { Judge, Score } from '@/types/judge'
import { useGeminiAI } from '@/hooks/useGeminiAI'
import { Trophy, Star, TrendingUp, Users, DollarSign, Lightbulb } from 'lucide-react'

interface ScoringResultsProps {
  judges: Judge[]
  presentationText: string
  onNewPitch: () => void
}

export default function ScoringResults({ judges, presentationText, onNewPitch }: ScoringResultsProps) {
  const [scores, setScores] = useState<Score[]>([])
  const [isGenerating, setIsGenerating] = useState(true)
  const [overallScore, setOverallScore] = useState(0)
  const [winner, setWinner] = useState<Judge | null>(null)
  
  const { generateScores } = useGeminiAI()

  useEffect(() => {
    generateAllScores()
  }, [])

  const generateAllScores = async () => {
    setIsGenerating(true)
    try {
      const allScores: Score[] = []
      
      for (const judge of judges) {
        const score = await generateScores(presentationText, judge)
        allScores.push(score)
      }
      
      setScores(allScores)
      
      // Calculate overall score
      const totalScore = allScores.reduce((sum, score) => sum + score.totalScore, 0)
      const averageScore = totalScore / allScores.length
      setOverallScore(averageScore)
      
      // Find winner (highest scoring judge)
      const highestScore = Math.max(...allScores.map(s => s.totalScore))
      const winnerJudge = judges.find((_, index) => allScores[index].totalScore === highestScore)
      setWinner(winnerJudge || null)
      
    } catch (error) {
      console.error('Error generating scores:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400'
    if (score >= 6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBarColor = (score: number) => {
    if (score >= 8) return 'bg-green-400'
    if (score >= 6) return 'bg-yellow-400'
    return 'bg-red-400'
  }

  const getOverallRating = (score: number) => {
    if (score >= 8) return { text: 'Outstanding!', color: 'text-green-400' }
    if (score >= 6) return { text: 'Good Pitch', color: 'text-yellow-400' }
    if (score >= 4) return { text: 'Needs Work', color: 'text-orange-400' }
    return { text: 'Keep Practicing', color: 'text-red-400' }
  }

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center">
          <div className="animate-spin w-16 h-16 border-4 border-judge-gold border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-white mb-4">Judges are Scoring...</h2>
          <p className="text-xl text-blue-200">Analyzing your pitch and preparing detailed feedback</p>
        </div>
      </div>
    )
  }

  const rating = getOverallRating(overallScore)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Overall Results */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Trophy className="w-12 h-12 text-judge-gold" />
          <h2 className="text-4xl font-bold text-white">Results Are In!</h2>
        </div>
        
        <div className="mb-8">
          <div className={`text-6xl font-bold ${rating.color} mb-4`}>
            {overallScore.toFixed(1)}/10
          </div>
          <div className={`text-2xl font-semibold ${rating.color}`}>
            {rating.text}
          </div>
        </div>

        {winner && (
          <div className="bg-judge-gold/20 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Top Judge</h3>
            <p className="text-lg text-blue-200">{winner.name}</p>
            <p className="text-sm text-blue-300">{winner.personality}</p>
          </div>
        )}

        <button
          onClick={onNewPitch}
          className="px-8 py-4 bg-judge-gold text-white text-xl font-bold rounded-xl hover:bg-yellow-500 transform hover:scale-105 transition-all shadow-2xl"
        >
          Pitch Again
        </button>
      </div>

      {/* Individual Judge Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scores.map((score, index) => {
          const judge = judges[index]
          return (
            <div key={judge.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-judge-gold rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                  {judge.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{judge.name}</h3>
                <div className={`text-3xl font-bold ${getScoreColor(score.totalScore)}`}>
                  {score.totalScore.toFixed(1)}/10
                </div>
              </div>

              {/* Detailed Scores */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-300" />
                    <span className="text-white text-sm">Innovation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-white/20 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getScoreBarColor(score.scores.innovation * 10)}`}
                        style={{ width: `${score.scores.innovation * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold ${getScoreColor(score.scores.innovation * 10)}`}>
                      {(score.scores.innovation * 10).toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-300" />
                    <span className="text-white text-sm">Market Potential</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-white/20 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getScoreBarColor(score.scores.marketPotential * 10)}`}
                        style={{ width: `${score.scores.marketPotential * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold ${getScoreColor(score.scores.marketPotential * 10)}`}>
                      {(score.scores.marketPotential * 10).toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-300" />
                    <span className="text-white text-sm">Team</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-white/20 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getScoreBarColor(score.scores.team * 10)}`}
                        style={{ width: `${score.scores.team * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold ${getScoreColor(score.scores.team * 10)}`}>
                      {(score.scores.team * 10).toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-300" />
                    <span className="text-white text-sm">Financials</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-white/20 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getScoreBarColor(score.scores.financials * 10)}`}
                        style={{ width: `${score.scores.financials * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold ${getScoreColor(score.scores.financials * 10)}`}>
                      {(score.scores.financials * 10).toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-300" />
                    <span className="text-white text-sm">Presentation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-white/20 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getScoreBarColor(score.scores.presentation * 10)}`}
                        style={{ width: `${score.scores.presentation * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold ${getScoreColor(score.scores.presentation * 10)}`}>
                      {(score.scores.presentation * 10).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Feedback:</h4>
                <p className="text-blue-200 text-sm leading-relaxed">
                  {score.feedback}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
