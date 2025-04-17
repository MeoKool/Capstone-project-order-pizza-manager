import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'
import { useSettings } from './settings-provider'
import { toast } from 'sonner'

export function RegistrationSettings() {
  const { settings, loading, updateSetting } = useSettings()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Find the registration settings - only if settings is available
  const registrationCutoffSetting = settings?.find((setting) => setting.key === 'REGISTRATION_CUTOFF_DAY')
  const swapCutoffSetting = settings?.find((setting) => setting.key === 'SWAP_WORKING_SLOT_CUTOFF_DAY')
  const weekLimitSetting = settings?.find((setting) => setting.key === 'REGISTRATION_WEEK_LIMIT')

  const [registrationCutoff, setRegistrationCutoff] = useState(
    registrationCutoffSetting ? registrationCutoffSetting.value : '2'
  )
  const [swapCutoff, setSwapCutoff] = useState(swapCutoffSetting ? swapCutoffSetting.value : '2')
  const [weekLimit, setWeekLimit] = useState(weekLimitSetting ? weekLimitSetting.value : '2')

  // Update state values when settings are loaded
  useEffect(() => {
    if (registrationCutoffSetting) {
      setRegistrationCutoff(registrationCutoffSetting.value)
    }
    if (swapCutoffSetting) {
      setSwapCutoff(swapCutoffSetting.value)
    }
    if (weekLimitSetting) {
      setWeekLimit(weekLimitSetting.value)
    }
  }, [registrationCutoffSetting, swapCutoffSetting, weekLimitSetting])

  const handleSave = async () => {
    if (!registrationCutoffSetting || !swapCutoffSetting || !weekLimitSetting) return

    setIsSubmitting(true)
    try {
      // Update all settings in parallel
      await Promise.all([
        updateSetting(registrationCutoffSetting.id, registrationCutoff),
        updateSetting(swapCutoffSetting.id, swapCutoff),
        updateSetting(weekLimitSetting.id, weekLimit)
      ])
      toast.success('Cài đặt đăng ký đã được lưu')
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
          <CardTitle>Cài đặt đăng ký</CardTitle>
          <CardDescription>Đang tải...</CardDescription>
        </CardHeader>
        <CardContent className='flex justify-center py-6'>
          <Loader2 className='h-6 w-6 animate-spin text-primary' />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cài đặt đăng ký</CardTitle>
        <CardDescription>Quản lý các cài đặt liên quan đến đăng ký và thay đổi lịch làm việc</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='registration-cutoff'>Thời hạn đăng ký (ngày)</Label>
          <Input
            id='registration-cutoff'
            type='number'
            value={registrationCutoff}
            onChange={(e) => setRegistrationCutoff(e.target.value)}
            min='0'
            className='max-w-[120px]'
          />
          <p className='text-sm text-muted-foreground'>Số ngày trước khi hết hạn đăng ký.</p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='swap-cutoff'>Thời hạn đổi ca (ngày)</Label>
          <Input
            id='swap-cutoff'
            type='number'
            value={swapCutoff}
            onChange={(e) => setSwapCutoff(e.target.value)}
            min='0'
            className='max-w-[120px]'
          />
          <p className='text-sm text-muted-foreground'>Số ngày trước khi hết hạn đổi ca làm việc.</p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='week-limit'>Giới hạn đăng ký theo tuần</Label>
          <Input
            id='week-limit'
            type='number'
            value={weekLimit}
            onChange={(e) => setWeekLimit(e.target.value)}
            min='1'
            className='max-w-[120px]'
          />
          <p className='text-sm text-muted-foreground'>Số tuần tối đa có thể đăng ký trước.</p>
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
  )
}
