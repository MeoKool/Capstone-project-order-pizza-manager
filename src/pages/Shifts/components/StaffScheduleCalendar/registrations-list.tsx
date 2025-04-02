import { format, parseISO } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import type { WorkingSlotRegister } from '@/types/staff-schedule'

interface RegistrationsListProps {
  registrations: WorkingSlotRegister[]
  onSelect: (registration: WorkingSlotRegister) => void
}

export function RegistrationsList({ registrations, onSelect }: RegistrationsListProps) {
  if (registrations.length === 0) {
    return <div className='text-center py-6 text-gray-500'>Không có yêu cầu đăng ký nào cho ngày này</div>
  }

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  // Format time from HH:MM:SS to HH:MM
  const formatTime = (time: string) => {
    if (!time) return ''
    return time.substring(0, 5)
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
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

  return (
    <div className='space-y-4 pb-4'>
      {registrations.map((registration) => (
        <Card
          key={registration.id}
          className={`border hover:shadow-md transition-shadow cursor-pointer ${
            registration.status === 'Onhold'
              ? 'border-amber-300 bg-amber-50/30'
              : registration.status === 'Approved'
                ? registration.zoneId
                  ? 'border-green-300 bg-green-50/30'
                  : 'border-blue-300 bg-blue-50/30'
                : 'border-red-300 bg-red-50/30'
          }`}
          onClick={() => onSelect(registration)}
        >
          <CardContent className='p-4'>
            <div className='flex items-start gap-3'>
              <Avatar className='h-10 w-10 bg-green-100 text-green-700 border border-green-200 shrink-0'>
                <AvatarFallback>{getInitials(registration.staffName)}</AvatarFallback>
              </Avatar>

              <div className='flex-1 min-w-0'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                  <h3 className='font-semibold text-green-900 truncate'>{registration.staffName}</h3>
                  <div className='flex flex-wrap gap-2'>
                    {getStatusBadge(registration.status)}
                    {registration.status === 'Approved' && registration.zoneId === null && (
                      <Badge className='bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1'>
                        <AlertCircle className='h-3.5 w-3.5' />
                        <span>Chưa phân khu vực</span>
                      </Badge>
                    )}
                  </div>
                </div>

                <div className='mt-2 space-y-1 text-sm'>
                  {registration.workingSlot && (
                    <div className='flex items-center gap-2 text-gray-700'>
                      <Clock className='h-4 w-4 text-green-600 shrink-0' />
                      <span className='truncate'>
                        Ca làm: {registration.workingSlot.shiftName} ({formatTime(registration.workingSlot.shiftStart)}{' '}
                        - {formatTime(registration.workingSlot.shiftEnd)})
                      </span>
                    </div>
                  )}
                  <div className='flex items-center gap-2 text-gray-700'>
                    <Clock className='h-4 w-4 text-green-600 shrink-0' />
                    <span>Đăng ký: {format(parseISO(registration.registerDate), 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
