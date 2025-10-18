'use client'

import PresentationPage from './PresentationPage'
import { Judge } from '../types/judge'

interface SharkTankRoomProps {
  judges: Judge[]
  onBackToSelection: () => void
  onPresentationComplete: () => void
}

export default function SharkTankRoom({ judges, onBackToSelection, onPresentationComplete }: SharkTankRoomProps) {
  // Go directly to presentation page
  return (
    <PresentationPage 
      judges={judges} 
      onBackToSelection={onBackToSelection}
      onPresentationComplete={onPresentationComplete}
    />
  )
}