'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Judge } from '@/types/judge'
import { useJudges } from '@/hooks/useJudges'
import { Check, Users, Star, Brain, DollarSign, ArrowLeft, Crown, Zap, Loader2, AlertCircle, LogIn } from 'lucide-react'
import AuthModal from './AuthModal'

interface JudgeSelectionProps {
  onJudgesSelected: (judges: Judge[]) => void
  onBackToLanding?: () => void
}

export default function JudgeSelection({ onJudgesSelected, onBackToLanding }: JudgeSelectionProps) {
  const [selectedJudges, setSelectedJudges] = useState<Judge[]>([])
  const { judges, loading, error, refetch } = useJudges()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const { user, loading: pageloading, signIn, signUp, resetPassword } = useAuth()
  const [conversationId, setConversationId] = useState<string | null>(null)

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

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'

  // Utility function to get access token from localStorage
  const getAccessTokenFromStorage = () => {
    // Check all possible localStorage keys for Supabase session
    const possibleKeys = [
      'supabase.auth.token',
      'supabase.auth.session',
      'sb-auth-token'
    ]

    for (const key of possibleKeys) {
      const stored = localStorage.getItem(key)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (parsed.access_token) {
            console.log(`Found token in localStorage key: ${key}`)
            return parsed.access_token
          }
        } catch (e) {
          console.log(`Failed to parse localStorage key: ${key}`, e)
        }
      }
    }

    // Check for any key that contains 'supabase' and 'auth'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes('supabase') && key.includes('auth')) {
        const stored = localStorage.getItem(key)
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            if (parsed.access_token) {
              console.log(`Found token in localStorage key: ${key}`)
              return parsed.access_token
            }
          } catch (e) {
            console.log(`Failed to parse localStorage key: ${key}`, e)
          }
        }
      }
    }

    return null
  }

  const handleStart = async () => {
    console.log('handleStart called - loading:', loading, 'user:', user)
    if (loading) return
    if (!user) {
      console.error('User not authenticated - user:', user)
      alert('Please sign in first to select judges')
      return
    }

    if (selectedJudges.length == 1) {
      try {
        // Try to get session from Supabase first
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        console.log('Session from Supabase:', { session, error })

        let accessToken = null

        if (session && session.access_token) {
          accessToken = session.access_token
          console.log('Using token from Supabase session')
        } else {
          // Fallback: try to get token from localStorage
          console.log('No session from Supabase, checking localStorage...')
          accessToken = getAccessTokenFromStorage()
        }

        if (!accessToken) {
          console.error('No access token found in session or localStorage')
          console.log('Available localStorage keys:', Object.keys(localStorage))
          alert('Authentication token not found. Please sign in again.')
          return
        }

        const selectedJudge = selectedJudges[0].id
        console.log('Selected judge:', selectedJudge)
        
        const response = await fetch(`${backendUrl}/judges/select`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ judge : selectedJudge }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Failed to select judge:', response.status, errorData)
          throw new Error(`Failed to select judge: ${errorData.detail || response.statusText}`)
        }

        const data = await response.json()
        const conversationId = data.conversation_id

        if (conversationId) {
          // Store in localStorage (or another storage mechanism)
          localStorage.setItem('conversationId', conversationId)
          console.log('Conversation ID stored:', conversationId)

          // Continue your logic
          onJudgesSelected(selectedJudges)
        } else {
          console.error('Conversation ID missing from response:', data)
          throw new Error('No conversation ID returned from server')
        }
        console.log('Judges successfully sent:', data)

      } catch (error) {
        console.error('Error selecting judge:', error)
        // You might want to show an error message to the user here
        alert(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
      }
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
            
            {/* Debug info */}
            <motion.div 
              className="text-sm text-yellow-300 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
            >
              {user ? (
                <div className="space-y-2">
                  {/* <div>✅ Authenticated as: {user.email}</div>
                  <div className="text-xs text-cyan-300">
                    Token available: {getAccessTokenFromStorage() ? '✅ Yes' : '❌ No'}
                  </div>
                  <div className="text-xs text-cyan-300">
                    localStorage keys: {Object.keys(localStorage).filter(k => k.includes('supabase')).length} supabase keys
                  </div> */}
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {/* <span>❌ Not authenticated - Please sign in first</span>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </button> */}
                </div>
              )}
            </motion.div>
            
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
              selectedJudges.length == 1
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 transform hover:scale-105 shadow-2xl shadow-yellow-400/50 border-2 border-yellow-300'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed border-2 border-gray-500'
            }`}
            whileHover={selectedJudges.length == 1 ? { scale: 1.05 } : {}}
            whileTap={selectedJudges.length == 1 ? { scale: 0.95 } : {}}
          >
            {selectedJudges.length == 1 ? (
              <>
                <Zap className="w-5 h-5" />
                <span>ENTER THE TANK WITH {selectedJudges.length} JUDGE{selectedJudges.length > 1 ? 'S' : ''}!</span>
                <Zap className="w-5 h-5" />
              </>
            ) : (
              <>
                <Star className="w-5 h-5" />
                <span>Start Pitching!</span>
                <Star className="w-5 h-5" />
              </>
            )}
          </motion.button>
          
          {selectedJudges.length == 1 && (
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
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        defaultMode="signin"
      />
    </div>
  )
}
