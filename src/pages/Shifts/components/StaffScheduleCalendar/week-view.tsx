'use client'

import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { StaffSchedule, WorkingSlotRegister, SwapWorkingSlotRequest } from '@/types/staff-schedule'
import { DayContent } from './day-content'

interface WeekViewProps {
  currentDate: Date
  staffSchedules: StaffSchedule[]
  registrations: WorkingSlotRegister[]
  swapRequests: SwapWorkingSlotRequest[]
  onDateClick: (date: Date) => void
}

export function WeekView({ currentDate, staffSchedules, registrations, swapRequests, onDateClick }: WeekViewProps) {
  const start = startOfWeek(currentDate, { weekStartsOn: 1 })
  const end = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start, end })

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

  return (
    <div className='grid grid-cols-7 gap-3'>
      {weekDays.map((day, index) => {
        const isCurrentDay = isToday(day)
        const isWeekend = index >= 5 // Saturday and Sunday

        return (
          <div
            key={index}
            className={`border rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md cursor-pointer ${
              isCurrentDay
                ? 'border-green-400 bg-green-50'
                : isWeekend
                  ? 'border-amber-200 bg-amber-50/30'
                  : 'border-gray-200'
            }`}
            onClick={() => onDateClick(day)}
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
            <div className='p-3 min-h-[100px] flex flex-col items-center justify-center gap-2'>
              <DayContent
                date={day}
                schedules={getSchedulesForDate(day)}
                registrations={getRegistrationsForDate(day)}
                swapRequests={getSwapRequestsForDate(day)}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
