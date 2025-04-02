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
