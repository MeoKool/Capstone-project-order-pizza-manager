import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'
import type { Feedback, OrderItem } from '@/types/feedback'
import FeedbackService from '@/services/feedback-service'
import { PAYMENT_STATUS } from '@/types/order'

interface FeedbackDetailDialogProps {
  feedback: Feedback
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedbackDetailDialog({ feedback, open, onOpenChange }: FeedbackDetailDialogProps) {
  const [detailedFeedback, setDetailedFeedback] = useState<Feedback | null>(null)
  const [loading, setLoading] = useState(false)
  const feedbackService = FeedbackService.getInstance()

  useEffect(() => {
    if (open && feedback) {
      fetchFeedbackDetails(feedback.id)
    }
  }, [open, feedback])

  const fetchFeedbackDetails = async (id: string) => {
    setLoading(true)
    try {
      const response = await feedbackService.getFeedbackById(id)
      if (response.success) {
        setDetailedFeedback(response.result)
      }
    } catch (error) {
      console.error('Error fetching feedback details:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Không có thông tin'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return (
      <div className='flex items-center'>
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-5 w-5 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className='ml-2 text-sm font-medium'>{rating}/5</span>
      </div>
    )
  }

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case PAYMENT_STATUS.PAID:
        return (
          <Badge className='bg-emerald-100 hover:bg-emerald-300 border-emerald-500 text-xs px-1'>
            <div className='text-emerald-600 text-center w-[98px] py-0.4'>Đã thanh toán</div>
          </Badge>
        )
      case PAYMENT_STATUS.CHECKOUT:
        return (
          <Badge className='bg-blue-100 hover:bg-blue-300 border-blue-500 text-xs px-1'>
            <div className='text-blue-600 text-center w-[98px] py-0.4'>Đã checkout</div>
          </Badge>
        )
      case PAYMENT_STATUS.UNPAID:
        return (
          <Badge className='bg-amber-100 hover:bg-amber-300 border-amber-500 text-xs px-1'>
            <div className='text-amber-600 text-center w-[98px] py-0.4'>Chưa thanh toán</div>
          </Badge>
        )
      case PAYMENT_STATUS.CANCELLED:
        return (
          <Badge className='bg-red-100 hover:bg-red-300 border-red-500 text-xs px-1'>
            <div className='text-red-600 text-center w-[98px] py-0.4'>Đã hủy</div>
          </Badge>
        )
      default:
        return (
          <Badge className='bg-gray-100 hover:bg-gray-300 border-gray-500 text-xs px-1'>
            <div className='text-gray-600 text-center w-[98px] py-0.4'>{status}</div>
          </Badge>
        )
    }
  }

  const getOrderItemStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <Badge className='bg-amber-100 hover:bg-amber-300 border-amber-500 text-xs px-1'>
            <div className='text-amber-600 text-center w-[98px] py-0.4'>Đang chờ</div>
          </Badge>
        )
      case 'Cancelled':
        return (
          <Badge className='bg-red-100 hover:bg-red-300 border-red-500 text-xs px-1'>
            <div className='text-red-600 text-center w-[98px] py-0.4'>Đã hủy</div>
          </Badge>
        )
      case 'Serving':
        return (
          <Badge className='bg-blue-100 hover:bg-blue-300 border-blue-500 text-xs px-1'>
            <div className='text-blue-600 text-center w-[98px] py-0.4'>Đang phục vụ</div>
          </Badge>
        )
      case 'Done':
        return (
          <Badge className='bg-green-100 hover:bg-green-300 border-green-500 text-xs px-1'>
            <div className='text-green-600 text-center w-[98px] py-0.4'>Hoàn thành</div>
          </Badge>
        )
      case 'Cooking':
        return (
          <Badge className='bg-orange-100 hover:bg-orange-300 border-orange-500 text-xs px-1'>
            <div className='text-orange-600 text-center w-[98px] py-0.4'>Đang nấu</div>
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] rounded-xl shadow-lg border-0'>
        <DialogHeader className='pb-4 mb-4 border-b'>
          <DialogTitle className='text-xl font-bold'>Chi tiết đánh giá</DialogTitle>
          <DialogDescription className='text-muted-foreground mt-1'>
            Thông tin chi tiết về đánh giá và đơn hàng.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='space-y-4 animate-pulse'>
            <div className='h-6 bg-gray-200 rounded w-1/3'></div>
            <div className='h-4 bg-gray-200 rounded w-1/2'></div>
            <div className='h-20 bg-gray-200 rounded w-full'></div>
          </div>
        ) : (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 gap-4'>
              <div>
                <h3 className='text-sm font-medium text-muted-foreground mb-1'>Đánh giá</h3>
                {renderStars(detailedFeedback?.rating || feedback.rating)}
              </div>

              <Separator />

              <div>
                <h3 className='text-sm font-medium text-muted-foreground mb-1'>Nội dung đánh giá</h3>
                <p className='text-base'>{detailedFeedback?.comments || feedback.comments || 'Không có nội dung'}</p>
              </div>

              <Separator />

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h3 className='text-sm font-medium text-muted-foreground mb-1'>Mã bàn</h3>
                  <p className='text-base'>{detailedFeedback?.order?.tableCode || 'Không có thông tin'}</p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-muted-foreground mb-1'>Thời gian đánh giá</h3>
                  <p className='text-base'>{formatDate(detailedFeedback?.feedbackDate || feedback.feedbackDate)}</p>
                </div>
              </div>

              <Separator />

              {detailedFeedback?.order && (
                <>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <h3 className='text-sm font-medium text-muted-foreground mb-1'>Thời gian bắt đầu</h3>
                      <p className='text-base'>{formatDate(detailedFeedback.order.startTime)}</p>
                    </div>
                    <div>
                      <h3 className='text-sm font-medium text-muted-foreground mb-1'>Thời gian kết thúc</h3>
                      <p className='text-base'>{formatDate(detailedFeedback.order.endTime)}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <h3 className='text-sm font-medium text-muted-foreground mb-1'>Tổng tiền</h3>
                      <p className='text-base font-medium'>{formatCurrency(detailedFeedback.order.totalPrice)}</p>
                    </div>
                    <div>
                      <h3 className='text-sm font-medium text-muted-foreground mb-1'>Trạng thái đơn hàng</h3>
                      {getOrderStatusBadge(detailedFeedback.order.status)}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className='text-sm font-medium text-muted-foreground mb-2'>Danh sách món ăn</h3>
                    <div className='space-y-3 max-h-[300px] overflow-y-auto pr-2'>
                      {detailedFeedback.order.orderItems.map((item: OrderItem) => (
                        <Card key={item.id} className='overflow-hidden'>
                          <CardHeader className='p-4 pb-2'>
                            <CardTitle className='text-base flex justify-between items-start'>
                              <span>{item.name}</span>
                              {getOrderItemStatusBadge(item.orderItemStatus)}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className='p-4 pt-0'>
                            <div className='flex flex-wrap gap-1 text-sm'>
                              {item.reasonCancel && (
                                <>
                                  <span className='text-muted-foreground'>Lý do hủy:</span>
                                  <span className='text-red-600'>{item.reasonCancel}</span>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
