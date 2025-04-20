"use client"

import { useState, useEffect, useRef } from "react"
import { parseISO, differenceInSeconds, differenceInMinutes } from "date-fns"
import { toast } from "sonner"

interface TableTimerProps {
  tableId: string
  status: string
  bookingTime?: string // ISO string format for reservation time (when customer should arrive)
  isRunning?: boolean
  onTimeUp: () => void
  onStatusChange?: (expired: boolean) => void
  tableName?: string // Table name/code for toast messages
  customerNameInTables?: string // Customer name for toast messages
}

export function TableTimer({
  tableId,
  status,
  bookingTime,
  isRunning = false,
  onTimeUp,
  onStatusChange,
  tableName = "",
  customerNameInTables = "",
}: TableTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [expired, setExpired] = useState<boolean>(false)
  const lastToastTimeRef = useRef<number>(0)
  const minutesOverdueRef = useRef<number>(0)

  // Add an effect to notify the parent component when expired status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(expired)
    }
  }, [expired, onStatusChange])

  useEffect(() => {
    // Parse the reservation time if provided, otherwise use current time + 30 minutes
    const reservationTime = bookingTime ? parseISO(bookingTime) : new Date(Date.now() + 30 * 60 * 1000)
    let intervalId: NodeJS.Timeout | null = null

    // Function to update the timer
    const updateTimer = () => {
      const now = new Date()

      // Check if the reservation time is in the future or past
      if (reservationTime > now) {
        // Reservation time is in the future - show countdown until reservation time
        const secondsUntilReservation = differenceInSeconds(reservationTime, now)
        setTimeLeft(formatTimeLeft(secondsUntilReservation))
        setExpired(false)

        // Reset the overdue minutes when we're not expired
        minutesOverdueRef.current = 0
      } else {
        // Reservation time has passed - customer should have arrived
        setExpired(true)

        // Calculate how long it's been since the reservation time
        const minutesSinceReservation = differenceInMinutes(now, reservationTime)
        minutesOverdueRef.current = minutesSinceReservation

        // Check if we need to show a toast notification (every minute)
        checkAndShowToast(
          minutesSinceReservation,
          now.getTime(),
          tableName || `Bàn ${tableId}`,
          customerNameInTables || "",
        )

        // Format the overdue message
        if (minutesSinceReservation < 60) {
          setTimeLeft(`${minutesSinceReservation} phút`)
        } else {
          const hours = Math.floor(minutesSinceReservation / 60)
          const minutes = minutesSinceReservation % 60
          if (minutes === 0) {
            setTimeLeft(`${hours} giờ`)
          } else {
            setTimeLeft(`${hours} giờ ${minutes} phút`)
          }
        }

        // Call the onTimeUp callback once when we first expire
        if (isRunning && !expired) {
          onTimeUp()
        }
      }
    }

    // Function to check if we should show a toast and show it if needed
    const checkAndShowToast = (
      minutesOverdue: number,
      currentTime: number,
      tableIdentifier: string,
      customerName: string,
    ) => {
      // Show toast every minute for Reserved tables
      if (status === "Reserved" && currentTime - lastToastTimeRef.current >= 60 * 1000) {
        const toastId = `reservation-overdue-${tableId}-${minutesOverdue}`

        toast.warning(
          <div className="flex flex-col space-y-2">
            <div className="font-medium">{customerName ? `Khách ${customerName} đã quá hạn` : "Khách đã quá hạn"}</div>
            <div>
              {tableIdentifier} đã quá hạn {minutesOverdue} phút.
            </div>
            <div className="flex justify-center mt-2">
              <button
                className="px-4 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 font-medium w-full"
                onClick={() => {
                  // Dismiss this specific toast
                  toast.dismiss(toastId)
                }}
              >
                Xác Nhận
              </button>
            </div>
          </div>,
          {
            duration: 10000, // 10 seconds
            id: toastId, // Unique ID to prevent duplicates
          },
        )

        // Update the last toast time
        lastToastTimeRef.current = currentTime
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
  }, [tableId, status, bookingTime, isRunning, onTimeUp, expired, tableName, customerNameInTables])

  // Format seconds to MM:SS or HH:MM:SS
  const formatTimeLeft = (seconds: number): string => {
    if (seconds <= 0) {
      return "00:00"
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
    return num.toString().padStart(2, "0")
  }

  // Determine the color based on time left
  const getTimerColor = (): string => {
    if (expired) {
      return "text-red-600 font-bold"
    } else {
      return "text-blue-600"
    }
  }

  return <span className={`font-mono ${getTimerColor()}`}>{timeLeft}</span>
}
