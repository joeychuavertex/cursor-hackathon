'use client'

import { useState, useEffect } from 'react'
import { Judge } from '@/types/judge'
import { motion, AnimatePresence } from 'framer-motion'

interface JudgeAvatarProps {
  judge: Judge
  position: number
  reaction?: string
  onReactionTrigger: (judgeId: string, expression: string) => void
}

export default function JudgeAvatar({ judge, position, reaction, onReactionTrigger }: JudgeAvatarProps) {
  const [currentExpression, setCurrentExpression] = useState('neutral')
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (reaction) {
      setCurrentExpression(reaction)
      setIsAnimating(true)
      
      setTimeout(() => {
        setIsAnimating(false)
        setCurrentExpression('neutral')
      }, 3000)
    }
  }, [reaction])

  const getExpressionStyle = () => {
    const baseStyle = "judge-avatar bg-white rounded-xl p-4 shadow-2xl"
    
    if (isAnimating) {
      return `${baseStyle} micro-expression`
    }
    
    return baseStyle
  }

  const getExpressionEmoji = () => {
    switch (currentExpression) {
      case 'smile': return '😊'
      case 'frown': return '😟'
      case 'nod': return '👍'
      case 'raise_eyebrow': return '🤨'
      case 'intense_stare': return '👁️'
      case 'smirk': return '😏'
      case 'head_tilt': return '🤔'
      case 'lean_forward': return '👂'
      case 'stern_look': return '😠'
      case 'slight_smile': return '🙂'
      case 'shake_head': return '👎'
      case 'calculating_look': return '🧮'
      case 'excited_eyes': return '🤩'
      case 'thoughtful_touch': return '🤔'
      case 'warm_smile': return '😌'
      case 'concerned_look': return '😰'
      case 'intrigued_look': return '🤔'
      case 'protective_stance': return '🛡️'
      case 'encouraging_nod': return '👍'
      case 'analytical_focus': return '🔍'
      default: return '😐'
    }
  }

  const getPositionStyle = () => {
    const positions = [
      'transform -rotate-2', // Top left
      'transform rotate-1',   // Top right
      'transform rotate-2',   // Bottom left
      'transform -rotate-1',  // Bottom right
      'transform rotate-3'    // Center
    ]
    return positions[position % positions.length]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position * 0.2 }}
      className={`${getPositionStyle()} ${getExpressionStyle()}`}
    >
      <div className="text-center">
        {/* Avatar Placeholder - In real implementation, this would be a 3D model */}
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-judge-gold to-yellow-600 rounded-full flex items-center justify-center text-4xl">
          {getExpressionEmoji()}
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 mb-2">{judge.name}</h3>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{judge.personality.split(',')[0]}</p>
          
          <div className="flex flex-wrap justify-center gap-1">
            {judge.expertise.slice(0, 2).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Micro Expression Indicator */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mt-2 text-xs text-judge-gold font-semibold"
            >
              {judge.microExpressions.find(exp => exp.name.toLowerCase().includes(currentExpression))?.name || 'Reacting...'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
