import type React from 'react'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import StaffScheduleService from '@/services/staff-schedule-service'
import type { Shift, Day } from '@/types/staff-schedule'
import { CalendarPlus, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function WorkingSlotForm() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [days, setDays] = useState<Day[]>([])
  const [selectedShift, setSelectedShift] = useState('')
  const [selectedDay, setSelectedDay] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('17:00')
  const [capacity, setCapacity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shiftService = StaffScheduleService.getInstance()
        const [shiftsResponse, daysResponse] = await Promise.all([
          shiftService.getAllShifts(),
          shiftService.getAllDays()
        ])

        if (shiftsResponse.success && shiftsResponse.result) {
          setShifts(shiftsResponse.result.items)
        }

        if (daysResponse.success && daysResponse.result) {
          setDays(daysResponse.result.items)
        }
      } catch (error) {
        console.error(error)
        toast.error('Không thể tải dữ liệu ca làm và ngày')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedShift || !selectedDay) {
      toast.error('Vui lòng chọn ca làm và ngày')
      return
    }

    setIsSubmitting(true)

    try {
      const shiftService = StaffScheduleService.getInstance()
      const response = await shiftService.createWorkingSlot({
        shiftStart: `${startTime}:00`,
        shiftEnd: `${endTime}:00`,
        capacity: capacity,
        dayId: selectedDay,
        shiftId: selectedShift
      })

      if (response.success) {
        toast.success('Đã tạo lịch làm việc mới')
      } else {
        toast.error(response.message || 'Không thể tạo lịch làm việc')
      }
    } catch (error) {
      console.error(error)
      toast.error('Đã xảy ra lỗi khi tạo lịch làm việc')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-8 h-[400px]'>
        <div className='flex flex-col items-center gap-2'>
          <div className='animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full'></div>
          <div className='text-green-600 font-medium'>Đang tải dữ liệu...</div>
        </div>
      </div>
    )
  }

  return (
    <Card className='border-green-200 shadow-md'>
      <CardHeader className='bg-green-50 border-b border-green-100'>
        <CardTitle className='text-black-800 flex items-center gap-2'>
          <CalendarPlus className='h-5 w-5 text-black-600' />
          Tạo lịch làm việc
        </CardTitle>
        <CardDescription className='text-black-600'>Thêm lịch làm việc mới vào hệ thống</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className='space-y-4 pt-6'>
          <div className='space-y-2'>
            <Label htmlFor='shift' className='text-black-700'>
              Ca làm
            </Label>
            <Select value={selectedShift} onValueChange={setSelectedShift}>
              <SelectTrigger id='shift' className='border-black-200 focus:ring-green-500'>
                <SelectValue placeholder='Chọn ca làm' />
              </SelectTrigger>
              <SelectContent>
                {shifts.map((shift) => (
                  <SelectItem key={shift.id} value={shift.id}>
                    {shift.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='day' className='text-black-700'>
              Ngày
            </Label>
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger id='day' className='border-green-200 focus:ring-green-500'>
                <SelectValue placeholder='Chọn ngày' />
              </SelectTrigger>
              <SelectContent>
                {days.map((day) => (
                  <SelectItem key={day.id} value={day.id}>
                    {day.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='startTime' className='text-black-700'>
                Giờ bắt đầu
              </Label>
              <div className='flex items-center'>
                <Clock className='h-4 w-4 text-black-500 mr-2' />
                <Input
                  id='startTime'
                  type='time'
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className='border-green-200 focus-visible:ring-green-500'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='endTime' className='text-black-700'>
                Giờ kết thúc
              </Label>
              <div className='flex items-center'>
                <Clock className='h-4 w-4 text-black-500 mr-2' />
                <Input
                  id='endTime'
                  type='time'
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className='border-green-200 focus-visible:ring-green-500'
                />
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='capacity' className='text-black-700'>
              Số lượng nhân viên
            </Label>
            <Input
              id='capacity'
              type='number'
              min='1'
              value={capacity}
              onChange={(e) => setCapacity(Number.parseInt(e.target.value))}
              className='border-green-200 focus-visible:ring-green-500'
            />
          </div>
        </CardContent>
        <CardFooter className='bg-green-50/50 border-t border-green-100'>
          <Button type='submit' disabled={isSubmitting} className='bg-green-600 hover:bg-green-700 text-white'>
            {isSubmitting ? 'Đang tạo...' : 'Tạo lịch làm việc'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
