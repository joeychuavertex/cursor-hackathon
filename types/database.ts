import { User } from '@supabase/supabase-js'

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          user_id: string
          judges: string[]
          presentation_text: string
          duration: number
          scores: any
          created_at: string
          status: 'active' | 'completed' | 'paused'
        }
        Insert: {
          id?: string
          user_id: string
          judges: string[]
          presentation_text: string
          duration: number
          scores?: any
          created_at?: string
          status?: 'active' | 'completed' | 'paused'
        }
        Update: {
          id?: string
          user_id?: string
          judges?: string[]
          presentation_text?: string
          duration?: number
          scores?: any
          created_at?: string
          status?: 'active' | 'completed' | 'paused'
        }
      }
      presentations: {
        Row: {
          id: string
          session_id: string
          text: string
          audio_url?: string
          duration: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          text: string
          audio_url?: string
          duration: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          text?: string
          audio_url?: string
          duration?: number
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          session_id: string
          judge_id: string
          text: string
          audio_url?: string
          created_at: string
          answered: boolean
        }
        Insert: {
          id?: string
          session_id: string
          judge_id: string
          text: string
          audio_url?: string
          created_at?: string
          answered?: boolean
        }
        Update: {
          id?: string
          session_id?: string
          judge_id?: string
          text?: string
          audio_url?: string
          created_at?: string
          answered?: boolean
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name?: string
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
