'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Clock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReservationSlotService, { type ReservationSlot } from '@/services/reservation-slot-service'

interface TimeSlotDisplayProps {
  date?: Date
  onRefresh?: () => void
}

export function TimeSlotDisplay({ onRefresh }: TimeSlotDisplayProps) {
  const [timeSlots, setTimeSlots] = useState<ReservationSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTimeSlot, setCurrentTimeSlot] = useState<ReservationSlot | null>(null)

  const reservationSlotService = ReservationSlotService.getInstance()

  // Format time for display (HH:MM:SS -> HH:MM)
  const formatTime = (time: string) => {
    return time.substring(0, 5)
  }

  // Fetch time slots
  const fetchTimeSlots = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all time slots
      const slotsResponse = await reservationSlotService.getAllSlots()

      if (slotsResponse.success) {
        const slots = slotsResponse.result.items

        // Sort slots by start time
        const sortedSlots = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime))
        setTimeSlots(sortedSlots)

        // Find current time slot
        updateCurrentTimeSlot(sortedSlots)
      } else {
        setError('Không thể tải khung giờ đặt bàn')
      }
    } catch (err) {
      console.error('Error fetching time slots:', err)
      setError('Đã xảy ra lỗi khi tải khung giờ đặt bàn')
    } finally {
      setLoading(false)
    }
  }

  // Update current time slot based on current time
  const updateCurrentTimeSlot = (slots: ReservationSlot[]) => {
    const now = new Date()
    const currentHour = now.getHours().toString().padStart(2, '0')
    const currentMinute = now.getMinutes().toString().padStart(2, '0')
    const currentTimeStr = `${currentHour}:${currentMinute}`

    const current = slots.find((slot) => {
      const slotStartTime = formatTime(slot.startTime)
      const slotEndTime = formatTime(slot.endTime)

      // Handle overnight slots
      if (slotStartTime > slotEndTime) {
        // If current time is after start time or before end time
        return currentTimeStr >= slotStartTime || currentTimeStr < slotEndTime
      }

      // Normal case
      return currentTimeStr >= slotStartTime && currentTimeStr < slotEndTime
    })

    setCurrentTimeSlot(current || null)
  }

  // Handle manual refresh
  const handleRefresh = () => {
    fetchTimeSlots()
    if (onRefresh) onRefresh()
  }

  // Fetch data on mount and when date changes
  useEffect(() => {
    fetchTimeSlots()

    // Set up interval to check current time slot every minute
    const intervalId = setInterval(() => {
      if (timeSlots.length > 0) {
        updateCurrentTimeSlot(timeSlots)
      }
    }, 60000) // Check every minute

    return () => clearInterval(intervalId)
  }, [])

  if (loading) {
    return (
      <Card className='border-[#e0e0e0] shadow-sm'>
        <CardContent className='flex items-center justify-center p-4'>
          <div className='flex items-center gap-2'>
            <Loader2 className='h-4 w-4 animate-spin text-[#e94235]' />
            <span className='text-sm text-muted-foreground'>Đang tải khung giờ...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className='border-destructive/30 shadow-sm'>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='text-destructive text-sm'>{error}</div>
            <Button
              variant='outline'
              size='sm'
              onClick={handleRefresh}
              className='h-7 px-2 text-xs text-[#e94235] hover:text-[#e94235] hover:bg-[#e94235]/10 border-[#e94235]/30'
            >
              <RefreshCw className='h-3 w-3 mr-1' />
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (timeSlots.length === 0) {
    return (
      <Card className='border-[#e0e0e0] shadow-sm'>
        <CardContent className='p-4 text-center'>
          <p className='text-sm text-muted-foreground'>Không có khung giờ đặt bàn nào được cấu hình.</p>
        </CardContent>
      </Card>
    )
  }

  // Group time slots by morning, afternoon, evening
  const groupTimeSlots = () => {
    const morning: ReservationSlot[] = []
    const afternoon: ReservationSlot[] = []
    const evening: ReservationSlot[] = []

    timeSlots.forEach((slot) => {
      const startHour = Number.parseInt(formatTime(slot.startTime).split(':')[0])

      if (startHour >= 5 && startHour < 12) {
        morning.push(slot)
      } else if (startHour >= 12 && startHour < 17) {
        afternoon.push(slot)
      } else {
        evening.push(slot)
      }
    })

    return { morning, afternoon, evening }
  }

  const { morning, afternoon, evening } = groupTimeSlots()

  const renderTimeSlotGroup = (title: string, slots: ReservationSlot[], icon: React.ReactNode) => {
    if (slots.length === 0) return null

    return (
      <div className='mb-3 last:mb-0'>
        <div className='flex items-center gap-1.5 mb-2'>
          {icon}
          <h3 className='text-xs font-medium text-foreground/80'>{title}</h3>
        </div>
        <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2'>
          {slots.map((slot) => {
            const isCurrentSlot = currentTimeSlot?.id === slot.id

            return (
              <div
                key={slot.id}
                className={`
                  relative border transition-all duration-200
                  ${
                    isCurrentSlot
                      ? 'bg-[#e94235]/5 border-[#e94235]'
                      : 'bg-card hover:bg-[#f8f8f8] hover:border-[#e0e0e0] border-[#e0e0e0]'
                  }
                `}
              >
                {isCurrentSlot && (
                  <div className='absolute top-0 right-0'>
                    <div className='bg-[#e94235] text-white text-[9px] py-0.5 px-1.5 rounded-bl-sm font-medium'>
                      Hiện tại
                    </div>
                  </div>
                )}
                <div className='p-2 flex flex-col items-center'>
                  <div className={`text-sm font-medium ${isCurrentSlot ? 'text-[#e94235]' : 'text-foreground'}`}>
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </div>
                  <div className='text-[10px] text-muted-foreground mt-0.5'>{slot.capacity} bàn tối đa</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card className='border-[#e0e0e0] shadow-sm'>
      <CardHeader className='py-2 px-4 flex flex-row items-center justify-between'>
        <CardTitle className='text-sm flex items-center gap-1.5'>
          <Clock className='h-4 w-4 text-[#e94235]' />
          Khung giờ đặt bàn
        </CardTitle>
        <Button
          variant='ghost'
          size='icon'
          onClick={handleRefresh}
          className='h-6 w-6 hover:bg-[#f8f8f8] text-[#666]'
          title='Làm mới'
        >
          <RefreshCw className='h-3 w-3' />
        </Button>
      </CardHeader>
      <CardContent className='py-2 px-4'>
        {renderTimeSlotGroup('Buổi sáng', morning, <span className='text-[#f5b400] text-xs'>☀️</span>)}
        {renderTimeSlotGroup('Buổi chiều', afternoon, <span className='text-[#f5b400] text-xs'>🌤️</span>)}
        {renderTimeSlotGroup('Buổi tối', evening, <span className='text-[#666] text-xs'>🌙</span>)}
      </CardContent>
    </Card>
  )
}
