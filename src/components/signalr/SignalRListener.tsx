import { connection } from '@/lib/signalr-client'
import { useEffect } from 'react'
import {
  showAssignTableToast,
  showCancelDishToast,
  showGeneralNotificationToast,
  showReservationCreatedToast
} from '../custom-toast'
import { useNavigate } from 'react-router-dom'

let isConnected = false

type Notification = {
  id: number
  type: number
  title: string
  message: string
  payload: string
  createdAt: string
}

interface ReservationCreatedNotification {
  id?: string
  customerName: string
  phoneNumber: string
  numberOfPeople: number
  duration?: number
  onClickNavigateToTable?: () => void
  arrivalTime?: string
}

interface OrderItemCancelledStatus {
  name: string
  tableCode: string
  reasonCancel: string
  quantity: number
  endTime: string
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
  const navigate = useNavigate()

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
      const toastType = getNotificationType(3)
      showGeneralNotificationToast(data.title, data.message, toastType)
    })

    // Handle reservation created notifications with custom styling
    connection.on('ReservationCreated', (data: ReservationCreatedNotification) => {
      console.log('ReservationCreated', data)

      showReservationCreatedToast({
        customerName: data.customerName,
        phoneNumber: data.phoneNumber,
        numberOfPeople: data.numberOfPeople,
        id: data.id,
        duration: data.duration,
        onClickNavigateToTable: () => navigate('/in-tables/booking')
      })
    })

    // Handle assign table notifications with custom styling
    connection.on('AssignTableForReservation', (data: ReservationCreatedNotification) => {
      showAssignTableToast({
        customerName: data.customerName,
        phoneNumber: data.phoneNumber,
        numberOfPeople: data.numberOfPeople,
        id: data.id,
        duration: data.duration,
        onClickNavigateToTable: () => navigate('/in-tables/booking')
      })
    })

    connection.on('OrderItemCancelledStatus', (data: OrderItemCancelledStatus) => {
      console.log('OrderItemCancelledStatus', data)
      showCancelDishToast({
        name: data.name,
        tableCode: data.tableCode,
        reasonCancel: data.reasonCancel,
        quantity: data.quantity,
        endTime: data.endTime
      })
    })
    connection.on('PaymentSuccess', () => {})
    // Empty handler for OrderItemUpdatedStatus
    connection.on('OrderItemUpdatedStatus', () => {})
    // Clean up event listeners on component unmount
    return () => {
      connection.off('OrderItemUpdatedStatus')
      connection.off('AssignTableForReservation')
      connection.off('ReceiveNotification')
      connection.off('ReservationCreated')
      connection.off('OrderItemCancelledStatus')
      connection.off('PaymentSuccess')
    }
  }, [])

  return null
}
