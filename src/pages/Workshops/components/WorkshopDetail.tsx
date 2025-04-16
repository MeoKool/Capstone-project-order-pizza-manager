'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import WorkshopService from '@/services/workshop-service'
import { useNavigate, useParams } from 'react-router-dom'
import { WorkshopStatus, type Workshop } from '@/types/workshop'
import DateTimeDisplay from '@/components/DateTimeDisplay'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { ArrowLeft, Edit, Pizza, X } from 'lucide-react'

export default function WorkshopDetail() {
  const { id } = useParams<{ id: string }>()
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const navigate = useNavigate()
  const workshopService = WorkshopService.getInstance()

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      setLoading(true)
      try {
        const response = await workshopService.getWorkshopById(id)
        if (response.success) {
          setWorkshop(response.result)
        }
      } catch (error) {
        console.error('Error fetching workshop:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleCancelWorkshop = async () => {
    if (!id) return

    try {
      const response = await workshopService.cancelWorkshop(id)
      if (response.success) {
        // Update the workshop status in the local state
        setWorkshop((prev) => (prev ? { ...prev, workshopStatus: WorkshopStatus.Cancelled } : null))
        setShowCancelDialog(false)
      } else {
        console.error('Failed to cancel workshop:', response.message)
      }
    } catch (error) {
      console.error('Error cancelling workshop:', error)
    }
  }

  if (loading) {
    return (
      <div className='container mx-auto py-6 flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
      </div>
    )
  }

  if (!workshop) {
    return <div className='p-4'>Không tìm thấy dữ liệu workshop</div>
  }

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => navigate('/workshops')} className='gap-2'>
          <ArrowLeft className='h-4 w-4' /> Quay lại danh sách
        </Button>
      </div>

      <Card className='shadow-md border border-gray-200 rounded-xl mb-6'>
        <CardHeader className='pb-4 border-b flex flex-row items-center justify-between'>
          <div>
            <CardTitle className='text-2xl'>{workshop.name}</CardTitle>
            <div className='mt-2'>
              {workshop.workshopStatus === 'Cancelled' ? (
                <span className='bg-red-500 text-white px-3 py-1 rounded-full text-sm'>Đã hủy</span>
              ) : workshop.workshopStatus === 'Opening' ? (
                <span className='bg-green-500 text-white px-3 py-1 rounded-full text-sm'>Đang mở</span>
              ) : workshop.workshopStatus === 'OpeningToRegister' ? (
                <span className='bg-blue-500 text-white px-3 py-1 rounded-full text-sm'>Đang mở đăng ký</span>
              ) : workshop.workshopStatus === 'Scheduled' ? (
                <span className='bg-blue-500 text-white px-3 py-1 rounded-full text-sm'>Đã lên lịch</span>
              ) : workshop.workshopStatus === 'Closed' ? (
                <span className='bg-gray-500 text-white px-3 py-1 rounded-full text-sm'>Đã kết thúc</span>
              ) : workshop.workshopStatus === 'CloseRegister' ? (
                <span className='bg-red-500 text-white px-3 py-1 rounded-full text-sm'>Đã đóng đăng ký</span>
              ) : (
                <span className='bg-blue-500 text-white px-3 py-1 rounded-full text-sm'>{workshop.workshopStatus}</span>
              )}
            </div>
          </div>

          <div className='flex gap-2'>
            {workshop.workshopStatus !== 'Cancelled' && (
              <Button
                variant='outline'
                className='text-amber-600 border-amber-600 hover:bg-amber-50'
                onClick={() => setShowCancelDialog(true)}
              >
                <X className='mr-2 h-4 w-4' />
                Hủy workshop
              </Button>
            )}
            <Button variant='outline' onClick={() => navigate(`/workshops/edit/${workshop.id}`)}>
              <Edit className='mr-2 h-4 w-4' />
              Chỉnh sửa
            </Button>
          </div>
        </CardHeader>

        <CardContent className='py-6'>
          <div className='grid grid-cols-2 gap-4 text-sm text-muted-foreground'>
            <div>
              <p className='font-semibold text-foreground'>Thời gian diễn ra:</p>
              <DateTimeDisplay value={workshop.workshopDate} />
            </div>
            <div>
              <p className='font-semibold text-foreground'>Bắt đầu đăng ký:</p>
              <DateTimeDisplay value={workshop.startRegisterDate} />
            </div>
            <div>
              <p className='font-semibold text-foreground'>Kết thúc đăng ký:</p>
              <DateTimeDisplay value={workshop.endRegisterDate} />
            </div>
            <div>
              <p className='font-semibold text-foreground'>Địa điểm:</p>
              <p>{workshop.location}</p>
            </div>
            <div>
              <p className='font-semibold text-foreground'>Người tổ chức:</p>
              <p>{workshop.organizer}</p>
            </div>
            <div>
              <p className='font-semibold text-foreground'>Hotline:</p>
              <p>{workshop.hotLineContact}</p>
            </div>
            <div>
              <p className='font-semibold text-foreground'>Phí tham gia:</p>
              <p>{workshop.totalFee.toLocaleString('vi-VN')} đ</p>
            </div>
            <div>
              <p className='font-semibold text-foreground'>Số pizza / đăng ký:</p>
              <p>{workshop.maxPizzaPerRegister}</p>
            </div>
            <div>
              <p className='font-semibold text-foreground'>Số người / đăng ký:</p>
              <p>{workshop.maxParticipantPerRegister}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Food Items Section */}
      <Card className='shadow-md border border-gray-200 rounded-xl'>
        <CardHeader className='pb-4 border-b'>
          <CardTitle className='flex items-center gap-2'>
            <Pizza className='h-5 w-5' />
            Danh sách món ăn đã chọn
          </CardTitle>
        </CardHeader>
        <CardContent className='py-6'>
          {workshop.workshopFoodDetails && workshop.workshopFoodDetails.length > 0 ? (
            <div className='grid gap-4'>
              {workshop.workshopFoodDetails.map((food) => (
                <div key={food.id} className='flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50'>
                  <div className='font-medium'>{food.name}</div>
                  <div className='text-amber-600 font-semibold'>{food.price.toLocaleString('vi-VN')} đ</div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center text-muted-foreground py-4'>Không có món ăn nào được thêm vào workshop này</div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Workshop Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy workshop</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy workshop này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không, giữ lại</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelWorkshop} className='bg-amber-600 hover:bg-amber-700'>
              Có, hủy workshop
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
