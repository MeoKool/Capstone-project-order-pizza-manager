'use client'

import { useState, useEffect } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import StaffAbsenceService from '@/services/staff-absence-service'
import type { Day, Staff, WorkingSlot } from '@/types/staff-absence'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'

interface AddAbsenceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddAbsenceDialog({ open, onOpenChange, onSuccess }: AddAbsenceDialogProps) {
  const [staff, setStaff] = useState<Staff[]>([])
  const [days, setDays] = useState<Day[]>([])
  const [workingSlots, setWorkingSlots] = useState<WorkingSlot[]>([])
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [selectedWorkingSlot, setSelectedWorkingSlot] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isAllDay, setIsAllDay] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [staffSearchOpen, setStaffSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([])

  const staffAbsenceService = StaffAbsenceService.getInstance()

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
        const [staffResponse, daysResponse] = await Promise.all([
          staffAbsenceService.getAllStaff(),
          staffAbsenceService.getAllDays()
        ])

        if (staffResponse.success) {
          setStaff(staffResponse.result.items)
          setFilteredStaff(staffResponse.result.items)
        }

        if (daysResponse.success) {
          setDays(daysResponse.result.items)
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
      setSelectedDate(new Date())
      setIsAllDay(false)
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
        const response = await staffAbsenceService.getWorkingSlotsByDayId(selectedDay)
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
      toast.error('Vui lòng chọn nhân viên và ngày nghỉ')
      return
    }

    if (!isAllDay && !selectedWorkingSlot) {
      toast.error('Vui lòng chọn ca làm việc hoặc chọn nghỉ cả ngày')
      return
    }

    setIsSubmitting(true)
    try {
      if (isAllDay) {
        // Nếu nghỉ cả ngày, tạo nhiều đơn xin nghỉ cho tất cả ca làm việc trong ngày đó
        const promises = workingSlots.map((slot) =>
          staffAbsenceService.createAbsence({
            staffId: selectedStaff,
            workingSlotId: slot.id,
            absentDate: format(selectedDate, 'yyyy-MM-dd')
          })
        )

        await Promise.all(promises)
      } else {
        // Nếu chỉ nghỉ một ca, tạo một đơn xin nghỉ
        await staffAbsenceService.createAbsence({
          staffId: selectedStaff,
          workingSlotId: selectedWorkingSlot,
          absentDate: format(selectedDate, 'yyyy-MM-dd')
        })
      }

      toast.success('Đã thêm đơn xin nghỉ thành công')

      // Reset form
      setSelectedStaff('')
      setSelectedDay('')
      setSelectedWorkingSlot('')
      setSelectedDate(new Date())
      setIsAllDay(false)

      // Gọi callback onSuccess để làm mới dữ liệu
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating absence:', error)
      toast.error('Không thể tạo đơn xin nghỉ')
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
          <DialogTitle>Thêm đơn xin nghỉ</DialogTitle>
          <DialogDescription>Điền thông tin để tạo đơn xin nghỉ cho nhân viên</DialogDescription>
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
                Ngày nghỉ
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

            <div className='grid grid-cols-4 items-center gap-4'>
              <div className='text-right'>
                <Label htmlFor='all-day'>Nghỉ cả ngày</Label>
              </div>
              <div className='col-span-3 flex items-center space-x-2'>
                <Checkbox
                  id='all-day'
                  checked={isAllDay}
                  onCheckedChange={(checked) => {
                    setIsAllDay(checked === true)
                    if (checked) {
                      setSelectedWorkingSlot('')
                    }
                  }}
                />
                <label
                  htmlFor='all-day'
                  className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  Chọn tất cả ca làm việc
                </label>
              </div>
            </div>

            {!isAllDay && selectedDay && (
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='working-slot' className='text-right'>
                  Ca làm việc
                </Label>
                <Select value={selectedWorkingSlot} onValueChange={setSelectedWorkingSlot} disabled={isAllDay}>
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
