import { connection } from '@/lib/signalr-client'
import { useEffect } from 'react'
import Swal from 'sweetalert2'

let isConnected = false

type Notification = {
  id: number
  type: number
  title: string
  message: string
  payload: string
  createdAt: string
}
type ReservationCreatedNotification = {
  numberOfPeople: number
  customerName: string
  phoneNumber: string
  id: string
}
export default function SignalRListener() {
  useEffect(() => {
    if (!isConnected && connection.state === 'Disconnected') {
      isConnected = true
      connection
        .start()
        .then(() => console.log('✅ Connected to SignalR'))
        .catch((err) => {
          isConnected = false
          console.error('❌ Connect fail:', err)
        })
    }

    connection.on('ReceiveNotification', (data: Notification) => {
      Swal.fire({
        title: data.title,
        text: data.message,
        width: '32em', // Increased width
        confirmButtonText: 'Đóng',
        customClass: {
          title: 'text-xl font-bold',
          popup: `
            animate__animated
            animate__fadeInUp
            animate__faster
          `,
          htmlContainer: 'text-base'
        },
        hideClass: {
          popup: `
            animate__animated
            animate__fadeOutDown
            animate__faster
          `
        }
      })
    })

    connection.on('ReservationCreated', (data: ReservationCreatedNotification) => {
      console.log('Received ReservationCreated notification:', data)

      Swal.fire({
        title: 'Đặt bàn',
        text:
          'Bạn có một đặt bàn mới từ ' +
          data.customerName +
          ' với số lượng người là ' +
          data.numberOfPeople +
          ' và số điện thoại là ' +
          data.phoneNumber,
        icon: 'success',
        width: '32em',
        confirmButtonText: 'Đóng',
        customClass: {
          title: 'text-xl font-bold',
          popup: `
            animate__animated
            animate__fadeInUp
            animate__faster
          `,
          htmlContainer: 'text-base'
        },
        hideClass: {
          popup: `
            animate__animated
            animate__fadeOutDown
            animate__faster
          `
        }
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/in-tables'
        }
      })
    })

    connection.on('AssignTableForReservation', (data: ReservationCreatedNotification) => {
      console.log('Received AssignTableForReservation notification:', data)

      Swal.fire({
        title: 'Sắp xếp bàn',
        text:
          'Sắp có khách ' +
          data.customerName +
          ' với số lượng người là ' +
          data.numberOfPeople +
          ' và số điện thoại là ' +
          data.phoneNumber +
          ' đến, vui lòng chọn bàn cho khách',
        icon: 'success',
        width: '32em',
        confirmButtonText: 'Đóng',
        customClass: {
          title: 'text-xl font-bold',
          popup: `
            animate__animated
            animate__fadeInUp
            animate__faster
          `,
          htmlContainer: 'text-base'
        },
        hideClass: {
          popup: `
            animate__animated
            animate__fadeOutDown
            animate__faster
          `
        }
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/in-tables'
        }
      })
    })
    connection.on('OrderItemUpdatedStatus', () => {})

    return () => {
      connection.off('OrderItemUpdatedStatus')
      connection.off('AssignTableForReservation')
      connection.off('ReceiveNotification')
      connection.off('ReservationCreated')
    }
  }, [])

  return null
}
