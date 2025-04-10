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

    return () => {
      connection.off('ReceiveNotification')
    }
  }, [])

  return null
}
