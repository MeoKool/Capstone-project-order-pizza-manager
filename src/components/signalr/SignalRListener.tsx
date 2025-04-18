'use client'

import { connection } from '@/lib/signalr-client'
import { useEffect } from 'react'
import { showAssignTableToast, showGeneralNotificationToast, showReservationCreatedToast } from '../custom-toast'

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

// Map notification type numbers to toast types
const getNotificationType = (type: number): 'info' | 'success' | 'warning' | 'error' => {
  switch (type) {
    case 1:
      return 'success'
    case 2:
      return 'info'
    case 3:
      return 'warning'
    case 4:
      return 'error'
    default:
      return 'info'
  }
}

export default function EnhancedSignalRListener() {
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

    // Handle general notifications with appropriate styling based on type
    connection.on('ReceiveNotification', (data: Notification) => {
      const toastType = getNotificationType(data.type)
      showGeneralNotificationToast(data.title, data.message, toastType)
    })

    // Handle reservation created notifications with custom styling
    connection.on('ReservationCreated', (data: ReservationCreatedNotification) => {
      console.log('Received ReservationCreated notification:', data)
      showReservationCreatedToast(data)
    })

    // Handle assign table notifications with custom styling
    connection.on('AssignTableForReservation', (data: ReservationCreatedNotification) => {
      console.log('Received AssignTableForReservation notification:', data)
      showAssignTableToast(data)
    })

    // Empty handler for OrderItemUpdatedStatus
    connection.on('OrderItemUpdatedStatus', () => {})

    // Clean up event listeners on component unmount
    return () => {
      connection.off('OrderItemUpdatedStatus')
      connection.off('AssignTableForReservation')
      connection.off('ReceiveNotification')
      connection.off('ReservationCreated')
    }
  }, [])

  return null
}
