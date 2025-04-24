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


export interface ReservationProps {
  numberOfPeople: number
  customerName: string
  phoneNumber: string
  id?: string
  onClickNavigateToTable: () => void
  duration?: number
  arrivalTime?: string

}
export const showReservationCreatedToast = (data: ReservationProps) => {
  return toast.custom(
    () => (
      <div className='flex flex-col bg-white border-2 border-blue-100 rounded-lg shadow-sm w-[356px]'>
        <div className='flex p-4 bg-blue-200 pt-4 items-center gap-2'>
          <div className='bg-blue-100 p-2 rounded-full'>
            <Bell className='h-5 w-5 text-blue-600' />
          </div>
          <div>
            <h3 className='font-bold text-lg'>Đặt bàn mới</h3>
            <p className='text-sm text-gray-600'>
              Vừa nhận lúc {new Date().toLocaleTimeString('vi-VN')}
            </p>
          </div>
        </div>

        <div className='bg-blue-50 p-4 pl-7 space-y-2'>
          <div className='flex items-center gap-2'>
            <Users className='h-4 w-4 text-blue-600' />
            <span className='font-medium'>Tên khách hàng: {data.customerName}</span>

          </div>

          <div className='flex items-center gap-2'>
            <Users className='h-4 w-4 text-blue-600' />
            <span className='font-medium'>Số người: {data.numberOfPeople} người</span>

          </div>

          <div className='flex items-center gap-2'>
            <Phone className='h-4 w-4 text-blue-600' />
            <span className='font-medium'>Số điện thoại: {data.phoneNumber}</span>

          </div>
        </div>

        <div>
          <p className='text-sm text-blue-700 bg-blue-50 p-3'>
            <strong>Lưu ý:</strong> Đây là đơn đặt bàn mới. Bạn có thể xem chi tiết để chọn bàn và xác nhận.
          </p>
        </div>

        <div className='flex justify-end bg-blue-50 pb-6 pt-0 px-5'>
          <button
            onClick={() => {
              data.onClickNavigateToTable()
              toast.dismiss()
            }}
            className='text-gray-100 bg-blue-500 hover:bg-blue-600 transition-colors px-3 py-1.5 rounded-md text-sm font-medium self-end'
          >
            Xem chi tiết
          </button>
        </div>
      </div>

    ),
    { duration: Number.POSITIVE_INFINITY }
  )
}

export const showAssignTableToast = (data: ReservationProps) => {
  return toast.custom(
    () => (
      <div className='flex flex-col bg-white border-2 border-amber-100 rounded-lg shadow-sm w-[356px]'>
        <div className='flex p-4 bg-amber-100 pt-4 items-center gap-2'>
          <div className='bg-amber-100 p-2 rounded-full'>
            <Clock className='h-5 w-5 text-amber-600' />
          </div>
          <div>
            <h3 className='font-bold text-lg'>Vui lòng chọn bàn cho khách!</h3>
            <p className='text-sm text-gray-600'>
              {data.arrivalTime ? `Khách đến lúc ${data.arrivalTime}` : 'Khách sắp đến'}
            </p>
          </div>
        </div>

        <div className='bg-amber-50 p-4 pl-7  space-y-2'>
          <div className='flex items-center gap-2'>
            <Users className='h-4 w-4 text-amber-600' />
            <span className='font-medium'>Tên khách hàng:</span>
            <Badge variant='outline' className='text-sm bg-amber-100 text-amber-800 border-amber-400 hover:bg-amber-100'>
              {data.customerName}
            </Badge>
          </div>
          <div className='flex items-center gap-2'>
            <Users className='h-4 w-4 text-amber-600' />
            <span className='font-medium'>Số người:</span>
            <Badge variant='outline' className='text-sm bg-amber-100 text-amber-800 border-amber-400 hover:bg-amber-100'>
              {data.numberOfPeople} người
            </Badge>
          </div>

          <div className='flex items-center gap-2'>
            <Phone className='h-4 w-4 text-amber-600' />
            <span className='font-medium'>Số điện thoại:</span>
            <Badge variant='outline' className='text-sm bg-amber-100 text-amber-800 border-amber-400 hover:bg-amber-100'>
              {data.phoneNumber}
            </Badge>
          </div>
        </div>
        <div>
          <p className='text-sm text-amber-700 bg-amber-50 p-3 '>
            <strong>Lưu ý:</strong> Sau khi chọn bàn, trạng thái đặt bàn sẽ chuyển thành "Đã xác nhận" và bàn sẽ được mở để
            phục vụ.
          </p>

        </div>
        <div className='flex justify-end bg-amber-50  pb-6 pt-0 px-5'>
          <button
            onClick={() => {
              data.onClickNavigateToTable()
              toast.dismiss()
            }}
            className=' text-gray-100 bg-amber-500 hover:bg-amber-600 transition-colors px-3 py-1.5 rounded-md text-sm font-medium self-end'
          >
            Chọn bàn ngay
          </button>
        </div>

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
