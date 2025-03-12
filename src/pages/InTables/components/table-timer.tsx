"use client"

import { useState, useEffect } from "react"

interface TableTimerProps {
    isRunning: boolean
    onTimeUp: () => void
}

const INITIAL_TIME = 15 * 60

export function TableTimer({ isRunning, onTimeUp }: TableTimerProps) {
    const [timeLeft, setTimeLeft] = useState(INITIAL_TIME)

    useEffect(() => {
        let interval: NodeJS.Timeout

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(interval)
                        onTimeUp()
                        return 0
                    }
                    return prevTime - 1
                })
            }, 1000)
        } else if (!isRunning) {
            setTimeLeft(INITIAL_TIME) // Reset thời gian khi bàn được giải phóng
        }

        return () => {
            if (interval) {
                clearInterval(interval)
            }
        }
    }, [isRunning, timeLeft, onTimeUp])

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }

    return <div className="font-mono text-lg">{formatTime(timeLeft)}</div>
}

