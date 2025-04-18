'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Feedback } from '@/types/feedback'
import FeedbackService from '@/services/feedback-service'

interface FeedbackContextType {
  feedbacks: Feedback[]
  totalCount: number
  loading: boolean
  error: string | null
  fetchFeedbacks: () => Promise<void>
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined)

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const feedbackService = FeedbackService.getInstance()

  const fetchFeedbacks = async () => {
    setLoading(true)
    try {
      const response = await feedbackService.getAllFeedbacks()

      if (response.success) {
        setFeedbacks(response.result.items)
        setTotalCount(response.result.totalCount)
      } else {
        setError(response.message || 'Failed to fetch feedback data')
      }
    } catch (err) {
      setError('An error occurred while fetching feedback data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const value = {
    feedbacks,
    totalCount,
    loading,
    error,
    fetchFeedbacks
  }

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>
}

export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider')
  }
  return context
}
