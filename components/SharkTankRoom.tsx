'use client'

import PresentationPage from './PresentationPage'
import { Judge } from '../types/judge'

interface SharkTankRoomProps {
  judges: Judge[]
  onBackToSelection: () => void
}

export default function SharkTankRoom({ judges, onBackToSelection }: SharkTankRoomProps) {
  return (
    <PresentationPage 
      judges={judges} 
      onBackToSelection={onBackToSelection}
    />
  )
}