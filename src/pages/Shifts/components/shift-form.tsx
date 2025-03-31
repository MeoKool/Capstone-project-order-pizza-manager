import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import StaffScheduleService from '@/services/staff-schedule-service'
import { Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function ShiftForm() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      toast.error('Vui lòng nhập tên ca làm')
      return
    }

    setIsSubmitting(true)

    try {
      const shiftService = StaffScheduleService.getInstance()
      const response = await shiftService.createShift({ name, description })

      if (response.success) {
        toast.success('Đã tạo ca làm mới')
        setName('')
        setDescription('')
      } else {
        toast.error(response.message || 'Không thể tạo ca làm')
      }
    } catch (error) {
      console.log(error)
      toast.error('Đã xảy ra lỗi khi tạo ca làm')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className='border-green-200 shadow-md'>
      <CardHeader className='bg-green-50 border-b border-green-100'>
        <CardTitle className='text-green-800 flex items-center gap-2'>
          <Clock className='h-5 w-5 text-green-600' />
          Tạo ca làm mới
        </CardTitle>
        <CardDescription className='text-green-600'>Thêm ca làm mới vào hệ thống</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className='space-y-4 pt-6'>
          <div className='space-y-2'>
            <Label htmlFor='name' className='text-green-700'>
              Tên ca làm
            </Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Ví dụ: Ca sáng, Ca chiều...'
              className='border-green-200 focus-visible:ring-green-500'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='description' className='text-green-700'>
              Mô tả
            </Label>
            <Textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Mô tả chi tiết về ca làm'
              className='border-green-200 focus-visible:ring-green-500 min-h-[120px]'
            />
          </div>
        </CardContent>
        <CardFooter className='bg-green-50/50 border-t border-green-100'>
          <Button type='submit' disabled={isSubmitting} variant='green' className=' hover:bg-green-700 text-white'>
            {isSubmitting ? 'Đang tạo...' : 'Tạo ca làm'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
