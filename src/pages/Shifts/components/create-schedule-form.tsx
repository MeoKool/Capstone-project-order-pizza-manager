'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Clock, ArrowRight, Plus, CircleCheck } from 'lucide-react'
import StaffScheduleService from '@/services/staff-schedule-service'
import type { Shift, Day } from '@/types/staff-schedule'
import { toast } from 'sonner'

export default function CreateScheduleForm() {
  const [activeStep, setActiveStep] = useState(1)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [days, setDays] = useState<Day[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Shift form states
  const [shiftName, setShiftName] = useState('')
  const [shiftDescription, setShiftDescription] = useState('')

  // Working slot form states
  const [selectedShift, setSelectedShift] = useState('')
  const [selectedDay, setSelectedDay] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('17:00')
  const [capacity, setCapacity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchFormData()
  }, [])

  const fetchFormData = async () => {
    try {
      setIsLoading(true)
      const staffScheduleService = StaffScheduleService.getInstance()
      const [shiftsResponse, daysResponse] = await Promise.all([
        staffScheduleService.getAllShifts(),
        staffScheduleService.getAllDays()
      ])

      if (shiftsResponse.success && shiftsResponse.result) {
        setShifts(shiftsResponse.result.items)
      }

      if (daysResponse.success && daysResponse.result) {
        setDays(daysResponse.result.items)
      }
    } catch (error) {
      console.error('Error fetching form data:', error)
      toast.error('Không thể tải dữ liệu ca làm và ngày')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!shiftName) {
      toast.error('Vui lòng nhập tên ca làm')
      return
    }

    setIsSubmitting(true)

    try {
      const staffScheduleService = StaffScheduleService.getInstance()
      const response = await staffScheduleService.createShift({
        name: shiftName,
        description: shiftDescription
      })

      if (response.success) {
        toast.success('Đã tạo ca làm mới')
        setShiftName('')
        setShiftDescription('')
        // Refresh shifts data
        fetchFormData()
        // Move to next step
        setActiveStep(2)
      } else {
        toast.error(response.message || 'Không thể tạo ca làm')
      }
    } catch (error) {
      console.error('Error creating shift:', error)
      toast.error('Đã xảy ra lỗi khi tạo ca làm')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateWorkingSlot = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedShift || !selectedDay) {
      toast.error('Vui lòng chọn ca làm và ngày')
      return
    }

    setIsSubmitting(true)

    try {
      const staffScheduleService = StaffScheduleService.getInstance()
      const response = await staffScheduleService.createWorkingSlot({
        shiftStart: `${startTime}:00`,
        shiftEnd: `${endTime}:00`,
        capacity: capacity,
        dayId: selectedDay,
        shiftId: selectedShift
      })

      if (response.success) {
        toast.success('Đã tạo lịch làm việc mới')
        // Reset form
        setSelectedShift('')
        setSelectedDay('')
        setStartTime('08:00')
        setEndTime('17:00')
        setCapacity(1)
      } else {
        toast.error(response.message || 'Không thể tạo lịch làm việc')
      }
    } catch (error) {
      console.error('Error creating working slot:', error)
      toast.error('Đã xảy ra lỗi khi tạo lịch làm việc')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-8 h-[400px]'>
        <div className='flex flex-col items-center gap-2'>
          <div className='animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full'></div>
          <div className='text-red-600 font-medium'>Đang tải dữ liệu...</div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2 mb-6'>
        <h2 className='text-xl font-semibold text-gray-800'>Tạo lịch làm việc mới</h2>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div
          className={`rounded-md p-4 flex items-center gap-3 cursor-pointer ${
            activeStep === 1 ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800'
          }`}
          onClick={() => setActiveStep(1)}
        >
          <CircleCheck className={`h-5 w-5 ${activeStep === 1 ? 'text-white' : 'text-red-600'}`} />
          <span className='font-medium'>Bước 1: Tạo ca làm</span>
        </div>

        <div
          className={`rounded-md p-4 flex items-center gap-3 cursor-pointer ${
            activeStep === 2 ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800'
          }`}
          onClick={() => setActiveStep(2)}
        >
          <CircleCheck className={`h-5 w-5 ${activeStep === 2 ? 'text-white' : 'text-red-600'}`} />
          <span className='font-medium'>Bước 2: Tạo lịch làm việc</span>
        </div>
      </div>

      <Card className='border-gray-200 shadow-sm mt-4'>
        <CardContent className='p-6'>
          {activeStep === 1 ? (
            <div>
              <div className='flex items-center gap-2 mb-4'>
                <Clock className='h-5 w-5 text-red-600' />
                <h3 className='text-lg font-medium text-gray-800'>Tạo ca làm mới</h3>
              </div>
              <p className='text-gray-500 text-sm mb-6'>Thêm ca làm mới vào hệ thống</p>

              <form onSubmit={handleCreateShift} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name' className='text-gray-700'>
                    Tên ca làm
                  </Label>
                  <Input
                    id='name'
                    value={shiftName}
                    onChange={(e) => setShiftName(e.target.value)}
                    placeholder='Ví dụ: Ca sáng, Ca chiều...'
                    className='border-gray-300 focus-visible:ring-red-500'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='description' className='text-gray-700'>
                    Mô tả
                  </Label>
                  <Textarea
                    id='description'
                    value={shiftDescription}
                    onChange={(e) => setShiftDescription(e.target.value)}
                    placeholder='Mô tả chi tiết về ca làm'
                    className='border-gray-300 focus-visible:ring-red-500 min-h-[120px]'
                  />
                </div>

                <div className='flex justify-between pt-4'>
                  <Button
                    type='button'
                    variant='outline'
                    className='border-gray-300 text-gray-700'
                    onClick={() => setActiveStep(2)}
                  >
                    Bỏ qua
                  </Button>
                  <Button type='submit' disabled={isSubmitting} className='bg-red-500 hover:bg-red-600 text-white'>
                    {isSubmitting ? (
                      'Đang tạo...'
                    ) : (
                      <div className='flex items-center gap-2'>
                        <span>Tiếp tục</span>
                        <ArrowRight className='h-4 w-4' />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <div className='flex items-center gap-2 mb-4'>
                <Plus className='h-5 w-5 text-red-600' />
                <h3 className='text-lg font-medium text-gray-800'>Tạo lịch làm việc</h3>
              </div>
              <p className='text-gray-500 text-sm mb-6'>Thêm lịch làm việc mới vào hệ thống</p>

              <form onSubmit={handleCreateWorkingSlot} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='shift' className='text-gray-700'>
                    Ca làm
                  </Label>
                  <Select value={selectedShift} onValueChange={setSelectedShift}>
                    <SelectTrigger id='shift' className='border-gray-300 focus:ring-red-500'>
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
                  <Label htmlFor='day' className='text-gray-700'>
                    Ngày
                  </Label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger id='day' className='border-gray-300 focus:ring-red-500'>
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
                    <Label htmlFor='startTime' className='text-gray-700'>
                      Giờ bắt đầu
                    </Label>
                    <Input
                      id='startTime'
                      type='time'
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className='border-gray-300 focus-visible:ring-red-500'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='endTime' className='text-gray-700'>
                      Giờ kết thúc
                    </Label>
                    <Input
                      id='endTime'
                      type='time'
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className='border-gray-300 focus-visible:ring-red-500'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='capacity' className='text-gray-700'>
                    Số lượng nhân viên
                  </Label>
                  <Input
                    id='capacity'
                    type='number'
                    min='1'
                    value={capacity}
                    onChange={(e) => setCapacity(Number.parseInt(e.target.value))}
                    className='border-gray-300 focus-visible:ring-red-500'
                  />
                </div>

                <div className='flex justify-between pt-4'>
                  <Button
                    type='button'
                    variant='outline'
                    className='border-gray-300 text-gray-700'
                    onClick={() => setActiveStep(1)}
                  >
                    Quay lại
                  </Button>
                  <Button type='submit' disabled={isSubmitting} className='bg-red-500 hover:bg-red-600 text-white'>
                    {isSubmitting ? 'Đang tạo...' : 'Tạo lịch làm việc'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
