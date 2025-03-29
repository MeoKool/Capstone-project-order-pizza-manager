import type React from 'react'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import ShiftService from '@/services/shift-service'
import type { Shift, Day } from '@/types/shift'
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
        const shiftService = ShiftService.getInstance()
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
        console.log(error)
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
      toast('Vui lòng chọn ca làm và ngày')
      return
    }

    setIsSubmitting(true)

    try {
      const shiftService = ShiftService.getInstance()
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
      console.log(error)

      toast.error('Đã xảy ra lỗi khi tạo lịch làm việc')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className='flex justify-center p-4'>Đang tải dữ liệu...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo lịch làm việc</CardTitle>
        <CardDescription>Thêm lịch làm việc mới vào hệ thống</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='shift'>Ca làm</Label>
            <Select value={selectedShift} onValueChange={setSelectedShift}>
              <SelectTrigger id='shift'>
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
            <Label htmlFor='day'>Ngày</Label>
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger id='day'>
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
              <Label htmlFor='startTime'>Giờ bắt đầu</Label>
              <Input id='startTime' type='time' value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='endTime'>Giờ kết thúc</Label>
              <Input id='endTime' type='time' value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='capacity'>Số lượng nhân viên</Label>
            <Input
              id='capacity'
              type='number'
              min='1'
              value={capacity}
              onChange={(e) => setCapacity(Number.parseInt(e.target.value))}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Đang tạo...' : 'Tạo lịch làm việc'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
