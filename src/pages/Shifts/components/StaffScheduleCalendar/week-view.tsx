'use client'

import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, isToday } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Users, Clock, Calendar, AlertCircle, ChevronDown, ChevronUp, Info } from 'lucide-react'
import type { StaffSchedule, WorkingSlotRegister, SwapWorkingSlotRequest, Zone } from '@/types/staff-schedule'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface WorkingSlot {
  id: string
  shiftName: string
  dayName: string
  shiftStart: string
  shiftEnd: string
  capacity: number
  dayId: string
  shiftId: string
}

interface WeekViewProps {
  currentDate: Date
  staffSchedules: StaffSchedule[]
  registrations: WorkingSlotRegister[]
  swapRequests: SwapWorkingSlotRequest[]
  onDateClick: (date: Date) => void
}

export function WeekView({ currentDate, staffSchedules, registrations, swapRequests, onDateClick }: WeekViewProps) {
  console.log(registrations, swapRequests)

  const [zones, setZones] = useState<Zone[]>([])
  const [workingSlots, setWorkingSlots] = useState<WorkingSlot[]>([])
  const [expandedSlots, setExpandedSlots] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch zones data
    const fetchZones = async () => {
      try {
        const response = await fetch('https://vietsac.id.vn/api/zones')
        const data = await response.json()

        if (data.success) {
          setZones(data.result.items)
        }
      } catch (error) {
        console.error('Error fetching zones:', error)
      }
    }

    // Fetch working slots data
    const fetchWorkingSlots = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('https://vietsac.id.vn/api/working-slots?SortBy=dayName%20desc')
        const data = await response.json()

        if (data.success) {
          setWorkingSlots(data.result.items)
        }
      } catch (error) {
        console.error('Error fetching working slots:', error)
      } finally {
        setIsLoading(false)
      }
    }

    Promise.all([fetchZones(), fetchWorkingSlots()])
  }, [])

  const start = startOfWeek(currentDate, { weekStartsOn: 1 }) // Start from Monday
  const end = endOfWeek(currentDate, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start, end })

  // Format time from HH:MM:SS to HH:MM
  const formatTime = (time: string) => {
    if (!time) return ''
    return time.substring(0, 5)
  }

  // Map day names to day indices (0 = Monday, 6 = Sunday)
  const dayNameToIndex: Record<string, number> = {
    'Thứ hai': 0,
    'Thứ ba': 1,
    'Thứ tư': 2,
    'Thứ năm': 3,
    'Thứ sáu': 4,
    'Thứ bảy': 5,
    'Chủ nhật': 6
  }

  // Get working slots for a specific day index
  const getSlotsForDayIndex = (dayIndex: number) => {
    const dayNames = Object.keys(dayNameToIndex)
    const dayName = dayNames.find((name) => dayNameToIndex[name] === dayIndex)

    if (!dayName) return []

    return workingSlots.filter((slot) => slot.dayName === dayName)
  }

  // Get schedules for a specific slot
  const getSchedulesForSlot = (slotId: string, date: Date) => {
    return staffSchedules.filter((schedule) => {
      const scheduleDate = parseISO(schedule.workingDate)
      return isSameDay(scheduleDate, date) && schedule.workingSlotId === slotId
    })
  }

  // Group schedules by zone for a specific slot and date
  const getSchedulesByZoneForSlot = (slotId: string, date: Date) => {
    const slotSchedules = getSchedulesForSlot(slotId, date)
    const groupedByZone: Record<string, StaffSchedule[]> = {}

    slotSchedules.forEach((schedule) => {
      if (!groupedByZone[schedule.zoneId]) {
        groupedByZone[schedule.zoneId] = []
      }
      groupedByZone[schedule.zoneId].push(schedule)
    })

    return groupedByZone
  }

  // Toggle expanded state for a slot
  const toggleSlotExpanded = (slotId: string) => {
    setExpandedSlots((prev) => ({
      ...prev,
      [slotId]: !prev[slotId]
    }))
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='flex flex-col items-center gap-2'>
          <div className='animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full'></div>
          <div className='text-green-600 font-medium'>Đang tải dữ liệu...</div>
        </div>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-7 gap-1 h-full'>
      {days.map((day, index) => {
        const isCurrentDay = isToday(day)
        const isWeekend = index >= 5
        const daySlots = getSlotsForDayIndex(index)
        const dayNumber = format(day, 'd')
        const hasSlots = daySlots.length > 0

        return (
          <Card
            key={index}
            className={`flex flex-col h-full overflow-hidden ${
              isCurrentDay ? 'border-green-500 shadow-sm' : isWeekend ? 'border-amber-200' : 'border-gray-200'
            }`}
          >
            <CardHeader
              className={`p-2 flex flex-row items-center justify-between ${
                isCurrentDay ? 'bg-green-200' : isWeekend ? 'bg-amber-100' : 'bg-gray-100'
              }`}
              onClick={() => onDateClick(day)}
            >
              <div className='flex items-center gap-2 cursor-pointer'>
                <div
                  className={`text-base font-medium rounded-full w-8 h-8 flex items-center justify-center ${
                    isCurrentDay
                      ? 'bg-green-500 text-white'
                      : isWeekend
                        ? 'bg-amber-400 text-white'
                        : 'bg-gray-400 text-white'
                  }`}
                >
                  {dayNumber}
                </div>
                <div>
                  <div className='font-medium text-gray-800'>{format(day, 'EEEE', { locale: vi })}</div>
                  <div className='text-xs text-gray-500'>{format(day, 'dd/MM')}</div>
                </div>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-7 w-7 rounded-full hover:bg-blue-100'
                      onClick={(e) => {
                        e.stopPropagation()
                        onDateClick(day)
                      }}
                    >
                      <Calendar className='h-4 w-4 text-blue-500' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Xem chi tiết ngày</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>

            <CardContent className='p-0 flex-1 overflow-hidden'>
              <ScrollArea className='h-full'>
                {hasSlots ? (
                  <div className='p-2 space-y-2'>
                    {daySlots.map((slot) => {
                      const schedulesByZone = getSchedulesByZoneForSlot(slot.id, day)
                      const totalStaffCount = Object.values(schedulesByZone).reduce(
                        (sum, staffs) => sum + staffs.length,
                        0
                      )
                      const isSlotExpanded = expandedSlots[slot.id]
                      const staffPercentage = slot.capacity > 0 ? (totalStaffCount / slot.capacity) * 100 : 0
                      const staffStatusColor =
                        staffPercentage >= 100 ? 'bg-green-500' : staffPercentage >= 70 ? 'bg-amber-500' : 'bg-red-500'

                      return (
                        <div
                          key={slot.id}
                          className='rounded-md overflow-hidden border border-gray-200 hover:border-green-300 transition-colors bg-white'
                        >
                          <div className='p-2'>
                            <div className='flex items-center justify-between'>
                              <div className='font-medium text-green-800'>{slot.shiftName}</div>
                              <Badge
                                className={`${
                                  totalStaffCount >= slot.capacity
                                    ? 'bg-green-100 text-green-800 border-green-300'
                                    : totalStaffCount > 0
                                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                                      : 'bg-red-100 text-red-800 border-red-300'
                                } flex items-center gap-1`}
                              >
                                <Users className='h-3 w-3' />
                                <span>
                                  {totalStaffCount}/{slot.capacity}
                                </span>
                              </Badge>
                            </div>

                            <div className='text-sm text-gray-600 mt-1 flex items-center gap-1'>
                              <Clock className='h-3.5 w-3.5 text-gray-500' />
                              {formatTime(slot.shiftStart)} - {formatTime(slot.shiftEnd)}
                            </div>

                            <div className='mt-2 w-full bg-gray-200 rounded-full h-1.5'>
                              <div
                                className={`h-1.5 rounded-full ${staffStatusColor}`}
                                style={{ width: `${Math.min(staffPercentage, 100)}%` }}
                              ></div>
                            </div>

                            <Button
                              variant='ghost'
                              size='sm'
                              className='w-full mt-1 h-6 text-xs flex items-center justify-center gap-1 text-gray-600 hover:text-green-700 hover:bg-green-50'
                              onClick={() => toggleSlotExpanded(slot.id)}
                            >
                              {isSlotExpanded ? (
                                <>
                                  <ChevronUp className='h-3.5 w-3.5' />
                                  <span>Ẩn khu vực</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className='h-3.5 w-3.5' />
                                  <span>Xem khu vực</span>
                                </>
                              )}
                            </Button>
                          </div>

                          {isSlotExpanded && (
                            <div className='bg-gray-50 p-2 border-t border-gray-200'>
                              <div className='grid grid-cols-1 gap-1.5'>
                                {zones.map((zone) => {
                                  const zoneSchedules = schedulesByZone[zone.id] || []
                                  const hasStaff = zoneSchedules.length > 0

                                  return (
                                    <div
                                      key={zone.id}
                                      className={`p-2 rounded border ${
                                        hasStaff ? 'bg-white border-green-200' : 'bg-gray-50 border-gray-200'
                                      }`}
                                    >
                                      <div className='flex items-center justify-between'>
                                        <div className='font-medium text-sm'>{zone.name}</div>
                                        {hasStaff ? (
                                          <Badge className='bg-green-100 text-green-800 border-green-300'>
                                            {zoneSchedules.length}
                                          </Badge>
                                        ) : (
                                          <span className='text-xs text-gray-500 flex items-center gap-1'>
                                            <AlertCircle className='h-3 w-3' />
                                            <span>Chưa có nhân viên</span>
                                          </span>
                                        )}
                                      </div>

                                      {hasStaff && zoneSchedules.length > 0 && (
                                        <div className='mt-1.5 pl-2 border-l-2 border-green-200'>
                                          {zoneSchedules.map((schedule, idx) => (
                                            <div key={idx} className='text-xs text-gray-700 py-0.5'>
                                              {schedule.staffName || 'Nhân viên'}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className='flex items-center justify-center h-full p-4'>
                    <div className='text-gray-500 flex flex-col items-center gap-1'>
                      <Info className='h-5 w-5 text-gray-400' />
                      <span>Không có ca làm việc</span>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
