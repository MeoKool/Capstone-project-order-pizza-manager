import { Badge } from '@/components/ui/badge'

interface ReservationPriorityStatusProps {
  reservationPriorityStatus: string
}

export const ReservationPriorityStatus = ({ reservationPriorityStatus }: ReservationPriorityStatusProps) => {
  switch (reservationPriorityStatus) {
    case 'Priority':
      return (
        <Badge variant='outline' className='bg-orange-50 text-orange-700 border-orange-200 p-1 w-[100px]'>
          <span className='text-center w-[100px]'>Ưu tiên</span>
        </Badge>
      )
    case 'NonPriority':
      return (
        <Badge variant='outline' className='bg-gray-50 text-gray-700 border-gray-200 p-1 w-[100px]'>
          <span className='text-center w-[100px]'>Không ưu tiên</span>
        </Badge>
      )
    default:
      return null
  }
}
