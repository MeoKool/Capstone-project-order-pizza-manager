'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface TimeInputProps {
  label?: string
  value?: string
  onChange?: (time: string) => void
  use24Hour?: boolean
  className?: string
}

export function TimeInput({ label = 'Time', value = '', onChange, use24Hour = false, className = '' }: TimeInputProps) {
  const [hour, setHour] = useState<string>('')
  const [minute, setMinute] = useState<string>('00')
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM')

  // Parse initial value on mount
  useEffect(() => {
    if (value) {
      try {
        const date = new Date(`2000-01-01T${value}`)
        let hours = date.getHours()
        const minutes = date.getMinutes()

        if (!use24Hour) {
          const newPeriod = hours >= 12 ? 'PM' : 'AM'
          hours = hours % 12 || 12
          setPeriod(newPeriod)
        }

        setHour(hours.toString().padStart(2, '0'))
        setMinute(minutes.toString().padStart(2, '0'))
      } catch (e) {
        console.log(e)

        // Invalid time format, ignore
      }
    }
  }, [value, use24Hour])

  // Update the time when any part changes
  useEffect(() => {
    if (hour && minute) {
      let hourNum = Number.parseInt(hour, 10)

      if (!use24Hour && period === 'PM' && hourNum < 12) {
        hourNum += 12
      } else if (!use24Hour && period === 'AM' && hourNum === 12) {
        hourNum = 0
      }

      const timeString = `${hourNum.toString().padStart(2, '0')}:${minute}`
      onChange?.(timeString)
    }
  }, [hour, minute, period, use24Hour, onChange])

  // Generate hour options
  const hourOptions = use24Hour
    ? Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
    : Array.from({ length: 12 }, (_, i) => (i === 0 ? '12' : i.toString().padStart(2, '0')))

  // Generate minute options
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      <div className='flex gap-2'>
        <Select value={hour} onValueChange={setHour}>
          <SelectTrigger className='w-[80px]'>
            <SelectValue placeholder='Giờ' />
          </SelectTrigger>
          <SelectContent>
            {hourOptions.map((h) => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={minute} onValueChange={setMinute}>
          <SelectTrigger className='w-[80px]'>
            <SelectValue placeholder='Phút' />
          </SelectTrigger>
          <SelectContent>
            {minuteOptions.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!use24Hour && (
          <Select value={period} onValueChange={(value) => setPeriod(value as 'AM' | 'PM')}>
            <SelectTrigger className='w-[80px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='AM'>AM</SelectItem>
              <SelectItem value='PM'>PM</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
