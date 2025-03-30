import { useEffect, useState } from 'react'
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, User, CalendarDays } from 'lucide-react'
import StaffScheduleService from '@/services/staff-schedule-service'
import type { WorkingSlotRegister, Zone, Config, StaffZoneScheduleRequest } from '@/types/staff-schedule'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
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
          setWeekLimit(parseInt(weekLimitConfig.value))
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

  const handleOpenDetails = (registration: WorkingSlotRegister) => {
    setSelectedRegistration(registration)
    setSelectedZone('')
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

      // Duyệt đăng ký
      const approveResponse = await staffScheduleService.approveWorkingSlotRegister(selectedRegistration.id)

      if (approveResponse.success) {
        // Tạo lịch làm việc với khu vực đã chọn
        const scheduleData: StaffZoneScheduleRequest = {
          workingDate: selectedRegistration.workingDate,
          staffId: selectedRegistration.staffId,
          zoneId: selectedZone,
          workingSlotId: selectedRegistration.workingSlotId
        }

        const scheduleResponse = await staffScheduleService.createStaffZoneSchedule(scheduleData)

        if (scheduleResponse.success) {
          toast.success('Đã duyệt đăng ký và phân công khu vực làm việc')

          // Cập nhật lại danh sách đăng ký
          await fetchData()
          setSelectedRegistration(null)
        } else {
          toast.error(scheduleResponse.message || 'Không thể phân công khu vực làm việc')
        }
      } else {
        toast.error(approveResponse.message || 'Không thể duyệt đăng ký')
      }
    } catch (error) {
      console.error('Error approving registration:', error)
      toast.error('Đã xảy ra lỗi khi duyệt đăng ký')
    } finally {
      setIsSubmitting(false)
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
                  ? 'border-green-300 bg-green-50/30'
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
                    {getStatusBadge(registration.status)}
                  </div>

                  <div className='mt-2 space-y-1 text-sm'>
                    <div className='flex items-center gap-2 text-gray-700'>
                      <CalendarDays className='h-4 w-4 text-blue-600' />
                      <span>Ngày làm: {format(parseISO(registration.workingDate), 'dd/MM/yyyy')}</span>
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
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold text-blue-800 flex items-center gap-2'>
            <User className='h-5 w-5 text-blue-600' />
            Duyệt yêu cầu đăng ký
          </h2>
          <p className='text-blue-600 mt-1'>
            Giới hạn đăng ký mỗi tuần: <span className='font-semibold'>{weekLimit}</span> ca
          </p>
        </div>
        <Button onClick={fetchData} variant='outline' className='border-blue-200 text-blue-700 hover:bg-blue-50'>
          Làm mới
        </Button>
      </div>

      <Tabs defaultValue='current-week' className='w-full'>
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
        </TabsList>

        <TabsContent value='current-week' className='mt-0'>
          {renderRegistrationList(currentWeekRegistrations)}
        </TabsContent>

        <TabsContent value='other' className='mt-0'>
          {renderRegistrationList(otherRegistrations)}
        </TabsContent>
      </Tabs>

      {selectedRegistration && (
        <Dialog open={!!selectedRegistration} onOpenChange={(open) => !open && setSelectedRegistration(null)}>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle className='text-xl flex items-center gap-2 text-blue-700'>
                <User className='h-5 w-5' />
                Chi tiết đăng ký
              </DialogTitle>
            </DialogHeader>

            <div className='py-4 space-y-4'>
              <div className='flex items-center gap-3'>
                <Avatar className='h-12 w-12 bg-blue-100 text-blue-700 border border-blue-200'>
                  <AvatarFallback>{getInitials(selectedRegistration.staffName)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className='font-semibold text-lg text-blue-900'>{selectedRegistration.staffName}</h3>
                  {getStatusBadge(selectedRegistration.status)}
                </div>
              </div>

              <Separator className='bg-blue-100' />

              <div className='space-y-3'>
                <div className='flex items-center gap-2 text-gray-700'>
                  <CalendarDays className='h-4 w-4 text-blue-600' />
                  <span>Ngày làm: {format(parseISO(selectedRegistration.workingDate), 'dd/MM/yyyy')}</span>
                </div>
                <div className='flex items-center gap-2 text-gray-700'>
                  <Clock className='h-4 w-4 text-blue-600' />
                  <span>Đăng ký: {format(parseISO(selectedRegistration.registerDate), 'dd/MM/yyyy HH:mm')}</span>
                </div>
              </div>

              {selectedRegistration.status === 'Onhold' && (
                <>
                  <Separator className='bg-blue-100' />

                  <div className='space-y-3'>
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
                </>
              )}
            </div>

            <DialogFooter className='flex items-center justify-between sm:justify-between'>
              <DialogClose asChild>
                <Button variant='outline' className='border-gray-200'>
                  Đóng
                </Button>
              </DialogClose>

              {selectedRegistration.status === 'Onhold' && (
                <Button
                  onClick={handleApprove}
                  disabled={isSubmitting || !selectedZone}
                  className='bg-blue-600 hover:bg-blue-700 text-white'
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Duyệt và phân công'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
