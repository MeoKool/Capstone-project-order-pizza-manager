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

// Không còn chuyển đổi UTC sang giờ Việt Nam nữa
export function convertToVietnamTime(dateString: string): Date {
  // Trả về trực tiếp đối tượng Date mà không thêm 7 giờ
  return new Date(dateString)
}

// Format date to Vietnam locale
export function formatVietnamDate(date: Date | string): string {
  // Không cần chuyển đổi múi giờ, chỉ định dạng theo locale Việt Nam
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// Không còn chuyển đổi giờ địa phương sang UTC nữa
export function convertToUTC(localDate: Date): Date {
  // Trả về trực tiếp đối tượng Date mà không trừ 7 giờ
  return localDate
}
