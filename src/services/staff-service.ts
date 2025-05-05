import type ApiResponse from '@/apis/apiUtils'
import { get, post, put, del } from '@/apis/apiUtils'
import { Staff, StaffResult, StaffType } from '@/types/staff'

export interface CreateStaffDto {
  fullName: string
  phone: string
  email: string
  staffType: StaffType
  status: 'FullTime' | 'PartTime'
}

export interface UpdateStaffDto {
  fullName?: string
  phone?: string
  email?: string
  staffType?: StaffType
  status?: 'FullTime' | 'PartTime'
}

class StaffService {
  private static instance: StaffService

  private constructor() {}

  public static getInstance(): StaffService {
    if (!StaffService.instance) {
      StaffService.instance = new StaffService()
    }
    return StaffService.instance
  }

  /**
   * Get all staff members
   */
  public async getAllStaff(): Promise<ApiResponse<StaffResult>> {
    try {
      return await get<StaffResult>('/staffs?TakeCount=1000')
    } catch (error) {
      console.error('Error fetching all staff:', error)
      throw error
    }
  }

  /**
   * Get a staff member by ID
   */
  public async getStaffById(id: string): Promise<ApiResponse<Staff>> {
    try {
      return await get<Staff>(`/staffs/${id}`)
    } catch (error) {
      console.error(`Error fetching staff with id ${id}:`, error)
      throw error
    }
  }

  /**
   * Create a new staff member
   */
  public async createStaff(staffData: CreateStaffDto): Promise<ApiResponse<Staff>> {
    try {
      // Convert staffType and status to numeric values based on the API documentation

      return await post<Staff>('Admin/create-staff', staffData)
    } catch (error) {
      console.error('Error creating staff:', error)
      throw error
    }
  }

  /**
   * Update an existing staff member
   */
  public async updateStaff(id: string, staffData: UpdateStaffDto): Promise<ApiResponse<Staff>> {
    try {
      // Convert staffType and status to numeric values if they exist
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedStaffData: any = { ...staffData }

      if (staffData.staffType) {
        mappedStaffData.staffType = this.mapStaffTypeToNumber(staffData.staffType)
      }

      if (staffData.status) {
        mappedStaffData.status = this.mapStatusToNumber(staffData.status)
      }

      return await put<Staff>(`/staffs/${id}`, mappedStaffData)
    } catch (error) {
      console.error(`Error updating staff with id ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete a staff member
   */
  public async deleteStaff(ids: string[]): Promise<ApiResponse<unknown>> {
    try {
      return await del<unknown>('/staffs?isHardDeleted=false', { data: ids })
    } catch (error) {
      console.error(`Error deleting staff with ids ${ids.join(', ')}:`, error)
      throw error
    }
  }

  /**
   * Map staff type string to number according to API documentation
   * 0-Staff, 1-Manager, 2-Chef
   */
  private mapStaffTypeToNumber(staffType: StaffType): number {
    const mapping = {
      Staff: 0,
      Manager: 1,
      Cheff: 2,
      ScreenChef: 3,
      ScreenWaiter: 4
    }
    return mapping[staffType]
  }

  /**
   * Map status string to number according to API documentation
   * 0-PartTime, 1-FullTime
   */
  private mapStatusToNumber(status: 'FullTime' | 'PartTime'): number {
    const mapping = {
      PartTime: 0,
      FullTime: 1
    }
    return mapping[status]
  }
}

export default StaffService
