import { DragOverlay } from '@dnd-kit/core'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { StaffZone } from '@/services/staff-zone-service'

interface StaffZoneOverlayProps {
  activeStaffZone: StaffZone | null
  activeView: 'grid' | 'list'
  getInitials: (name: string) => string
}

export function StaffZoneOverlay({ activeStaffZone, activeView, getInitials }: StaffZoneOverlayProps) {
  if (!activeStaffZone) return null

  // Get badge color based on staff type
  const getStaffTypeBadgeColor = (staffType: string) => {
    switch (staffType) {
      case 'Staff':
        return 'bg-blue-100 text-blue-800'
      case 'Cheff':
        return 'bg-amber-100 text-amber-800'
      case 'Manager':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
      {activeView === 'grid' ? (
        <div className='flex items-center justify-between p-2 rounded-md bg-white border border-primary shadow-lg w-[280px]'>
          <div className='flex items-center gap-3'>
            <Avatar className='h-8 w-8 border-2 border-white shadow-sm'>
              <AvatarFallback
                className={`text-xs ${
                  activeStaffZone.staff.staffType === 'Cheff'
                    ? 'bg-amber-100 text-amber-800'
                    : activeStaffZone.staff.staffType === 'Manager'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                }`}
              >
                {getInitials(activeStaffZone.staff.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className='font-medium leading-tight'>{activeStaffZone.staff.fullName}</p>
              <p className='text-xs text-muted-foreground'>
                {activeStaffZone.staff.status === 'FullTime' ? 'Toàn thời gian' : 'Bán thời gian'}
              </p>
            </div>
          </div>
          <Badge className={getStaffTypeBadgeColor(activeStaffZone.staff.staffType)}>
            {activeStaffZone.staff.staffType === 'Cheff'
              ? 'Đầu bếp'
              : activeStaffZone.staff.staffType === 'Manager'
                ? 'Quản lý'
                : 'Nhân viên'}
          </Badge>
        </div>
      ) : (
        <div className='flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow-lg border border-primary'>
          <Avatar className='h-6 w-6'>
            <AvatarFallback
              className={`text-xs ${
                activeStaffZone.staff.staffType === 'Cheff'
                  ? 'bg-amber-100 text-amber-800'
                  : activeStaffZone.staff.staffType === 'Manager'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
              }`}
            >
              {getInitials(activeStaffZone.staff.fullName)}
            </AvatarFallback>
          </Avatar>
          <span className='text-sm font-medium'>{activeStaffZone.staff.fullName}</span>
          <Badge className={`${getStaffTypeBadgeColor(activeStaffZone.staff.staffType)} text-xs py-0 px-1.5`}>
            {activeStaffZone.staff.staffType === 'Cheff'
              ? 'Đầu bếp'
              : activeStaffZone.staff.staffType === 'Manager'
                ? 'Quản lý'
                : 'Nhân viên'}
          </Badge>
        </div>
      )}
    </DragOverlay>
  )
}
