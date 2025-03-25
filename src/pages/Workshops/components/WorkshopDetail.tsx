import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import WorkshopService from '@/services/workshop-service'
import { useParams } from 'react-router-dom'
import { Workshop } from '@/types/workshop'
import DateTimeDisplay from '@/components/DateTimeDisplay'

export default function WorkshopDetail() {
  const { id } = useParams<{ id: string }>()
  const [workshop, setWorkshop] = useState<Workshop | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      const response = await WorkshopService.getInstance().getWorkshopById(id)
      if (response.success) {
        setWorkshop(response.result)
      }
    }
    fetchData()
  }, [id])

  if (!workshop) {
    return <div className='p-4'>Đang tải dữ liệu workshop...</div>
  }

  return (
    <div className='container mx-auto py-6'>
      <Card className='shadow-sm'>
        <CardHeader>
          <CardTitle className='text-2xl'>{workshop.name}</CardTitle>
        </CardHeader>
        <CardContent>
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
    </div>
  )
}
