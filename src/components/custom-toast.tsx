import { toast } from 'sonner'
import { Clock, Users, Phone, Check, Info, AlertTriangle, X, Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/utils'

// Custom toast styles for different notification types
export const showReservationCreatedToast = (data: {
  customerName: string
  numberOfPeople: number
  phoneNumber: string
}) => {
  return toast.success(
    <div className='flex flex-col gap-3'>
      <div className='flex items-center gap-2'>
        <div className='bg-green-100 p-2 rounded-full'>
          <Bell className='h-5 w-5 text-green-600' />
        </div>
        <div>
          <h3 className='font-bold text-lg'>Đặt bàn mới</h3>
          <p className='text-sm text-gray-600'>Vừa nhận lúc {new Date().toLocaleTimeString('vi-VN')}</p>
        </div>
      </div>

      <div className='flex items-center gap-2 mt-1'>
        <span className='font-medium'>Khách hàng:</span>
        <span className='font-semibold text-green-700'>{data.customerName}</span>
      </div>

      <div className='bg-green-50 p-3 rounded-lg border border-green-100 space-y-2'>
        <div className='flex items-center gap-2'>
          <Users className='h-4 w-4 text-green-600' />
          <span className='font-medium'>Số người:</span>
          <Badge variant='outline' className='bg-green-100 text-green-800 hover:bg-green-100'>
            {data.numberOfPeople} người
          </Badge>
        </div>

        <div className='flex items-center gap-2'>
          <Phone className='h-4 w-4 text-green-600' />
          <span className='font-medium'>Số điện thoại:</span>
          <Badge variant='outline' className='bg-green-100 text-green-800 hover:bg-green-100'>
            {data.phoneNumber}
          </Badge>
        </div>
      </div>
    </div>,
    {
      duration: Infinity,
      className: 'p-4 border-l-4 border-green-500 max-w-md w-full shadow-lg rounded-lg',
      action: {
        label: 'Xem chi tiết',
        onClick: () => {
          window.location.href = '/in-tables'
        }
      },
      style: {
        fontSize: '14px'
      }
    }
  )
}

export const showAssignTableToast = (data: {
  customerName: string
  numberOfPeople: number
  phoneNumber: string
  arrivalTime?: string
}) => {
  return toast.warning(
    <div className='flex flex-col gap-3'>
      <div className='flex items-center gap-2'>
        <div className='bg-amber-100 p-2 rounded-full'>
          <Clock className='h-5 w-5 text-amber-600' />
        </div>
        <div>
          <h3 className='font-bold text-lg'>Sắp xếp bàn</h3>
          <p className='text-sm text-gray-600'>
            {data.arrivalTime ? `Khách đến lúc ${data.arrivalTime}` : 'Khách sắp đến'}
          </p>
        </div>
      </div>

      <div className='flex items-center gap-2 mt-1'>
        <span className='font-medium'>Khách hàng:</span>
        <span className='font-semibold text-amber-700'>{data.customerName}</span>
      </div>

      <div className='bg-amber-50 p-3 rounded-lg border border-amber-100 space-y-2'>
        <div className='flex items-center gap-2'>
          <Users className='h-4 w-4 text-amber-600' />
          <span className='font-medium'>Số người:</span>
          <Badge variant='outline' className='bg-amber-100 text-amber-800 hover:bg-amber-100'>
            {data.numberOfPeople} người
          </Badge>
        </div>

        <div className='flex items-center gap-2'>
          <Phone className='h-4 w-4 text-amber-600' />
          <span className='font-medium'>Số điện thoại:</span>
          <Badge variant='outline' className='bg-amber-100 text-amber-800 hover:bg-amber-100'>
            {data.phoneNumber}
          </Badge>
        </div>
      </div>

      <p className='text-sm font-medium text-amber-700 mt-1 bg-amber-100 p-2 rounded-md flex items-center gap-2'>
        <AlertTriangle className='h-4 w-4' />
        Vui lòng chọn bàn cho khách!
      </p>
    </div>,
    {
      duration: Infinity, // Infinite duration
      className: 'p-4 border-l-4 border-amber-500 max-w-md w-full shadow-lg rounded-lg',
      action: {
        label: 'Chọn bàn ngay',
        onClick: () => {
          window.location.href = '/in-tables'
        }
      },
      style: {
        fontSize: '14px'
      }
    }
  )
}

export const showGeneralNotificationToast = (
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info'
) => {
  const styles = {
    info: {
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconBg: 'bg-blue-100',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
      icon: <Info className='h-5 w-5 text-blue-600' />
    },
    success: {
      borderColor: 'border-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      iconBg: 'bg-green-100',
      badgeBg: 'bg-green-100',
      badgeText: 'text-green-800',
      icon: <Check className='h-5 w-5 text-green-600' />
    },
    warning: {
      borderColor: 'border-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      iconBg: 'bg-amber-100',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      icon: <AlertTriangle className='h-5 w-5 text-amber-600' />
    },
    error: {
      borderColor: 'border-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      iconBg: 'bg-red-100',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-800',
      icon: <X className='h-5 w-5 text-red-600' />
    }
  }

  const style = styles[type]
  const toastFunction = toast[type] || toast.info

  return toastFunction(
    <div className='flex flex-col '>
      <div className='flex items-center gap-2'>
        <h3 className='font-bold text-lg'>{title}</h3>
      </div>
      <p className={cn('text-sm font-semibold', style.textColor)}>{message}</p>

    </div>,
    {
      duration: Infinity,
      className: `p-4 border-l-4 max-w-md w-full bg-amber-300 text-amber-700 rounded-lg`,
      action: {
        label: 'Xác nhận',
        onClick: () => {
          toast.dismiss()
        }
      },
      style: {
        fontSize: '14px'
      }
    }
  )
}

// // Toast for table status changes
// export const showTableStatusToast = (data: {
//   tableName: string
//   status: 'occupied' | 'available' | 'reserved' | 'cleaning'
//   customerName?: string
//   numberOfPeople?: number
// }) => {
//   const statusConfig = {
//     occupied: {
//       title: 'Bàn đã có khách',
//       color: 'border-red-500',
//       bgColor: 'bg-red-50',
//       textColor: 'text-red-700',
//       icon: <Users className='h-5 w-5 text-red-600' />
//     },
//     available: {
//       title: 'Bàn đã sẵn sàng',
//       color: 'border-green-500',
//       bgColor: 'bg-green-50',
//       textColor: 'text-green-700',
//       icon: <Check className='h-5 w-5 text-green-600' />
//     },
//     reserved: {
//       title: 'Bàn đã được đặt trước',
//       color: 'border-amber-500',
//       bgColor: 'bg-amber-50',
//       textColor: 'text-amber-700',
//       icon: <Clock className='h-5 w-5 text-amber-600' />
//     },
//     cleaning: {
//       title: 'Bàn đang dọn dẹp',
//       color: 'border-blue-500',
//       bgColor: 'bg-blue-50',
//       textColor: 'text-blue-700',
//       icon: <Info className='h-5 w-5 text-blue-600' />
//     }
//   }

//   const config = statusConfig[data.status]

//   return toast.info(
//     <div className='flex flex-col gap-3'>
//       <div className='flex items-center gap-2'>
//         <div className={cn('p-2 rounded-full', config.bgColor)}>{config.icon}</div>
//         <div>
//           <h3 className='font-bold text-lg'>{config.title}</h3>
//           <p className='text-sm text-gray-600'>Bàn {data.tableName}</p>
//         </div>
//       </div>

//       {data.customerName && (
//         <div className={cn('p-3 rounded-lg border space-y-2', config.bgColor)}>
//           <div className='flex items-center gap-2'>
//             <span className='font-medium'>Khách hàng:</span>
//             <span className={cn('font-semibold', config.textColor)}>{data.customerName}</span>
//           </div>

//           {data.numberOfPeople && (
//             <div className='flex items-center gap-2'>
//               <Users className='h-4 w-4' />
//               <span className='font-medium'>Số người:</span>
//               <Badge variant='outline' className={cn(config.bgColor, config.textColor)}>
//                 {data.numberOfPeople} người
//               </Badge>
//             </div>
//           )}
//         </div>
//       )}
//     </div>,
//     {
//       duration: Infinity,
//       className: `p-4 border-l-4 ${config.color} max-w-md w-full shadow-lg rounded-lg`,
//       style: {
//         fontSize: '14px'
//       }
//     }
//   )
// }

// Toast container configuration
export const ToastContainer = () => {
  return <div className='sonner-toast-container'></div>
}
