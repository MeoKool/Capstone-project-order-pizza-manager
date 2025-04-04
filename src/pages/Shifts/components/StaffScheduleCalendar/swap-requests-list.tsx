'use client'

import { format, parseISO } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Clock, CalendarDays, ArrowRightLeft, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import type { SwapWorkingSlotRequest } from '@/types/staff-schedule'

interface SwapRequestsListProps {
  swapRequests: SwapWorkingSlotRequest[]
  onSelect: (request: SwapWorkingSlotRequest) => void
}

export function SwapRequestsList({ swapRequests, onSelect }: SwapRequestsListProps) {
  if (swapRequests.length === 0) {
    return <div className='text-center py-6 text-gray-500'>Không có yêu cầu đổi ca nào cho ngày này</div>
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
          <Badge className='bg-red-100 text-red-800 border border-red-300 flex items-center gap-1'>
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
      case 'PendingManagerApprove':
        return (
          <Badge className='bg-orange-100 text-orange-800 border border-orange-300 flex items-center gap-1'>
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
      {swapRequests.map((request) => (
        <Card
          key={request.id}
          className='border border-orange-300 bg-orange-50/30 hover:shadow-md transition-shadow cursor-pointer'
          onClick={() => onSelect(request)}
        >
          <CardContent className='p-4'>
            <div className='flex flex-col gap-3'>
              <div className='flex items-center justify-between'>
                <h3 className='font-semibold text-red-900 flex items-center gap-2'>
                  <ArrowRightLeft className='h-4 w-4 text-red-600' />
                  Yêu cầu đổi ca
                </h3>
                {getStatusBadge(request.status)}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-2'>
                <div className='space-y-2 p-3 bg-white rounded-md border border-red-100'>
                  <div className='flex items-center gap-2'>
                    <Avatar className='h-8 w-8 bg-red-100 text-red-700 border border-red-200 shrink-0'>
                      <AvatarFallback>{getInitials(request.employeeFromName)}</AvatarFallback>
                    </Avatar>
                    <div className='font-medium text-red-800 truncate'>{request.employeeFromName}</div>
                  </div>
                  <div className='text-sm space-y-1 ml-10'>
                    <div className='flex items-center gap-2 text-gray-700'>
                      <CalendarDays className='h-3.5 w-3.5 text-red-600 shrink-0' />
                      <span>Ngày: {format(parseISO(request.workingDateFrom), 'dd/MM/yyyy')}</span>
                    </div>
                    {request.workingSlotFrom && (
                      <div className='flex items-center gap-2 text-gray-700'>
                        <Clock className='h-3.5 w-3.5 text-red-600 shrink-0' />
                        <span className='truncate'>
                          {request.workingSlotFrom.shiftName} ({formatTime(request.workingSlotFrom.shiftStart)} -{' '}
                          {formatTime(request.workingSlotFrom.shiftEnd)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-2 p-3 bg-white rounded-md border border-red-100'>
                  <div className='flex items-center gap-2'>
                    <Avatar className='h-8 w-8 bg-red-100 text-red-700 border border-red-200 shrink-0'>
                      <AvatarFallback>{getInitials(request.employeeToName)}</AvatarFallback>
                    </Avatar>
                    <div className='font-medium text-red-800 truncate'>{request.employeeToName}</div>
                  </div>
                  <div className='text-sm space-y-1 ml-10'>
                    <div className='flex items-center gap-2 text-gray-700'>
                      <CalendarDays className='h-3.5 w-3.5 text-red-600 shrink-0' />
                      <span>Ngày: {format(parseISO(request.workingDateTo), 'dd/MM/yyyy')}</span>
                    </div>
                    {request.workingSlotTo && (
                      <div className='flex items-center gap-2 text-gray-700'>
                        <Clock className='h-3.5 w-3.5 text-red-600 shrink-0' />
                        <span className='truncate'>
                          {request.workingSlotTo.shiftName} ({formatTime(request.workingSlotTo.shiftStart)} -{' '}
                          {formatTime(request.workingSlotTo.shiftEnd)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className='text-sm text-gray-700 flex items-center gap-2 mt-1'>
                <Clock className='h-4 w-4 text-red-600 shrink-0' />
                <span>Yêu cầu lúc: {format(parseISO(request.requestDate), 'dd/MM/yyyy HH:mm')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
