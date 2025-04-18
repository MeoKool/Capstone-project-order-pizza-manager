'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow, isPast, parseISO, differenceInSeconds } from 'date-fns'
import { vi } from 'date-fns/locale'

interface TableTimerProps {
  tableId: string
  status: string
  bookingTime?: string // ISO string format for booking time
  isRunning?: boolean
  onTimeUp: () => void
  duration?: number // Duration in minutes for the timer (default: 30)
}

export function TableTimer({
  tableId,
  status,
  bookingTime,
  isRunning = false,
  onTimeUp,
  duration = 30
}: TableTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [expired, setExpired] = useState<boolean>(false)
  const [timerStarted, setTimerStarted] = useState<boolean>(false)

  useEffect(() => {
    // If no booking time is provided, use the current time + duration
    const targetTime = bookingTime ? parseISO(bookingTime) : new Date(Date.now() + duration * 60 * 1000)
    let intervalId: NodeJS.Timeout | null = null

    // Function to update the timer
    const updateTimer = () => {
      const now = new Date()

      // If the booking time is in the past, start the countdown
      if (isPast(targetTime)) {
        // If the timer hasn't started yet, set it as started
        if (!timerStarted) {
          setTimerStarted(true)
        }

        // Calculate seconds difference
        const diffInSeconds = differenceInSeconds(targetTime, now)

        // If the time is up
        if (diffInSeconds <= -duration * 60) {
          setTimeLeft('Hết hạn')
          setExpired(true)

          // Call the onTimeUp callback
          if (isRunning && !expired) {
            onTimeUp()
          }

          // Clear the interval
          if (intervalId) {
            clearInterval(intervalId)
          }
        } else {
          // Format the time left
          setTimeLeft(formatTimeLeft(-diffInSeconds))
        }
      } else {
        // If the booking time is in the future, show how much time until it starts
        setTimeLeft(`Còn ${formatDistanceToNow(targetTime, { locale: vi, addSuffix: false })}`)
      }
    }

    // Initial update
    updateTimer()

    // Set up interval to update every second
    intervalId = setInterval(updateTimer, 1000)

    // Clean up on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [tableId, status, bookingTime, isRunning, onTimeUp, duration, timerStarted, expired])

  // Format seconds to MM:SS or HH:MM:SS
  const formatTimeLeft = (seconds: number): string => {
    if (seconds <= 0) {
      return '00:00'
    }

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`
    } else {
      return `${padZero(minutes)}:${padZero(remainingSeconds)}`
    }
  }

  // Add leading zero if needed
  const padZero = (num: number): string => {
    return num.toString().padStart(2, '0')
  }

  // Determine the color based on time left
  const getTimerColor = (): string => {
    if (expired) {
      return 'text-red-600 font-bold'
    } else if (timerStarted) {
      return 'text-blue-600'
    } else {
      return 'text-gray-600'
    }
  }

  return <span className={`font-mono ${getTimerColor()}`}>{timeLeft}</span>
}
