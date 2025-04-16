import { format, parseISO } from 'date-fns'

// Format time from HH:MM:SS to HH:MM
export function formatTime(time: string) {
  if (!time) return ''
  return time.substring(0, 5)
}

// Get initials from name
export function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Format date
export function formatDate(date: string | Date, formatString = 'dd/MM/yyyy') {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatString)
}

// Utility function to convert UTC time to Vietnam time (UTC+7)
export function convertToVietnamTime(utcDateString: string): Date {
  const date = new Date(utcDateString)

  // Create a date string that explicitly specifies the timezone as UTC
  const utcDate = new Date(date.toISOString())

  // Add 7 hours to convert to Vietnam time (UTC+7)
  utcDate.setHours(utcDate.getHours() + 7)

  return utcDate
}

// Format date to Vietnam locale
export function formatVietnamDate(date: Date | string): string {
  const vietnamDate = typeof date === 'string' ? convertToVietnamTime(date) : date
  return vietnamDate.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// Convert local time to UTC for sending to backend
export function convertToUTC(localDate: Date): Date {
  const utcDate = new Date(localDate)
  utcDate.setHours(utcDate.getHours() - 7)
  return utcDate
}
