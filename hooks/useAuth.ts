import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthUser, AuthState } from '@/types/auth'

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        setAuthState({
          user: session?.user as AuthUser || null,
          loading: false,
          error: null
        })
      } catch (error) {
        console.error('Error getting initial session:', error)
        setAuthState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to get session'
        })
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState({
          user: session?.user as AuthUser || null,
          loading: false,
          error: null
        })

        // Create or update user profile on sign in
        if (event === 'SIGNED_IN' && session?.user) {
          await createOrUpdateProfile(session.user as AuthUser)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, fullName?: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) throw error

      if (data.user) {
        // Create profile
        await createOrUpdateProfile(data.user as AuthUser, fullName)
      }

      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { data: null, error: errorMessage }
    }
  }

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { data: null, error: errorMessage }
    }
  }

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setAuthState({
        user: null,
        loading: false,
        error: null
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
    }
  }

  const resetPassword = async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      setAuthState(prev => ({ ...prev, loading: false }))
      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { error: errorMessage }
    }
  }

  const createOrUpdateProfile = async (user: AuthUser, fullName?: string) => {
    try {
      // Use type assertion to bypass TypeScript error
      const { error } = await (supabase as any)
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: fullName || user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Error creating/updating profile:', error)
    }
  }

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword
  }
}
