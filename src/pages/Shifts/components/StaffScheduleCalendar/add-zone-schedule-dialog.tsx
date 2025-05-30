'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format, isBefore, startOfDay } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, Loader2, Search } from 'lucide-react'
import { cn } from '@/utils/utils'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'

// Types based on the provided code
interface Staff {
  id: string
  fullName: string
  username?: string
}

interface Day {
  id: string
  name: string
}

interface WorkingSlot {
  id: string
  shiftName: string
  shiftStart: string
  shiftEnd: string
}

interface Zone {
  id: string
  name: string
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

// Service to fetch data and make API calls
class ZoneScheduleService {
  private static instance: ZoneScheduleService

  private constructor() {}

  public static getInstance(): ZoneScheduleService {
    if (!ZoneScheduleService.instance) {
      ZoneScheduleService.instance = new ZoneScheduleService()
    }
    return ZoneScheduleService.instance
  }

  public async getAllStaff(): Promise<any> {
    try {
      const response = await axios.get(
        'https://vietsac.id.vn/api/staffs?StaffType=Cheff&StaffType=Staff&Status=PartTime&TakeCount=1000'
      )
      return response.data
    } catch (error) {
      console.error('Error fetching staff:', error)
      throw error
    }
  }

  public async getAllDays(): Promise<any> {
    try {
      const response = await axios.get('https://vietsac.id.vn/api/days')
      return response.data
    } catch (error) {
      console.error('Error fetching days:', error)
      throw error
    }
  }

  public async getWorkingSlotsByDayId(dayId: string): Promise<any> {
    try {
      const response = await axios.get(`https://vietsac.id.vn/api/working-slots?DayId=${dayId}&SortBy=shiftStart`)
      return response.data
    } catch (error) {
      console.error(`Error fetching working slots for day ${dayId}:`, error)
      throw error
    }
  }

  public async getAllZones(): Promise<any> {
    try {
      const response = await axios.get('https://vietsac.id.vn/api/zones?TakeCount=1000&SortBy=name')
      return response.data
    } catch (error) {
      console.error('Error fetching zones:', error)
      throw error
    }
  }

  public async createZoneSchedule(request: {
    workingDate: string
    staffId: string
    zoneId: string
    workingSlotId: string
  }): Promise<any> {
    try {
      const response = await axios.post('https://vietsac.id.vn/api/staff-zone-schedules', request)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Handle specific error responses
        if (error.response.status === 400) {
          const errorData = error.response.data as ApiErrorResponse
          throw new Error(errorData.error.message || 'Lỗi yêu cầu không hợp lệ')
        }
      }
      throw error
    }
  }
}

