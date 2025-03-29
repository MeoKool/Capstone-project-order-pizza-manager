import { useEffect, useState } from 'react'
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  getDay
} from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, ChevronRight, Calendar, Users } from 'lucide-react'
import ShiftService from '@/services/shift-service'
import type { WorkingSlot, Shift, Day } from '@/types/shift'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'week' | 'month'>('week')
  const [workingSlots, setWorkingSlots] = useState<WorkingSlot[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [days, setDays] = useState<Day[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<WorkingSlot | null>(null)
  console.log(selectedSlot)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shiftService = ShiftService.getInstance()
        const [slotsResponse, shiftsResponse, daysResponse] = await Promise.all([
          shiftService.getAllWorkingSlots(),
          shiftService.getAllShifts(),
          shiftService.getAllDays()
        ])

        if (slotsResponse.success && slotsResponse.result) {
          setWorkingSlots(slotsResponse.result.items)
        }

        if (shiftsResponse.success && shiftsResponse.result) {
          setShifts(shiftsResponse.result.items)
        }

        if (daysResponse.success && daysResponse.result) {
          setDays(daysResponse.result.items)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const getShiftName = (shiftId: string) => {
    const shift = shifts.find((s) => s.id === shiftId)
    return shift ? shift.name : 'Unknown Shift'
  }

  const getDayName = (dayId: string) => {
    const day = days.find((d) => d.id === dayId)
    return day ? day.name : 'Unknown Day'
  }

  const getDaySlots = (dayId: string) => {
    return workingSlots.filter((slot) => slot.dayId === dayId)
  }

  const handlePrevious = () => {
    if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1))
    } else {
      const prevMonth = new Date(currentDate)
      prevMonth.setMonth(prevMonth.getMonth() - 1)
      setCurrentDate(prevMonth)
    }
  }

  const handleNext = () => {
    if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1))
    } else {
      const nextMonth = new Date(currentDate)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      setCurrentDate(nextMonth)
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const renderWeekView = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const end = endOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDays = eachDayOfInterval({ start, end })

    return (
      <div className='grid grid-cols-7 gap-2'>
        {weekDays.map((day, index) => {
          const dayName = format(day, 'EEEE', { locale: vi })
          const dayId = days.find((d) => d.name === dayName)?.id
          const daySlots = dayId ? getDaySlots(dayId) : []

          return (
            <div key={index} className='border rounded-md p-2 min-h-[150px]'>
              <div className='font-medium text-center pb-2 border-b'>
                {format(day, 'EEEE', { locale: vi })}
                <div className='text-sm text-muted-foreground'>{format(day, 'dd/MM')}</div>
              </div>
              <div className='mt-2 space-y-1'>
                {daySlots.map((slot, slotIndex) => (
                  <Dialog key={slotIndex}>
                    <DialogTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full text-left justify-start text-xs p-2 h-auto'
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <div>
                          <div className='font-medium'>{getShiftName(slot.shiftId)}</div>
                          <div className='text-muted-foreground'>
                            {slot.shiftStart.substring(0, 5)} - {slot.shiftEnd.substring(0, 5)}
                          </div>
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Chi tiết ca làm việc</DialogTitle>
                      </DialogHeader>
                      <div className='space-y-4 py-4'>
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <div className='text-sm font-medium'>Ngày:</div>
                            <div>{getDayName(slot.dayId)}</div>
                          </div>
                          <div>
                            <div className='text-sm font-medium'>Ca làm:</div>
                            <div>{getShiftName(slot.shiftId)}</div>
                          </div>
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <div className='text-sm font-medium'>Thời gian:</div>
                            <div>
                              {slot.shiftStart.substring(0, 5)} - {slot.shiftEnd.substring(0, 5)}
                            </div>
                          </div>
                          <div>
                            <div className='text-sm font-medium'>Số lượng nhân viên:</div>
                            <div className='flex items-center'>
                              <Users className='h-4 w-4 mr-1' />
                              <span>
                                {slot.registeredCount || 0}/{slot.capacity}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className='text-sm font-medium'>Trạng thái:</div>
                          <div
                            className={`font-medium ${(slot.registeredCount || 0) >= slot.capacity ? 'text-red-500' : 'text-green-500'}`}
                          >
                            {(slot.registeredCount || 0) >= slot.capacity ? 'Đã đủ nhân viên' : 'Còn trống'}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
                {daySlots.length === 0 && (
                  <div className='text-xs text-muted-foreground text-center py-2'>Không có ca làm</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderMonthView = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const monthDays = eachDayOfInterval({ start, end })

    // Create a 6x7 grid for the month view
    const firstDayOfMonth = getDay(start)
    const daysToAdd = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 // Adjust for Monday start

    const calendarDays = []

    // Add days from previous month
    for (let i = daysToAdd; i > 0; i--) {
      calendarDays.push(addDays(start, -i))
    }

    // Add days of current month
    calendarDays.push(...monthDays)

    // Add days from next month to fill the grid
    const remainingDays = 42 - calendarDays.length
    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push(addDays(end, i))
    }

    // Split into weeks
    const weeks = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7))
    }

    return (
      <div className='space-y-2'>
        <div className='grid grid-cols-7 gap-2 text-center font-medium'>
          <div>T2</div>
          <div>T3</div>
          <div>T4</div>
          <div>T5</div>
          <div>T6</div>
          <div>T7</div>
          <div>CN</div>
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className='grid grid-cols-7 gap-2'>
            {week.map((day, dayIndex) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()
              const dayName = format(day, 'EEEE', { locale: vi })
              const dayId = days.find((d) => d.name === dayName)?.id
              const daySlots = dayId ? getDaySlots(dayId) : []

              return (
                <div
                  key={dayIndex}
                  className={`border rounded-md p-1 min-h-[100px] ${isCurrentMonth ? '' : 'bg-muted/20 text-muted-foreground'}`}
                >
                  <div className='text-right text-xs'>{format(day, 'd')}</div>
                  <div className='mt-1 space-y-1'>
                    {daySlots.length > 0 ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant='outline' size='sm' className='w-full text-center text-xs p-1 h-auto'>
                            {daySlots.length} ca làm
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Ca làm việc - {format(day, 'EEEE, dd/MM/yyyy', { locale: vi })}</DialogTitle>
                          </DialogHeader>
                          <div className='space-y-4 py-4'>
                            {daySlots.map((slot, slotIndex) => (
                              <Card key={slotIndex} className='p-2'>
                                <div className='grid grid-cols-2 gap-2'>
                                  <div>
                                    <div className='text-sm font-medium'>{getShiftName(slot.shiftId)}</div>
                                    <div className='text-xs text-muted-foreground'>
                                      {slot.shiftStart.substring(0, 5)} - {slot.shiftEnd.substring(0, 5)}
                                    </div>
                                  </div>
                                  <div className='text-right'>
                                    <div className='flex items-center justify-end'>
                                      <Users className='h-4 w-4 mr-1' />
                                      <span className='text-sm'>
                                        {slot.registeredCount || 0}/{slot.capacity}
                                      </span>
                                    </div>
                                    <div
                                      className={`text-xs font-medium ${(slot.registeredCount || 0) >= slot.capacity ? 'text-red-500' : 'text-green-500'}`}
                                    >
                                      {(slot.registeredCount || 0) >= slot.capacity ? 'Đã đủ' : 'Còn trống'}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      isCurrentMonth && (
                        <div className='text-xs text-muted-foreground text-center py-1'>Không có ca</div>
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return <div className='flex justify-center p-4'>Đang tải dữ liệu...</div>
  }

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle>Lịch làm việc</CardTitle>
          <div className='flex items-center space-x-2'>
            <Button variant='outline' size='sm' onClick={handlePrevious}>
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='sm' onClick={handleToday}>
              Hôm nay
            </Button>
            <Button variant='outline' size='sm' onClick={handleNext}>
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
        <div className='flex items-center justify-between mt-2'>
          <div className='text-lg font-medium'>
            {view === 'week'
              ? `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'dd/MM')} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'dd/MM/yyyy')}`
              : format(currentDate, 'MMMM yyyy', { locale: vi })}
          </div>
          <Tabs value={view} onValueChange={(v) => setView(v as 'week' | 'month')}>
            <TabsList>
              <TabsTrigger value='week' className='flex items-center gap-1'>
                <Calendar className='h-4 w-4' />
                <span>Tuần</span>
              </TabsTrigger>
              <TabsTrigger value='month' className='flex items-center gap-1'>
                <Calendar className='h-4 w-4' />
                <span>Tháng</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={view} className='w-full'>
          <TabsContent value='week' className='mt-0'>
            {renderWeekView()}
          </TabsContent>
          <TabsContent value='month' className='mt-0'>
            {renderMonthView()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
