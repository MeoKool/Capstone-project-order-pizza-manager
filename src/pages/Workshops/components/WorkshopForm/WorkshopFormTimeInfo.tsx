'use client'

import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Clock, AlertCircle } from 'lucide-react'
import { format, isAfter, isBefore } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useFormContext } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { Dispatch, SetStateAction } from 'react'
import { cn } from '@/utils/utils'

// Hàm chuyển đổi từ múi giờ địa phương sang UTC - không cần chuyển đổi nữa
function localToUtcDate(localDate: Date | undefined, timeState: TimeState): Date | undefined {
  if (!localDate) return undefined

  const result = new Date(localDate)
  // Đặt giờ và phút theo múi giờ địa phương
  result.setHours(Number.parseInt(timeState.hour), Number.parseInt(timeState.minute))
  // Không cần chuyển đổi sang UTC nữa
  return result
}

type TimeState = { hour: string; minute: string }

type Props = {
  workshopDate?: Date
  startRegisterDate?: Date
  endRegisterDate?: Date
  setWorkshopDate: Dispatch<SetStateAction<Date | undefined>>
  setStartRegisterDate: Dispatch<SetStateAction<Date | undefined>>
  setEndRegisterDate: Dispatch<SetStateAction<Date | undefined>>
  workshopTime: TimeState
  startRegisterTime: TimeState
  endRegisterTime: TimeState
  setWorkshopTime: Dispatch<SetStateAction<TimeState>>
  setStartRegisterTime: Dispatch<SetStateAction<TimeState>>
  setEndRegisterTime: Dispatch<SetStateAction<TimeState>>
  disabled?: boolean
}

// Add this debugging function to help see what's happening with dates
function debugDate(date?: Date, time?: TimeState) {
  if (!date || !time) return 'No date/time'

  const dateObj = new Date(date)
  dateObj.setHours(Number.parseInt(time.hour), Number.parseInt(time.minute))

  return {
    localString: dateObj.toString(),
    isoString: dateObj.toISOString(),
    localTime: `${time.hour}:${time.minute}`
  }
}

