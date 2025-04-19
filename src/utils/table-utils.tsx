import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Calendar, Coffee } from 'lucide-react'

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Opening':
      return <Badge className='px-3 bg-green-500 hover:bg-green-600 h-[32px] text-base'>Bàn mở</Badge>
    case 'Closing':
      return <Badge className='px-3 bg-red-500 hover:bg-red-600 h-[32px] text-base'>Bàn đóng</Badge>
    case 'Reserved':
      return <Badge className='px-3 bg-blue-500 hover:bg-blue-600 h-[32px] text-base'>Đã đặt trước</Badge>
    case 'Locked':
      return <Badge className='px-3 bg-yellow-500 hover:bg-yellow-600 h-[32px] text-base'>Đang bảo trì</Badge>
    default:
      return <Badge variant='outline'>Không xác định</Badge>
  }
}
export const getStatusZone = (status: number) => {
  switch (status) {
    case 0:
      return <Badge className='px-3 bg-green-500 hover:bg-green-600  text-xs'>Hoạt động</Badge>
    case 1:
      return <Badge className='px-3 bg-red-500 hover:bg-red-600 text-xs'>Đóng</Badge>
    case 2:
      return <Badge className='px-3 bg-blue-500 hover:bg-blue-600 text-xs'>Đã đặt trước</Badge>
    case 3:
      return <Badge className='px-3 bg-yellow-500 hover:bg-yellow-600 text-xs'>Đang bảo trì</Badge>
    default:
      return <Badge variant='outline'>Không xác định</Badge>
  }
}
export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Opening':
      return <Coffee className='h-4 w-4 text-green-500' />
    case 'Closed':
      return <AlertTriangle className='h-4 w-4 text-red-500' />
    case 'Reserved':
      return <Calendar className='h-4 w-4 text-blue-500' />
    case 'Locked':
      return <AlertTriangle className='h-4 w-4 text-yellow-500' />
    default:
      return null
  }
}
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'Created':
      return 'Đã tạo'
    case 'Confirmed':
      return 'Đã xác nhận'
    case 'Checkedin':
      return 'Đã check-in'
    case 'Cancelled':
      return 'Đã hủy'
    default:
      return status
  }
}
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Created':
      return 'bg-gray-50 text-gray-700 border-gray-200 p-1'
    case 'Confirmed':
      return 'bg-blue-50 text-blue-700 border-blue-200 p-1'
    case 'Checkedin':
      return 'bg-green-50 text-green-700 border-green-200 p-1'
    case 'Cancelled':
      return 'bg-red-50 text-red-700 border-red-200 p-1'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200 p-1'
  }
}
// Helper function to format date strings
export const formatDateString = (dateStr: string): string => {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'N/A'

    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  } catch (error) {
    console.error('Error formatting date string:', error, 'for input:', dateStr)
    return 'N/A'
  }
}

export const getStatusSortValue = (status: string): number => {
  switch (status) {
    case 'Created':
      return 1
    case 'Confirmed':
      return 2
    case 'Checkedin':
      return 3
    case 'Cancelled':
      return 4
    default:
      return 99
  }
}

export const getPrioritySortValue = (status: string): number => {
  switch (status) {
    case 'Priority':
      return 1
    case 'NonPriority':
      return 2
    default:
      return 99
  }
}
