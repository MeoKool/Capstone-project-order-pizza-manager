import { useEffect, useState } from 'react'
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  CalendarDays,
  MapPin,
  Phone,
  Repeat,
  ArrowRightLeft,
  Check,
  X
} from 'lucide-react'
import StaffScheduleService from '@/services/staff-schedule-service'
import type {
  WorkingSlotRegister,
  Zone,
  Config,
  StaffZoneScheduleRequest,
  StaffSchedule,
  SwapWorkingSlotRequest
} from '@/types/staff-schedule'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import { toast } from 'sonner'

export default function RegistrationApproval() {
  const [, setRegistrations] = useState<WorkingSlotRegister[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [, setConfigs] = useState<Config[]>([])
  const [weekLimit, setWeekLimit] = useState(3)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRegistration, setSelectedRegistration] = useState<WorkingSlotRegister | null>(null)
  const [selectedZone, setSelectedZone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentWeekRegistrations, setCurrentWeekRegistrations] = useState<WorkingSlotRegister[]>([])
  const [otherRegistrations, setOtherRegistrations] = useState<WorkingSlotRegister[]>([])
  const [assignedStaff, setAssignedStaff] = useState<StaffSchedule[]>([])
  const [isLoadingAssignedStaff, setIsLoadingAssignedStaff] = useState(false)

  // Swap requests state
  const [swapRequests, setSwapRequests] = useState<SwapWorkingSlotRequest[]>([])
  const [isLoadingSwapRequests, setIsLoadingSwapRequests] = useState(false)
  const [selectedSwapRequest, setSelectedSwapRequest] = useState<SwapWorkingSlotRequest | null>(null)
  const [isSwapActionDialogOpen, setIsSwapActionDialogOpen] = useState(false)
  const [swapAction, setSwapAction] = useState<'approve' | 'reject' | null>(null)

  useEffect(() => {
    fetchData()
    fetchSwapRequests()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const staffScheduleService = StaffScheduleService.getInstance()
      const [registrationsResponse, zonesResponse, configsResponse] = await Promise.all([
        staffScheduleService.getWorkingSlotRegisters(),
        staffScheduleService.getZones(),
        staffScheduleService.getConfigs()
      ])

      if (registrationsResponse.success && registrationsResponse.result) {
        const allRegistrations = registrationsResponse.result.items

        // Phân loại đăng ký theo tuần hiện tại và các tuần khác
        const now = new Date()
        const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 })
        const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 1 })

        const currentWeek = allRegistrations.filter((reg) => {
          const regDate = parseISO(reg.workingDate)
          return isWithinInterval(regDate, { start: startOfCurrentWeek, end: endOfCurrentWeek })
        })

        const others = allRegistrations.filter((reg) => {
          const regDate = parseISO(reg.workingDate)
          return !isWithinInterval(regDate, { start: startOfCurrentWeek, end: endOfCurrentWeek })
        })

        setRegistrations(allRegistrations)
        setCurrentWeekRegistrations(currentWeek)
        setOtherRegistrations(others)
      }

      if (zonesResponse.success && zonesResponse.result) {
        setZones(zonesResponse.result.items)
      }

      if (configsResponse.success && configsResponse.result) {
        const weekLimitConfig = configsResponse.result.items.find((config) => config.key === 'REGISTRATION_WEEK_LIMIT')
        if (weekLimitConfig) {
          setWeekLimit(Number.parseInt(weekLimitConfig.value))
        }
        setConfigs(configsResponse.result.items)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Không thể tải dữ liệu đăng ký')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSwapRequests = async () => {
    try {
      setIsLoadingSwapRequests(true)
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
      toast.error('Không thể tải dữ liệu yêu cầu đổi ca')
    } finally {
      setIsLoadingSwapRequests(false)
    }
  }

  const fetchAssignedStaff = async (workingDate: string) => {
    try {
      setIsLoadingAssignedStaff(true)
      const staffScheduleService = StaffScheduleService.getInstance()
      const response = await staffScheduleService.getStaffSchedulesByDate(workingDate)

      if (response.success && response.result) {
        setAssignedStaff(response.result.items)
      } else {
        setAssignedStaff([])
      }
    } catch (error) {
      console.error('Error fetching assigned staff:', error)
      setAssignedStaff([])
    } finally {
      setIsLoadingAssignedStaff(false)
    }
  }

  const handleOpenDetails = async (registration: WorkingSlotRegister) => {
    setSelectedRegistration(registration)
    setSelectedZone('')
    await fetchAssignedStaff(registration.workingDate)
  }

  const handleOpenSwapDetails = (request: SwapWorkingSlotRequest) => {
    setSelectedSwapRequest(request)
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

        // Refresh swap requests
        await fetchSwapRequests()
        setSelectedSwapRequest(null)
      } else {
        toast(response.message || `Không thể ${swapAction === 'approve' ? 'duyệt' : 'từ chối'} yêu cầu đổi ca`)
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const handleApprove = async () => {
    if (!selectedRegistration || !selectedZone) {
      toast('Vui lòng chọn khu vực làm việc')
      return
    }

    setIsSubmitting(true)

    try {
      const staffScheduleService = StaffScheduleService.getInstance()

      // Nếu trạng thái là Onhold, duyệt đăng ký trước
      if (selectedRegistration.status === 'Onhold') {
        const approveResponse = await staffScheduleService.approveWorkingSlotRegister(selectedRegistration.id)

        if (!approveResponse.success) {
          toast.error(approveResponse.message || 'Không thể duyệt đăng ký')
          setIsSubmitting(false)
          return
        }
      }

      // Tạo lịch làm việc với khu vực đã chọn
      const scheduleData: StaffZoneScheduleRequest = {
        workingDate: selectedRegistration.workingDate,
        staffId: selectedRegistration.staffId,
        zoneId: selectedZone,
        workingSlotId: selectedRegistration.workingSlotId
      }

      const scheduleResponse = await staffScheduleService.createStaffZoneSchedule(scheduleData)

      if (scheduleResponse.success) {
        toast.success(
          selectedRegistration.status === 'Onhold'
            ? 'Đã duyệt đăng ký và phân công khu vực làm việc'
            : 'Đã phân công khu vực làm việc'
        )

        // Cập nhật lại danh sách đăng ký
        await fetchData()
        // Cập nhật lại danh sách nhân viên đã phân công
        await fetchAssignedStaff(selectedRegistration.workingDate)
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

  // Nhóm nhân viên đã phân công theo ca làm và khu vực
  const groupStaffByShiftAndZone = () => {
    // Đầu tiên nhóm theo ca làm (workingSlotId)
    const groupedByShift: Record<string, StaffSchedule[]> = {}

    assignedStaff.forEach((staff) => {
      if (!groupedByShift[staff.workingSlotId]) {
        groupedByShift[staff.workingSlotId] = []
      }
      groupedByShift[staff.workingSlotId].push(staff)
    })

    return groupedByShift
  }

  // Nhóm nhân viên theo khu vực trong một ca làm
  const groupStaffByZone = (staffList: StaffSchedule[]) => {
    const grouped: Record<string, StaffSchedule[]> = {}

    staffList.forEach((staff) => {
      if (!grouped[staff.zoneId]) {
        grouped[staff.zoneId] = []
      }
      grouped[staff.zoneId].push(staff)
    })

    return grouped
  }

  // Lấy thông tin ca làm từ một nhân viên
  const getShiftInfo = (staff: StaffSchedule) => {
    return {
      id: staff.workingSlotId,
      name: staff.workingSlot?.shiftName || 'Không xác định',
      start: staff.workingSlot?.shiftStart || '00:00',
      end: staff.workingSlot?.shiftEnd || '00:00'
    }
  }

  // Lấy tên khu vực từ ID
  const getZoneName = (zoneId: string) => {
    const zone = zones.find((z) => z.id === zoneId)
    return zone ? zone.name : 'Không xác định'
  }

  // Format time from HH:MM:SS to HH:MM
  const formatTime = (time: string) => {
    if (!time) return ''
    return time.substring(0, 5)
  }

  // Lấy mô tả khu vực từ ID
  const getZoneDescription = (zoneId: string) => {
    const zone = zones.find((z) => z.id === zoneId)
    return zone ? zone.description : ''
  }

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

  const getStaffStatusColor = (status: string) => {
    switch (status) {
      case 'FullTime':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'PartTime':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const renderRegistrationList = (registrations: WorkingSlotRegister[]) => {
    if (registrations.length === 0) {
      return <div className='text-center py-8 text-gray-500'>Không có yêu cầu đăng ký nào</div>
    }

    return (
      <div className='space-y-4'>
        {registrations.map((registration) => (
          <Card
            key={registration.id}
            className={`border hover:shadow-md transition-shadow cursor-pointer ${
              registration.status === 'Onhold'
                ? 'border-amber-300 bg-amber-50/30'
                : registration.status === 'Approved'
                  ? registration.zoneId
                    ? 'border-green-300 bg-green-50/30'
                    : 'border-blue-300 bg-blue-50/30'
                  : 'border-red-300 bg-red-50/30'
            }`}
            onClick={() => handleOpenDetails(registration)}
          >
            <CardContent className='p-4'>
              <div className='flex items-start gap-3'>
                <Avatar className='h-10 w-10 bg-green-100 text-green-700 border border-green-200'>
                  <AvatarFallback>{getInitials(registration.staffName)}</AvatarFallback>
                </Avatar>

                <div className='flex-1'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                    <h3 className='font-semibold text-green-900'>{registration.staffName}</h3>
                    <div className='flex flex-wrap gap-2'>
                      {getStatusBadge(registration.status)}
                      {registration.status === 'Approved' && registration.zoneId === null && (
                        <Badge className='bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1'>
                          <AlertCircle className='h-3.5 w-3.5' />
                          <span>Chưa phân khu vực</span>
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className='mt-2 space-y-1 text-sm'>
                    <div className='flex items-center gap-2 text-gray-700'>
                      <CalendarDays className='h-4 w-4 text-green-600' />
                      <span>Ngày làm: {format(parseISO(registration.workingDate), 'dd/MM/yyyy')}</span>
                    </div>
                    {registration.workingSlot && (
                      <div className='flex items-center gap-2 text-gray-700'>
                        <Clock className='h-4 w-4 text-green-600' />
                        <span>
                          Ca làm: {registration.workingSlot.shiftName} (
                          {formatTime(registration.workingSlot.shiftStart)} -{' '}
                          {formatTime(registration.workingSlot.shiftEnd)})
                        </span>
                      </div>
                    )}
                    <div className='flex items-center gap-2 text-gray-700'>
                      <Clock className='h-4 w-4 text-green-600' />
                      <span>Đăng ký: {format(parseISO(registration.registerDate), 'dd/MM/yyyy HH:mm')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderSwapRequestsList = () => {
    if (isLoadingSwapRequests) {
      return (
        <div className='flex justify-center items-center py-8'>
          <div className='flex flex-col items-center gap-2'>
            <div className='animate-spin h-6 w-6 border-3 border-green-500 border-t-transparent rounded-full'></div>
            <div className='text-green-600 text-sm'>Đang tải dữ liệu...</div>
          </div>
        </div>
      )
    }

    if (swapRequests.length === 0) {
      return <div className='text-center py-8 text-gray-500'>Không có yêu cầu đổi ca nào</div>
    }

    return (
      <div className='space-y-4'>
        {swapRequests.map((request) => (
          <Card
            key={request.id}
            className='border border-amber-300 bg-amber-50/30 hover:shadow-md transition-shadow cursor-pointer'
            onClick={() => handleOpenSwapDetails(request)}
          >
            <CardContent className='p-4'>
              <div className='flex flex-col gap-3'>
                <div className='flex items-center justify-between'>
                  <h3 className='font-semibold text-green-900 flex items-center gap-2'>
                    <Repeat className='h-4 w-4 text-green-600' />
                    Yêu cầu đổi ca
                  </h3>
                  {getStatusBadge(request.status)}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-2'>
                  <div className='space-y-2 p-3 bg-white rounded-md border border-green-100'>
                    <div className='flex items-center gap-2'>
                      <Avatar className='h-8 w-8 bg-green-100 text-green-700 border border-green-200'>
                        <AvatarFallback>{getInitials(request.employeeFromName)}</AvatarFallback>
                      </Avatar>
                      <div className='font-medium text-green-800'>{request.employeeFromName}</div>
                    </div>
                    <div className='text-sm space-y-1 ml-10'>
                      <div className='flex items-center gap-2 text-gray-700'>
                        <CalendarDays className='h-3.5 w-3.5 text-green-600' />
                        <span>Ngày: {format(parseISO(request.workingDateFrom), 'dd/MM/yyyy')}</span>
                      </div>
                      {request.workingSlotFrom && (
                        <div className='flex items-center gap-2 text-gray-700'>
                          <Clock className='h-3.5 w-3.5 text-green-600' />
                          <span>
                            {request.workingSlotFrom.shiftName} ({formatTime(request.workingSlotFrom.shiftStart)} -{' '}
                            {formatTime(request.workingSlotFrom.shiftEnd)})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='space-y-2 p-3 bg-white rounded-md border border-green-100'>
                    <div className='flex items-center gap-2'>
                      <Avatar className='h-8 w-8 bg-green-100 text-green-700 border border-green-200'>
                        <AvatarFallback>{getInitials(request.employeeToName)}</AvatarFallback>
                      </Avatar>
                      <div className='font-medium text-green-800'>{request.employeeToName}</div>
                    </div>
                    <div className='text-sm space-y-1 ml-10'>
                      <div className='flex items-center gap-2 text-gray-700'>
                        <CalendarDays className='h-3.5 w-3.5 text-green-600' />
                        <span>Ngày: {format(parseISO(request.workingDateTo), 'dd/MM/yyyy')}</span>
                      </div>
                      {request.workingSlotTo && (
                        <div className='flex items-center gap-2 text-gray-700'>
                          <Clock className='h-3.5 w-3.5 text-green-600' />
                          <span>
                            {request.workingSlotTo.shiftName} ({formatTime(request.workingSlotTo.shiftStart)} -{' '}
                            {formatTime(request.workingSlotTo.shiftEnd)})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className='text-sm text-gray-700 flex items-center gap-2 mt-1'>
                  <Clock className='h-4 w-4 text-green-600' />
                  <span>Yêu cầu lúc: {format(parseISO(request.requestDate), 'dd/MM/yyyy HH:mm')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderAssignedStaffByShiftAndZone = () => {
    if (isLoadingAssignedStaff) {
      return (
        <div className='flex justify-center items-center py-4'>
          <div className='flex flex-col items-center gap-2'>
            <div className='animate-spin h-6 w-6 border-3 border-green-500 border-t-transparent rounded-full'></div>
            <div className='text-green-600 text-sm'>Đang tải dữ liệu...</div>
          </div>
        </div>
      )
    }

    if (assignedStaff.length === 0) {
      return (
        <div className='text-center py-4 text-gray-500 text-sm'>Chưa có nhân viên nào được phân công vào ngày này</div>
      )
    }

    const groupedByShift = groupStaffByShiftAndZone()

    return (
      <ScrollArea className='max-h-[400px] pr-4'>
        <div className='space-y-6'>
          {Object.entries(groupedByShift).map(([slotId, staffList]) => {
            // Lấy thông tin ca làm từ nhân viên đầu tiên trong nhóm
            const firstStaff = staffList[0]
            const shiftInfo = getShiftInfo(firstStaff)
            const groupedByZone = groupStaffByZone(staffList)

            return (
              <div
                key={slotId}
                className='mb-6 last:mb-0 bg-white rounded-lg border border-green-200 p-4 shadow-sm hover:shadow-md transition-shadow'
              >
                <div className='flex flex-col gap-4'>
                  {/* Thông tin ca làm */}
                  <div className='flex items-center justify-between border-b border-green-100 pb-3'>
                    <div className='flex items-center gap-2'>
                      <Badge className='bg-amber-100 text-amber-800 border border-amber-300'>{shiftInfo.name}</Badge>
                    </div>
                    <div className='flex items-center gap-2 text-gray-700'>
                      <Clock className='h-4 w-4 text-amber-600' />
                      <span>
                        {shiftInfo.start.substring(0, 5)} - {shiftInfo.end.substring(0, 5)}
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
                            <div className='font-medium text-green-900'>{getZoneName(zoneId)}</div>
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
                                  <div className='flex gap-2 mt-1'>
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
      </ScrollArea>
    )
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-8 h-[400px]'>
        <div className='flex flex-col items-center gap-2'>
          <div className='animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full'></div>
          <div className='text-green-600 font-medium'>Đang tải dữ liệu...</div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold text-green-800 flex items-center gap-2'>
            <User className='h-5 w-5 text-green-600' />
            Duyệt yêu cầu đăng ký
          </h2>
          <p className='text-green-600 mt-1'>
            Giới hạn đăng ký mỗi tuần: <span className='font-semibold'>{weekLimit}</span> ca
          </p>
        </div>
        <Button onClick={fetchData} variant='outline' className='border-green-200 text-green-700 hover:bg-green-50'>
          Làm mới
        </Button>
      </div>

      <Tabs defaultValue='current-week' className='w-full'>
        <TabsList className='bg-green-100 mb-4'>
          <TabsTrigger
            value='current-week'
            className='flex items-center gap-1 data-[state=active]:bg-green-600 data-[state=active]:text-white'
          >
            <Calendar className='h-4 w-4' />
            <span>Tuần này</span>
            {currentWeekRegistrations.length > 0 && (
              <Badge className='ml-1 bg-green-200 text-green-800'>{currentWeekRegistrations.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value='other'
            className='flex items-center gap-1 data-[state=active]:bg-green-600 data-[state=active]:text-white'
          >
            <CalendarDays className='h-4 w-4' />
            <span>Các tuần khác</span>
            {otherRegistrations.length > 0 && (
              <Badge className='ml-1 bg-green-200 text-green-800'>{otherRegistrations.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value='swap-requests'
            className='flex items-center gap-1 data-[state=active]:bg-green-600 data-[state=active]:text-white'
          >
            <ArrowRightLeft className='h-4 w-4' />
            <span>Yêu cầu đổi ca</span>
            {swapRequests.length > 0 && (
              <Badge className='ml-1 bg-green-200 text-green-800'>{swapRequests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='current-week' className='mt-0'>
          {renderRegistrationList(currentWeekRegistrations)}
        </TabsContent>

        <TabsContent value='other' className='mt-0'>
          {renderRegistrationList(otherRegistrations)}
        </TabsContent>

        <TabsContent value='swap-requests' className='mt-0'>
          {renderSwapRequestsList()}
        </TabsContent>
      </Tabs>

      {selectedRegistration && (
        <Dialog open={!!selectedRegistration} onOpenChange={(open) => !open && setSelectedRegistration(null)}>
          <DialogContent className='max-w-3xl max-h-[80vh] flex flex-col'>
            <DialogHeader>
              <DialogTitle className='text-xl flex items-center gap-2 text-green-700'>
                <CalendarDays className='h-5 w-5' />
                Lịch làm việc - {format(parseISO(selectedRegistration.workingDate), 'EEEE, dd/MM/yyyy', { locale: vi })}
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className='flex-1 overflow-y-auto pr-4 max-h-[calc(80vh-180px)]'>
              <div className='py-4 space-y-6'>
                <div className='flex items-center gap-3 bg-green-50 p-3 rounded-lg border border-green-100'>
                  <Avatar className='h-12 w-12 bg-green-100 text-green-700 border border-green-200'>
                    <AvatarFallback>{getInitials(selectedRegistration.staffName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className='font-semibold text-lg text-green-900'>{selectedRegistration.staffName}</h3>
                    <div className='flex flex-wrap gap-2 mt-1'>
                      {getStatusBadge(selectedRegistration.status)}
                      {selectedRegistration.status === 'Approved' && selectedRegistration.zoneId === null && (
                        <Badge className='bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1'>
                          <AlertCircle className='h-3.5 w-3.5' />
                          <span>Chưa phân khu vực</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {(selectedRegistration.status === 'Onhold' ||
                  (selectedRegistration.status === 'Approved' && selectedRegistration.zoneId === null)) && (
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

                <div className='space-y-3'>
                  <h4 className='font-medium text-green-800 flex items-center gap-2'>
                    <CalendarDays className='h-4 w-4 text-green-600' />
                    Nhân viên đã phân công
                  </h4>
                  <div className='flex items-center gap-2 text-gray-700'>
                    <CalendarDays className='h-4 w-4 text-green-600' />
                    <span>Ngày làm: {format(parseISO(selectedRegistration.workingDate), 'dd/MM/yyyy')}</span>
                  </div>
                  {selectedRegistration.workingSlot && (
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-gray-700'>
                        <Clock className='h-4 w-4 text-green-600' />
                        <span>Ca làm: {selectedRegistration.workingSlot.shiftName}</span>
                      </div>
                      <div className='flex items-center gap-2 text-gray-700 ml-6'>
                        <Badge variant='outline' className='bg-green-50 border-green-200'>
                          {formatTime(selectedRegistration.workingSlot.shiftStart)} -{' '}
                          {formatTime(selectedRegistration.workingSlot.shiftEnd)}
                        </Badge>
                      </div>
                    </div>
                  )}
                  {renderAssignedStaffByShiftAndZone()}
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className='mt-4 border-t pt-4'>
              <div className='flex items-center justify-between w-full'>
                <DialogClose asChild>
                  <Button variant='outline' className='border-gray-200'>
                    Đóng
                  </Button>
                </DialogClose>

                {(selectedRegistration.status === 'Onhold' ||
                  (selectedRegistration.status === 'Approved' && selectedRegistration.zoneId === null)) && (
                  <Button
                    onClick={handleApprove}
                    disabled={isSubmitting || !selectedZone}
                    className='bg-green-600 hover:bg-green-700 text-white'
                  >
                    {isSubmitting
                      ? 'Đang xử lý...'
                      : selectedRegistration.status === 'Onhold'
                        ? 'Duyệt và phân công'
                        : 'Phân công khu vực'}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {selectedSwapRequest && (
        <Dialog open={!!selectedSwapRequest} onOpenChange={(open) => !open && setSelectedSwapRequest(null)}>
          <DialogContent className='max-w-3xl'>
            <DialogHeader>
              <DialogTitle className='text-xl flex items-center gap-2 text-green-700'>
                <ArrowRightLeft className='h-5 w-5' />
                Chi tiết yêu cầu đổi ca
              </DialogTitle>
            </DialogHeader>

            <div className='py-4 space-y-6'>
              <div className='flex items-center justify-between'>
                <h3 className='font-semibold text-green-900'>Thông tin yêu cầu</h3>
                {getStatusBadge(selectedSwapRequest.status)}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4 p-4 bg-green-50/50 rounded-lg border border-green-100'>
                  <h4 className='font-medium text-green-800 flex items-center gap-2'>
                    <User className='h-4 w-4 text-green-600' />
                    Nhân viên yêu cầu
                  </h4>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-10 w-10 bg-green-100 text-green-700 border border-green-200'>
                      <AvatarFallback>{getInitials(selectedSwapRequest.employeeFromName)}</AvatarFallback>
                    </Avatar>
                    <div className='font-medium'>{selectedSwapRequest.employeeFromName}</div>
                  </div>
                  <div className='space-y-2 mt-2'>
                    <div className='flex items-center gap-2 text-gray-700'>
                      <CalendarDays className='h-4 w-4 text-green-600' />
                      <span>Ngày làm: {format(parseISO(selectedSwapRequest.workingDateFrom), 'dd/MM/yyyy')}</span>
                    </div>
                    {selectedSwapRequest.workingSlotFrom && (
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2 text-gray-700'>
                          <Clock className='h-4 w-4 text-green-600' />
                          <span>Ca làm: {selectedSwapRequest.workingSlotFrom.shiftName}</span>
                        </div>
                        <div className='flex items-center gap-2 text-gray-700 ml-6'>
                          <Badge variant='outline' className='bg-green-50 border-green-200'>
                            {formatTime(selectedSwapRequest.workingSlotFrom.shiftStart)} -{' '}
                            {formatTime(selectedSwapRequest.workingSlotFrom.shiftEnd)}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-4 p-4 bg-green-50/50 rounded-lg border border-green-100'>
                  <h4 className='font-medium text-green-800 flex items-center gap-2'>
                    <User className='h-4 w-4 text-green-600' />
                    Nhân viên đổi ca
                  </h4>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-10 w-10 bg-green-100 text-green-700 border border-green-200'>
                      <AvatarFallback>{getInitials(selectedSwapRequest.employeeToName)}</AvatarFallback>
                    </Avatar>
                    <div className='font-medium'>{selectedSwapRequest.employeeToName}</div>
                  </div>
                  <div className='space-y-2 mt-2'>
                    <div className='flex items-center gap-2 text-gray-700'>
                      <CalendarDays className='h-4 w-4 text-green-600' />
                      <span>Ngày làm: {format(parseISO(selectedSwapRequest.workingDateTo), 'dd/MM/yyyy')}</span>
                    </div>
                    {selectedSwapRequest.workingSlotTo && (
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2 text-gray-700'>
                          <Clock className='h-4 w-4 text-green-600' />
                          <span>Ca làm: {selectedSwapRequest.workingSlotTo.shiftName}</span>
                        </div>
                        <div className='flex items-center gap-2 text-gray-700 ml-6'>
                          <Badge variant='outline' className='bg-green-50 border-green-200'>
                            {formatTime(selectedSwapRequest.workingSlotTo.shiftStart)} -{' '}
                            {formatTime(selectedSwapRequest.workingSlotTo.shiftEnd)}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className='text-sm text-gray-700 flex items-center gap-2 p-3 bg-amber-50 rounded-md border border-amber-100'>
                <Clock className='h-4 w-4 text-amber-600' />
                <span>Yêu cầu lúc: {format(parseISO(selectedSwapRequest.requestDate), 'dd/MM/yyyy HH:mm')}</span>
              </div>
            </div>

            <DialogFooter className='flex items-center justify-between sm:justify-between'>
              <DialogClose asChild>
                <Button variant='outline' className='border-gray-200'>
                  Đóng
                </Button>
              </DialogClose>

              {selectedSwapRequest.status === 'PendingManagerApprove' && (
                <div className='flex items-center gap-2'>
                  <Button
                    onClick={() => handleSwapAction('reject')}
                    variant='outline'
                    className='border-red-200 text-red-700 hover:bg-red-50'
                  >
                    <X className='h-4 w-4 mr-1' />
                    Từ chối
                  </Button>
                  <Button
                    onClick={() => handleSwapAction('approve')}
                    className='bg-green-600 hover:bg-green-700 text-white'
                  >
                    <Check className='h-4 w-4 mr-1' />
                    Duyệt
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={isSwapActionDialogOpen} onOpenChange={setIsSwapActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {swapAction === 'approve' ? 'Duyệt yêu cầu đổi ca' : 'Từ chối yêu cầu đổi ca'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {swapAction === 'approve'
                ? 'Bạn có chắc chắn muốn duyệt yêu cầu đổi ca này? Hành động này sẽ cập nhật lịch làm việc của cả hai nhân viên.'
                : 'Bạn có chắc chắn muốn từ chối yêu cầu đổi ca này?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSwapAction}
              className={swapAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isSubmitting ? 'Đang xử lý...' : swapAction === 'approve' ? 'Duyệt' : 'Từ chối'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
