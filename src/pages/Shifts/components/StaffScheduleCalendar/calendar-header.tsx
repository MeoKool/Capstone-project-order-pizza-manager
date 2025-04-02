import { format, startOfWeek, endOfWeek } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, RefreshCw } from 'lucide-react'

interface CalendarHeaderProps {
  currentDate: Date
  view: 'week' | 'month'
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  onRefresh: () => void
  onViewChange: (view: 'week' | 'month') => void
}

export function CalendarHeader({
  currentDate,
  view,
  onPrevious,
  onNext,
  onToday,
  onRefresh,
  onViewChange
}: CalendarHeaderProps) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={onPrevious}
            className='border-green-200 text-green-700 hover:bg-green-50'
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={onToday}
            className='border-green-200 text-green-700 hover:bg-green-50'
          >
            Hôm nay
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={onNext}
            className='border-green-200 text-green-700 hover:bg-green-50'
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>

        <Button
          variant='outline'
          size='sm'
          onClick={onRefresh}
          className='border-green-200 text-green-700 hover:bg-green-50'
        >
          <RefreshCw className='h-4 w-4 mr-1' />
          Làm mới
        </Button>
      </div>
      <div className='flex items-center justify-between mt-2'>
        <div className='text-lg font-medium text-green-700'>
          {view === 'week'
            ? `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'dd/MM')} - ${format(
                endOfWeek(currentDate, { weekStartsOn: 1 }),
                'dd/MM/yyyy'
              )}`
            : format(currentDate, 'MMMM yyyy', { locale: vi })}
        </div>
        <Tabs value={view} onValueChange={(v) => onViewChange(v as 'week' | 'month')}>
          <TabsList className='bg-green-100'>
            <TabsTrigger
              value='week'
              className='flex items-center gap-1 data-[state=active]:bg-green-600 data-[state=active]:text-white'
            >
              <Calendar className='h-4 w-4' />
              <span>Tuần</span>
            </TabsTrigger>
            <TabsTrigger
              value='month'
              className='flex items-center gap-1 data-[state=active]:bg-green-600 data-[state=active]:text-white'
            >
              <CalendarDays className='h-4 w-4' />
              <span>Tháng</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
