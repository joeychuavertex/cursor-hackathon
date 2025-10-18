import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Session, Presentation, Question } from '@/types/session'

export function useSupabase() {
  const [isLoading, setIsLoading] = useState(false)

  const saveSession = async (session: Omit<Session, 'id' | 'timestamp'>) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert([{
          user_id: session.userId,
          judges: session.judges,
          presentation_text: session.presentationText,
          duration: session.duration,
          scores: session.scores,
          status: session.status,
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error saving session:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const savePresentation = async (presentation: Omit<Presentation, 'id' | 'timestamp'>) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('presentations')
        .insert([{
          session_id: presentation.sessionId,
          text: presentation.text,
          audio_url: presentation.audioUrl,
          duration: presentation.duration,
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error saving presentation:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const saveQuestion = async (question: Omit<Question, 'id' | 'timestamp'>) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert([{
          session_id: question.sessionId,
          judge_id: question.judgeId,
          text: question.text,
          audio_url: question.audioUrl,
          answered: question.answered,
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error saving question:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const getSessionHistory = async (userId: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching session history:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    saveSession,
    savePresentation,
    saveQuestion,
    getSessionHistory,
    isLoading
  }
}
