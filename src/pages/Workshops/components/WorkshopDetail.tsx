import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { Workshop } from '@/types/workshop'
import WorkshopService from '@/services/workshop-service'

export default function WorkshopDetail() {
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [loading, setLoading] = useState(true)
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const workshopService = WorkshopService.getInstance()

  useEffect(() => {
    if (id) {
      fetchWorkshopDetails(id)
    }
  }, [id])

  const fetchWorkshopDetails = async (workshopId: string) => {
    try {
      setLoading(true)
      const response = await workshopService.getWorkshopById(workshopId)
      if (response.success) {
        setWorkshop(response.result)
      } else {
        console.error('Failed to fetch workshop details:', response.message)
      }
    } catch {
      console.error('Error fetching workshop details')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    // if (id && window.confirm("Bạn có chắc chắn muốn xóa workshop này không?")) {
    //   try {
    //     const response = await workshopService.deleteWorkshop(id)
    //     if (response.success) {
    //       navigate("/workshops")
    //     }
    //   } catch (error) {
    //     console.error("Error deleting workshop:", error)
    //   }
    // }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <Badge className='bg-blue-500 hover:bg-blue-600'>Đã lên lịch</Badge>
      case 'Opening':
        return <Badge className='bg-green-500 hover:bg-green-600'>Đang mở</Badge>
      case 'Closed':
        return <Badge className='bg-gray-500 hover:bg-gray-600'>Đã đóng</Badge>
      case 'Approved':
        return <Badge className='bg-purple-500 hover:bg-purple-600'>Đã duyệt</Badge>
      case 'Cancelled':
        return <Badge className='bg-red-500 hover:bg-red-600'>Đã hủy</Badge>
      default:
        return <Badge className='bg-gray-400 hover:bg-gray-500'>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'HH:mm dd/MM/yyyy', { locale: vi })
    } catch (error) {
      console.log('Error formatting date:', error)
      return dateString
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
      </div>
    )
  }

  if (!workshop) {
    return (
      <div className='text-center p-8'>
        <h2 className='text-2xl font-bold mb-4'>Không tìm thấy workshop</h2>
        <Button onClick={() => navigate('/workshops')}>
          <ArrowLeft className='mr-2 h-4 w-4' /> Quay lại
        </Button>
      </div>
    )
  }

  return (
    <div className='mx-auto p-4 max-w-full'>
      <div className='flex items-center mb-6'>
        <Button variant='ghost' onClick={() => navigate('/workshops')} className='mr-4'>
          <ArrowLeft className='h-4 w-4 mr-2' /> Quay lại
        </Button>
        <h1 className='text-2xl font-bold'>Chi tiết Workshop</h1>
      </div>

      <Card>
        <CardHeader className='flex flex-row items-start justify-between'>
          <div>
            <CardTitle className='text-2xl'>{workshop.name}</CardTitle>
            <p className='text-muted-foreground mt-1'>{workshop.header}</p>
          </div>
          <div className='flex space-x-2'>
            <Button variant='outline' onClick={() => navigate(`/workshops/edit/${id}`)}>
              <Edit className='h-4 w-4 mr-2' /> Chỉnh sửa
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              <Trash2 className='h-4 w-4 mr-2' /> Xóa
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h3 className='text-lg font-semibold mb-4'>Thông tin chung</h3>
              <div className='space-y-3'>
                <div>
                  <p className='text-sm text-muted-foreground'>Trạng thái</p>
                  <div className='mt-1'>{getStatusBadge(workshop.workshopStatus)}</div>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Mô tả</p>
                  <p className='mt-1'>{workshop.description}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Địa điểm</p>
                  <p className='mt-1'>{workshop.location}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Khu vực</p>
                  <p className='mt-1'>{workshop.zoneName}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Người tổ chức</p>
                  <p className='mt-1'>{workshop.organizer}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Hotline</p>
                  <p className='mt-1'>{workshop.hotLineContact}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className='text-lg font-semibold mb-4'>Thời gian & Đăng ký</h3>
              <div className='space-y-3'>
                <div>
                  <p className='text-sm text-muted-foreground'>Thời gian diễn ra</p>
                  <p className='mt-1 font-medium'>{formatDate(workshop.workshopDate)}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Thời gian đăng ký</p>
                  <p className='mt-1'>
                    {formatDate(workshop.startRegisterDate)} - {formatDate(workshop.endRegisterDate)}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Phí tham gia</p>
                  <p className='mt-1'>{workshop.totalFee.toLocaleString('vi-VN')} đ</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Số lượng đăng ký tối đa</p>
                  <p className='mt-1'>{workshop.maxRegister}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Số pizza tối đa/đăng ký</p>
                  <p className='mt-1'>{workshop.maxPizzaPerRegister}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Số người tối đa/đăng ký</p>
                  <p className='mt-1'>{workshop.maxParticipantPerRegister}</p>
                </div>
              </div>
            </div>
          </div>

          {workshop.workshopFoodDetails && workshop.workshopFoodDetails.length > 0 && (
            <div>
              <h3 className='text-lg font-semibold mb-4'>Thực đơn</h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {workshop.workshopFoodDetails.map((food) => (
                  <Card key={food.id} className='p-4'>
                    <p className='font-medium'>ID: {food.productId}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
