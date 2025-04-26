"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { isToday } from "date-fns"

interface TimeInputProps {
    label?: string
    value?: string
    onChange?: (time: string) => void
    className?: string
    selectedDate?: Date
}

export function TimeInput({ label = "Time", value = "", onChange, className = "", selectedDate }: TimeInputProps) {
    const [hour, setHour] = useState<string>("")
    const [minute, setMinute] = useState<string>("00")
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

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

    // Kiểm tra xem giờ có hợp lệ không (nếu là hôm nay)
    const isHourDisabled = (h: string) => {
        if (!selectedDate || !isToday(selectedDate)) return false
        return Number.parseInt(h) < currentHour
    }

    // Kiểm tra xem phút có hợp lệ không (nếu là hôm nay và cùng giờ hiện tại)
    const isMinuteDisabled = (m: string) => {
        if (!selectedDate || !isToday(selectedDate)) return false
        if (Number.parseInt(hour) > currentHour) return false
        if (Number.parseInt(hour) === currentHour) {
            return Number.parseInt(m) <= currentMinute
        }
        return false
    }

    // Lọc các tùy chọn giờ hợp lệ
    const validHourOptions = hourOptions.filter((h) => !isHourDisabled(h))

    // Lọc các tùy chọn phút hợp lệ
    const validMinuteOptions = minuteOptions.filter((m) => !isMinuteDisabled(m))

    // Nếu giờ hiện tại không hợp lệ, đặt giờ mặc định là giờ hợp lệ đầu tiên
    useEffect(() => {
        if (selectedDate && isToday(selectedDate)) {
            if (isHourDisabled(hour) || (Number.parseInt(hour) === currentHour && isMinuteDisabled(minute))) {
                // Tìm giờ hợp lệ đầu tiên
                if (validHourOptions.length > 0) {
                    const newHour = validHourOptions[0]
                    setHour(newHour)

                    // Nếu giờ mới bằng giờ hiện tại, tìm phút hợp lệ đầu tiên
                    if (Number.parseInt(newHour) === currentHour && validMinuteOptions.length > 0) {
                        setMinute(validMinuteOptions[0])
                    } else {
                        setMinute("00")
                    }
                }
            }
        }
    }, [selectedDate])

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
                            <SelectItem
                                key={h}
                                value={h}
                                disabled={isHourDisabled(h)}
                                className={isHourDisabled(h) ? "text-muted-foreground" : ""}
                            >
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
                            <SelectItem
                                key={m}
                                value={m}
                                disabled={isMinuteDisabled(m)}
                                className={isMinuteDisabled(m) ? "text-muted-foreground" : ""}
                            >
                                {m}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
