import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'
import { useSettings } from './settings-provider'
import { toast } from 'sonner'

export function GeneralSettings() {
  const { settings, loading, updateSetting } = useSettings()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Find the MAXIMUM_REGISTER_SLOT setting
  const maxSlotSetting = settings?.find((setting) => setting.key === 'MAXIMUM_REGISTER_SLOT')

  const [maxSlotValue, setMaxSlotValue] = useState(maxSlotSetting ? maxSlotSetting.value : '3')

  // Update state values when settings are loaded
  useEffect(() => {
    if (maxSlotSetting) {
      setMaxSlotValue(maxSlotSetting.value)
    }
  }, [maxSlotSetting])

  const handleSave = async () => {
    if (!maxSlotSetting) return

    setIsSubmitting(true)
    try {
      await updateSetting(maxSlotSetting.id, maxSlotValue)
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
          <CardTitle>Cài đặt chung</CardTitle>
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
        <CardTitle>Cài đặt chung</CardTitle>
        <CardDescription>Quản lý các cài đặt chung của hệ thống</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='max-slots'>Số lượng đăng ký tối đa</Label>
          <Input
            id='max-slots'
            type='number'
            value={maxSlotValue}
            onChange={(e) => setMaxSlotValue(e.target.value)}
            min='1'
          />
          <p className='text-sm text-muted-foreground'>Số lượng tối đa các slot có thể đăng ký trong hệ thống.</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSubmitting} className='ml-auto'>
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
