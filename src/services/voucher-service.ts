import type ApiResponse from '@/apis/apiUtils'
import { get, post, put, del } from '@/apis/apiUtils'
import {
  Voucher,
  VoucherResult,
  VoucherType,
  VoucherTypeResult,
  CreateVoucherTypeDto,
  CreateVoucherDto,
  AddVoucherToOrder
} from '@/types/voucher'

class VoucherService {
  private static instance: VoucherService

  private constructor() { }

  public static getInstance(): VoucherService {
    if (!VoucherService.instance) {
      VoucherService.instance = new VoucherService()
    }
    return VoucherService.instance
  }

  // Voucher Type APIs
  public async getAllVoucherTypes(): Promise<ApiResponse<VoucherTypeResult>> {
    try {
      return await get<VoucherTypeResult>('/voucher-types?TakeCount=1000')
    } catch (error) {
      console.error('Error fetching all voucher types:', error)
      throw error
    }
  }

  public async getVoucherTypeById(id: string): Promise<ApiResponse<VoucherType>> {
    try {
      return await get<VoucherType>(`/voucher-types/${id}`)
    } catch (error) {
      console.error(`Error fetching voucher type with id ${id}:`, error)
      throw error
    }
  }

  public async createVoucherType(data: CreateVoucherTypeDto): Promise<ApiResponse<VoucherType>> {
    try {
      return await post<VoucherType>('/voucher-types', data)
    } catch (error) {
      console.error('Error creating voucher type:', error)
      throw error
    }
  }

  public async updateVoucherType(id: string, data: Partial<CreateVoucherTypeDto>): Promise<ApiResponse<VoucherType>> {
    try {
      return await put<VoucherType>(`/voucher-types/${id}`, data)
    } catch (error) {
      console.error(`Error updating voucher type with id ${id}:`, error)
      throw error
    }
  }

  public async deleteVoucherType(id: string): Promise<ApiResponse<unknown>> {
    try {
      return await del<unknown>(`/voucher-types/${id}`)
    } catch (error) {
      console.error(`Error deleting voucher type with id ${id}:`, error)
      throw error
    }
  }

  // Voucher APIs
  public async getAllVouchers(): Promise<ApiResponse<VoucherResult>> {
    try {
      return await get<VoucherResult>('/vouchers?TakeCount=10000')
    } catch (error) {
      console.error('Error fetching all vouchers:', error)
      throw error
    }
  }

  public async getVoucherById(id: string): Promise<ApiResponse<Voucher>> {
    try {
      return await get<Voucher>(`/vouchers/${id}`)
    } catch (error) {
      console.error(`Error fetching voucher with id ${id}:`, error)
      throw error
    }
  }

  public async createVoucher(data: CreateVoucherDto): Promise<ApiResponse<Voucher>> {
    try {
      return await post<Voucher>('/vouchers', data)
    } catch (error) {
      console.error('Error creating voucher:', error)
      throw error
    }
  }

  public async createBulkVouchers(voucherTypeId: string, quantity: number): Promise<ApiResponse<Voucher[]>> {
    try {
      return await post<Voucher[]>('/vouchers/bulk', { voucherTypeId, quantity })
    } catch (error) {
      console.error('Error creating bulk vouchers:', error)
      throw error
    }
  }

  public async updateVoucher(id: string, data: Partial<CreateVoucherDto>): Promise<ApiResponse<Voucher>> {
    try {
      return await put<Voucher>(`/vouchers/${id}`, data)
    } catch (error) {
      console.error(`Error updating voucher with id ${id}:`, error)
      throw error
    }
  }

  public async deleteVoucher(id: string): Promise<ApiResponse<unknown>> {
    try {
      return await del<unknown>(`/vouchers/${id}`)
    } catch (error) {
      console.error(`Error deleting voucher with id ${id}:`, error)
      throw error
    }
  }
  public async getVoucherByCode(code: string): Promise<ApiResponse<Voucher>> {
    try {
      return await get<Voucher>(`/vouchers/get-by-code?Code=${code}`)
    } catch (error) {
      console.error(`Error getget voucher with id ${code}:`, error)
      throw error
    }
  }
  public async addVoucherToOrder(orderId: string, voucherId: string): Promise<ApiResponse<AddVoucherToOrder>> {
    try {
      const payload = {
        orderId,
        voucherId
      };
      return await post<AddVoucherToOrder>(`/order-vouchers`, payload)
    } catch (error) {
      console.error(`Error add voucher to order `, error)
      throw error
    }
  }
  public async removeVoucherOfOrder(id: string): Promise<ApiResponse<void>> {
    try {
      return await del<void>(`/order-vouchers/${id}?isHardDeleted=false`)
    } catch (error) {
      console.error(`Error add voucher to order `, error)
      throw error
    }
  }
}

export default VoucherService
