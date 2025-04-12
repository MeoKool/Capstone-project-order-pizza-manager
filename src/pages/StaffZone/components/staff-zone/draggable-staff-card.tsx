import { useDraggable } from '@dnd-kit/core'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import type { StaffZone } from '@/services/staff-zone-service'

interface DraggableStaffCardProps {
  staffZone: StaffZone
  isMoving: boolean
  movingStaffId: string | null
}

export function DraggableStaffCard({ staffZone, isMoving, movingStaffId }: DraggableStaffCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: staffZone.id,
    data: {
      staffZone
    }
  })

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

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
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing bg-white border ${
        isDragging ? 'opacity-30' : 'border-transparent'
      } ${isMoving && movingStaffId === staffZone.staff.id ? 'animate-pulse' : ''}`}
      style={{
        touchAction: 'none' // Prevents touch scrolling while dragging on mobile
      }}
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
        <Badge className={getStaffTypeBadgeColor(staffZone.staff.staffType)}>
          {staffZone.staff.staffType === 'Cheff'
            ? 'Đầu bếp'
            : staffZone.staff.staffType === 'Manager'
              ? 'Quản lý'
              : 'Nhân viên'}
        </Badge>
        {isMoving && movingStaffId === staffZone.staff.id && <Loader2 className='h-4 w-4 animate-spin ml-2' />}
      </div>
    </div>
  )
}
