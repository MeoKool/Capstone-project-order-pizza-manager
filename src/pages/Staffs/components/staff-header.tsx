'use client'

import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { useStaff } from './staff-provider'

interface StaffHeaderProps {
  onAddStaff: () => void
}

export function StaffHeader({ onAddStaff }: StaffHeaderProps) {
  const { totalCount } = useStaff()

  return (
    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border shadow-sm'>
      <div>
        <p className='text-muted-foreground flex items-center'>
          <span className='inline-block w-2 h-2 rounded-full bg-primary mr-2'></span>
          Tổng số nhân viên: <span className='font-medium ml-1'>{totalCount}</span>
        </p>
      </div>
      <Button variant='green' onClick={onAddStaff}>
        <PlusCircle className='h-4 w-4' />
        Thêm nhân viên
      </Button>
    </div>
  )
}
