'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info, Loader2, Save } from 'lucide-react'
import { useSettings } from './settings-provider'
import { toast } from 'sonner'

export function BookingNotificationSettings() {
  const { settings, loading, updateSetting } = useSettings()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Find the BOOKING_DATE_PREVIOUS_NOTIFY setting
  const bookingNotifySetting = settings?.find((setting) => setting.key === 'BOOKING_DATE_PREVIOUS_NOTIFY')

  const [bookingNotifyValue, setBookingNotifyValue] = useState(
    bookingNotifySetting ? bookingNotifySetting.value : '360'
  )

  // Update state values when settings are loaded
  useEffect(() => {
    if (bookingNotifySetting) {
      setBookingNotifyValue(bookingNotifySetting.value)
    }
  }, [bookingNotifySetting])

  const handleSave = async () => {
    if (!bookingNotifySetting) return

    setIsSubmitting(true)
    try {
      await updateSetting(bookingNotifySetting.id, bookingNotifyValue)
      toast.success('Cài đặt đã được lưu')
    } catch (error) {
      console.log(error)
      toast.error('Đã xảy ra lỗi khi lưu cài đặt')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt đặt bàn</CardTitle>
          <CardDescription>Đang tải...</CardDescription>
        </CardHeader>
        <CardContent className='flex justify-center py-6'>
          <Loader2 className='h-6 w-6 animate-spin text-primary' />
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt sắp xếp đặt bàn</CardTitle>
          <CardDescription>Quản lý các cài đặt liên quan đến sắp xếp đặt bàn</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Label htmlFor='booking-notify'>Thời gian sắp xếp đặt bàn (phút)</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='h-4 w-4 text-muted-foreground cursor-help' />
                </TooltipTrigger>
                <TooltipContent>
                  <p className='max-w-xs'>
                    Giới hạn thời gian tối đa được phép sắp xếp bàn trước so với thời điểm hiện tại.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className='flex items-center'>
              <Input
                id='booking-notify'
                type='number'
                value={bookingNotifyValue}
                onChange={(e) => setBookingNotifyValue(e.target.value)}
                min='1'
                className='max-w-[120px]'
              />
              <span className='ml-2'>phút</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isSubmitting} className='ml-auto' variant='green'>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className='mr-2 h-4 w-4' />
                Lưu thay đổi
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}
