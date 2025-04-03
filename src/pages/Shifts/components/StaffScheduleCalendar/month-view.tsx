'use client'

import {
  format,
  startOfMonth,
  endOfMonth,
  getDay,
  addDays,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  parseISO
} from 'date-fns'
import type { StaffSchedule, WorkingSlotRegister, SwapWorkingSlotRequest } from '@/types/staff-schedule'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Calendar, Users, Clock, ArrowRightLeft } from 'lucide-react'

interface MonthViewProps {
  currentDate: Date
  staffSchedules: StaffSchedule[]
  registrations: WorkingSlotRegister[]
  swapRequests: SwapWorkingSlotRequest[]
  onDateClick: (date: Date) => void
}

export function MonthView({ currentDate, staffSchedules, registrations, swapRequests, onDateClick }: MonthViewProps) {
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

  const getSchedulesForDate = (date: Date) => {
    return staffSchedules.filter((schedule) => {
      const scheduleDate = parseISO(schedule.workingDate)
      return isSameDay(scheduleDate, date)
    })
  }

  const getRegistrationsForDate = (date: Date) => {
    return registrations.filter((registration) => {
      const registrationDate = parseISO(registration.workingDate)
      return isSameDay(registrationDate, date)
    })
  }

  const getSwapRequestsForDate = (date: Date) => {
    return swapRequests.filter((request) => {
      const fromDate = parseISO(request.workingDateFrom)
      const toDate = parseISO(request.workingDateTo)
      return isSameDay(fromDate, date) || isSameDay(toDate, date)
    })
  }

  // Group schedules by working slot
  const groupSchedulesBySlot = (schedules: StaffSchedule[]) => {
    const grouped: Record<string, StaffSchedule[]> = {}

    schedules.forEach((schedule) => {
      if (!grouped[schedule.workingSlotId]) {
        grouped[schedule.workingSlotId] = []
      }
      grouped[schedule.workingSlotId].push(schedule)
    })

    return grouped
  }

  return (
    <div className='space-y-1'>
      <div className='grid grid-cols-7 text-center font-medium text-gray-700 bg-green-50 rounded-t-lg border border-green-100'>
        <div className='py-2'>T2</div>
        <div className='py-2'>T3</div>
        <div className='py-2'>T4</div>
        <div className='py-2'>T5</div>
        <div className='py-2'>T6</div>
        <div className='py-2 text-amber-700'>T7</div>
        <div className='py-2 text-amber-700'>CN</div>
      </div>

      <div className='border border-green-100 rounded-b-lg overflow-hidden'>
        {weeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            className='grid grid-cols-7 divide-x divide-green-100 border-t border-green-100 first:border-t-0'
          >
            {week.map((day, dayIndex) => {
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isCurrentDay = isToday(day)
              const isWeekend = dayIndex >= 5 // Saturday and Sunday

              const daySchedules = getSchedulesForDate(day)
              const dayRegistrations = getRegistrationsForDate(day)
              const daySwapRequests = getSwapRequestsForDate(day)

              const pendingRegistrations = dayRegistrations.filter((r) => r.status === 'Onhold')
              const pendingSwaps = daySwapRequests.filter((s) => s.status === 'PendingManagerApprove')

              const hasData = daySchedules.length > 0 || pendingRegistrations.length > 0 || pendingSwaps.length > 0
              const groupedSchedules = groupSchedulesBySlot(daySchedules)
              const slots = Object.keys(groupedSchedules).length

              return (
                <div
                  key={dayIndex}
                  className={`min-h-[120px] transition-all ${
                    !isCurrentMonth
                      ? 'bg-gray-50/50 text-gray-400'
                      : isCurrentDay
                        ? 'bg-green-50/70'
                        : isWeekend
                          ? 'bg-amber-50/20'
                          : 'hover:bg-green-50/30'
                  } ${isCurrentMonth ? 'cursor-pointer' : ''}`}
                  onClick={() => isCurrentMonth && onDateClick(day)}
                >
                  <div className='p-2 flex flex-col h-full'>
                    <div className='flex items-center justify-between'>
                      <div
                        className={`text-sm font-medium rounded-full w-7 h-7 flex items-center justify-center ${
                          isCurrentDay
                            ? 'bg-green-500 text-white'
                            : isWeekend && isCurrentMonth
                              ? 'bg-amber-100 text-amber-900'
                              : isCurrentMonth
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-gray-50 text-gray-400'
                        }`}
                      >
                        {format(day, 'd')}
                      </div>

                      {isCurrentMonth && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-6 w-6 rounded-full hover:bg-green-100'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDateClick(day)
                                }}
                              >
                                <Calendar className='h-3.5 w-3.5 text-green-700' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Xem chi tiết ngày</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>

                    {isCurrentMonth && (
                      <div className='mt-2 flex-1 flex flex-col'>
                        {hasData ? (
                          <div className='space-y-1.5'>
                            {slots > 0 && (
                              <div className='flex items-center gap-1'>
                                <Badge className='bg-green-100 text-green-800 border-green-200 h-5 px-1.5 text-xs flex items-center gap-0.5'>
                                  <Users className='h-3 w-3' />
                                  <span>{daySchedules.length}</span>
                                </Badge>
                                <span className='text-xs text-gray-600'>{slots} ca làm việc</span>
                              </div>
                            )}

                            {pendingRegistrations.length > 0 && (
                              <div className='flex items-center gap-1'>
                                <Badge className='bg-amber-100 text-amber-800 border-amber-200 h-5 px-1.5 text-xs flex items-center gap-0.5'>
                                  <Clock className='h-3 w-3' />
                                  <span>{pendingRegistrations.length}</span>
                                </Badge>
                                <span className='text-xs text-gray-600'>đăng ký</span>
                              </div>
                            )}

                            {pendingSwaps.length > 0 && (
                              <div className='flex items-center gap-1'>
                                <Badge className='bg-blue-100 text-blue-800 border-blue-200 h-5 px-1.5 text-xs flex items-center gap-0.5'>
                                  <ArrowRightLeft className='h-3 w-3' />
                                  <span>{pendingSwaps.length}</span>
                                </Badge>
                                <span className='text-xs text-gray-600'>đổi ca</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className='flex-1 flex items-center justify-center'>
                            <span className='text-xs text-gray-400'>Không có ca làm việc</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
