import { format, parseISO } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Clock, CalendarDays, ArrowRightLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import type { SwapWorkingSlotRequest } from '@/types/staff-schedule'

interface SwapRequestDialogProps {
  swapRequest: SwapWorkingSlotRequest | null
  onClose: () => void
  onAction: (action: 'approve' | 'reject') => void
}

export function SwapRequestDialog({ swapRequest, onClose, onAction }: SwapRequestDialogProps) {
  if (!swapRequest) return null

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
    <Dialog open={!!swapRequest} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader className='shrink-0'>
          <DialogTitle className='text-xl flex items-center gap-2 text-red-700'>
            <ArrowRightLeft className='h-5 w-5' />
            Chi tiết yêu cầu đổi ca
          </DialogTitle>
        </DialogHeader>

        <div className='py-4 space-y-6 overflow-auto flex-1' style={{ minHeight: '200px' }}>
          <div className='flex items-center justify-between'>
            <h3 className='font-semibold text-red-900'>Thông tin yêu cầu</h3>
            {getStatusBadge(swapRequest.status)}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4 p-4 bg-red-50/50 rounded-lg border border-red-100'>
              <h4 className='font-medium text-red-800 flex items-center gap-2'>
                <User className='h-4 w-4 text-red-600' />
                Nhân viên yêu cầu
              </h4>
              <div className='flex items-center gap-3'>
                <Avatar className='h-10 w-10 bg-red-100 text-red-700 border border-red-200'>
                  <AvatarFallback>{getInitials(swapRequest.employeeFromName)}</AvatarFallback>
                </Avatar>
                <div className='font-medium'>{swapRequest.employeeFromName}</div>
              </div>
              <div className='space-y-2 mt-2'>
                <div className='flex items-center gap-2 text-gray-700'>
                  <CalendarDays className='h-4 w-4 text-red-600' />
                  <span>Ngày làm: {format(parseISO(swapRequest.workingDateFrom), 'dd/MM/yyyy')}</span>
                </div>
                {swapRequest.workingSlotFrom && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-700'>
                      <Clock className='h-4 w-4 text-red-600' />
                      <span>Ca làm: {swapRequest.workingSlotFrom.shiftName}</span>
                    </div>
                    <div className='flex items-center gap-2 text-gray-700 ml-6'>
                      <Badge variant='outline' className='bg-red-50 border-red-200'>
                        {formatTime(swapRequest.workingSlotFrom.shiftStart)} -{' '}
                        {formatTime(swapRequest.workingSlotFrom.shiftEnd)}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-4 p-4 bg-red-50/50 rounded-lg border border-red-100'>
              <h4 className='font-medium text-red-800 flex items-center gap-2'>
                <User className='h-4 w-4 text-red-600' />
                Nhân viên đổi ca
              </h4>
              <div className='flex items-center gap-3'>
                <Avatar className='h-10 w-10 bg-red-100 text-red-700 border border-red-200'>
                  <AvatarFallback>{getInitials(swapRequest.employeeToName)}</AvatarFallback>
                </Avatar>
                <div className='font-medium'>{swapRequest.employeeToName}</div>
              </div>
              <div className='space-y-2 mt-2'>
                <div className='flex items-center gap-2 text-gray-700'>
                  <CalendarDays className='h-4 w-4 text-red-600' />
                  <span>Ngày làm: {format(parseISO(swapRequest.workingDateTo), 'dd/MM/yyyy')}</span>
                </div>
                {swapRequest.workingSlotTo && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-700'>
                      <Clock className='h-4 w-4 text-red-600' />
                      <span>Ca làm: {swapRequest.workingSlotTo.shiftName}</span>
                    </div>
                    <div className='flex items-center gap-2 text-gray-700 ml-6'>
                      <Badge variant='outline' className='bg-red-50 border-red-200'>
                        {formatTime(swapRequest.workingSlotTo.shiftStart)} -{' '}
                        {formatTime(swapRequest.workingSlotTo.shiftEnd)}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='text-sm text-gray-700 flex items-center gap-2 p-3 bg-orange-50 rounded-md border border-orange-100'>
            <Clock className='h-4 w-4 text-orange-600' />
            <span>Yêu cầu lúc: {format(parseISO(swapRequest.requestDate), 'dd/MM/yyyy HH:mm')}</span>
          </div>
        </div>

        <DialogFooter className='mt-4 border-t pt-4 shrink-0'>
          <div className='flex items-center justify-between sm:justify-between w-full'>
            <DialogClose asChild>
              <Button variant='outline' className='border-gray-200'>
                Đóng
              </Button>
            </DialogClose>

            {swapRequest.status === 'PendingManagerApprove' && (
              <div className='flex items-center gap-2'>
                <Button
                  onClick={() => onAction('reject')}
                  variant='outline'
                  className='border-red-200 text-red-700 hover:bg-red-50'
                >
                  <XCircle className='h-4 w-4 mr-1' />
                  Từ chối
                </Button>
                <Button onClick={() => onAction('approve')} className='bg-red-500 hover:bg-red-600 text-white'>
                  <CheckCircle className='h-4 w-4 mr-1' />
                  Duyệt
                </Button>
              </div>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
