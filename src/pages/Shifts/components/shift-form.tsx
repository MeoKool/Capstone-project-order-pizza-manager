import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ShiftService from '@/services/shift-service'
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
      const shiftService = ShiftService.getInstance()
      const response = await shiftService.createShift({ name, description })

      if (response.success) {
        toast.success('Đã tạo ca làm mới')
        setName('')
        setDescription('')
      } else {
        toast(response.message || 'Không thể tạo ca làm')
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo ca làm mới</CardTitle>
        <CardDescription>Thêm ca làm mới vào hệ thống</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Tên ca làm</Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Ví dụ: Ca sáng, Ca chiều...'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='description'>Mô tả</Label>
            <Textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Mô tả chi tiết về ca làm'
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Đang tạo...' : 'Tạo ca làm'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
