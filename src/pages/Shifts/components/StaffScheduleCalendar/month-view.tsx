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
import { DayContent } from './day-content'

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
                } ${isCurrentMonth ? 'cursor-pointer' : ''}`}
                onClick={() => isCurrentMonth && onDateClick(day)}
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
                <div className='mt-2 flex flex-col items-center justify-center gap-2 h-[60px]'>
                  {isCurrentMonth && (
                    <DayContent
                      date={day}
                      schedules={getSchedulesForDate(day)}
                      registrations={getRegistrationsForDate(day)}
                      swapRequests={getSwapRequestsForDate(day)}
                    />
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
