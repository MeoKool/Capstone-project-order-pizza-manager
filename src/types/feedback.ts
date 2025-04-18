export interface Feedback {
  id: string
  rating: number
  comments: string
  feedbackDate: string
  orderId: string
  order: Order | null
}

export interface FeedbackResult {
  items: Feedback[]
  totalCount: number
}

export interface Order {
  id: string
  orderCode: string | null
  tableCode: string
  startTime: string
  endTime: string | null
  totalPrice: number
  totalOrderItemPrice: number
  totalAdditionalFeePrice: number
  status: string
  type: string
  phone: string | null
  tableId: string
  table: any | null
  additionalFees: any[]
  orderItems: OrderItem[]
  orderVouchers: any[]
}

export interface OrderItem {
  id: string
  tableCode: string
  name: string
  note: string
  quantity: number
  price: number
  totalPrice: number
  startTime: string
  orderId: string
  productId: string
  orderItemStatus: string
  type: string
  product: any | null
  productType: string
  orderItemDetails: any[]
  startTimeCooking: string | null
  startTimeServing: string | null
  endTime: string | null
  reasonCancel: string | null
}

export interface FeedbackApiResponse {
  success: boolean
  result: FeedbackResult
  message: string
  statusCode: number
}

export interface FeedbackDetailApiResponse {
  success: boolean
  result: Feedback
  message: string
  statusCode: number
}
