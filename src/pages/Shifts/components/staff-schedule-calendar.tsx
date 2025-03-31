import { useEffect, useState } from 'react'
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isSameDay,
  startOfMonth,
  endOfMonth,
  getDay,
  addMonths,
  subMonths,
  addDays,
  isToday,
  isSameMonth
} from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Calendar, Users, MapPin, Phone, Clock, CalendarDays } from 'lucide-react'
import StaffScheduleService from '@/services/staff-schedule-service'
import type { StaffSchedule } from '@/types/staff-schedule'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function StaffScheduleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'week' | 'month'>('month')
  const [staffSchedules, setStaffSchedules] = useState<StaffSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [, setSelectedDate] = useState<Date | null>(null)
  const [, setSelectedDaySchedules] = useState<StaffSchedule[]>([])

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      setIsLoading(true)
      const staffScheduleService = StaffScheduleService.getInstance()
      const response = await staffScheduleService.getStaffSchedules()

      if (response.success && response.result) {
        setStaffSchedules(response.result.items)
      }
    } catch (error) {
      console.error('Error fetching staff schedules:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrevious = () => {
    if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1))
    } else {
      setCurrentDate(subMonths(currentDate, 1))
    }
  }

  const handleNext = () => {
    if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1))
    } else {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const getSchedulesForDate = (date: Date) => {
    return staffSchedules.filter((schedule) => {
      const scheduleDate = parseISO(schedule.workingDate)
      return isSameDay(scheduleDate, date)
    })
  }

  const handleDateClick = (date: Date, schedules: StaffSchedule[]) => {
    setSelectedDate(date)
    setSelectedDaySchedules(schedules)
  }

  const getStaffTypeLabel = (staffType: string) => {
    switch (staffType) {
      case 'Manager':
        return 'Quản lý'
      case 'Staff':
        return 'Nhân viên'
      default:
        return staffType
    }
  }

  const getStaffStatusLabel = (status: string) => {
    switch (status) {
      case 'FullTime':
        return 'Toàn thời gian'
      case 'PartTime':
        return 'Bán thời gian'
      default:
        return status
    }
  }

  const getStaffTypeColor = (staffType: string) => {
    switch (staffType) {
      case 'Manager':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'Staff':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStaffStatusColor = (status: string) => {
    switch (status) {
      case 'FullTime':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'PartTime':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  // Group schedules by zone and slot
  const groupSchedulesByZoneAndSlot = (schedules: StaffSchedule[]) => {
    const grouped: Record<string, StaffSchedule[]> = {}

    schedules.forEach((schedule) => {
      // Create a unique key based on zone and working slot
      const slotId = schedule.workingSlot?.id || 'no-slot'
      const zoneId = schedule.zone.id
      const key = `${zoneId}-${slotId}`

      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(schedule)
    })

    return grouped
  }

  const renderStaffDialog = (date: Date, schedules: StaffSchedule[]) => {
    const formattedDate = format(date, 'EEEE, dd/MM/yyyy', { locale: vi })
    const groupedSchedules = groupSchedulesByZoneAndSlot(schedules)

    return (
      <Dialog>
        <DialogTrigger asChild>
          <div
            className='h-full w-full flex flex-col items-center justify-center cursor-pointer hover:bg-green-50/50 transition-colors rounded-md p-2'
            onClick={() => handleDateClick(date, schedules)}
          >
            <Badge className='bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 flex items-center gap-1 px-3 py-1.5 rounded-full'>
              <Users className='h-3.5 w-3.5' />
              <span className='font-medium'>{schedules.length}</span>
            </Badge>
          </div>
        </DialogTrigger>
        <DialogContent className='max-w-3xl max-h-[80vh] flex flex-col'>
          <DialogHeader>
            <DialogTitle className='text-xl flex items-center gap-2 text-green-700'>
              <CalendarDays className='h-5 w-5' />
              Lịch làm việc - {formattedDate}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className='flex-1 overflow-y-auto pr-4 max-h-[calc(80vh-120px)]'>
            <div className='py-4'>
              {Object.entries(groupedSchedules).map(([, groupedStaff], groupIndex) => {
                // Use the first schedule in the group to get zone and slot info
                const firstSchedule = groupedStaff[0]

                return (
                  <div
                    key={groupIndex}
                    className='mb-6 last:mb-0 bg-white rounded-lg border border-green-200 p-4 shadow-sm hover:shadow-md transition-shadow'
                  >
                    <div className='flex flex-col gap-4'>
                      {/* Zone and Shift Information */}
                      <div className='flex items-center justify-between border-b border-green-100 pb-3'>
                        <div className='flex items-center gap-3'>
                          <div className='h-10 w-10 rounded-full bg-green-100 flex items-center justify-center border border-green-200'>
                            <MapPin className='h-5 w-5 text-green-700' />
                          </div>
                          <div>
                            <div className='font-medium text-green-900'>{firstSchedule.zoneName}</div>
                            <div className='text-sm text-gray-600'>{firstSchedule.zone.description}</div>
                          </div>
                        </div>

                        {firstSchedule.workingSlot && (
                          <div className='flex items-center gap-3'>
                            <Badge className='bg-amber-100 text-amber-800 border border-amber-300'>
                              {firstSchedule.workingSlot.shiftName}
                            </Badge>
                            <div className='flex items-center gap-1 text-gray-700'>
                              <Clock className='h-4 w-4 text-amber-600' />
                              <span>
                                {firstSchedule.workingSlot.shiftStart.substring(0, 5)} -{' '}
                                {firstSchedule.workingSlot.shiftEnd.substring(0, 5)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Staff List */}
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {groupedStaff.map((schedule, staffIndex) => (
                          <div key={staffIndex} className='flex items-start gap-3 p-2 rounded-md hover:bg-green-50/50'>
                            <Avatar className='h-10 w-10 bg-green-100 text-green-700 border border-green-200'>
                              <AvatarFallback>{getInitials(schedule.staffName)}</AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                              <h3 className='font-semibold text-green-900'>{schedule.staffName}</h3>
                              <div className='flex flex-wrap gap-2 mt-1'>
                                <Badge
                                  variant='outline'
                                  className={`${getStaffTypeColor(schedule.staff.staffType)} border text-xs`}
                                >
                                  {getStaffTypeLabel(schedule.staff.staffType)}
                                </Badge>
                                <Badge
                                  variant='outline'
                                  className={`${getStaffStatusColor(schedule.staff.status)} border text-xs`}
                                >
                                  {getStaffStatusLabel(schedule.staff.status)}
                                </Badge>
                              </div>
                              <div className='mt-1 text-sm text-gray-700'>
                                <Phone className='h-3.5 w-3.5 inline mr-1 text-green-600' />
                                {schedule.staff.phone}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
          <DialogFooter className='mt-4 border-t pt-4'>
            <DialogClose asChild>
              <Button className='bg-green-600 hover:bg-green-700 text-white'>Đóng</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const renderWeekView = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const end = endOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDays = eachDayOfInterval({ start, end })

    return (
      <div className='grid grid-cols-7 gap-3'>
        {weekDays.map((day, index) => {
          const daySchedules = getSchedulesForDate(day)
          const hasSchedules = daySchedules.length > 0
          const isCurrentDay = isToday(day)
          const isWeekend = index >= 5 // Saturday and Sunday

          return (
            <div
              key={index}
              className={`border rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md ${
                isCurrentDay
                  ? 'border-green-400 bg-green-50'
                  : isWeekend
                    ? 'border-amber-200 bg-amber-50/30'
                    : 'border-gray-200'
              }`}
            >
              <div
                className={`font-medium text-center py-2 ${
                  isCurrentDay
                    ? 'bg-green-500 text-white'
                    : isWeekend
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-gray-100 text-gray-700'
                }`}
              >
                <div>{format(day, 'EEEE', { locale: vi })}</div>
                <div className='text-sm'>{format(day, 'dd/MM')}</div>
              </div>
              <div className='p-3 min-h-[100px] flex items-center justify-center'>
                {hasSchedules ? (
                  renderStaffDialog(day, daySchedules)
                ) : (
                  <div
                    className={`text-xs text-center h-full w-full flex items-center justify-center ${
                      isWeekend ? 'text-amber-700' : 'text-gray-500'
                    }`}
                  >
                    Không có ca làm
                  </div>
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

    // Create a 6x7 grid for the month view
    const firstDayOfMonth = getDay(start)
    const daysToAdd = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 // Adjust for Monday start

    const calendarDays = []

    // Add days from previous month
    for (let i = daysToAdd; i > 0; i--) {
      calendarDays.push(addDays(start, -i))
    }

    // Add days of current month
    const monthDays = eachDayOfInterval({ start, end })
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
      <div className='space-y-3'>
        <div className='grid grid-cols-7 gap-3 text-center font-medium text-gray-700'>
          <div className='py-1'>T2</div>
          <div className='py-1'>T3</div>
          <div className='py-1'>T4</div>
          <div className='py-1'>T5</div>
          <div className='py-1'>T6</div>
          <div className='py-1 text-amber-700'>T7</div>
          <div className='py-1 text-amber-700'>CN</div>
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className='grid grid-cols-7 gap-3'>
            {week.map((day, dayIndex) => {
              const isCurrentMonth = isSameMonth(day, currentDate)
              const daySchedules = getSchedulesForDate(day)
              const hasSchedules = daySchedules.length > 0
              const isCurrentDay = isToday(day)
              const isWeekend = dayIndex >= 5 // Saturday and Sunday

              return (
                <div
                  key={dayIndex}
                  className={`border rounded-lg p-2 min-h-[110px] transition-all ${
                    !isCurrentMonth
                      ? 'bg-gray-50 text-gray-400 border-gray-100'
                      : isCurrentDay
                        ? 'border-green-400 bg-green-50 shadow-sm'
                        : isWeekend
                          ? 'border-amber-200 bg-amber-50/30'
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-50/30'
                  }`}
                >
                  <div
                    className={`text-right text-sm font-medium p-1 rounded-full w-7 h-7 flex items-center justify-center ml-auto ${
                      isCurrentDay
                        ? 'bg-green-500 text-white'
                        : isWeekend && isCurrentMonth
                          ? 'bg-amber-100 text-amber-900'
                          : ''
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                  <div className='mt-2 flex items-center justify-center h-[60px]'>
                    {hasSchedules && isCurrentMonth
                      ? renderStaffDialog(day, daySchedules)
                      : isCurrentMonth && (
                          <div
                            className={`text-xs text-center h-full flex items-center justify-center ${
                              isWeekend ? 'text-amber-700' : 'text-gray-500'
                            }`}
                          >
                            Không có ca làm
                          </div>
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
    <Card className='border-none shadow-none'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handlePrevious}
              className='border-green-200 text-green-700 hover:bg-green-50'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleToday}
              className='border-green-200 text-green-700 hover:bg-green-50'
            >
              Hôm nay
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleNext}
              className='border-green-200 text-green-700 hover:bg-green-50'
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
        <div className='flex items-center justify-between mt-2'>
          <div className='text-lg font-medium text-green-700'>
            {view === 'week'
              ? `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'dd/MM')} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'dd/MM/yyyy')}`
              : format(currentDate, 'MMMM yyyy', { locale: vi })}
          </div>
          <Tabs value={view} onValueChange={(v) => setView(v as 'week' | 'month')}>
            <TabsList className='bg-green-100'>
              <TabsTrigger
                value='week'
                className='flex items-center gap-1 data-[state=active]:bg-green-600 data-[state=active]:text-white'
              >
                <Calendar className='h-4 w-4' />
                <span>Tuần</span>
              </TabsTrigger>
              <TabsTrigger
                value='month'
                className='flex items-center gap-1 data-[state=active]:bg-green-600 data-[state=active]:text-white'
              >
                <CalendarDays className='h-4 w-4' />
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
