'use client'

import { useState } from 'react'
import LandingPage from '@/components/LandingPage'
import JudgeSelection from '@/components/JudgeSelection'
import SharkTankRoom from '@/components/SharkTankRoom'
import { Judge } from '@/types/judge'

export default function Home() {
  const [selectedJudges, setSelectedJudges] = useState<Judge[]>([])
  const [currentStep, setCurrentStep] = useState<'landing' | 'selection' | 'room'>('landing')

  const handleEnterTank = () => {
    setCurrentStep('selection')
  }

  const handleJudgeSelection = (judges: Judge[]) => {
    setSelectedJudges(judges)
    setCurrentStep('room')
  }

  const handleBackToSelection = () => {
    setCurrentStep('selection')
    setSelectedJudges([])
  }

  const handleBackToLanding = () => {
    setCurrentStep('landing')
    setSelectedJudges([])
  }

  return (
    <main className="min-h-screen">
      {currentStep === 'landing' ? (
        <LandingPage onEnter={handleEnterTank} />
      ) : currentStep === 'selection' ? (
        <JudgeSelection 
          onJudgesSelected={handleJudgeSelection}
          onBackToLanding={handleBackToLanding}
        />
      ) : (
        <SharkTankRoom 
          judges={selectedJudges} 
          onBackToSelection={handleBackToSelection}
        />
      )}
    </main>
  )
}
