'use client'

interface PresentationTimerProps {
  timeRemaining: number
  totalTime: number
}

export default function PresentationTimer({ timeRemaining, totalTime }: PresentationTimerProps) {
  const progress = ((totalTime - timeRemaining) / totalTime) * 100
  const isWarning = timeRemaining <= 10
  const isCritical = timeRemaining <= 5

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6">
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-white mb-2">Presentation Timer</h3>
          <div className={`text-4xl font-mono font-bold ${
            isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-white'
          }`}>
            {timeRemaining}
          </div>
          <p className="text-blue-200 text-sm">seconds remaining</p>
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-4 mb-2">
          <div
            className={`h-4 rounded-full transition-all duration-1000 ${
              isCritical ? 'bg-red-400' : isWarning ? 'bg-yellow-400' : 'bg-judge-gold'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-blue-200">
          <span>0s</span>
          <span className={isWarning ? 'text-yellow-400' : 'text-white'}>
            {timeRemaining}s left
          </span>
          <span>{totalTime}s</span>
        </div>
      </div>
    </div>
  )
}
