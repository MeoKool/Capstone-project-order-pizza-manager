import { connection } from '@/lib/signalr-client'
import { useEffect } from 'react'
import { toast } from 'sonner'

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
      toast.warning(data.title, {
        description: data.message,
        duration: Infinity,
        closeButton: true
      })
    })

    return () => {
      connection.off('ReceiveNotification')
    }
  }, [])

  return null
}
