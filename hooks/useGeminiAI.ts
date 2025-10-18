import { useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Judge, Score } from '@/types/judge'
import { Question } from '@/types/session'

export function useGeminiAI() {
  const [isLoading, setIsLoading] = useState(false)

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

  const generateQuestion = async (
    presentationText: string,
    judge: Judge,
    previousQuestions: Question[]
  ): Promise<string> => {
    setIsLoading(true)
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
      
      const prompt = `
        You are ${judge.name}, a Shark Tank judge with expertise in ${judge.expertise.join(', ')}.
        Your personality: ${judge.personality}
        
        A startup founder just presented: "${presentationText}"
        
        Previous questions you've asked: ${previousQuestions.map(q => q.text).join('; ')}
        
        Ask ONE insightful, challenging question that reflects your expertise and personality.
        Focus on areas you care about most based on your scoring criteria:
        - Innovation: ${judge.scoringCriteria.innovation * 100}%
        - Market Potential: ${judge.scoringCriteria.marketPotential * 100}%
        - Team: ${judge.scoringCriteria.team * 100}%
        - Financials: ${judge.scoringCriteria.financials * 100}%
        - Presentation: ${judge.scoringCriteria.presentation * 100}%
        
        Be direct, professional, and show your personality. Keep it under 100 words.
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text().trim()
    } catch (error) {
      console.error('Error generating question:', error)
      return "I'd like to understand more about your business model and revenue projections. Can you walk me through your financials?"
    } finally {
      setIsLoading(false)
    }
  }

  const generateScores = async (presentationText: string, judge: Judge): Promise<Score> => {
    setIsLoading(true)
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
      
      const prompt = `
        You are ${judge.name}, a Shark Tank judge. Evaluate this pitch and provide scores.
        
        Pitch: "${presentationText}"
        
        Your expertise: ${judge.expertise.join(', ')}
        Your personality: ${judge.personality}
        
        Score each category from 0-1 (will be multiplied by 10):
        - Innovation: How unique and creative is the idea?
        - Market Potential: How big is the market opportunity?
        - Team: How capable is the founding team?
        - Financials: How sound are the business model and projections?
        - Presentation: How well was the pitch delivered?
        
        Provide your response in this exact JSON format:
        {
          "scores": {
            "innovation": 0.8,
            "marketPotential": 0.7,
            "team": 0.6,
            "financials": 0.5,
            "presentation": 0.9
          },
          "feedback": "Your detailed feedback here explaining your scores and what you liked or didn't like about the pitch. Be specific and constructive."
        }
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text().trim()
      
      // Try to parse JSON response
      try {
        const parsed = JSON.parse(text) as { scores: { [key: string]: number }, feedback: string }
        const totalScore = Object.values(parsed.scores).reduce((sum: number, score: number) => sum + score, 0) * 2
        
        return {
          judgeId: judge.id,
          scores: parsed.scores as any,
          totalScore,
          feedback: parsed.feedback,
          timestamp: Date.now()
        }
      } catch (parseError) {
        // Fallback if JSON parsing fails
        const fallbackScores = {
          innovation: 0.6,
          marketPotential: 0.6,
          team: 0.6,
          financials: 0.6,
          presentation: 0.6
        }
        
        return {
          judgeId: judge.id,
          scores: fallbackScores,
          totalScore: 6.0,
          feedback: text || "Interesting pitch. I'd like to see more details on your business model and market validation.",
          timestamp: Date.now()
        }
      }
    } catch (error) {
      console.error('Error generating scores:', error)
      // Return default scores on error
      const defaultScores = {
        innovation: 0.5,
        marketPotential: 0.5,
        team: 0.5,
        financials: 0.5,
        presentation: 0.5
      }
      
      return {
        judgeId: judge.id,
        scores: defaultScores,
        totalScore: 5.0,
        feedback: "I need to see more details about your business model and market opportunity.",
        timestamp: Date.now()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    generateQuestion,
    generateScores,
    isLoading
  }
}
