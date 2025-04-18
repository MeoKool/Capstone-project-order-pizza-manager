import type { Feedback, FeedbackResult } from '@/types/feedback'
import ApiResponse, { get } from '@/apis/apiUtils'

class FeedbackService {
  private static instance: FeedbackService

  private constructor() {}

  public static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService()
    }
    return FeedbackService.instance
  }

  /**
   * Get all feedbacks
   */
  public async getAllFeedbacks(): Promise<ApiResponse<FeedbackResult>> {
    try {
      return await get<FeedbackResult>('/feedbacks?TakeCount=10000')
    } catch (error) {
      console.error('Error fetching all feedbacks:', error)
      throw error
    }
  }

  /**
   * Get a feedback by ID with order details
   */
  public async getFeedbackById(id: string): Promise<ApiResponse<Feedback>> {
    try {
      return await get<Feedback>(
        `/feedbacks/${id}?includeProperties=Order.OrderItems&IncludeProperties=Order.OrderItems`
      )
    } catch (error) {
      console.error(`Error fetching feedback with id ${id}:`, error)
      throw error
    }
  }
}

export default FeedbackService
