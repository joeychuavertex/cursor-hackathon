'use client'

import { useState } from 'react'
import { Judge } from '@/types/judge'
import { JUDGES } from '@/lib/config'
import { Check, Users, Star, Brain, DollarSign, ArrowLeft } from 'lucide-react'

interface JudgeSelectionProps {
  onJudgesSelected: (judges: Judge[]) => void
  onBackToLanding?: () => void
}

export default function JudgeSelection({ onJudgesSelected, onBackToLanding }: JudgeSelectionProps) {
  const [selectedJudges, setSelectedJudges] = useState<Judge[]>([])

  const toggleJudge = (judge: Judge) => {
    setSelectedJudges(prev => {
      if (prev.find(j => j.id === judge.id)) {
        return prev.filter(j => j.id !== judge.id)
      } else if (prev.length < 5) {
        return [...prev, judge]
      }
      return prev
    })
  }

  const handleStart = () => {
    if (selectedJudges.length >= 2) {
      onJudgesSelected(selectedJudges)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        {onBackToLanding && (
          <div className="mb-6">
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg text-white hover:bg-white/20 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Landing
            </button>
          </div>
        )}
        
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            🦈 Shark Tank Simulator
          </h1>
          <p className="text-xl text-blue-200 mb-8">
            Choose your judges and prepare to pitch your idea!
          </p>
          <div className="flex items-center justify-center gap-4 text-lg text-blue-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{selectedJudges.length}/5 judges selected</span>
            </div>
            <div className="text-2xl">•</div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>Minimum 2 judges required</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {JUDGES.map((judge) => {
            const isSelected = selectedJudges.find(j => j.id === judge.id)
            return (
              <div
                key={judge.id}
                onClick={() => toggleJudge(judge)}
                className={`relative cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                  isSelected ? 'ring-4 ring-judge-gold' : 'hover:ring-2 hover:ring-blue-300'
                }`}
              >
                <div className="bg-white rounded-xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{judge.name}</h3>
                    {isSelected && (
                      <Check className="w-6 h-6 text-judge-gold" />
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm mb-2">{judge.personality}</p>
                    <div className="flex flex-wrap gap-1">
                      {judge.expertise.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Brain className="w-4 h-4" />
                      <span>Focus: {judge.scoringCriteria.financials > 0.3 ? 'Financials' : 
                                   judge.scoringCriteria.innovation > 0.3 ? 'Innovation' : 
                                   judge.scoringCriteria.marketPotential > 0.3 ? 'Market' : 'Team'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>Investment Style: {judge.personality.split(',')[0]}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center">
          <button
            onClick={handleStart}
            disabled={selectedJudges.length < 2}
            className={`px-12 py-4 text-xl font-bold rounded-xl transition-all duration-300 ${
              selectedJudges.length >= 2
                ? 'bg-judge-gold text-white hover:bg-yellow-500 transform hover:scale-105 shadow-2xl'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            {selectedJudges.length >= 2 
              ? `Enter the Tank with ${selectedJudges.length} Judges!` 
              : 'Select at least 2 judges to continue'
            }
          </button>
        </div>
      </div>
    </div>
  )
}
