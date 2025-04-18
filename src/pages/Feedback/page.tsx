'use client'

import { useState } from 'react'
import type { Feedback } from '@/types/feedback'
import { FeedbackProvider } from './components/feedback-provider'
import { FeedbackHeader } from './components/feedback-header'
import { FeedbackTable } from './components/feedback-table'
import { FeedbackDetailDialog } from './components/feedback-detail-dialog'

export default function FeedbackPage() {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback)
    setIsDetailDialogOpen(true)
  }

  return (
    <FeedbackProvider>
      <div className='h-full flex flex-col'>
        <div className='flex-1 p-6'>
          <FeedbackHeader />
          <FeedbackTable onViewFeedback={handleViewFeedback} />
          {selectedFeedback && (
            <FeedbackDetailDialog
              feedback={selectedFeedback}
              open={isDetailDialogOpen}
              onOpenChange={setIsDetailDialogOpen}
            />
          )}
        </div>
      </div>
    </FeedbackProvider>
  )
}
