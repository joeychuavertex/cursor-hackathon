'use client'

import { useState } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import LandingPage from '@/components/LandingPage'
import JudgeSelection from '@/components/JudgeSelection'
import SharkTankRoom from '@/components/SharkTankRoom'
import PerformanceDashboard from '@/components/PerformanceDashboard'
import GlobalBackgroundMusic from '@/components/GlobalBackgroundMusic'
import { Judge } from '@/types/judge'

export default function Home() {
  const [selectedJudges, setSelectedJudges] = useState<Judge[]>([])
  const [currentStep, setCurrentStep] = useState<'landing' | 'selection' | 'room' | 'dashboard'>('landing')

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

  const handlePresentationComplete = () => {
    setCurrentStep('dashboard')
  }

  return (
    <AuthProvider>
      <main className="min-h-screen">
        {currentStep === 'landing' ? (
          <LandingPage onEnter={handleEnterTank} />
        ) : currentStep === 'selection' ? (
          <JudgeSelection 
            onJudgesSelected={handleJudgeSelection}
            onBackToLanding={handleBackToLanding}
          />
        ) : currentStep === 'room' ? (
          <SharkTankRoom 
            judges={selectedJudges} 
            onBackToSelection={handleBackToSelection}
            onPresentationComplete={handlePresentationComplete}
          />
        ) : (
          <PerformanceDashboard 
            judges={selectedJudges}
            onBackToLanding={handleBackToLanding}
          />
        )}
        
        {/* Global Background Music Control */}
        <GlobalBackgroundMusic currentStep={currentStep} />
      </main>
    </AuthProvider>
  )
}
