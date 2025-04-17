'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Define types for our schedule data
interface ScheduleDay {
  id: string
  name: string
}

interface ScheduleSlot {
  id: string
  shiftName: string
  dayName: string
  dayId: string
  shiftStart: string
  shiftEnd: string
  capacity: number
}

export function ScheduleView({ workingSlots = [] }: { workingSlots: ScheduleSlot[] }) {
  // Group slots by day for timetable view
  const [days, setDays] = useState<ScheduleDay[]>([])
  const [groupedSlots, setGroupedSlots] = useState<Record<string, ScheduleSlot[]>>({})

  useEffect(() => {
    // Extract unique days from working slots
    const uniqueDays = Array.from(new Set(workingSlots.map((slot) => slot.dayName))).map((dayName) => {
      const slot = workingSlots.find((s) => s.dayName === dayName)
      return {
        id: slot?.dayId || '',
        name: dayName
      }
    })

    // Sort days (assuming days are in Vietnamese)
    const dayOrder = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
    uniqueDays.sort((a, b) => {
      return dayOrder.indexOf(a.name) - dayOrder.indexOf(b.name)
    })

    setDays(uniqueDays)

    // Group slots by shift name
    const grouped: Record<string, ScheduleSlot[]> = {}
    workingSlots.forEach((slot) => {
      if (!grouped[slot.shiftName]) {
        grouped[slot.shiftName] = []
      }
      grouped[slot.shiftName].push(slot)
    })

    setGroupedSlots(grouped)
  }, [workingSlots])

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle>Thời khóa biểu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-red-50'>
                <th className='border p-2 text-left font-medium text-red-800'>Ca làm</th>
                {days.map((day) => (
                  <th key={day.id} className='border p-2 text-center font-medium text-red-800'>
                    {day.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedSlots).map(([shiftName, slots]) => (
                <tr key={shiftName} className='hover:bg-gray-50'>
                  <td className='border p-2 font-medium'>{shiftName}</td>
                  {days.map((day) => {
                    const slot = slots.find((s) => s.dayName === day.name)
                    return (
                      <td key={day.id} className='border p-2 text-center'>
                        {slot ? (
                          <div className='flex flex-col'>
                            <span className='font-medium'>{`${slot.shiftStart.substring(0, 5)} - ${slot.shiftEnd.substring(0, 5)}`}</span>
                            <span className='text-sm text-gray-500'>{`SL: ${slot.capacity}`}</span>
                          </div>
                        ) : (
                          <span className='text-gray-400'>-</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
