'use client'

import { useState } from 'react'
import PresentationPage from './PresentationPage'
import { Judge } from '../types/judge'

interface SharkTankRoomProps {
  judges: Judge[]
  onBackToSelection: () => void
}

export default function SharkTankRoom({ judges, onBackToSelection }: SharkTankRoomProps) {
  const [showPresentation, setShowPresentation] = useState(false)

  const startPresentation = () => {
    console.log('🚀 ENTERING THE TANK - Navigating to presentation page')
    setShowPresentation(true)
  }

  // If presentation is active, show the presentation page
  if (showPresentation) {
    return (
      <PresentationPage 
        judges={judges} 
        onBackToSelection={onBackToSelection}
      />
    )
  }

  // Otherwise show the preparation screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
      <div className="text-center animate-fadeIn">
        <div className="bg-gradient-to-br from-blue-900/90 to-purple-900/90 backdrop-blur-xl rounded-3xl p-16 max-w-4xl mx-auto shadow-2xl border border-white/20 animate-slideUp">
          <div className="mb-8">
            <div className="text-6xl mb-4">🦈</div>
            <h2 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
              Ready to Face the Sharks?
            </h2>
          </div>
          <p className="text-2xl text-blue-100 mb-4">
            You have 60 seconds to convince the judges.
          </p>
          <p className="text-lg text-blue-200/80 mb-12">
            The panel is waiting. Make your pitch count!
          </p>
          
          <button
            onClick={startPresentation}
            className="group px-12 py-6 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 text-2xl font-bold rounded-2xl hover:from-yellow-300 hover:to-yellow-500 transform hover:scale-110 transition-all duration-300 shadow-2xl"
          >
            <span className="flex items-center gap-3">
              Enter The Tank
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}