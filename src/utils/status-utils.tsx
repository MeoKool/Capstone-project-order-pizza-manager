import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

// Get staff type label
export function getStaffTypeLabel(staffType: string) {
  switch (staffType) {
    case 'Manager':
      return 'Quản lý'
    case 'Staff':
      return 'Nhân viên'
    default:
      return staffType
  }
}

// Get staff status label
export function getStaffStatusLabel(status: string) {
  switch (status) {
    case 'FullTime':
      return 'Toàn thời gian'
    case 'PartTime':
      return 'Bán thời gian'
    default:
      return status
  }
}

// Get staff type color
export function getStaffTypeColor(staffType: string) {
  switch (staffType) {
    case 'Manager':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'Staff':
      return 'bg-green-100 text-green-800 border-green-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

// Get staff status color
export function getStaffStatusColor(status: string) {
  switch (status) {
    case 'FullTime':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'PartTime':
      return 'bg-amber-100 text-amber-800 border-amber-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

// Get status badge
export function getStatusBadge(status: string) {
  switch (status) {
    case 'Approved':
      return (
        <Badge className='bg-green-100 text-green-800 border border-green-300 flex items-center gap-1'>
          <CheckCircle className='h-3.5 w-3.5' />
          <span>Đã duyệt</span>
        </Badge>
      )
    case 'Rejected':
      return (
        <Badge className='bg-red-100 text-red-800 border border-red-300 flex items-center gap-1'>
          <XCircle className='h-3.5 w-3.5' />
          <span>Từ chối</span>
        </Badge>
      )
    case 'Onhold':
    case 'PendingManagerApprove':
      return (
        <Badge className='bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1'>
          <AlertCircle className='h-3.5 w-3.5' />
          <span>Chờ duyệt</span>
        </Badge>
      )
    default:
      return <Badge className='bg-gray-100 text-gray-800 border border-gray-300'>{status}</Badge>
  }
}
