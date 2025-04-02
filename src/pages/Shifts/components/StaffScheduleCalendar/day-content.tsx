import { Badge } from '@/components/ui/badge'
import { Users, AlertCircle, ArrowRightLeft } from 'lucide-react'
import type { StaffSchedule, WorkingSlotRegister, SwapWorkingSlotRequest } from '@/types/staff-schedule'

interface DayContentProps {
  date: Date
  schedules: StaffSchedule[]
  registrations: WorkingSlotRegister[]
  swapRequests: SwapWorkingSlotRequest[]
}

export function DayContent({ date, schedules, registrations, swapRequests }: DayContentProps) {
  console.log(date)
  const pendingRegistrations = registrations.filter(
    (reg) => reg.status === 'Onhold' || (reg.status === 'Approved' && reg.zoneId === null)
  )
  const pendingSwapRequests = swapRequests.filter((req) => req.status === 'PendingManagerApprove')

  const hasSchedules = schedules.length > 0
  const hasPendingItems = pendingRegistrations.length > 0 || pendingSwapRequests.length > 0

  return (
    <div className='space-y-2'>
      {hasSchedules && (
        <Badge className='bg-green-100 text-green-800 border border-green-300 flex items-center gap-1'>
          <Users className='h-3.5 w-3.5' />
          <span>{schedules.length}</span>
        </Badge>
      )}

      {pendingRegistrations.length > 0 && (
        <Badge className='bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1'>
          <AlertCircle className='h-3.5 w-3.5' />
          <span>{pendingRegistrations.length}</span>
        </Badge>
      )}

      {pendingSwapRequests.length > 0 && (
        <Badge className='bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1'>
          <ArrowRightLeft className='h-3.5 w-3.5' />
          <span>{pendingSwapRequests.length}</span>
        </Badge>
      )}

      {!hasSchedules && !hasPendingItems && <div className='text-xs text-gray-500'>Không có dữ liệu</div>}
    </div>
  )
}
