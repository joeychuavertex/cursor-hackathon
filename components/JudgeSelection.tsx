'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Judge } from '@/types/judge'
import { useJudges } from '@/hooks/useJudges'
import { Check, Users, Star, Brain, DollarSign, ArrowLeft, Crown, Zap, Loader2, AlertCircle } from 'lucide-react'

interface JudgeSelectionProps {
  onJudgesSelected: (judges: Judge[]) => void
  onBackToLanding?: () => void
}

export default function JudgeSelection({ onJudgesSelected, onBackToLanding }: JudgeSelectionProps) {
  const [selectedJudges, setSelectedJudges] = useState<Judge[]>([])
  const { judges, loading, error, refetch } = useJudges()

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
    if (selectedJudges.length >= 1) {
      onJudgesSelected(selectedJudges)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Theatrical Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      
      {/* Floating particles */}
      {Array.from({ length: 15 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          {onBackToLanding && (
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <button
                onClick={onBackToLanding}
                className="flex items-center gap-2 px-6 py-3 bg-black/60 backdrop-blur-xl rounded-lg text-cyan-300 hover:bg-black/80 hover:text-cyan-200 transition-all duration-300 border border-cyan-400/30 hover:border-cyan-400/60"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Landing
              </button>
            </motion.div>
          )}
          
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <motion.h1 
              className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 mb-6 drop-shadow-2xl"
              animate={{ 
                textShadow: [
                  "0 0 20px rgba(251, 191, 36, 0.5)",
                  "0 0 40px rgba(251, 191, 36, 0.8)",
                  "0 0 20px rgba(251, 191, 36, 0.5)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🦈 SHARK TANK
            </motion.h1>
            <motion.p 
              className="text-3xl text-cyan-300 drop-shadow-lg font-light tracking-wider mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              CHOOSE YOUR JUDGES
            </motion.p>
            
            <motion.div 
              className="flex items-center justify-center gap-8 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
            >
              <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl rounded-lg px-6 py-3 border border-yellow-400/30">
                <Users className="w-6 h-6 text-yellow-400" />
                <span className="text-yellow-300 font-semibold">{selectedJudges.length}/5 judges selected</span>
              </div>
              <div className="w-px h-8 bg-cyan-400/50"></div>
              <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl rounded-lg px-6 py-3 border border-cyan-400/30">
                <Star className="w-6 h-6 text-cyan-400" />
                <span className="text-cyan-300 font-semibold">Minimum 1 judge required</span>
              </div>
            </motion.div>
          </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div 
            className="flex flex-col items-center justify-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1 }}
          >
            <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mb-4" />
            <p className="text-cyan-300 text-lg">Loading judges...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div 
            className="flex flex-col items-center justify-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1 }}
          >
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-red-300 text-lg mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Judges Grid */}
        {!loading && !error && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 1 }}
          >
            {judges.map((judge, index) => {
              const isSelected = selectedJudges.find(j => j.id === judge.id)
              return (
                <motion.div
                  key={judge.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 2 + index * 0.1, duration: 0.6 }}
                  onClick={() => toggleJudge(judge)}
                  className={`relative cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                    isSelected ? 'ring-4 ring-yellow-400 shadow-2xl shadow-yellow-400/50' : 'hover:ring-2 hover:ring-cyan-400 hover:shadow-xl hover:shadow-cyan-400/30'
                  }`}
                >
                  <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 hover:border-yellow-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-300">{judge.name}</h3>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
                        >
                          <Check className="w-5 h-5 text-black" />
                        </motion.div>
                      )}
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-cyan-200 text-sm mb-3 font-medium">{judge.personality}</p>
                      <div className="flex flex-wrap gap-2">
                        {judge.expertise.map((skill: string, skillIndex: number) => (
                          <span
                            key={skillIndex}
                            className="px-3 py-1 bg-cyan-400/20 text-cyan-300 text-xs rounded-full border border-cyan-400/30"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-cyan-200">
                        <Brain className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex items-center gap-3 text-sm text-cyan-200">
                        <DollarSign className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium">Style: {judge.investmentStyle || judge.personality.split(',')[0]}</span>
                      </div>
                      {judge.causes && judge.causes.length > 0 && (
                        <div className="flex items-center gap-3 text-sm text-cyan-200">
                          <Star className="w-4 h-4 text-purple-400" />
                          <span className="font-medium">Causes: {judge.causes.slice(0, 2).join(', ')}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Selection indicator */}
                    {isSelected && (
                      <motion.div
                        className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <Crown className="w-3 h-3 text-black" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          <motion.button
            onClick={handleStart}
            disabled={selectedJudges.length < 1}
            className={`px-16 py-6 text-2xl font-bold rounded-2xl transition-all duration-300 flex items-center gap-4 mx-auto ${
              selectedJudges.length >= 1
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 transform hover:scale-105 shadow-2xl shadow-yellow-400/50 border-2 border-yellow-300'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed border-2 border-gray-500'
            }`}
            whileHover={selectedJudges.length >= 1 ? { scale: 1.05 } : {}}
            whileTap={selectedJudges.length >= 1 ? { scale: 0.95 } : {}}
          >
            {selectedJudges.length >= 1 ? (
              <>
                <Zap className="w-6 h-6" />
                <span>ENTER THE TANK WITH {selectedJudges.length} JUDGE{selectedJudges.length > 1 ? 'S' : ''}!</span>
                <Zap className="w-6 h-6" />
              </>
            ) : (
              <>
                <Star className="w-6 h-6" />
                <span>SELECT AT LEAST 1 JUDGE TO CONTINUE</span>
                <Star className="w-6 h-6" />
              </>
            )}
          </motion.button>
          
          {selectedJudges.length >= 1 && (
            <motion.p
              className="mt-6 text-lg text-cyan-300 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
            >
              The sharks are waiting for your pitch...
            </motion.p>
          )}
        </motion.div>
        </div>
      </div>
    </div>
  )
}
