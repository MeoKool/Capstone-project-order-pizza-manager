import { format, parseISO } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'
import type { WorkingSlotRegister, Zone } from '@/types/staff-schedule'

interface RegistrationDialogProps {
  registration: WorkingSlotRegister | null
  zones: Zone[]
  isSubmitting: boolean
  onClose: () => void
  onApprove: (registration: WorkingSlotRegister, zoneId: string) => Promise<void>
}

export function RegistrationDialog({ registration, zones, isSubmitting, onClose, onApprove }: RegistrationDialogProps) {
  const [selectedZone, setSelectedZone] = useState('')

  if (!registration) return null

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
    <Dialog open={!!registration} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader className='shrink-0'>
          <DialogTitle className='text-xl flex items-center gap-2 text-green-700'>
            <User className='h-5 w-5' />
            Chi tiết yêu cầu đăng ký
          </DialogTitle>
        </DialogHeader>

        <div className='py-4 space-y-6 overflow-auto flex-1' style={{ minHeight: '200px' }}>
          <div className='flex items-center gap-3 bg-green-50 p-3 rounded-lg border border-green-100'>
            <Avatar className='h-12 w-12 bg-green-100 text-green-700 border border-green-200'>
              <AvatarFallback>{getInitials(registration.staffName)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className='font-semibold text-lg text-green-900'>{registration.staffName}</h3>
              <div className='flex flex-wrap gap-2 mt-1'>
                {getStatusBadge(registration.status)}
                {registration.status === 'Approved' && registration.zoneId === null && (
                  <Badge className='bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1'>
                    <AlertCircle className='h-3.5 w-3.5' />
                    <span>Chưa phân khu vực</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className='space-y-3'>
            <div className='flex items-center gap-2 text-gray-700'>
              <Clock className='h-4 w-4 text-green-600' />
              <span>Ngày làm: {format(parseISO(registration.workingDate), 'dd/MM/yyyy')}</span>
            </div>
            {registration.workingSlot && (
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-700'>
                  <Clock className='h-4 w-4 text-green-600' />
                  <span>Ca làm: {registration.workingSlot.shiftName}</span>
                </div>
                <div className='flex items-center gap-2 text-gray-700 ml-6'>
                  <Badge variant='outline' className='bg-green-50 border-green-200'>
                    {formatTime(registration.workingSlot.shiftStart)} - {formatTime(registration.workingSlot.shiftEnd)}
                  </Badge>
                </div>
              </div>
            )}
            <div className='flex items-center gap-2 text-gray-700'>
              <Clock className='h-4 w-4 text-green-600' />
              <span>Đăng ký: {format(parseISO(registration.registerDate), 'dd/MM/yyyy HH:mm')}</span>
            </div>
          </div>

          {(registration.status === 'Onhold' ||
            (registration.status === 'Approved' && registration.zoneId === null)) && (
            <div className='space-y-3 bg-green-50/50 p-4 rounded-lg border border-green-100'>
              <Label htmlFor='zone' className='text-green-700 font-medium'>
                Chọn khu vực làm việc
              </Label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger id='zone' className='border-green-200 focus:ring-green-500'>
                  <SelectValue placeholder='Chọn khu vực' />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name} - {zone.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className='mt-4 border-t pt-4 shrink-0'>
          <div className='flex items-center justify-between sm:justify-between w-full'>
            <DialogClose asChild>
              <Button variant='outline' className='border-gray-200'>
                Đóng
              </Button>
            </DialogClose>

            {(registration.status === 'Onhold' ||
              (registration.status === 'Approved' && registration.zoneId === null)) && (
              <Button
                onClick={() => onApprove(registration, selectedZone)}
                disabled={isSubmitting || !selectedZone}
                className='bg-green-600 hover:bg-green-700 text-white'
              >
                {isSubmitting
                  ? 'Đang xử lý...'
                  : registration.status === 'Onhold'
                    ? 'Duyệt và phân công'
                    : 'Phân công khu vực'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
