import { useState, useEffect } from 'react'
import type { Order } from '@/types/order'
import OrderService from '@/services/order-service'

const orderService = OrderService.getInstance()

export default function useOrderService() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await orderService.getAllOrders()
      if (response?.success && response.result) {
        setOrders(response.result.items)
      }
    } catch (err) {
      setError('Failed to fetch orders')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const getOrderById = async (orderId: string) => {
    try {
      return await orderService.getOrderById(orderId)
    } catch (err) {
      setError('Failed to fetch order details')
      console.error(err)
      return null
    }
  }

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    getOrderById
  }
}
