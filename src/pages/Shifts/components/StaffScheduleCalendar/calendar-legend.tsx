import { Badge } from '@/components/ui/badge'
import { Users, AlertCircle, ArrowRightLeft } from 'lucide-react'

export function CalendarLegend() {
  return (
    <div className='flex items-center gap-4 mt-4'>
      <div className='flex items-center gap-2'>
        <Badge className='bg-red-100 text-red-800 border border-red-300 flex items-center gap-1'>
          <Users className='h-3.5 w-3.5' />
        </Badge>
        <span className='text-sm text-gray-600'>Lịch làm việc</span>
      </div>

      <div className='flex items-center gap-2'>
        <Badge className='bg-orange-100 text-orange-800 border border-orange-300 flex items-center gap-1'>
          <AlertCircle className='h-3.5 w-3.5' />
        </Badge>
        <span className='text-sm text-gray-600'>Yêu cầu đăng ký</span>
      </div>

      <div className='flex items-center gap-2'>
        <Badge className='bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1'>
          <ArrowRightLeft className='h-3.5 w-3.5' />
        </Badge>
        <span className='text-sm text-gray-600'>Yêu cầu đổi ca</span>
      </div>
    </div>
  )
}
