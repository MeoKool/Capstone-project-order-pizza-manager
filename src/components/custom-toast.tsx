'use client'

import { toast } from 'sonner'
import { Clock, Users, Phone, Check, Info, AlertTriangle, X, Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/utils'

interface TableLockToastProps {
  tableCode: string
  message: string
  note?: string
  duration?: number
}

export const showTableLToast = ({ tableCode, message, note, duration = 5000 }: TableLockToastProps) => {
  return toast.custom(
    () => (
      <div className='flex items-start gap-3 bg-[#ECFDF3] text-[#008A2E] border border-green-200 py-4 px-3 rounded-md shadow-sm w-[356px] max-w-sm'>
        <div className='flex'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'
            fill='currentColor'
            height='20'
            width='20'
            className='text-green-700 mr-0.5'
          >
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z'
              clipRule='evenodd'
            />
          </svg>
          <div className='text-[13px] font-medium ml-1'>
            Bàn <strong>{tableCode}</strong> {message}
            {note && (
              <>
                <br />
                <span className='text-xs text-green-600'>Lý do: "{note}"</span>
              </>
            )}
          </div>
        </div>
      </div>
    ),
    { duration }
  )
}

export const showReservationCreatedToast = (data: {
  customerName: string
  numberOfPeople: number
  phoneNumber: string
  duration?: number
}) => {
  return toast.custom(
    () => (
      <div className='flex flex-col gap-3 bg-white border border-green-200 p-4 rounded-lg shadow-sm w-[356px] max-w-sm'>
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

        <button
          onClick={() => {
            window.location.href = '/in-tables'
          }}
          className='mt-2 text-green-700 bg-green-50 hover:bg-green-100 transition-colors px-3 py-1.5 rounded-md text-sm font-medium self-end'
        >
          Xem chi tiết
        </button>
      </div>
    ),
    { duration: data.duration || Number.POSITIVE_INFINITY }
  )
}

export const showAssignTableToast = (data: {
  customerName: string
  numberOfPeople: number
  phoneNumber: string
  arrivalTime?: string
  duration?: number
}) => {
  return toast.custom(
    () => (
      <div className='flex flex-col gap-3 bg-white border border-amber-200 p-4 rounded-lg shadow-sm w-[356px] max-w-sm'>
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

        <button
          onClick={() => {
            window.location.href = '/in-tables'
          }}
          className='mt-2 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors px-3 py-1.5 rounded-md text-sm font-medium self-end'
        >
          Chọn bàn ngay
        </button>
      </div>
    ),
    { duration: data.duration || Number.POSITIVE_INFINITY }
  )
}

export const showGeneralNotificationToast = (
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  duration?: number
) => {
  const styles = {
    info: {
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconBg: 'bg-blue-100',
      icon: <Info className='h-5 w-5 text-blue-600' />
    },
    success: {
      borderColor: 'border-green-200',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      iconBg: 'bg-green-100',
      icon: <Check className='h-5 w-5 text-green-600' />
    },
    warning: {
      borderColor: 'border-amber-200',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      iconBg: 'bg-amber-100',
      icon: <AlertTriangle className='h-5 w-5 text-amber-600' />
    },
    error: {
      borderColor: 'border-red-200',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      iconBg: 'bg-red-100',
      icon: <X className='h-5 w-5 text-red-600' />
    }
  }

  const style = styles[type]

  return toast.custom(
    (t) => (
      <div
        className={`flex flex-col gap-2 bg-white ${style.borderColor} border p-4 rounded-lg shadow-sm w-[356px] max-w-sm`}
      >
        <div className='flex items-center gap-2'>
          <div className={`${style.iconBg} p-2 rounded-full`}>{style.icon}</div>
          <h3 className='font-bold text-lg'>{title}</h3>
        </div>
        <p className={cn('text-sm font-medium', style.textColor)}>{message}</p>

        <button
          onClick={() => {
            toast.dismiss(t)
          }}
          className={`mt-2 ${style.textColor} ${style.bgColor} hover:bg-opacity-80 transition-colors px-3 py-1.5 rounded-md text-sm font-medium self-end`}
        >
          Xác nhận
        </button>
      </div>
    ),
    { duration: duration || Number.POSITIVE_INFINITY }
  )
}

export const showTableStatusToast = (data: {
  tableName: string
  status: 'occupied' | 'available' | 'reserved' | 'cleaning'
  customerName?: string
  numberOfPeople?: number
  duration?: number
}) => {
  const statusConfig = {
    occupied: {
      title: 'Bàn đã có khách',
      borderColor: 'border-red-200',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      iconBg: 'bg-red-100',
      icon: <Users className='h-5 w-5 text-red-600' />
    },
    available: {
      title: 'Bàn đã sẵn sàng',
      borderColor: 'border-green-200',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      iconBg: 'bg-green-100',
      icon: <Check className='h-5 w-5 text-green-600' />
    },
    reserved: {
      title: 'Bàn đã được đặt trước',
      borderColor: 'border-amber-200',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      iconBg: 'bg-amber-100',
      icon: <Clock className='h-5 w-5 text-amber-600' />
    },
    cleaning: {
      title: 'Bàn đang dọn dẹp',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconBg: 'bg-blue-100',
      icon: <Info className='h-5 w-5 text-blue-600' />
    }
  }

  const config = statusConfig[data.status]

  return toast.custom(
    () => (
      <div
        className={`flex flex-col gap-3 bg-white ${config.borderColor} border p-4 rounded-lg shadow-sm w-[356px] max-w-sm`}
      >
        <div className='flex items-center gap-2'>
          <div className={`${config.iconBg} p-2 rounded-full`}>{config.icon}</div>
          <div>
            <h3 className='font-bold text-lg'>{config.title}</h3>
            <p className='text-sm text-gray-600'>Bàn {data.tableName}</p>
          </div>
        </div>

        {data.customerName && (
          <div className={cn(`p-3 rounded-lg border ${config.bgColor} ${config.borderColor} space-y-2`)}>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>Khách hàng:</span>
              <span className={cn('font-semibold', config.textColor)}>{data.customerName}</span>
            </div>

            {data.numberOfPeople && (
              <div className='flex items-center gap-2'>
                <Users className='h-4 w-4' />
                <span className='font-medium'>Số người:</span>
                <Badge variant='outline' className={cn(config.bgColor, config.textColor)}>
                  {data.numberOfPeople} người
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>
    ),
    { duration: data.duration || Number.POSITIVE_INFINITY }
  )
}

// Toast container configuration
export const ToastContainer = () => {
  return <div className='sonner-toast-container'></div>
}
