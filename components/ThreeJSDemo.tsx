'use client'

import { useState } from 'react'
import { JUDGES } from '@/lib/config'
import ThreeJSRoom from './ThreeJSRoom'

export default function ThreeJSDemo() {
  const [selectedJudges, setSelectedJudges] = useState(JUDGES.slice(0, 3))
  const [currentPhase, setCurrentPhase] = useState<'preparation' | 'presentation' | 'questions' | 'scoring' | 'results'>('preparation')

  const phases = [
    { key: 'preparation', label: 'Preparation', description: 'Get ready to pitch' },
    { key: 'presentation', label: 'Presentation', description: 'Present your idea' },
    { key: 'questions', label: 'Q&A', description: 'Answer questions' },
    { key: 'scoring', label: 'Scoring', description: 'Judges evaluate' },
    { key: 'results', label: 'Results', description: 'See your scores' }
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800">
      {/* 3D Room */}
      <div className="absolute inset-0">
        <ThreeJSRoom 
          judges={selectedJudges}
          currentPhase={currentPhase}
          onJudgeClick={(judge) => {
            console.log('Judge clicked:', judge.name)
          }}
        />
      </div>

      {/* Demo Controls Overlay */}
      <div className="absolute top-4 left-4 z-20 space-y-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
          <h3 className="text-white font-bold mb-2">3D Shark Tank Demo</h3>
          <p className="text-blue-200 text-sm mb-4">
            Experience the immersive 3D Shark Tank environment with realistic judge avatars and micro expressions.
          </p>
          
          {/* Phase Selector */}
          <div className="space-y-2">
            <label className="text-white text-sm font-semibold">Current Phase:</label>
            <select 
              value={currentPhase}
              onChange={(e) => setCurrentPhase(e.target.value as any)}
              className="w-full p-2 rounded bg-white/20 text-white border border-white/30"
            >
              {phases.map(phase => (
                <option key={phase.key} value={phase.key} className="bg-gray-800">
                  {phase.label} - {phase.description}
                </option>
              ))}
            </select>
          </div>

          {/* Judge Count Selector */}
          <div className="space-y-2 mt-4">
            <label className="text-white text-sm font-semibold">Number of Judges:</label>
            <select 
              value={selectedJudges.length}
              onChange={(e) => setSelectedJudges(JUDGES.slice(0, parseInt(e.target.value)))}
              className="w-full p-2 rounded bg-white/20 text-white border border-white/30"
            >
              {[2, 3, 4, 5].map(count => (
                <option key={count} value={count} className="bg-gray-800">
                  {count} Judges
                </option>
              ))}
            </select>
          </div>

          {/* Features List */}
          <div className="mt-4 space-y-1">
            <h4 className="text-white text-sm font-semibold">3D Features:</h4>
            <ul className="text-blue-200 text-xs space-y-1">
              <li>• Realistic 3D judge avatars</li>
              <li>• Micro expressions and animations</li>
              <li>• Interactive 3D environment</li>
              <li>• Dynamic lighting and shadows</li>
              <li>• Camera controls (drag to rotate)</li>
              <li>• Immersive presentation podium</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 text-center">
          <p className="text-white text-sm">
            <strong>Controls:</strong> Drag to rotate camera • Scroll to zoom • Click judges to interact
          </p>
        </div>
      </div>
    </div>
  )
}
