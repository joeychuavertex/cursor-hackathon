import { useState, useEffect } from 'react'
import { Judge } from '@/types/judge'

interface UseJudgesReturn {
  judges: Judge[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useJudges(): UseJudgesReturn {
  const [judges, setJudges] = useState<Judge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJudges = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/judges/list')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch judges: ${response.status}`)
      }
      
      const data = await response.json()
      setJudges(data.judges || [])
    } catch (err) {
      console.error('Error fetching judges:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch judges')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJudges()
  }, [])

  return {
    judges,
    loading,
    error,
    refetch: fetchJudges
  }
}