export default function WorkshopFormTimeInfo({
  workshopDate,
  startRegisterDate,
  endRegisterDate,
  setWorkshopDate,
  setStartRegisterDate,
  setEndRegisterDate,
  workshopTime,
  startRegisterTime,
  endRegisterTime,
  setWorkshopTime,
  setStartRegisterTime,
  setEndRegisterTime,
  disabled = false
}: Props) {
  const { control, setValue } = useFormContext()
  const today = new Date()

  // Theo dõi lỗi thời gian
  const [timeErrors, setTimeErrors] = useState({
    workshopDate: false,
    startRegisterDate: false,
    endRegisterDate: false
  })

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

  // Kiểm tra thời gian hợp lệ khi thay đổi
  useEffect(() => {
    // Skip validation if disabled (in edit mode)
    if (!disabled) {
      validateDates()
    }
  }, [workshopDate, startRegisterDate, endRegisterDate, workshopTime, startRegisterTime, endRegisterTime, disabled])

  // Hàm kiểm tra tính hợp lệ của các ngày và thời gian
  const validateDates = () => {
    // Debug date information
    console.log('Workshop Date Debug:', debugDate(workshopDate, workshopTime))
    console.log('Start Register Date Debug:', debugDate(startRegisterDate, startRegisterTime))
    console.log('End Register Date Debug:', debugDate(endRegisterDate, endRegisterTime))

    const errors = {
      workshopDate: false,
      startRegisterDate: false,
      endRegisterDate: false
    }

    // Get current time in local timezone
    const now = new Date()

    // Kiểm tra workshopDate không được nhỏ hơn ngày hôm nay
    if (workshopDate) {
      const workshopDateTime = new Date(workshopDate)
      workshopDateTime.setHours(Number.parseInt(workshopTime.hour), Number.parseInt(workshopTime.minute))

      if (isBefore(workshopDateTime, now)) {
        errors.workshopDate = true
        setValue('workshopDate', '')
      }
    }

    // Kiểm tra startRegisterDate không được lớn hơn workshopDate
    if (workshopDate && startRegisterDate) {
      const workshopDateTime = new Date(workshopDate)
      workshopDateTime.setHours(Number.parseInt(workshopTime.hour), Number.parseInt(workshopTime.minute))

      const startRegDateTime = new Date(startRegisterDate)
      startRegDateTime.setHours(Number.parseInt(startRegisterTime.hour), Number.parseInt(startRegisterTime.minute))

      // Compare dates in the same timezone
      if (isAfter(startRegDateTime, workshopDateTime)) {
        errors.startRegisterDate = true
        setValue('startRegisterDate', '')
      }
    }

    // Kiểm tra endRegisterDate không được lớn hơn workshopDate
    if (workshopDate && endRegisterDate) {
      const workshopDateTime = new Date(workshopDate)
      workshopDateTime.setHours(Number.parseInt(workshopTime.hour), Number.parseInt(workshopTime.minute))

      const endRegDateTime = new Date(endRegisterDate)
      endRegDateTime.setHours(Number.parseInt(endRegisterTime.hour), Number.parseInt(endRegisterTime.minute))

      // Compare dates in the same timezone
      if (isAfter(endRegDateTime, workshopDateTime)) {
        errors.endRegisterDate = true
        setValue('endRegisterDate', '')
      }
    }

    // Kiểm tra endRegisterDate không được nhỏ hơn startRegisterDate
    if (startRegisterDate && endRegisterDate) {
      const startRegDateTime = new Date(startRegisterDate)
      startRegDateTime.setHours(Number.parseInt(startRegisterTime.hour), Number.parseInt(startRegisterTime.minute))

      const endRegDateTime = new Date(endRegisterDate)
      endRegDateTime.setHours(Number.parseInt(endRegisterTime.hour), Number.parseInt(endRegisterTime.minute))

      // Compare dates in the same timezone
      if (isBefore(endRegDateTime, startRegDateTime)) {
        errors.endRegisterDate = true
        setValue('endRegisterDate', '')
      }
    }

    setTimeErrors(errors)

    // Hiển thị thông báo lỗi nếu có
    if (errors.workshopDate) {
      toast.error('Thời gian diễn ra không được nhỏ hơn thời gian hiện tại')
    }
    if (errors.startRegisterDate) {
      toast.error('Thời gian bắt đầu đăng ký không được lớn hơn thời gian diễn ra')
    }
    if (errors.endRegisterDate) {
      if (startRegisterDate) {
        toast.error(
          'Thời gian kết thúc đăng ký phải sau thời gian bắt đầu đăng ký và không được lớn hơn thời gian diễn ra'
        )
      } else {
        toast.error('Thời gian kết thúc đăng ký không được lớn hơn thời gian diễn ra')
      }
    }
  }

  // Thêm hàm để xử lý việc lưu giá trị UTC vào form khi submit:
  const updateFormWithUtcDates = () => {
    if (workshopDate) {
      const utcWorkshopDate = localToUtcDate(workshopDate, workshopTime)
      setValue('workshopDateUtc', utcWorkshopDate?.toISOString())
    }

    if (startRegisterDate) {
      const utcStartRegDate = localToUtcDate(startRegisterDate, startRegisterTime)
      setValue('startRegisterDateUtc', utcStartRegDate?.toISOString())
    }

    if (endRegisterDate) {
      const utcEndRegDate = localToUtcDate(endRegisterDate, endRegisterTime)
      setValue('endRegisterDateUtc', utcEndRegDate?.toISOString())
    }
  }

  // Thêm useEffect để cập nhật giá trị UTC khi các ngày hoặc thời gian thay đổi:
  useEffect(() => {
    updateFormWithUtcDates()
  }, [workshopDate, startRegisterDate, endRegisterDate, workshopTime, startRegisterTime, endRegisterTime])

  // Xử lý khi chọn ngày workshop
  const handleWorkshopDateSelect = (date: Date | undefined) => {
    setWorkshopDate(date)

    // Nếu ngày đăng ký bắt đầu hoặc kết thúc lớn hơn ngày workshop, reset chúng
    if (date && startRegisterDate && isAfter(startRegisterDate, date)) {
      setStartRegisterDate(undefined)
      setValue('startRegisterDate', '')
    }

    if (date && endRegisterDate && isAfter(endRegisterDate, date)) {
      setEndRegisterDate(undefined)
      setValue('endRegisterDate', '')
    }
  }

  // Xử lý khi chọn ngày bắt đầu đăng ký
  const handleStartRegisterDateSelect = (date: Date | undefined) => {
    setStartRegisterDate(date)

    // Nếu ngày kết thúc đăng ký nhỏ hơn ngày bắt đầu, reset nó
    if (date && endRegisterDate && isBefore(endRegisterDate, date)) {
      setEndRegisterDate(undefined)
      setValue('endRegisterDate', '')
    }
  }

  return (
    <div className='space-y-6'>
      {disabled && (
        <div className='p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700'>
          <p>Khi cập nhật workshop, bạn không thể chỉnh sửa thông tin thời gian.</p>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Workshop Date */}
        <FormField
          control={control}
          name='workshopDate'
          render={() => (
            <FormItem>
              <FormLabel>
                Thời gian diễn ra <span className='text-red-500'>*</span>
              </FormLabel>
              <div className='flex flex-col gap-2'>
                <DateTimePicker
                  selectedDate={workshopDate}
                  setDate={handleWorkshopDateSelect}
                  time={workshopTime}
                  setTime={setWorkshopTime}
                  placeholder='Chọn ngày'
                  hours={hours}
                  minutes={minutes}
                  minDate={today}
                  hasError={timeErrors.workshopDate}
                  errorMessage='Thời gian diễn ra không được nhỏ hơn thời gian hiện tại'
                  disabled={disabled}
                />
              </div>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />

        {/* Start Register Date */}
        <FormField
          control={control}
          name='startRegisterDate'
          render={() => (
            <FormItem>
              <FormLabel>
                Thời gian bắt đầu đăng ký <span className='text-red-500'>*</span>
              </FormLabel>
              <div className='flex flex-col gap-2'>
                <DateTimePicker
                  selectedDate={startRegisterDate}
                  setDate={handleStartRegisterDateSelect}
                  time={startRegisterTime}
                  setTime={setStartRegisterTime}
                  placeholder='Chọn ngày'
                  hours={hours}
                  minutes={minutes}
                  minDate={today}
                  maxDate={workshopDate}
                  disabled={!workshopDate || disabled}
                  hasError={timeErrors.startRegisterDate}
                  errorMessage='Thời gian bắt đầu đăng ký không được lớn hơn thời gian diễn ra'
                />
                {!workshopDate && <p className='text-sm text-amber-600'>Vui lòng chọn thời gian diễn ra trước</p>}
              </div>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />

        {/* End Register Date */}
        <FormField
          control={control}
          name='endRegisterDate'
          render={() => (
            <FormItem>
              <FormLabel>
                Thời gian kết thúc đăng ký <span className='text-red-500'>*</span>
              </FormLabel>
              <div className='flex flex-col gap-2'>
                <DateTimePicker
                  selectedDate={endRegisterDate}
                  setDate={setEndRegisterDate}
                  time={endRegisterTime}
                  setTime={setEndRegisterTime}
                  placeholder='Chọn ngày'
                  hours={hours}
                  minutes={minutes}
                  minDate={startRegisterDate || today}
                  maxDate={workshopDate}
                  disabled={!workshopDate || !startRegisterDate || disabled}
                  hasError={timeErrors.endRegisterDate}
                  errorMessage='Thời gian kết thúc đăng ký phải sau thời gian bắt đầu và không được lớn hơn thời gian diễn ra'
                />
                {!startRegisterDate && (
                  <p className='text-sm text-amber-600'>Vui lòng chọn thời gian bắt đầu đăng ký trước</p>
                )}
              </div>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

type DateTimePickerProps = {
  selectedDate?: Date
  setDate: (date: Date | undefined) => void
  time: TimeState
  setTime: Dispatch<SetStateAction<TimeState>>
  placeholder: string
  hours: string[]
  minutes: string[]
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  hasError?: boolean
  errorMessage?: string
}

function DateTimePicker({
  selectedDate,
  setDate,
  time,
  setTime,
  placeholder,
  hours,
  minutes,
  minDate,
  maxDate,
  disabled = false,
  hasError = false,
  errorMessage
}: DateTimePickerProps) {
  return (
    <>
      <Popover>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant='outline'
            className={cn(
              'w-full h-11 pl-3 text-left font-normal shadow-sm',
              !selectedDate && 'text-muted-foreground',
              hasError && 'border-red-500',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: vi }) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            selected={selectedDate}
            onSelect={setDate}
            initialFocus
            className='rounded-md border'
            fromDate={minDate}
            toDate={maxDate}
            locale={vi}
          />
        </PopoverContent>
      </Popover>

      <div className='flex items-center gap-2 h-11'>
        <div
          className={cn(
            'flex items-center gap-1 bg-background border rounded-md px-3 py-2 w-full shadow-sm',
            hasError && 'border-red-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Clock className='h-4 w-4 text-muted-foreground' />
          <div className='flex items-center gap-1 w-full'>
            <Select
              value={time.hour}
              onValueChange={(value) => setTime({ ...time, hour: value })}
              disabled={disabled || !selectedDate}
            >
              <SelectTrigger className='w-[70px] border-0 p-0 h-auto focus:ring-0 text-center font-medium'>
                <SelectValue placeholder='HH' />
              </SelectTrigger>
              <SelectContent className='max-h-[300px]'>
                {hours.map((hour) => (
                  <SelectItem key={hour} value={hour} className='justify-center'>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className='text-muted-foreground font-bold'>:</span>
            <Select
              value={time.minute}
              onValueChange={(value) => setTime({ ...time, minute: value })}
              disabled={disabled || !selectedDate}
            >
              <SelectTrigger className='w-[70px] border-0 p-0 h-auto focus:ring-0 text-center font-medium'>
                <SelectValue placeholder='MM' />
              </SelectTrigger>
              <SelectContent className='max-h-[300px]'>
                {minutes.map((minute) => (
                  <SelectItem key={minute} value={minute} className='justify-center'>
                    {minute}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {hasError && errorMessage && (
        <div className='flex items-center gap-1 text-xs text-red-500 mt-1'>
          <AlertCircle className='h-3 w-3' />
          <span>{errorMessage}</span>
        </div>
      )}
    </>
  )
}
