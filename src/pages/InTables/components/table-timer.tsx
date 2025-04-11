"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import type { TableStatus } from "@/types/tables"

interface TableTimerProps {
  tableId: string // Add tableId to identify which table's timer we're tracking
  status?: TableStatus
  isRunning?: boolean
  onTimeUp: () => void
  initialMinutes?: number
}

export function TableTimer({ tableId, status, isRunning = false, onTimeUp, initialMinutes = 30 }: TableTimerProps) {
  const [timeLeft, setTimeLeft] = useState(0) // Start at 0 and initialize in useEffect
  const [timerActive, setTimerActive] = useState(false)

  // Load saved timer state or initialize new timer
  useEffect(() => {
    const initializeTimer = () => {
      const storageKey = `table-timer-${tableId}`
      const savedTimerData = localStorage.getItem(storageKey)

      if (savedTimerData) {
        try {
          const { endTime, status: savedStatus } = JSON.parse(savedTimerData)

          // Only restore timer if the status is still "Reserved"
          if (status === "Reserved" && savedStatus === "Reserved") {
            const now = new Date().getTime()
            const end = Number.parseInt(endTime)
            const remaining = Math.max(0, Math.floor((end - now) / 1000))

            if (remaining > 0) {
              setTimeLeft(remaining)
              setTimerActive(true)
              return remaining
            }
          }
        } catch (error) {
          console.error("Error parsing saved timer data:", error)
        }
      }

      // If no valid saved timer or different status, initialize a new one
      const newTimeLeft = initialMinutes * 60
      setTimeLeft(newTimeLeft)
      return newTimeLeft
    }

    const initialTimeLeft = initializeTimer()

    // If status is Reserved, save the end time
    if (status === "Reserved") {
      const endTime = new Date().getTime() + initialTimeLeft * 1000
      localStorage.setItem(
        `table-timer-${tableId}`,
        JSON.stringify({
          endTime,
          status: "Reserved",
          initialMinutes,
        }),
      )
      setTimerActive(true)
    }
  }, [tableId, initialMinutes, status])

  // Effect to handle status changes
  useEffect(() => {
    if (status === "Reserved") {
      setTimerActive(true)

      // Save timer state when status changes to Reserved
      const endTime = new Date().getTime() + timeLeft * 1000
      localStorage.setItem(
        `table-timer-${tableId}`,
        JSON.stringify({
          endTime,
          status: "Reserved",
          initialMinutes,
        }),
      )
    } else if (status == "Closing" || status == "Locked" || status == "Opening") {
      setTimerActive(false)
      // Clear saved timer if status is no longer Reserved
      localStorage.removeItem(`table-timer-${tableId}`)
    }
  }, [status, tableId, timeLeft, initialMinutes])

  // Effect to handle manual control via isRunning prop
  useEffect(() => {
    if (status !== "Reserved") {
      setTimerActive(isRunning)
    }
  }, [isRunning, status])

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1

          // Update the saved end time as the timer counts down
          if (status === "Reserved" && newTime > 0) {
            const storageKey = `table-timer-${tableId}`
            const endTime = new Date().getTime() + newTime * 1000
            localStorage.setItem(
              storageKey,
              JSON.stringify({
                endTime,
                status: "Reserved",
                initialMinutes,
              }),
            )
          }

          if (newTime <= 0) {
            if (interval) clearInterval(interval)
            // Clear saved timer when it reaches zero
            localStorage.removeItem(`table-timer-${tableId}`)
            onTimeUp()
            return 0
          }
          return newTime
        })
      }, 1000)
    } else if (!timerActive && interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, timeLeft, onTimeUp, tableId, status, initialMinutes])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTimerColor = () => {
    if (timeLeft < 60) return "text-red-500 font-bold"
    if (timeLeft < 300) return "text-amber-500"
    return "text-green-500"
  }

  return (
    <Badge
      variant="outline"
      className={`font-mono ${getTimerColor()} text-xs py-0 h-5 min-w-[2.5rem] ${timeLeft < 60 ? "animate-pulse" : ""}`}
    >
      {formatTime(timeLeft)}
    </Badge>
  )
}
