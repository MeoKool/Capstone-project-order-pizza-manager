import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Clock, MapPin, Phone } from 'lucide-react'
import type { StaffSchedule, Zone } from '@/types/staff-schedule'

interface SchedulesListProps {
  schedules: StaffSchedule[]
  zones: Zone[]
}

export function SchedulesList({ schedules, zones }: SchedulesListProps) {
  if (schedules.length === 0) {
    return <div className='text-center py-6 text-gray-500'>Không có lịch làm việc nào cho ngày này</div>
  }

  // Group schedules by slot
  const groupSchedulesBySlot = (schedules: StaffSchedule[]) => {
    const grouped: Record<string, StaffSchedule[]> = {}

    schedules.forEach((schedule) => {
      const key = schedule.workingSlotId
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(schedule)
    })

    return grouped
  }

  // Group schedules by zone
  const groupSchedulesByZone = (schedules: StaffSchedule[]) => {
    const grouped: Record<string, StaffSchedule[]> = {}

    schedules.forEach((schedule) => {
      const key = schedule.zoneId
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(schedule)
    })

    return grouped
  }

  // Format time from HH:MM:SS to HH:MM
  const formatTime = (time: string) => {
    if (!time) return ''
    return time.substring(0, 5)
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

  // Get staff type label
  const getStaffTypeLabel = (staffType: string) => {
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
  const getStaffStatusLabel = (status: string) => {
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
  const getStaffTypeColor = (staffType: string) => {
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
  const getStaffStatusColor = (status: string) => {
    switch (status) {
      case 'FullTime':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'PartTime':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  // Get zone description
  const getZoneDescription = (zoneId: string) => {
    const zone = zones.find((z) => z.id === zoneId)
    return zone ? zone.description : ''
  }

  const groupedBySlot = groupSchedulesBySlot(schedules)

  return (
    <div className='space-y-6 pb-4'>
      {Object.entries(groupedBySlot).map(([slotId, slotSchedules]) => {
        const slot = slotSchedules[0].workingSlot
        const groupedByZone = groupSchedulesByZone(slotSchedules)

        return (
          <div key={slotId} className='mb-6 last:mb-0 bg-white rounded-lg border border-green-200 p-4 shadow-sm'>
            <div className='flex flex-col gap-4'>
              {/* Thông tin ca làm */}
              <div className='flex items-center justify-between border-b border-green-100 pb-3'>
                <div className='flex items-center gap-2'>
                  <Badge className='bg-amber-100 text-amber-800 border border-amber-300'>{slot.shiftName}</Badge>
                </div>
                <div className='flex items-center gap-2 text-gray-700'>
                  <Clock className='h-4 w-4 text-amber-600' />
                  <span>
                    {formatTime(slot.shiftStart)} - {formatTime(slot.shiftEnd)}
                  </span>
                </div>
              </div>

              {/* Danh sách khu vực và nhân viên */}
              <div className='divide-y divide-gray-100'>
                {Object.entries(groupedByZone).map(([zoneId, zoneStaffList]) => (
                  <div key={zoneId} className='py-3 first:pt-0 last:pb-0'>
                    <div className='flex items-center gap-2 mb-3'>
                      <div className='h-8 w-8 rounded-full bg-green-100 flex items-center justify-center border border-green-200'>
                        <MapPin className='h-4 w-4 text-green-700' />
                      </div>
                      <div>
                        <div className='font-medium text-green-900'>{zoneStaffList[0].zone.name}</div>
                        <div className='text-xs text-gray-600'>{getZoneDescription(zoneId)}</div>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 pl-10'>
                      {zoneStaffList.map((staff) => (
                        <div key={staff.id} className='flex items-start gap-3 p-2 rounded-md hover:bg-green-50/50'>
                          <Avatar className='h-8 w-8 bg-green-100 text-green-700 border border-green-200'>
                            <AvatarFallback>{getInitials(staff.staffName)}</AvatarFallback>
                          </Avatar>
                          <div className='flex-1'>
                            <div className='font-medium'>{staff.staffName}</div>
                            {staff.staff && (
                              <div className='flex flex-wrap gap-2 mt-1'>
                                <Badge
                                  variant='outline'
                                  className={`${getStaffTypeColor(staff.staff.staffType)} border text-xs py-0 h-5`}
                                >
                                  {getStaffTypeLabel(staff.staff.staffType)}
                                </Badge>
                                <Badge
                                  variant='outline'
                                  className={`${getStaffStatusColor(staff.staff.status)} border text-xs py-0 h-5`}
                                >
                                  {getStaffStatusLabel(staff.staff.status)}
                                </Badge>
                              </div>
                            )}
                            {staff.staff && (
                              <div className='mt-1 text-sm text-gray-700'>
                                <Phone className='h-3.5 w-3.5 inline mr-1 text-green-600' />
                                {staff.staff.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
