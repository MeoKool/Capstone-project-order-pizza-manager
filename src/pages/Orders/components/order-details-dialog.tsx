import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle2, X, Ban } from 'lucide-react'

interface OrderDetailsDialogProps {
  orderDetail: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailsDialog({ orderDetail, open, onOpenChange }: OrderDetailsDialogProps) {
  if (!orderDetail) return null

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatDateShort = (dateString: string | null) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }

  const calculateDuration = (startTime: string | null, endTime: string | null) => {
    if (!startTime || !endTime) return '—'

    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationMs = end.getTime() - start.getTime()

    const hours = Math.floor(durationMs / 3600000)
    const minutes = Math.floor((durationMs % 3600000) / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`
    } else {
      return `${minutes} phút ${seconds} giây`
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Done':
        return (
          <Badge variant='outline' className='bg-green-50 text-green-600 border-green-200 flex items-center gap-1'>
            <CheckCircle2 className='h-3 w-3' />
            Đã hoàn thành
          </Badge>
        )
      case 'Cooking':
        return (
          <Badge variant='outline' className='bg-orange-50 text-orange-600 border-orange-200 flex items-center gap-1'>
            Đang chế biến
          </Badge>
        )
      case 'Serving':
        return (
          <Badge variant='outline' className='bg-blue-50 text-blue-600 border-blue-200 flex items-center gap-1'>
            Đang phục vụ
          </Badge>
        )
      case 'Pending':
        return (
          <Badge variant='outline' className='bg-amber-50 text-amber-600 border-amber-200 flex items-center gap-1'>
            Đang chờ
          </Badge>
        )
      case 'Cancelled':
        return (
          <Badge variant='outline' className='bg-red-50 text-red-600 border-red-200 flex items-center gap-1'>
            <Ban className='h-3 w-3' />
            Đã hủy
          </Badge>
        )
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[600px] p-0 overflow-hidden'>
        <DialogHeader className='px-6 pt-6 pb-2'>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-xl font-bold'>Chi tiết đơn hàng</DialogTitle>
            <Button variant='ghost' size='icon' onClick={() => onOpenChange(false)} className='h-8 w-8'>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </DialogHeader>

        <div className='grid grid-cols-3 gap-4 px-6 py-4'>
          <div className='flex flex-col'>
            <span className='text-sm text-muted-foreground mb-1'>Bàn</span>
            <span className='font-medium'>{orderDetail.tableCode}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-sm text-muted-foreground mb-1'>Mã đơn</span>
            <span className='font-medium'>{orderDetail.orderCode || '—'}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-sm text-muted-foreground mb-1'>Thời gian</span>
            <span className='font-medium'>{formatDate(orderDetail.startTime)}</span>
          </div>
        </div>

        <Separator />

        <ScrollArea className='max-h-[400px] px-6 py-4'>
          {orderDetail.orderItems &&
            orderDetail.orderItems.map((item: any) => {
              const isCancelled = item.orderItemStatus === 'Cancelled'

              return (
                <div key={item.id} className='mb-6 last:mb-0'>
                  <div className={`bg-white border rounded-lg p-4 relative ${isCancelled ? 'overflow-hidden' : ''}`}>
                    {/* Diagonal strikethrough for cancelled items */}
                    {isCancelled && (
                      <div className='absolute inset-0 pointer-events-none'>
                        <div className='absolute inset-0 bg-red-50/30'></div>
                        <div className='absolute top-0 left-0 w-full h-full'>
                          <div className='absolute top-0 left-0 w-[200%] h-[1px] bg-red-200 origin-top-left rotate-45 transform translate-y-0'></div>
                        </div>
                      </div>
                    )}

                    <div className='flex justify-between items-start mb-3'>
                      <div>
                        <h3 className='font-medium text-lg'>{item.name}</h3>
                        <p className='text-sm text-muted-foreground'>
                          Số lượng: {item.quantity} • {item.price?.toLocaleString('vi-VN')} đ/món
                        </p>
                      </div>
                      <div className='flex flex-col items-end'>
                        <span className='font-bold text-lg mb-1'>{item.totalPrice?.toLocaleString('vi-VN')} đ</span>
                        {getStatusBadge(item.orderItemStatus)}
                      </div>
                    </div>

                    {/* Cancellation reason */}
                    {isCancelled && item.reasonCancel && (
                      <div className='mt-2 mb-3 p-3 bg-red-50 rounded-md border border-red-100'>
                        <span className='font-medium text-red-700'>Lý do hủy:</span>
                        <span className='ml-2 text-red-600'>{item.reasonCancel}</span>
                      </div>
                    )}

                    <div className='grid grid-cols-2 gap-x-6 gap-y-2 mt-4'>
                      <div className='flex justify-between'>
                        <span className='text-sm text-muted-foreground'>Thời gian bắt đầu:</span>
                        <span className='text-sm font-medium'>
                          {formatTime(item.startTime)} {formatDateShort(item.startTime)}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-muted-foreground'>Bắt đầu phục vụ:</span>
                        <span className='text-sm font-medium'>
                          {formatTime(item.startTimeServing)} {formatDateShort(item.startTimeServing)}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-muted-foreground'>Bắt đầu chế biến:</span>
                        <span className='text-sm font-medium'>
                          {formatTime(item.startTimeCooking)} {formatDateShort(item.startTimeCooking)}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-muted-foreground'>Hoàn thành:</span>
                        <span className='text-sm font-medium'>
                          {formatTime(item.endTime)} {formatDateShort(item.endTime)}
                        </span>
                      </div>
                    </div>

                    <div className='mt-4 bg-muted/30 p-3 rounded-md'>
                      <div className='flex justify-between items-center'>
                        <span className='font-medium'>Tổng thời gian:</span>
                        <span className='font-bold text-primary'>
                          {calculateDuration(item.startTime, item.endTime)}
                        </span>
                      </div>
                    </div>

                    {item.note && item.note !== 'No Comment' && (
                      <div className='mt-3 p-3 bg-amber-50 rounded-md'>
                        <span className='font-medium'>Ghi chú:</span>
                        <span className='ml-2'>{item.note}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
        </ScrollArea>

        {orderDetail.additionalFees && orderDetail.additionalFees.length > 0 && (
          <>
            <Separator />
            <div className='px-6 py-4'>
              <h3 className='font-medium mb-3'>Phí bổ sung</h3>
              {orderDetail.additionalFees.map((fee: any) => (
                <div key={fee.id} className='flex justify-between items-center mb-2 last:mb-0'>
                  <div>
                    <p className='font-medium'>{fee.name}</p>
                    {fee.description && <p className='text-sm text-muted-foreground'>{fee.description}</p>}
                  </div>
                  <p className='font-medium'>{fee.value.toLocaleString('vi-VN')} đ</p>
                </div>
              ))}
            </div>
          </>
        )}

        <Separator />

        <div className='px-6 py-4'>
          <div className='flex justify-between items-center mb-2'>
            <div>
              <p className='text-sm text-muted-foreground'>Tổng số món</p>
              <p className='font-medium'>{orderDetail.orderItems ? orderDetail.orderItems.length : 0} món</p>
            </div>
            <div className='text-right'>
              <p className='text-sm text-muted-foreground'>Tổng tiền</p>
              <p className='text-xl font-bold text-primary'>
                {orderDetail.totalPrice ? orderDetail.totalPrice.toLocaleString('vi-VN') : 'N/A'} đ
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className='px-6 py-4 bg-muted/20'>
          <Button variant='destructive' onClick={() => onOpenChange(false)} className='w-full sm:w-auto'>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
