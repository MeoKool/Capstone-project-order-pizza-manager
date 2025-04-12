import { DragOverlay } from '@dnd-kit/core'
import type { StaffZone } from '@/services/staff-zone-service'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface StaffZoneOverlayProps {
  activeStaffZone: StaffZone | null
  activeView: 'grid' | 'list'
  getInitials: (name: string) => string
}

export function StaffZoneOverlay({ activeStaffZone, activeView, getInitials }: StaffZoneOverlayProps) {
  if (!activeStaffZone) return null

  // Render staff card for drag overlay
  const renderStaffCard = (staffZone: StaffZone) => {
    return (
      <div
        className='flex items-center justify-between p-2 rounded-md bg-white border shadow-md'
        style={{ width: activeView === 'grid' ? '300px' : 'auto' }}
      >
        <div className='flex items-center gap-3'>
          <Avatar className='h-8 w-8 border-2 border-white shadow-sm'>
            <AvatarFallback
              className={`text-xs ${
                staffZone.staff.staffType === 'Cheff'
                  ? 'bg-amber-100 text-amber-800'
                  : staffZone.staff.staffType === 'Manager'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
              }`}
            >
              {getInitials(staffZone.staff.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className='font-medium leading-tight'>{staffZone.staff.fullName}</p>
            <p className='text-xs text-muted-foreground'>
              {staffZone.staff.status === 'FullTime' ? 'Toàn thời gian' : 'Bán thời gian'}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Badge
            className={`
            ${staffZone.staff.staffType === 'Staff' ? 'bg-blue-100 text-blue-800' : ''}
            ${staffZone.staff.staffType === 'Cheff' ? 'bg-amber-100 text-amber-800' : ''}
            ${staffZone.staff.staffType === 'Manager' ? 'bg-purple-100 text-purple-800' : ''}
          `}
          >
            {staffZone.staff.staffType === 'Cheff'
              ? 'Đầu bếp'
              : staffZone.staff.staffType === 'Manager'
                ? 'Quản lý'
                : 'Nhân viên'}
          </Badge>
        </div>
      </div>
    )
  }

  // Render staff pill for drag overlay (list view)
  const renderStaffPill = (staffZone: StaffZone) => {
    return (
      <div className='flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow-md border border-gray-200'>
        <Avatar className='h-6 w-6'>
          <AvatarFallback
            className={`text-xs ${
              staffZone.staff.staffType === 'Cheff'
                ? 'bg-amber-100 text-amber-800'
                : staffZone.staff.staffType === 'Manager'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
            }`}
          >
            {getInitials(staffZone.staff.fullName)}
          </AvatarFallback>
        </Avatar>
        <span className='text-sm font-medium'>{staffZone.staff.fullName}</span>
        <Badge
          className={`
            ${staffZone.staff.staffType === 'Staff' ? 'bg-blue-100 text-blue-800' : ''}
            ${staffZone.staff.staffType === 'Cheff' ? 'bg-amber-100 text-amber-800' : ''}
            ${staffZone.staff.staffType === 'Manager' ? 'bg-purple-100 text-purple-800' : ''}
            text-xs py-0 px-1.5
          `}
        >
          {staffZone.staff.staffType === 'Cheff'
            ? 'Đầu bếp'
            : staffZone.staff.staffType === 'Manager'
              ? 'Quản lý'
              : 'Nhân viên'}
        </Badge>
      </div>
    )
  }

  return (
    <DragOverlay dropAnimation={null}>
      {activeStaffZone && (
        <div
          style={{
            width: activeView === 'grid' ? '300px' : 'auto',
            opacity: 1,
            backgroundColor: 'white',
            borderRadius: '0.375rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transform: 'rotate(2deg)'
          }}
        >
          {activeView === 'grid' ? renderStaffCard(activeStaffZone) : renderStaffPill(activeStaffZone)}
        </div>
      )}
    </DragOverlay>
  )
}
