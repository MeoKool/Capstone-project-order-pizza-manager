'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'
import { useSettings } from './settings-provider'
import { toast } from 'sonner'

export function TaxSettings() {
  const { settings, updateSetting } = useSettings()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Find the VAT setting
  const vatSetting = settings.find((setting) => setting.key === 'VAT')

  const [vatValue, setVatValue] = useState(vatSetting ? (Number.parseFloat(vatSetting.value) * 100).toString() : '8')

  const handleSave = async () => {
    if (!vatSetting) return

    setIsSubmitting(true)
    try {
      // Convert percentage back to decimal
      const decimalValue = (Number.parseFloat(vatValue) / 100).toString()
      await updateSetting(vatSetting.id, decimalValue)
      toast('Thuế VAT đã được cập nhật')
    } catch (error) {
      console.log(error)
      toast('Không thể cập nhật cài đặt. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thuế & Phí</CardTitle>
        <CardDescription>Quản lý các cài đặt thuế và phí của hệ thống</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='vat'>Thuế VAT (%)</Label>
          <div className='flex items-center'>
            <Input
              id='vat'
              type='number'
              value={vatValue}
              onChange={(e) => setVatValue(e.target.value)}
              min='0'
              max='100'
              step='0.1'
              className='max-w-[120px]'
            />
            <span className='ml-2'>%</span>
          </div>
          <p className='text-sm text-muted-foreground'>Thuế giá trị gia tăng (VAT) áp dụng cho các giao dịch.</p>
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
