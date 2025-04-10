import type ApiResponse from '@/apis/apiUtils'
import { get } from '@/apis/apiUtils'
import type { Customer, CustomerResult } from '@/types/customer'

class CustomerService {
  private static instance: CustomerService

  private constructor() {}

  public static getInstance(): CustomerService {
    if (!CustomerService.instance) {
      CustomerService.instance = new CustomerService()
    }
    return CustomerService.instance
  }

  /**
   * Get all customers
   */
  public async getAllCustomers(): Promise<ApiResponse<CustomerResult>> {
    try {
      return await get<CustomerResult>('/customers?TakeCount=1000')
    } catch (error) {
      console.error('Error fetching all customers:', error)
      throw error
    }
  }

  /**
   * Get a customer by ID
   */
  public async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    try {
      return await get<Customer>(`/customers/${id}`)
    } catch (error) {
      console.error(`Error fetching customer with id ${id}:`, error)
      throw error
    }
  }
}

export default CustomerService
