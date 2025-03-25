// components/workshop/WorkshopFormTimeInfo.tsx
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/utils/utils'
import { useFormContext } from 'react-hook-form'
import { Dispatch, SetStateAction } from 'react'

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
  setEndRegisterTime
}: Props) {
  const { control } = useFormContext()

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

  return (
    <Card className='border-0 shadow-sm'>
      <CardHeader className='pb-4 border-b'>
        <CardTitle className='text-xl'>Thời gian</CardTitle>
      </CardHeader>
      <CardContent className='pt-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Workshop Date */}
          <FormField
            control={control}
            name='workshopDate'
            render={() => (
              <FormItem>
                <FormLabel>Thời gian diễn ra</FormLabel>
                <div className='flex flex-col gap-2'>
                  <DateTimePicker
                    selectedDate={workshopDate}
                    setDate={setWorkshopDate}
                    time={workshopTime}
                    setTime={setWorkshopTime}
                    placeholder='Chọn ngày'
                    hours={hours}
                    minutes={minutes}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Start Register Date */}
          <FormField
            control={control}
            name='startRegisterDate'
            render={() => (
              <FormItem>
                <FormLabel>Thời gian bắt đầu đăng ký</FormLabel>
                <div className='flex flex-col gap-2'>
                  <DateTimePicker
                    selectedDate={startRegisterDate}
                    setDate={setStartRegisterDate}
                    time={startRegisterTime}
                    setTime={setStartRegisterTime}
                    placeholder='Chọn ngày'
                    hours={hours}
                    minutes={minutes}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Register Date */}
          <FormField
            control={control}
            name='endRegisterDate'
            render={() => (
              <FormItem>
                <FormLabel>Thời gian kết thúc đăng ký</FormLabel>
                <div className='flex flex-col gap-2'>
                  <DateTimePicker
                    selectedDate={endRegisterDate}
                    setDate={setEndRegisterDate}
                    time={endRegisterTime}
                    setTime={setEndRegisterTime}
                    placeholder='Chọn ngày'
                    hours={hours}
                    minutes={minutes}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}

type DateTimePickerProps = {
  selectedDate?: Date
  setDate: Dispatch<SetStateAction<Date | undefined>>
  time: TimeState
  setTime: Dispatch<SetStateAction<TimeState>>
  placeholder: string
  hours: string[]
  minutes: string[]
}

function DateTimePicker({ selectedDate, setDate, time, setTime, placeholder, hours, minutes }: DateTimePickerProps) {
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn('w-full h-11 pl-3 text-left font-normal', !selectedDate && 'text-muted-foreground')}
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
          />
        </PopoverContent>
      </Popover>

      <div className='flex items-center gap-2 h-11'>
        <div className='flex items-center gap-1 bg-background border rounded-md px-3 py-2 w-full'>
          <Clock className='h-4 w-4 text-muted-foreground' />
          <Select value={time.hour} onValueChange={(value) => setTime({ ...time, hour: value })}>
            <SelectTrigger className='w-[60px] border-0 p-0 h-auto focus:ring-0'>
              <SelectValue placeholder='HH' />
            </SelectTrigger>
            <SelectContent>
              {hours.map((hour) => (
                <SelectItem key={hour} value={hour}>
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className='text-muted-foreground'>:</span>
          <Select value={time.minute} onValueChange={(value) => setTime({ ...time, minute: value })}>
            <SelectTrigger className='w-[60px] border-0 p-0 h-auto focus:ring-0'>
              <SelectValue placeholder='MM' />
            </SelectTrigger>
            <SelectContent>
              {minutes.map((minute) => (
                <SelectItem key={minute} value={minute}>
                  {minute}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )
}