interface AddZoneScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddZoneScheduleDialog({ open, onOpenChange, onSuccess }: AddZoneScheduleDialogProps) {
  const [staff, setStaff] = useState<Staff[]>([])
  const [days, setDays] = useState<Day[]>([])
  const [workingSlots, setWorkingSlots] = useState<WorkingSlot[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [selectedWorkingSlot, setSelectedWorkingSlot] = useState<string>('')
  const [selectedZone, setSelectedZone] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [staffSearchOpen, setStaffSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([])

  const zoneScheduleService = ZoneScheduleService.getInstance()

  // Hàm để xác định thứ từ ngày
  const getDayOfWeekFromDate = (date: Date): string => {
    const dayOfWeek = date.getDay() // 0 = Chủ nhật, 1-6 = Thứ hai - Thứ bảy

    // Map từ số sang id của thứ trong API
    const dayMap: Record<number, string | undefined> = {}

    // Tìm id tương ứng với thứ trong tuần từ danh sách days
    days.forEach((day) => {
      if (day.name === 'Chủ nhật') dayMap[0] = day.id
      else if (day.name === 'Thứ hai') dayMap[1] = day.id
      else if (day.name === 'Thứ ba') dayMap[2] = day.id
      else if (day.name === 'Thứ tư') dayMap[3] = day.id
      else if (day.name === 'Thứ năm') dayMap[4] = day.id
      else if (day.name === 'Thứ sáu') dayMap[5] = day.id
      else if (day.name === 'Thứ bảy') dayMap[6] = day.id
    })

    return dayMap[dayOfWeek] || ''
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      try {
        const [staffResponse, daysResponse, zonesResponse] = await Promise.all([
          zoneScheduleService.getAllStaff(),
          zoneScheduleService.getAllDays(),
          zoneScheduleService.getAllZones()
        ])

        if (staffResponse.success) {
          setStaff(staffResponse.result.items)
          setFilteredStaff(staffResponse.result.items)
        }

        if (daysResponse.success) {
          setDays(daysResponse.result.items)
        }

        if (zonesResponse.success) {
          setZones(zonesResponse.result.items)
        }
      } catch (error) {
        console.error('Error fetching initial data:', error)
        toast.error('Không thể tải dữ liệu ban đầu')
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      fetchInitialData()
      // Reset form khi mở dialog
      setSelectedStaff('')
      setSelectedDay('')
      setSelectedWorkingSlot('')
      setSelectedZone('')
      setSelectedDate(new Date())
      setSearchTerm('')
    }
  }, [open])

  // Tự động xác định thứ khi ngày thay đổi
  useEffect(() => {
    if (selectedDate && days.length > 0) {
      const dayId = getDayOfWeekFromDate(selectedDate)
      setSelectedDay(dayId)
    }
  }, [selectedDate, days])

  // Tải ca làm việc khi thứ thay đổi
  useEffect(() => {
    const fetchWorkingSlots = async () => {
      if (!selectedDay) return

      setIsLoading(true)
      try {
        const response = await zoneScheduleService.getWorkingSlotsByDayId(selectedDay)
        if (response.success) {
          setWorkingSlots(response.result.items)
        }
      } catch (error) {
        console.error('Error fetching working slots:', error)
        toast.error('Không thể tải ca làm việc')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkingSlots()
  }, [selectedDay])

  // Lọc danh sách nhân viên khi searchTerm thay đổi
  useEffect(() => {
    if (staff.length > 0) {
      if (!searchTerm.trim()) {
        setFilteredStaff(staff)
      } else {
        const searchLower = searchTerm.toLowerCase().trim()
        const filtered = staff.filter(
          (s) =>
            s.fullName.toLowerCase().includes(searchLower) ||
            (s.username && s.username.toLowerCase().includes(searchLower))
        )
        setFilteredStaff(filtered)
      }
    }
  }, [searchTerm, staff])

  const handleSubmit = async () => {
    if (!selectedStaff || !selectedDate) {
      toast.error('Vui lòng chọn nhân viên và ngày làm việc')
      return
    }

    if (!selectedWorkingSlot) {
      toast.error('Vui lòng chọn ca làm việc')
      return
    }

    if (!selectedZone) {
      toast.error('Vui lòng chọn khu vực làm việc')
      return
    }

    setIsSubmitting(true)
    try {
      await zoneScheduleService.createZoneSchedule({
        staffId: selectedStaff,
        workingSlotId: selectedWorkingSlot,
        zoneId: selectedZone,
        workingDate: format(selectedDate, 'yyyy-MM-dd')
      })

      // Lấy thông tin chi tiết để hiển thị trong thông báo thành công
      const staffName = staff.find((s) => s.id === selectedStaff)?.fullName || ''
      const zoneName = zones.find((z) => z.id === selectedZone)?.name || ''
      const workingSlotName = workingSlots.find((w) => w.id === selectedWorkingSlot)?.shiftName || ''

      toast.success(
        `Đã thêm nhân viên ${staffName} vào ca làm việc ${workingSlotName} tại khu vực ${zoneName} thành công`
      )

      // Reset form
      setSelectedStaff('')
      setSelectedDay('')
      setSelectedWorkingSlot('')
      setSelectedZone('')
      setSelectedDate(new Date())

      // Gọi callback onSuccess để làm mới dữ liệu
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating zone schedule:', error)

      // Hiển thị thông báo lỗi cụ thể từ API
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Không thể thêm nhân viên vào ca làm việc')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Lấy tên nhân viên đã chọn
  const getSelectedStaffName = () => {
    const selectedStaffMember = staff.find((s) => s.id === selectedStaff)
    return selectedStaffMember ? `${selectedStaffMember.fullName}` : 'Chọn nhân viên'
  }

  // Hàm kiểm tra ngày quá khứ
  const isPastDate = (date: Date) => {
    return isBefore(date, startOfDay(new Date()))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Thêm nhân viên bán thời gian vào ca làm việc</DialogTitle>
          <DialogDescription>Điền thông tin để thêm nhân viên vào ca làm việc tại khu vực</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className='flex justify-center items-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin text-red-500' />
          </div>
        ) : (
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='staff' className='text-right'>
                Nhân viên
              </Label>
              <div className='col-span-3'>
                <Popover open={staffSearchOpen} onOpenChange={setStaffSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      aria-expanded={staffSearchOpen}
                      className='w-full justify-between'
                    >
                      {getSelectedStaffName()}
                      <Search className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-[300px] p-0'>
                    <Command>
                      <CommandInput placeholder='Tìm nhân viên...' value={searchTerm} onValueChange={setSearchTerm} />
                      <CommandList>
                        <CommandEmpty>Không tìm thấy nhân viên</CommandEmpty>
                        <CommandGroup>
                          {filteredStaff.map((s) => (
                            <CommandItem
                              key={s.id}
                              value={s.fullName}
                              onSelect={() => {
                                setSelectedStaff(s.id)
                                setStaffSearchOpen(false)
                              }}
                            >
                              {s.fullName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='date' className='text-right'>
                Ngày làm việc
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id='date'
                    variant={'outline'}
                    className={cn(
                      'col-span-3 justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: vi }) : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar
                    mode='single'
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    locale={vi}
                    disabled={isPastDate}
                    fromDate={startOfDay(new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {selectedDay && days.length > 0 && (
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label className='text-right'>Thứ</Label>
                <div className='col-span-3 font-medium'>{days.find((day) => day.id === selectedDay)?.name || ''}</div>
              </div>
            )}

            {selectedDay && (
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='working-slot' className='text-right'>
                  Ca làm việc
                </Label>
                <Select value={selectedWorkingSlot} onValueChange={setSelectedWorkingSlot}>
                  <SelectTrigger id='working-slot' className='col-span-3'>
                    <SelectValue placeholder='Chọn ca làm việc' />
                  </SelectTrigger>
                  <SelectContent>
                    {workingSlots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.shiftName} ({slot.shiftStart.substring(0, 5)} - {slot.shiftEnd.substring(0, 5)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='zone' className='text-right'>
                Khu vực
              </Label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger id='zone' className='col-span-3'>
                  <SelectValue placeholder='Chọn khu vực' />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type='submit' onClick={handleSubmit} disabled={isSubmitting} className='bg-red-500 hover:bg-red-600'>
            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
