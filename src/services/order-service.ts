import type ApiResponse from '@/apis/apiUtils'
import { get, post, put } from '@/apis/apiUtils'
import type { AddFoodResponse, CreateOrderResponse, OrderDetail, OrdersResult } from '@/types/order'

class OrderService {
  private static instance: OrderService

  private constructor() { }

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService()
    }
    return OrderService.instance
  }

  public async getAllOrders(): Promise<ApiResponse<OrdersResult>> {
    try {
      return await get<OrdersResult>(`/orders?TakeCount=1000`)
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw error
    }
  }

  public async createOrder(tableIdJson: string): Promise<ApiResponse<CreateOrderResponse>> {
    try {
      const { tableId } = JSON.parse(tableIdJson)
      return await post<CreateOrderResponse>('/orders', { tableId })
    } catch (error) {
      console.error('Error creating new order:', error)
      throw error
    }
  }

  public async addFoodToOrder(orderDataJson: string): Promise<ApiResponse<AddFoodResponse>> {
    try {
      const orderData = JSON.parse(orderDataJson)
      const response = await post<AddFoodResponse>('/orders/add-food-to-order', orderData)
      return response
    } catch (error) {
      console.error('Error adding food to existing order:', error)
      throw error
    }
  }

  public async getOrderById(orderId: string): Promise<ApiResponse<OrderDetail>> {
    try {
      return await get<OrderDetail>(`/orders/${orderId}?includeProperties=OrderItems.OrderItemDetails%2CAdditionalFees%2COrderVouchers.Voucher`)
    } catch (error) {
      console.error(`Error fetching order details with order id ${orderId}:`, error)
      throw error
    }
  }
  public async checkOutOrder(orderId: string): Promise<ApiResponse<void>> {
    try {
      return await put<void>(`/orders/check-out-order/${orderId}`)
    } catch (error) {
      console.error(`Error check out order with order id ${orderId}:`, error);
      throw error
    }
  }
  public async cancelCheckOutOrder(orderId: string): Promise<ApiResponse<void>> {
    try {
      return await put<void>(`/orders/cancel-check-out/${orderId}`)
    } catch (error) {
      console.error(`Error check out order with order id ${orderId}:`, error);
      throw error
    }
  }
}

export default OrderService
