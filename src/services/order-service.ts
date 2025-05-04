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
  public async swapTable(orderId: string, newTableId: string): Promise<ApiResponse<void>> {
    try {
      const req = {
        orderId,
        newTableId
      }
      return await put(`/orders/swap-table-order/${orderId}`, req)
    } catch (error) {
      console.log(`error swap table with orderId ${orderId}`, error);
      throw error

    }
  }
  public async cancelOrder(orderId: string, note: string): Promise<ApiResponse<void>> {
    try {
      const req = {
        orderId,
        note
      }
      return await put(`/orders/cancel-order/${orderId}`, req)
    } catch (error) {
      console.log(`err cancelOrder with order Id ${orderId} `, error);
      throw error
    }
  }


  public async cancelOrderItem(id: string, note: string): Promise<ApiResponse<void>> {
    try {
      const req = JSON.stringify(note)

      return await put<void>(`/order-items/cancelled/${id}`, req)
    } catch (error) {
      console.log(`error cancel order item with id ${id}`, error);
      throw error
    }
  }

}

export default OrderService
