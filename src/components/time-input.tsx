"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface TimeInputProps {
  label?: string
  value?: string
  onChange?: (time: string) => void
  className?: string
}

export function TimeInput({ label = "Time", value = "", onChange, className = "" }: TimeInputProps) {
  const [hour, setHour] = useState<string>("")
  const [minute, setMinute] = useState<string>("00")

  // Parse initial value on mount
  useEffect(() => {
    if (value) {
      try {
        const date = new Date(`2000-01-01T${value}`)
        const hours = date.getHours()
        const minutes = date.getMinutes()

        // Round minutes to nearest 15-minute increment
        const roundedMinutes = (Math.round(minutes / 15) * 15) % 60

        setHour(hours.toString().padStart(2, "0"))
        setMinute(roundedMinutes.toString().padStart(2, "0"))
      } catch (e) {
        console.log(e)
        // Invalid time format, ignore
      }
    }
  }, [value])

  // Update the time when any part changes
  useEffect(() => {
    if (hour && minute) {
      const timeString = `${hour}:${minute}`
      onChange?.(timeString)
    }
  }, [hour, minute, onChange])

  // Generate hour options from 0 to 23
  const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))

  // Generate minute options with 15-minute increments
  const minuteOptions = ["00", "15", "30", "45"]

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <Select value={hour} onValueChange={setHour}>
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="Giờ" />
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
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="Phút" />
          </SelectTrigger>
          <SelectContent>
            {minuteOptions.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
