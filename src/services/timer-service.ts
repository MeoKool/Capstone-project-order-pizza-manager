import type { TableStatus } from '@/types/tables'

interface TimerData {
  endTime: number
  status: TableStatus
  initialMinutes: number
}

class TimerService {
  private getStorageKey(tableId: string): string {
    return `table-timer-${tableId}`
  }

  /**
   * Saves a timer for a specific table
   */
  public saveTimer(tableId: string, status: TableStatus, remainingSeconds: number, initialMinutes: number): void {
    const endTime = new Date().getTime() + remainingSeconds * 1000
    localStorage.setItem(
      this.getStorageKey(tableId),
      JSON.stringify({
        endTime,
        status,
        initialMinutes
      })
    )
  }

  /**
   * Gets the remaining time for a table timer in seconds
   * Returns null if no timer exists or timer has expired
   */
  public getTimerRemaining(tableId: string, currentStatus: TableStatus): number | null {
    const storageKey = this.getStorageKey(tableId)
    const savedTimerData = localStorage.getItem(storageKey)

    if (!savedTimerData) return null

    try {
      const { endTime, status } = JSON.parse(savedTimerData) as TimerData

      // Only restore timer if the status matches
      if (currentStatus === status) {
        const now = new Date().getTime()
        const end = Number.parseInt(endTime.toString())
        const remaining = Math.max(0, Math.floor((end - now) / 1000))

        if (remaining > 0) {
          return remaining
        }
      }
    } catch (error) {
      console.error('Error parsing saved timer data:', error)
    }

    return null
  }

  /**
   * Clears a timer for a specific table
   */
  public clearTimer(tableId: string): void {
    localStorage.removeItem(this.getStorageKey(tableId))
  }

  /**
   * Clears all timers
   */
  public clearAllTimers(): void {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('table-timer-')) {
        localStorage.removeItem(key)
      }
    })
  }
}

export const timerService = new TimerService()
