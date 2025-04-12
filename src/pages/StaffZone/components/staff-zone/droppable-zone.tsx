import { useDroppable } from '@dnd-kit/core'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'
import type { StaffZone, Zone } from '@/services/staff-zone-service'
import { DraggableStaffCard } from './draggable-staff-card'
import { DraggableStaffPill } from './draggable-staff-pill'

interface DroppableZoneProps {
  zone: Zone
  staffZones: StaffZone[]
  isMoving: boolean
  movingStaffId: string | null
  isGridView?: boolean
}

export function DroppableZone({ zone, staffZones, isMoving, movingStaffId, isGridView = true }: DroppableZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: zone.id,
    data: {
      zone
    }
  })

  // Get zone color based on zone type
  const getZoneColor = (zoneType: string) => {
    return zoneType === 'DininingArea' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
  }

  // Get zone icon based on zone type
  const getZoneIcon = (zoneType: string) => {
    if (zoneType === 'DininingArea') {
      return (
        <div className='rounded-full bg-emerald-100 p-1.5'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='text-emerald-600'
          >
            <path d='M3 10a7 7 0 1 0 14 0 7 7 0 1 0-14 0' />
            <circle cx='10' cy='10' r='3' />
            <path d='m17 10 4 4' />
            <path d='m21 10-4 4' />
            <path d='M10 17v4' />
          </svg>
        </div>
      )
    } else {
      return (
        <div className='rounded-full bg-amber-100 p-1.5'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='text-amber-600'
          >
            <path d='M7 10h10' />
            <path d='M7 14h10' />
            <circle cx='12' cy='12' r='9' />
          </svg>
        </div>
      )
    }
  }

  if (isGridView) {
    return (
      <Card
        ref={setNodeRef}
        className={`border-2 ${getZoneColor(zone.type)} overflow-hidden transition-all duration-200 ${
          isOver ? 'ring-2 ring-primary ring-opacity-70 shadow-lg transform scale-[1.01]' : ''
        }`}
      >
        <div className='p-4 border-b border-gray-100'>
          <div className='flex justify-between items-start'>
            <div className='flex items-center gap-2'>
              {getZoneIcon(zone.type)}
              <div>
                <h3 className='font-semibold'>{zone.name.trim()}</h3>
                <p className='text-sm text-muted-foreground'>{zone.description}</p>
              </div>
            </div>
            <Badge variant='outline' className='capitalize'>
              {zone.type === 'DininingArea' ? 'Phục vụ' : 'Bếp'}
            </Badge>
          </div>
        </div>
        <div className='p-4'>
          <div className='flex items-center gap-2 mb-3'>
            <Users className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm text-muted-foreground'>{staffZones.length} nhân viên</span>
          </div>
          <div
            className={`space-y-3 max-h-[240px] overflow-y-auto pr-1 transition-all duration-200 ${
              isOver ? 'bg-primary/5 rounded-lg p-2' : ''
            } ${staffZones.length === 0 ? 'flex items-center justify-center min-h-[100px]' : ''}`}
          >
            {staffZones.length === 0 ? (
              <div
                className={`text-muted-foreground text-sm text-center p-4 border border-dashed rounded-lg ${isOver ? 'border-primary/50 bg-primary/5' : 'border-gray-200'}`}
              >
                <p>Thả nhân viên vào đây</p>
              </div>
            ) : (
              staffZones.map((staffZone) => (
                <DraggableStaffCard
                  key={staffZone.id}
                  staffZone={staffZone}
                  isMoving={isMoving}
                  movingStaffId={movingStaffId}
                />
              ))
            )}
          </div>
        </div>
      </Card>
    )
  } else {
    return (
      <Card
        ref={setNodeRef}
        className={`border-l-4 ${getZoneColor(zone.type)} transition-all duration-200 ${
          isOver ? 'ring-2 ring-primary ring-opacity-70 shadow-lg transform scale-[1.005]' : ''
        }`}
      >
        <CardContent className='p-4'>
          <div className='flex flex-col md:flex-row md:items-center gap-4'>
            <div className='flex items-center gap-3 min-w-[250px]'>
              {getZoneIcon(zone.type)}
              <div>
                <h3 className='font-semibold'>{zone.name.trim()}</h3>
                <p className='text-sm text-muted-foreground'>{zone.description}</p>
              </div>
              <Badge variant='outline' className='capitalize ml-auto md:ml-2'>
                {zone.type === 'DininingArea' ? 'Phục vụ' : 'Bếp'}
              </Badge>
            </div>

            <div
              className={`flex-1 flex flex-wrap gap-2 mt-2 md:mt-0 transition-all duration-200 rounded-lg p-2 ${
                isOver ? 'bg-primary/5' : ''
              } ${staffZones.length === 0 ? 'justify-center items-center min-h-[50px] border border-dashed' : ''} ${
                staffZones.length === 0 && isOver
                  ? 'border-primary/50'
                  : staffZones.length === 0
                    ? 'border-gray-200'
                    : ''
              }`}
            >
              {staffZones.length === 0 ? (
                <p className='text-muted-foreground text-sm'>Thả nhân viên vào đây</p>
              ) : (
                staffZones.map((staffZone) => (
                  <DraggableStaffPill
                    key={staffZone.id}
                    staffZone={staffZone}
                    isMoving={isMoving}
                    movingStaffId={movingStaffId}
                  />
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
}
