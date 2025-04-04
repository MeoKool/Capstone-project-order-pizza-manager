'use client'

import { format, startOfWeek, endOfWeek } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, RefreshCw, CheckCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useState } from 'react'

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
  const [isAutoAssigning, setIsAutoAssigning] = useState(false)

  const handleAutoAssign = async () => {
    try {
      setIsAutoAssigning(true)

      // Get Monday of the current week
      const mondayDate = startOfWeek(currentDate, { weekStartsOn: 1 })

      // Format the date as YYYY-MM-DD
      const formattedDate = format(mondayDate, 'yyyy-MM-dd')

      const response = await fetch('https://vietsac.id.vn/api/staff-zone-schedules/auto-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workingDate: formattedDate
        })
      })

      if (!response.ok) {
        throw new Error('Failed to auto assign')
      }

      // If successful, refresh the data
      onRefresh()
    } catch (error) {
      console.error('Error auto assigning:', error)
    } finally {
      setIsAutoAssigning(false)
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={onPrevious}
                  className='border-green-200 text-green-700 hover:bg-green-50'
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tuần trước</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={onToday}
                  className='border-green-200 text-green-700 hover:bg-green-50'
                >
                  Hôm nay
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Về ngày hiện tại</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={onNext}
                  className='border-green-200 text-green-700 hover:bg-green-50'
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tuần sau</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className='flex items-center gap-2'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='green' size='sm' onClick={handleAutoAssign} disabled={isAutoAssigning}>
                  <CheckCircle className='h-4 w-4 mr-1' />
                  {isAutoAssigning ? 'Đang xử lý...' : 'Tự động duyệt đăng ký'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tự động duyệt đăng ký cho ngày hiện tại</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={onRefresh}
                  className='border-green-200 text-green-700 hover:bg-green-50'
                >
                  <RefreshCw className='h-4 w-4 mr-1' />
                  Làm mới
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Làm mới dữ liệu</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
