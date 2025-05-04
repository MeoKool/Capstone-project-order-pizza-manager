import { useEffect, useState } from 'react'
import { parseISO, addWeeks, subWeeks, isSameDay, addMonths, subMonths } from 'date-fns'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import StaffScheduleService from '@/services/staff-schedule-service'
import type {
  StaffSchedule,
  WorkingSlotRegister,
  Zone,
  StaffZoneScheduleRequest,
  SwapWorkingSlotRequest
} from '@/types/staff-schedule'

import { toast } from 'sonner'
import { CalendarHeader } from './StaffScheduleCalendar/calendar-header'
import LoadingSpinner from '@/components/LoadingSpinner'
import { WeekView } from './StaffScheduleCalendar/week-view'
import { MonthView } from './StaffScheduleCalendar/month-view'
import { DayDetailsDialog } from './StaffScheduleCalendar/day-details-dialog'
import { RegistrationDialog } from './StaffScheduleCalendar/registration-dialog'
import { SwapRequestDialog } from './StaffScheduleCalendar/swap-request-dialog'
import { SwapActionDialog } from './StaffScheduleCalendar/swap-action-dialog'

export default function StaffScheduleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'week' | 'month'>('week')
  const [staffSchedules, setStaffSchedules] = useState<StaffSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDaySchedules, setSelectedDaySchedules] = useState<StaffSchedule[]>([])

  // Registration approval states
  const [registrations, setRegistrations] = useState<WorkingSlotRegister[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedRegistration, setSelectedRegistration] = useState<WorkingSlotRegister | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Swap requests state
  const [swapRequests, setSwapRequests] = useState<SwapWorkingSlotRequest[]>([])
  const [selectedSwapRequest, setSelectedSwapRequest] = useState<SwapWorkingSlotRequest | null>(null)
  const [isSwapActionDialogOpen, setIsSwapActionDialogOpen] = useState(false)
  const [swapAction, setSwapAction] = useState<'approve' | 'reject' | null>(null)

  // Dialog states
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'schedules' | 'registrations' | 'swaps'>('schedules')

  useEffect(() => {
    fetchSchedules()
    fetchRegistrations()
    fetchSwapRequests()
  }, [])

  const fetchSchedules = async () => {
    try {
      setIsLoading(true)
      const staffScheduleService = StaffScheduleService.getInstance()
      const response = await staffScheduleService.getStaffSchedules()

      if (response.success && response.result) {
        setStaffSchedules(response.result.items)
        // Update selectedDaySchedules if there's a selected date
        if (selectedDate) {
          setSelectedDaySchedules(getSchedulesForDate(selectedDate))
        }
      }
    } catch (error) {
      console.error('Error fetching staff schedules:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRegistrations = async () => {
    try {
      const staffScheduleService = StaffScheduleService.getInstance()
      const response = await staffScheduleService.getWorkingSlotRegisters()

      if (response.success && response.result) {
        setRegistrations(response.result.items)
      }

      const zonesResponse = await staffScheduleService.getZones()
      if (zonesResponse.success && zonesResponse.result) {
        setZones(zonesResponse.result.items)
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
    }
  }

  const fetchSwapRequests = async () => {
    try {
      const staffScheduleService = StaffScheduleService.getInstance()
      const response = await staffScheduleService.getSwapWorkingSlotRequests()

      if (response.success && response.result) {
        const requests = response.result.items

        // Fetch working slot details for each request
        const requestsWithDetails = await Promise.all(
          requests.map(async (request) => {
            try {
              const [fromSlotResponse, toSlotResponse] = await Promise.all([
                staffScheduleService.getWorkingSlotById(request.workingSlotFromId),
                staffScheduleService.getWorkingSlotById(request.workingSlotToId)
              ])

              return {
                ...request,
                workingSlotFrom: fromSlotResponse.success ? fromSlotResponse.result : undefined,
                workingSlotTo: toSlotResponse.success ? toSlotResponse.result : undefined
              }
            } catch (error) {
              console.error('Error fetching working slot details:', error)
              return request
            }
          })
        )

        setSwapRequests(requestsWithDetails)
      }
    } catch (error) {
      console.error('Error fetching swap requests:', error)
    }
  }

  const handlePrevious = () => {
    if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1))
    } else {
      setCurrentDate(subMonths(currentDate, 1))
    }
  }

  const handleNext = () => {
    if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1))
    } else {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleRefresh = async () => {
    await Promise.all([fetchSchedules(), fetchRegistrations(), fetchSwapRequests()])
  }

  const getSchedulesForDate = (date: Date) => {
    return staffSchedules.filter((schedule) => {
      const scheduleDate = parseISO(schedule.workingDate)
      return isSameDay(scheduleDate, date)
    })
  }

  const getRegistrationsForDate = (date: Date) => {
    return registrations.filter((registration) => {
      const registrationDate = parseISO(registration.workingDate)
      return isSameDay(registrationDate, date)
    })
  }

  const getSwapRequestsForDate = (date: Date) => {
    return swapRequests.filter((request) => {
      const fromDate = parseISO(request.workingDateFrom)
      const toDate = parseISO(request.workingDateTo)
      return isSameDay(fromDate, date) || isSameDay(toDate, date)
    })
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedDaySchedules(getSchedulesForDate(date))
    setIsDayDialogOpen(true)
    setActiveTab('schedules')
  }

  const handleApproveRegistration = async (registration: WorkingSlotRegister, zoneId: string) => {
    if (!zoneId) {
      toast.error('Vui lòng chọn khu vực làm việc')
      return
    }

    setIsSubmitting(true)

    try {
      const staffScheduleService = StaffScheduleService.getInstance()

      // Nếu trạng thái là Onhold, duyệt đăng ký trước
      if (registration.status === 'Onhold') {
        const approveResponse = await staffScheduleService.approveWorkingSlotRegister(registration.id)

        if (!approveResponse.success) {
          toast.error(approveResponse.message || 'Không thể duyệt đăng ký')
          setIsSubmitting(false)
          return
        }
      }

      // Tạo lịch làm việc với khu vực đã chọn
      const scheduleData: StaffZoneScheduleRequest = {
        workingDate: registration.workingDate,
        staffId: registration.staffId,
        zoneId: zoneId,
        workingSlotId: registration.workingSlotId
      }

      const scheduleResponse = await staffScheduleService.createStaffZoneSchedule(scheduleData)

      if (scheduleResponse.success) {
        toast.success(
          registration.status === 'Onhold'
            ? 'Đã duyệt đăng ký và phân công khu vực làm việc'
            : 'Đã phân công khu vực làm việc'
        )

        // Cập nhật lại danh sách
        await Promise.all([fetchSchedules(), fetchRegistrations()])

        if (selectedDate) {
          setSelectedDaySchedules(getSchedulesForDate(selectedDate))
        }

        setSelectedRegistration(null)
      } else {
        toast.error(scheduleResponse.message || 'Không thể phân công khu vực làm việc')
      }
    } catch (error) {
      console.error('Error approving registration:', error)
      toast.error('Đã xảy ra lỗi khi xử lý yêu cầu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSwapAction = (action: 'approve' | 'reject') => {
    if (!selectedSwapRequest) return

    setSwapAction(action)
    setIsSwapActionDialogOpen(true)
  }

  const confirmSwapAction = async () => {
    if (!selectedSwapRequest || !swapAction) return

    setIsSubmitting(true)

    try {
      const staffScheduleService = StaffScheduleService.getInstance()
      let response

      if (swapAction === 'approve') {
        response = await staffScheduleService.approveSwapWorkingSlot(selectedSwapRequest.id)
      } else {
        response = await staffScheduleService.rejectSwapWorkingSlot(selectedSwapRequest.id)
      }

      if (response.success) {
        toast.success(swapAction === 'approve' ? 'Đã duyệt yêu cầu đổi ca' : 'Đã từ chối yêu cầu đổi ca')

        // Refresh data
        await Promise.all([fetchSchedules(), fetchSwapRequests()])

        if (selectedDate) {
          setSelectedDaySchedules(getSchedulesForDate(selectedDate))
        }

        setSelectedSwapRequest(null)
      } else {
        toast.error(response.message || `Không thể ${swapAction === 'approve' ? 'duyệt' : 'từ chối'} yêu cầu đổi ca`)
      }
    } catch (error) {
      console.error(`Error ${swapAction === 'approve' ? 'approving' : 'rejecting'} swap request:`, error)
      toast.error(`Đã xảy ra lỗi khi ${swapAction === 'approve' ? 'duyệt' : 'từ chối'} yêu cầu đổi ca`)
    } finally {
      setIsSubmitting(false)
      setIsSwapActionDialogOpen(false)
      setSwapAction(null)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='p-4 bg-orange-50 '>
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToday={handleToday}
          onRefresh={handleRefresh}
          onViewChange={setView}
        />
      </div>

      <div className='flex-1 overflow-hidden bg-white'>
        <Tabs value={view} className='h-full'>
          <TabsContent value='week' className='h-full '>
            <div className='h-full '>
              <WeekView
                currentDate={currentDate}
                registrations={registrations}
                swapRequests={swapRequests}
                onDateClick={handleDateClick}
              />
            </div>
          </TabsContent>
          <TabsContent value='month' className='h-full'>
            <MonthView
              currentDate={currentDate}
              staffSchedules={staffSchedules}
              registrations={registrations}
              swapRequests={swapRequests}
              onDateClick={handleDateClick}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Day Dialog */}
      <DayDetailsDialog
        isOpen={isDayDialogOpen}
        onOpenChange={setIsDayDialogOpen}
        selectedDate={selectedDate}
        schedules={selectedDaySchedules}
        registrations={selectedDate ? getRegistrationsForDate(selectedDate) : []}
        swapRequests={selectedDate ? getSwapRequestsForDate(selectedDate) : []}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRegistrationSelect={setSelectedRegistration}
        onSwapRequestSelect={setSelectedSwapRequest}
        zones={zones}
        onUpdate={fetchSchedules}
      />

      {/* Registration Approval Dialog */}
      <RegistrationDialog
        registration={selectedRegistration}
        zones={zones}
        isSubmitting={isSubmitting}
        onClose={() => setSelectedRegistration(null)}
        onApprove={handleApproveRegistration}
      />

      {/* Swap Request Dialog */}
      <SwapRequestDialog
        swapRequest={selectedSwapRequest}
        onClose={() => setSelectedSwapRequest(null)}
        onAction={handleSwapAction}
      />

      {/* Swap Action Confirmation Dialog */}
      <SwapActionDialog
        isOpen={isSwapActionDialogOpen}
        onOpenChange={setIsSwapActionDialogOpen}
        action={swapAction}
        isSubmitting={isSubmitting}
        onConfirm={confirmSwapAction}
      />
    </div>
  )
}
