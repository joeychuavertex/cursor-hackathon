'use client'

import { useState, useEffect } from 'react'
import { Judge } from '../types/judge'
import { useGeminiAI } from '../hooks/useGeminiAI'
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Lightbulb,
  Target,
  BarChart3,
  FileText,
  Presentation,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'

interface PerformanceDashboardProps {
  judges: Judge[]
  onBackToLanding: () => void
}

interface InvestmentMemo {
  recommendation: string
  summary: string
  valueProposition: string
  market: string
  product: string
  metrics: string
  risks: string
  team: string
  deal: string
  scenarioAnalysis: string
  conclusion: string
}

interface PresentationMetrics {
  clarity: number
  confidence: number
  engagement: number
  structure: number
  delivery: number
  overall: number
}

export default function PerformanceDashboard({ judges, onBackToLanding }: PerformanceDashboardProps) {
  const [investmentMemo, setInvestmentMemo] = useState<InvestmentMemo | null>(null)
  const [presentationMetrics, setPresentationMetrics] = useState<PresentationMetrics | null>(null)
  const [isGenerating, setIsGenerating] = useState(true)
  const [overallScore, setOverallScore] = useState(0)
  
  const { generateScores } = useGeminiAI()

  useEffect(() => {
    generateDashboardData()
  }, [])

  const generateDashboardData = async () => {
    setIsGenerating(true)
    try {
      // Generate mock investment memo data
      const memo: InvestmentMemo = {
        recommendation: "STRONG BUY - This innovative solution addresses a critical market need with a clear path to profitability.",
        summary: "EcoClean presents a compelling opportunity in the $50B+ cleaning products market with their revolutionary biodegradable formula. The company has demonstrated strong early traction with $50K in sales in just 6 months.",
        valueProposition: "100% natural, biodegradable cleaning products that outperform traditional cleaners while being environmentally safe. Unique enzyme-based formula provides superior cleaning power without harmful chemicals.",
        market: "Targeting the $50B+ global cleaning products market with focus on environmentally conscious consumers. TAM of $12B for eco-friendly segment growing at 15% annually.",
        product: "Proprietary enzyme-based cleaning formula with 3 core products: all-purpose cleaner, bathroom cleaner, and kitchen degreaser. Patented technology provides superior cleaning with 100% biodegradability.",
        metrics: "• $50K revenue in first 6 months\n• 40% month-over-month growth\n• 85% customer retention rate\n• $25 average order value\n• 4.8/5 customer satisfaction rating",
        risks: "• Competition from established brands\n• Regulatory changes in chemical industry\n• Supply chain dependency on natural ingredients\n• Scaling manufacturing capacity\n• Consumer education on benefits",
        team: "Strong founding team with 15+ years combined experience in consumer products and chemistry. CEO has previous exit in cleaning industry. CTO holds PhD in Chemical Engineering.",
        deal: "Seeking $2M Series A at $8M pre-money valuation for 25% equity. Funds will be used for manufacturing scale-up, marketing, and team expansion.",
        scenarioAnalysis: "Conservative: $5M revenue by Year 3\nBase Case: $15M revenue by Year 3\nOptimistic: $30M revenue by Year 3\nAll scenarios show path to profitability by Year 2",
        conclusion: "EcoClean represents a compelling investment opportunity with strong market potential, innovative technology, and experienced team. The environmental angle provides competitive moat and aligns with growing consumer trends."
      }

      // Generate mock presentation metrics
      const metrics: PresentationMetrics = {
        clarity: 8.5,
        confidence: 7.8,
        engagement: 9.2,
        structure: 8.0,
        delivery: 8.7,
        overall: 8.4
      }

      setInvestmentMemo(memo)
      setPresentationMetrics(metrics)
      setOverallScore(8.4)
      
    } catch (error) {
      console.error('Error generating dashboard data:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400'
    if (score >= 6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBarColor = (score: number) => {
    if (score >= 8) return 'bg-green-400'
    if (score >= 6) return 'bg-yellow-400'
    return 'bg-red-400'
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Theatrical Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
          {/* Floating particles */}
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 2}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-12 text-center border border-yellow-400/30 shadow-2xl shadow-yellow-400/10">
            <div className="w-16 h-16 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-300 mb-4">
              Generating Performance Dashboard...
            </h2>
            <p className="text-xl text-cyan-300">Analyzing your pitch and preparing detailed insights</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Theatrical Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        {/* Floating particles */}
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-6 bg-black/40 backdrop-blur-xl border-b border-yellow-400/20">
        <button
          onClick={onBackToLanding}
          className="px-6 py-3 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-lg transition-all duration-300 border border-gray-600/50 hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-400/20 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Landing
        </button>
        
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 drop-shadow-2xl">
          🎯 PITCHING PERFORMANCE DASHBOARD
        </h1>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8 space-y-8">
        {/* Overall Score */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-8 border border-yellow-400/30 shadow-2xl shadow-yellow-400/10 text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Trophy className="w-12 h-12 text-yellow-400" />
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-300">
                Overall Performance Score
              </h2>
            </div>
            
            <div className="mb-8">
              <div className={`text-8xl font-black ${getScoreColor(overallScore)} mb-4 drop-shadow-2xl`}>
                {overallScore.toFixed(1)}/10
              </div>
              <div className="text-2xl text-cyan-300 font-semibold">
                {overallScore >= 8 ? 'Outstanding Performance!' : overallScore >= 6 ? 'Good Job!' : 'Keep Practicing!'}
              </div>
            </div>
          </div>
        </div>

        {/* Investment Memo Section */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-8 border border-yellow-400/30 shadow-2xl shadow-yellow-400/10">
            <div className="flex items-center gap-4 mb-8">
              <FileText className="w-8 h-8 text-yellow-400" />
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-300">
                Investment Memo
              </h3>
            </div>

            {investmentMemo && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="bg-gray-900/50 rounded-xl p-6 border border-yellow-400/20">
                    <h4 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Recommendation
                    </h4>
                    <p className="text-white/90 leading-relaxed">{investmentMemo.recommendation}</p>
                  </div>

                  <div className="bg-gray-900/50 rounded-xl p-6 border border-yellow-400/20">
                    <h4 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Summary
                    </h4>
                    <p className="text-white/90 leading-relaxed">{investmentMemo.summary}</p>
                  </div>

                  <div className="bg-gray-900/50 rounded-xl p-6 border border-yellow-400/20">
                    <h4 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Value Proposition
                    </h4>
                    <p className="text-white/90 leading-relaxed">{investmentMemo.valueProposition}</p>
                  </div>

                  <div className="bg-gray-900/50 rounded-xl p-6 border border-yellow-400/20">
                    <h4 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Market
                    </h4>
                    <p className="text-white/90 leading-relaxed">{investmentMemo.market}</p>
                  </div>

                  <div className="bg-gray-900/50 rounded-xl p-6 border border-yellow-400/20">
                    <h4 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Product
                    </h4>
                    <p className="text-white/90 leading-relaxed">{investmentMemo.product}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="bg-gray-900/50 rounded-xl p-6 border border-yellow-400/20">
                    <h4 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Key Metrics
                    </h4>
                    <div className="text-white/90 leading-relaxed whitespace-pre-line">{investmentMemo.metrics}</div>
                  </div>

                  <div className="bg-gray-900/50 rounded-xl p-6 border border-red-400/20">
                    <h4 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Risks
                    </h4>
                    <div className="text-white/90 leading-relaxed whitespace-pre-line">{investmentMemo.risks}</div>
                  </div>

                  <div className="bg-gray-900/50 rounded-xl p-6 border border-yellow-400/20">
                    <h4 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Team
                    </h4>
                    <p className="text-white/90 leading-relaxed">{investmentMemo.team}</p>
                  </div>

                  <div className="bg-gray-900/50 rounded-xl p-6 border border-yellow-400/20">
                    <h4 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Deal Terms
                    </h4>
                    <p className="text-white/90 leading-relaxed">{investmentMemo.deal}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Scenario Analysis & Conclusion */}
            {investmentMemo && (
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-900/50 rounded-xl p-6 border border-cyan-400/20">
                  <h4 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Scenario Analysis
                  </h4>
                  <div className="text-white/90 leading-relaxed whitespace-pre-line">{investmentMemo.scenarioAnalysis}</div>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6 border border-green-400/20">
                  <h4 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Conclusion
                  </h4>
                  <p className="text-white/90 leading-relaxed">{investmentMemo.conclusion}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Presentation Metrics Section */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-8 border border-yellow-400/30 shadow-2xl shadow-yellow-400/10">
            <div className="flex items-center gap-4 mb-8">
              <Presentation className="w-8 h-8 text-yellow-400" />
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-300">
                Presentation Analysis
              </h3>
            </div>

            {presentationMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(presentationMetrics).map(([key, value]) => (
                  <div key={key} className="bg-gray-900/50 rounded-xl p-6 border border-yellow-400/20">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-yellow-400 capitalize">
                        {key === 'overall' ? 'Overall Score' : key}
                      </h4>
                      <span className={`text-2xl font-bold ${getScoreColor(value)}`}>
                        {value.toFixed(1)}/10
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-700/50 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full ${getScoreBarColor(value)} transition-all duration-1000`}
                        style={{ width: `${value * 10}%` }}
                      />
                    </div>
                    
                    <div className="text-sm text-white/70">
                      {value >= 8 ? 'Excellent' : value >= 6 ? 'Good' : value >= 4 ? 'Fair' : 'Needs Improvement'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center">
            <button
              onClick={onBackToLanding}
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xl font-black rounded-xl hover:from-yellow-300 hover:to-yellow-400 transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-yellow-400/30 border-2 border-yellow-300/50"
            >
              🎯 Start New Pitch
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
