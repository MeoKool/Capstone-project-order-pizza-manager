'use client'

import { useState } from 'react'
import axios from 'axios'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Clock, MapPin, Phone, X } from 'lucide-react'
import type { StaffSchedule, Zone } from '@/types/staff-schedule'
import { getStaffTypeLabel } from '@/utils/status-utils'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

interface SchedulesListProps {
  schedules: StaffSchedule[]
  zones: Zone[]
  onScheduleDeleted?: () => void
}

interface ApiErrorResponse {
  error: {
    code: number
    title: string
    message: string
    statusCode: number
    timestamp: string
  }
}

export function SchedulesList({ schedules, zones, onScheduleDeleted }: SchedulesListProps) {
  const [hoveredStaffId, setHoveredStaffId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [staffToDelete, setStaffToDelete] = useState<StaffSchedule | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

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

  // Get staff status label
  const getStaffStatusLabel = (status: string) => {
    switch (status) {
      case 'FullTime':
        return 'Toàn thời gian'
      case 'PartTime':
        return 'Bán thời gian'
      case 'Cheff':
        return 'Đầu bếp'
      default:
        return status
    }
  }

  // Get staff type color
  const getStaffTypeColor = (staffType: string) => {
    switch (staffType) {
      case 'Manager':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'Staff':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'Cheff':
        return 'bg-amber-100 text-amber-800 border-amber-300'
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
        return 'bg-orange-100 text-orange-800 border-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  // Get zone description
  const getZoneDescription = (zoneId: string) => {
    const zone = zones.find((z) => z.id === zoneId)
    return zone ? zone.description : ''
  }

  // Handle delete staff schedule
  const handleDeleteClick = (staff: StaffSchedule) => {
    setStaffToDelete(staff)
    setIsConfirmOpen(true)
  }

  // Confirm delete staff schedule
  const confirmDelete = async () => {
    if (!staffToDelete) return

    setIsDeleting(true)
    try {
      await axios.delete(`https://vietsac.id.vn/api/staff-zone-schedules`, {
        params: {
          isHardDeleted: false
        },
        data: {
          id: staffToDelete.id
        }
      })

      toast.success(`Đã xóa nhân viên ${staffToDelete.staffName} khỏi lịch làm việc`)

      // Call the callback to refresh data
      if (onScheduleDeleted) {
        onScheduleDeleted()
      }
    } catch (error) {
      console.error('Error deleting staff schedule:', error)

      // Handle specific error responses
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          const errorData = error.response.data as ApiErrorResponse
          toast.error(errorData.error.message || 'Lỗi khi xóa nhân viên khỏi lịch làm việc')
        } else {
          toast.error('Không thể xóa nhân viên khỏi lịch làm việc')
        }
      } else {
        toast.error('Không thể xóa nhân viên khỏi lịch làm việc')
      }
    } finally {
      setIsDeleting(false)
      setIsConfirmOpen(false)
      setStaffToDelete(null)
    }
  }

  const groupedBySlot = groupSchedulesBySlot(schedules)

  return (
    <>
      <div className='space-y-6 pb-4'>
        {Object.entries(groupedBySlot).map(([slotId, slotSchedules]) => {
          const slot = slotSchedules[0].workingSlot
          const groupedByZone = groupSchedulesByZone(slotSchedules)

          return (
            <div key={slotId} className='mb-6 last:mb-0 bg-white rounded-lg border border-red-200 p-4 shadow-sm'>
              <div className='flex flex-col gap-4'>
                {/* Thông tin ca làm */}
                <div className='flex items-center justify-between border-b border-orange-100 pb-3'>
                  <div className='flex items-center gap-2'>
                    {slot && slot.shiftName ? (
                      <Badge className='bg-orange-100 text-orange-800 border border-orange-300'>{slot.shiftName}</Badge>
                    ) : (
                      <Badge className='bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200'>
                        Nhân viên chính thức
                      </Badge>
                    )}
                  </div>
                  <div className='flex items-center gap-2 text-gray-700'>
                    <Clock className='h-4 w-4 text-orange-600' />
                    <span>
                      {slot && slot.shiftStart && slot.shiftEnd
                        ? `${formatTime(slot.shiftStart)} - ${formatTime(slot.shiftEnd)}`
                        : 'Cả ngày'}
                    </span>
                  </div>
                </div>

                {/* Danh sách khu vực và nhân viên */}
                <div className='divide-y divide-gray-100'>
                  {Object.entries(groupedByZone).map(([zoneId, zoneStaffList]) => (
                    <div key={zoneId} className='py-3 first:pt-0 last:pb-0'>
                      <div className='flex items-center gap-2 mb-3'>
                        <div className='h-8 w-8 rounded-full bg-red-100 flex items-center justify-center border border-red-200'>
                          <MapPin className='h-4 w-4 text-red-700' />
                        </div>
                        <div>
                          <div className='font-medium text-red-900'>{zoneStaffList[0].zone.name}</div>
                          <div className='text-xs text-gray-600'>{getZoneDescription(zoneId)}</div>
                        </div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-3 pl-10'>
                        {zoneStaffList.map((staff) => (
                          <div
                            key={staff.id}
                            className='flex items-start gap-3 p-2 rounded-md hover:bg-red-50/50 relative group'
                            onMouseEnter={() => setHoveredStaffId(staff.id)}
                            onMouseLeave={() => setHoveredStaffId(null)}
                          >
                            <Avatar className='h-8 w-8 bg-red-100 text-red-700 border border-red-200'>
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
                                  <Phone className='h-3.5 w-3.5 inline mr-1 text-red-600' />
                                  {staff.staff.phone}
                                </div>
                              )}
                            </div>

                            {/* Delete button that appears on hover */}
                            <button
                              className={`absolute top-2 right-2 p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 
                                ${hoveredStaffId === staff.id ? 'opacity-100' : 'opacity-0'} 
                                transition-opacity duration-200`}
                              onClick={() => handleDeleteClick(staff)}
                              aria-label='Xóa nhân viên khỏi lịch làm việc'
                            >
                              <X className='h-4 w-4' />
                            </button>
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

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhân viên {staffToDelete?.staffName} khỏi lịch làm việc này?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
              disabled={isDeleting}
              className='bg-red-500 hover:bg-red-600'
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
