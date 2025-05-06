'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BanknoteIcon, QrCode, Loader2, CreditCard, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import PaymentService from '@/services/payment-service'
import { PaymentQRDialog } from './payment-qr-dialog'
import type { OrderDetail } from '@/types/order'
import OrderService from '@/services/order-service'
import { connection } from '@/lib/signalr-client'
import { showGeneralNotificationToast } from '@/components/custom-toast'

interface PaymentDialogProps {
  orderId: string
  totalAmount: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onPaymentComplete?: () => void
  onBackToDetails?: () => void
}
interface PaymentSuccessNotification {
  id: string
}
export function PaymentDialog({
  orderId,
  totalAmount,
  open,
  onOpenChange,
  onPaymentComplete,
  onBackToDetails
}: PaymentDialogProps) {
  const [isLoadingCash, setIsLoadingCash] = useState(false)
  const [isLoadingQR, setIsLoadingQR] = useState(false)
  const [isCancelingQR, setIsCancelingQR] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false)
  const [, setQrCodeGenerated] = useState(false)
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  // Fetch order details when dialog opens
  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetails()
    }
  }, [open, orderId])

  const fetchOrderDetails = async () => {
    try {
      const orderService = OrderService.getInstance()
      const response = await orderService.getOrderById(orderId)
      if (response.success && response.result) {
        setOrderDetail(response.result)
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
    }
  }

  const handlePayByCash = async () => {
    if (!orderId) return

    setIsLoadingCash(true)
    try {
      const paymentService = PaymentService.getInstance()
      const response = await paymentService.payOrderByCash(orderId)

      if (response.success) {
        toast.success('Thanh toán tiền mặt thành công')
        onOpenChange(false)
        if (onPaymentComplete) onPaymentComplete()
      } else {
        toast.error(response.message || 'Không thể thanh toán bằng tiền mặt')
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi khi thanh toán bằng tiền mặt')
      console.error('Error paying by cash:', error)
    } finally {
      setIsLoadingCash(false)
    }
  }

  useEffect(() => {
    connection.on('PaymentSuccess', (data: PaymentSuccessNotification) => {
      if (data.id === orderId) {
        showGeneralNotificationToast('Thanh toán thành công', 'Đơn hàng đã được thanh toán thành công', 'success')
        if (onPaymentComplete) onPaymentComplete()
        // Close both dialogs
        setIsQRDialogOpen(false)
        onOpenChange(false)
      }
    })
    return () => {
      connection.off('PaymentSuccess')
    }
  }, [orderId, onPaymentComplete, onOpenChange])


  const handleCreateQRCode = async () => {
    if (!orderId) return

    setIsLoadingQR(true)
    try {
      const paymentService = PaymentService.getInstance()
      const response = await paymentService.createPaymentQRCode(orderId)

      if (response.success && response.result) {
        // Store the QR code data
        setQrCodeData(response.result)
        // Mark that QR code was generated
        setQrCodeGenerated(true)
        // Open the QR code dialog
        setIsQRDialogOpen(true)
      } else {
        toast.error(response.message || 'Không thể tạo mã QR thanh toán')
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi khi tạo mã QR thanh toán')
      console.error('Error creating QR code:', error)
    } finally {
      setIsLoadingQR(false)
    }
  }

  const handleCancelPaymentQR = async () => {
    if (!orderId || isCancelingQR) return

    setIsCancelingQR(true)
    try {
      const paymentService = PaymentService.getInstance()
      const response = await paymentService.cancelPaymentQRCode(orderId)

      if (response.success) {
        toast.success('Đã hủy thanh toán bằng mã QR thành công')

        setQrCodeGenerated(false)
        setQrCodeData(null)
      } else {
        toast.error(response.message || 'Không thể hủy mã QR thanh toán')
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi khi hủy mã QR thanh toán')
      console.error('Error canceling QR code:', error)
    } finally {
      setIsCancelingQR(false)
    }
  }

  const handleBack = () => {
    onOpenChange(false)
    if (onBackToDetails) {
      setTimeout(() => {
        onBackToDetails()
      }, 100)
    }
  }

  const handleQRDialogBack = () => {
    // Just close the QR dialog
    setIsQRDialogOpen(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-[450px] p-0 overflow-hidden'>
          <DialogHeader className='px-6 pt-6 pb-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100'>
            <DialogTitle className='text-xl font-bold text-amber-800 flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              Thanh toán đơn hàng
            </DialogTitle>
            <p className='text-amber-600 text-sm'>Chọn phương thức thanh toán</p>
          </DialogHeader>

          <div className='p-6 space-y-4'>
            <div className='text-center mb-4'>
              <p className='text-sm text-slate-600'>Tổng tiền thanh toán</p>
              <p className='text-2xl font-bold text-amber-800'>{formatCurrency(totalAmount)}</p>
            </div>

            <div className='grid grid-cols-1 gap-4'>
              <Card
                className='border-amber-100 hover:border-amber-300 transition-colors cursor-pointer'
                onClick={handlePayByCash}
              >
                <CardContent className='p-4 flex items-center'>
                  <div className='bg-amber-100 p-3 rounded-full mr-4'>
                    <BanknoteIcon className='h-6 w-6 text-amber-600' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-medium text-amber-900'>Thanh toán tiền mặt</h3>
                    <p className='text-sm text-amber-600'>Thanh toán trực tiếp bằng tiền mặt</p>
                  </div>
                  {isLoadingCash && <Loader2 className='h-5 w-5 text-amber-500 animate-spin ml-2' />}
                </CardContent>
              </Card>

              <Card
                className='border-amber-100 hover:border-amber-300 transition-colors cursor-pointer'
                onClick={handleCreateQRCode}
              >
                <CardContent className='p-4 flex items-center'>
                  <div className='bg-amber-100 p-3 rounded-full mr-4'>
                    <QrCode className='h-6 w-6 text-amber-600' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-medium text-amber-900'>Thanh toán chuyển khoản</h3>
                    <p className='text-sm text-amber-600'>Quét mã QR để thanh toán</p>
                  </div>
                  {isLoadingQR && <Loader2 className='h-5 w-5 text-amber-500 animate-spin ml-2' />}
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter className='px-6 py-4 bg-amber-50 border-t border-amber-100'>
            <Button
              variant='outline'
              onClick={handleBack}
              disabled={isCancelingQR}
              className='w-full border-amber-200 text-amber-700 hover:bg-amber-100'
            >
              {isCancelingQR ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Đang hủy...
                </>
              ) : (
                <>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Quay lại
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      {qrCodeData && (
        <PaymentQRDialog
          open={isQRDialogOpen}
          onOpenChange={setIsQRDialogOpen}
          qrCodeData={qrCodeData}
          amount={totalAmount}
          onBack={handleQRDialogBack}
          onCancel={handleCancelPaymentQR}
          orderDetail={orderDetail || undefined}
        />
      )}
    </>
  )
}
