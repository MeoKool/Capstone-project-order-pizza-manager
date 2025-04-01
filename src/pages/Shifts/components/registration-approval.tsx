'use client'

import type React from 'react'

import { useEffect, useState } from 'react'
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
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
  Users,
  RefreshCw
} from 'lucide-react'
import StaffScheduleService from '@/services/staff-schedule-service'
import type { WorkingSlotRegister, Zone, Config, StaffZoneScheduleRequest, StaffSchedule } from '@/types/staff-schedule'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

export default function RegistrationApproval() {
  const [, setRegistrations] = useState<WorkingSlotRegister[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [, setConfigs] = useState<Config[]>([])
  const [, setWeekLimit] = useState(3)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRegistration, setSelectedRegistration] = useState<WorkingSlotRegister | null>(null)
  const [selectedZone, setSelectedZone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentWeekRegistrations, setCurrentWeekRegistrations] = useState<WorkingSlotRegister[]>([])
  const [otherRegistrations, setOtherRegistrations] = useState<WorkingSlotRegister[]>([])
  const [assignedStaff, setAssignedStaff] = useState<StaffSchedule[]>([])
  const [isLoadingAssignedStaff, setIsLoadingAssignedStaff] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [otherPage, setOtherPage] = useState(1)
  const [itemsPerPage] = useState(5)

  useEffect(() => {
    fetchData()
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

  const fetchAssignedStaff = async (workingDate: string, workingSlotId: string) => {
    try {
      setIsLoadingAssignedStaff(true)
      const staffScheduleService = StaffScheduleService.getInstance()
      const response = await staffScheduleService.getStaffSchedulesByDate(workingDate)

      if (response.success && response.result) {
        // Filter staff by the selected working slot
        const filteredStaff = response.result.items.filter((staff) => staff.workingSlotId === workingSlotId)
        setAssignedStaff(filteredStaff)
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
    await fetchAssignedStaff(registration.workingDate, registration.workingSlotId)
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
      toast.error('Vui lòng chọn khu vực làm việc')
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
        await fetchAssignedStaff(selectedRegistration.workingDate, selectedRegistration.workingSlotId)
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

  // Nhóm nhân viên đã phân công theo khu vực
  const groupStaffByZone = () => {
    const grouped: Record<string, StaffSchedule[]> = {}

    assignedStaff.forEach((staff) => {
      if (!grouped[staff.zoneId]) {
        grouped[staff.zoneId] = []
      }
      grouped[staff.zoneId].push(staff)
    })

    return grouped
  }

  // Lấy tên khu vực từ ID
  const getZoneName = (zoneId: string) => {
    const zone = zones.find((z) => z.id === zoneId)
    return zone ? zone.name : 'Không xác định'
  }

  // Pagination logic for current week registrations
  const indexOfLastCurrentItem = currentPage * itemsPerPage
  const indexOfFirstCurrentItem = indexOfLastCurrentItem - itemsPerPage
  const paginatedCurrentWeekRegistrations = currentWeekRegistrations.slice(
    indexOfFirstCurrentItem,
    indexOfLastCurrentItem
  )
  const totalCurrentPages = Math.ceil(currentWeekRegistrations.length / itemsPerPage)

  // Pagination logic for other registrations
  const indexOfLastOtherItem = otherPage * itemsPerPage
  const indexOfFirstOtherItem = indexOfLastOtherItem - itemsPerPage
  const paginatedOtherRegistrations = otherRegistrations.slice(indexOfFirstOtherItem, indexOfLastOtherItem)
  const totalOtherPages = Math.ceil(otherRegistrations.length / itemsPerPage)

  // Add this function after the other handler functions
  const handleTabChange = (value: string) => {
    // Reset pagination to page 1 when switching tabs
    if (value === 'current-week') {
      setCurrentPage(1)
    } else if (value === 'other') {
      setOtherPage(1)
    }
  }

  const renderRegistrationList = (
    registrations: WorkingSlotRegister[],
    currentPageNum: number,
    totalPages: number,
    setPageFunction: React.Dispatch<React.SetStateAction<number>>
  ) => {
    if (registrations.length === 0) {
      return <div className='text-center py-8 text-gray-500'>Không có yêu cầu đăng ký nào</div>
    }

    return (
      <div className='space-y-4'>
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
                  <Avatar className='h-10 w-10 bg-blue-100 text-blue-700 border border-blue-200'>
                    <AvatarFallback>{getInitials(registration.staffName)}</AvatarFallback>
                  </Avatar>

                  <div className='flex-1'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                      <h3 className='font-semibold text-blue-900'>{registration.staffName}</h3>
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
                        <CalendarDays className='h-4 w-4 text-blue-600' />
                        <span>
                          Ngày làm: {format(parseISO(registration.workingDate), 'dd/MM/yyyy')}
                          {registration.workingSlot?.dayName && (
                            <span className='ml-1 text-blue-600'>({registration.workingSlot.dayName})</span>
                          )}
                        </span>
                      </div>
                      <div className='flex items-center gap-2 text-gray-700'>
                        <Clock className='h-4 w-4 text-blue-600' />
                        <span>
                          Giờ làm: {registration.workingSlot?.shiftStart} - {registration.workingSlot?.shiftEnd}
                        </span>
                      </div>
                      <div className='flex items-center gap-2 text-gray-700'>
                        <Clock className='h-4 w-4 text-blue-600' />
                        <span>Đăng ký: {format(parseISO(registration.registerDate), 'dd/MM/yyyy HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className='flex justify-center mt-6'>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPageFunction((prev) => Math.max(prev - 1, 1))}
                    className={currentPageNum === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNumber = i + 1
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setPageFunction(pageNumber)}
                        isActive={currentPageNum === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                {totalPages > 5 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setPageFunction(totalPages)}
                        isActive={currentPageNum === totalPages}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPageFunction((prev) => Math.min(prev + 1, totalPages))}
                    className={currentPageNum === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    )
  }

  const renderAssignedStaffTable = () => {
    if (isLoadingAssignedStaff) {
      return (
        <div className='flex justify-center items-center py-4'>
          <div className='flex flex-col items-center gap-2'>
            <div className='animate-spin h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full'></div>
            <div className='text-blue-600 text-sm'>Đang tải dữ liệu...</div>
          </div>
        </div>
      )
    }

    if (assignedStaff.length === 0) {
      return (
        <div className='text-center py-4 text-gray-500 text-sm'>Chưa có nhân viên nào được phân công vào ca này</div>
      )
    }

    const groupedByZone = groupStaffByZone()

    return (
      <ScrollArea className='max-h-[300px]'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[180px]'>Khu vực</TableHead>
              <TableHead>Nhân viên đã phân công</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedByZone).map(([zoneId, staffList]) => (
              <TableRow key={zoneId}>
                <TableCell className='font-medium'>
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4 text-blue-600' />
                    <span>{getZoneName(zoneId)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex flex-wrap gap-2'>
                    {staffList.map((staff) => (
                      <Badge
                        key={staff.id}
                        variant='outline'
                        className='bg-white border-blue-200 text-blue-800 py-1 px-2'
                      >
                        {staff.staffName}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    )
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-8 h-[400px]'>
        <div className='flex flex-col items-center gap-2'>
          <div className='animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full'></div>
          <div className='text-blue-600 font-medium'>Đang tải dữ liệu...</div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <Tabs defaultValue='current-week' className='w-full' onValueChange={handleTabChange}>
        <TabsList className='bg-blue-100 mb-4'>
          <TabsTrigger
            value='current-week'
            className='flex items-center gap-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white'
          >
            <Calendar className='h-4 w-4' />
            <span>Tuần này</span>
            {currentWeekRegistrations.length > 0 && (
              <Badge className='ml-1 bg-blue-200 text-blue-800'>{currentWeekRegistrations.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value='other'
            className='flex items-center gap-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white'
          >
            <CalendarDays className='h-4 w-4' />
            <span>Các tuần khác</span>
            {otherRegistrations.length > 0 && (
              <Badge className='ml-1 bg-blue-200 text-blue-800'>{otherRegistrations.length}</Badge>
            )}
          </TabsTrigger>
          <Button
            onClick={fetchData}
            className='ml-2 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1'
            size='sm'
          >
            <RefreshCw className='h-4 w-4' />
            Làm mới
          </Button>
        </TabsList>

        <TabsContent value='current-week' className='mt-0'>
          {renderRegistrationList(paginatedCurrentWeekRegistrations, currentPage, totalCurrentPages, setCurrentPage)}
        </TabsContent>

        <TabsContent value='other' className='mt-0'>
          {renderRegistrationList(paginatedOtherRegistrations, otherPage, totalOtherPages, setOtherPage)}
        </TabsContent>
      </Tabs>

      {selectedRegistration && (
        <Dialog open={!!selectedRegistration} onOpenChange={(open) => !open && setSelectedRegistration(null)}>
          <DialogContent className='max-w-3xl'>
            <DialogHeader>
              <DialogTitle className='text-xl flex items-center gap-2 text-blue-700'>
                <User className='h-5 w-5' />
                Chi tiết đăng ký
                {selectedRegistration.workingSlot && (
                  <span className='ml-2 text-sm font-normal text-blue-500'>
                    ({selectedRegistration.workingSlot.shiftStart} - {selectedRegistration.workingSlot.shiftEnd})
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className='py-4 space-y-6'>
              <div className='flex items-center gap-3'>
                <Avatar className='h-12 w-12 bg-blue-100 text-blue-700 border border-blue-200'>
                  <AvatarFallback>{getInitials(selectedRegistration.staffName)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className='font-semibold text-lg text-blue-900'>{selectedRegistration.staffName}</h3>
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

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-3'>
                  <h4 className='font-medium text-blue-800'>Thông tin đăng ký</h4>
                  <div className='space-y-3 bg-blue-50/50 p-3 rounded-md border border-blue-100'>
                    <div className='flex items-center gap-2 text-gray-700'>
                      <CalendarDays className='h-4 w-4 text-blue-600' />
                      <span>
                        Ngày làm: {format(parseISO(selectedRegistration.workingDate), 'dd/MM/yyyy')}
                        {selectedRegistration.workingSlot?.dayName && (
                          <span className='ml-1 text-blue-600'>({selectedRegistration.workingSlot.dayName})</span>
                        )}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-gray-700'>
                      <Clock className='h-4 w-4 text-blue-600' />
                      <span>
                        Giờ làm: {selectedRegistration.workingSlot?.shiftStart} -{' '}
                        {selectedRegistration.workingSlot?.shiftEnd}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-gray-700'>
                      <Clock className='h-4 w-4 text-blue-600' />
                      <span>Đăng ký: {format(parseISO(selectedRegistration.registerDate), 'dd/MM/yyyy HH:mm')}</span>
                    </div>
                  </div>

                  {(selectedRegistration.status === 'Onhold' ||
                    (selectedRegistration.status === 'Approved' && selectedRegistration.zoneId === null)) && (
                    <div className='space-y-3 mt-4'>
                      <Label htmlFor='zone' className='text-blue-700'>
                        Chọn khu vực làm việc
                      </Label>
                      <Select value={selectedZone} onValueChange={setSelectedZone}>
                        <SelectTrigger id='zone' className='border-blue-200 focus:ring-blue-500'>
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

                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-medium text-blue-800 flex items-center gap-2'>
                      <Users className='h-4 w-4 text-blue-600' />
                      Nhân viên đã phân công
                    </h4>
                    <Badge className='bg-blue-100 text-blue-800 border border-blue-300'>
                      {assignedStaff.length} nhân viên
                    </Badge>
                  </div>
                  {renderAssignedStaffTable()}
                </div>
              </div>
            </div>

            <DialogFooter className='flex items-center justify-between sm:justify-between'>
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
                  className='bg-blue-600 hover:bg-blue-700 text-white'
                >
                  {isSubmitting
                    ? 'Đang xử lý...'
                    : selectedRegistration.status === 'Onhold'
                      ? 'Duyệt và phân công'
                      : 'Phân công khu vực'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
