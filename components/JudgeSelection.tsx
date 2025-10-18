'use client'

import { Judge } from '@/types/judge'
import { JUDGES } from '@/lib/config'
import ThreeJSJudgeGallery from './ThreeJSJudgeGallery'

interface JudgeSelectionProps {
  onJudgesSelected: (judges: Judge[]) => void
  onBackToLanding?: () => void
}

export default function JudgeSelection({ onJudgesSelected, onBackToLanding }: JudgeSelectionProps) {
  return (
    <ThreeJSJudgeGallery 
      judges={JUDGES}
      onJudgesSelected={onJudgesSelected}
      onBackToLanding={onBackToLanding}
    />
  )
}
