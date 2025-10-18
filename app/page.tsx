'use client'

import { useState } from 'react'
import JudgeSelection from '@/components/JudgeSelection'
import SharkTankRoom from '@/components/SharkTankRoom'
import { Judge } from '@/types/judge'

export default function Home() {
  const [selectedJudges, setSelectedJudges] = useState<Judge[]>([])
  const [currentStep, setCurrentStep] = useState<'selection' | 'room'>('selection')

  const handleJudgeSelection = (judges: Judge[]) => {
    setSelectedJudges(judges)
    setCurrentStep('room')
  }

  const handleBackToSelection = () => {
    setCurrentStep('selection')
    setSelectedJudges([])
  }

  return (
    <main className="min-h-screen">
      {currentStep === 'selection' ? (
        <JudgeSelection onJudgesSelected={handleJudgeSelection} />
      ) : (
        <SharkTankRoom 
          judges={selectedJudges} 
          onBackToSelection={handleBackToSelection}
        />
      )}
    </main>
  )
}
