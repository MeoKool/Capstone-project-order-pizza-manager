import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { useStaff } from './staff-provider'

interface StaffHeaderProps {
  onAddStaff: () => void
}

export function StaffHeader({ onAddStaff }: StaffHeaderProps) {
  const { totalCount } = useStaff()

  return (
    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Quản lý nhân viên</h1>
        <p className='text-muted-foreground'>Tổng số nhân viên: {totalCount}</p>
      </div>
      <Button onClick={onAddStaff} className='gap-2'>
        <PlusCircle className='h-4 w-4' />
        Thêm nhân viên
      </Button>
    </div>
  )
}
