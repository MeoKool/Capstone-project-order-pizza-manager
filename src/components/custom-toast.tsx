import { toast } from 'sonner'

// Custom toast styles for different notification types
export const showReservationCreatedToast = (data: {
  customerName: string
  numberOfPeople: number
  phoneNumber: string
}) => {
  return toast.success(
    <div className='flex flex-col gap-2'>
      <h3 className='font-bold text-lg'>Đặt bàn mới</h3>
      <p className='text-base'>
        Bạn có một đặt bàn mới từ <span className='font-medium'>{data.customerName}</span>
      </p>
      <div className='flex flex-col mt-1 bg-green-50 p-2 rounded-md'>
        <div className='flex items-center gap-2'>
          <span className='font-medium'>Số người:</span>
          <span className='bg-green-100 px-2 py-1 rounded-md'>{data.numberOfPeople} người</span>
        </div>
        <div className='flex items-center gap-2 mt-1'>
          <span className='font-medium'>Số điện thoại:</span>
          <span className='bg-green-100 px-2 py-1 rounded-md'>{data.phoneNumber}</span>
        </div>
      </div>
    </div>,
    {
      duration: Infinity,
      className: 'p-5 border-l-8 border-green-500 max-w-md w-full shadow-lg',
      action: {
        label: 'Xem chi tiết',
        onClick: () => {
          window.location.href = '/in-tables'
        }
      },
      icon: <span className='text-2xl'>🍽️</span>,
      style: {
        fontSize: '16px'
      }
    }
  )
}

export const showAssignTableToast = (data: { customerName: string; numberOfPeople: number; phoneNumber: string }) => {
  return toast.warning(
    <div className='flex flex-col gap-2'>
      <h3 className='font-bold text-lg'>Sắp xếp bàn</h3>
      <p className='text-base'>
        Sắp có khách <span className='font-medium'>{data.customerName}</span> đến nhà hàng
      </p>
      <div className='flex flex-col mt-1 bg-yellow-50 p-2 rounded-md'>
        <div className='flex items-center gap-2'>
          <span className='font-medium'>Số người:</span>
          <span className='bg-yellow-100 px-2 py-1 rounded-md'>{data.numberOfPeople} người</span>
        </div>
        <div className='flex items-center gap-2 mt-1'>
          <span className='font-medium'>Số điện thoại:</span>
          <span className='bg-yellow-100 px-2 py-1 rounded-md'>{data.phoneNumber}</span>
        </div>
      </div>
      <p className='text-base font-medium text-yellow-700 mt-1'>Vui lòng chọn bàn cho khách!</p>
    </div>,
    {
      duration: Infinity,
      className: 'p-5 border-l-8 border-yellow-500 max-w-md w-full shadow-lg',
      action: {
        label: 'Chọn bàn ngay',
        onClick: () => {
          window.location.href = '/in-tables'
        }
      },
      icon: <span className='text-2xl'>⏰</span>,
      style: {
        fontSize: '16px'
      }
    }
  )
}

export const showGeneralNotificationToast = (
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info'
) => {
  const borderColors = {
    info: 'border-blue-500',
    success: 'border-green-500',
    warning: 'border-yellow-500',
    error: 'border-red-500'
  }

  const bgColors = {
    info: 'bg-blue-50',
    success: 'bg-green-50',
    warning: 'bg-yellow-50',
    error: 'bg-red-50'
  }

  const icons = {
    info: <span className='text-2xl'>ℹ️</span>,
    success: <span className='text-2xl'>✅</span>,
    warning: <span className='text-2xl'>⚠️</span>,
    error: <span className='text-2xl'>❌</span>
  }

  const toastFunction = toast[type] || toast.info

  return toastFunction(
    <div className='flex flex-col gap-2'>
      <h3 className='font-bold text-lg'>{title}</h3>
      <p className={`text-base p-3 rounded-md ${bgColors[type]}`}>{message}</p>
    </div>,
    {
      duration: Infinity,
      className: `p-5 border-l-8 ${borderColors[type]} max-w-md w-full shadow-lg`,
      action: {
        label: 'Đóng',
        onClick: () => {
          toast.dismiss()
        }
      },
      icon: icons[type],
      style: {
        fontSize: '16px'
      }
    }
  )
}
