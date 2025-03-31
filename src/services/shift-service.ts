import type ApiResponse from '@/apis/apiUtils'
import { get, post } from '@/apis/apiUtils'
import type { ShiftsResult, Shift, DaysResult, WorkingSlot, WorkingSlotsResult } from '@/types/shift'

class ShiftService {
  private static instance: ShiftService

  private constructor() {}

  public static getInstance(): ShiftService {
    if (!ShiftService.instance) {
      ShiftService.instance = new ShiftService()
    }
    return ShiftService.instance
  }

  public async getAllShifts(): Promise<ApiResponse<ShiftsResult>> {
    try {
      return await get<ShiftsResult>('/shifts')
    } catch (error) {
      console.error('Error fetching all shifts:', error)
      throw error
    }
  }

  public async createShift(data: { name: string; description: string }): Promise<ApiResponse<Shift>> {
    try {
      return await post<Shift>('/shifts', data)
    } catch (error) {
      console.error('Error creating shift:', error)
      throw error
    }
  }

  public async getAllDays(): Promise<ApiResponse<DaysResult>> {
    try {
      return await get<DaysResult>('/days')
    } catch (error) {
      console.error('Error fetching all days:', error)
      throw error
    }
  }

  public async createWorkingSlot(data: {
    shiftStart: string
    shiftEnd: string
    capacity: number
    dayId: string
    shiftId: string
  }): Promise<ApiResponse<WorkingSlot>> {
    try {
      return await post<WorkingSlot>('/working-slots', data)
    } catch (error) {
      console.error('Error creating working slot:', error)
      throw error
    }
  }

  public async getAllWorkingSlots(): Promise<ApiResponse<WorkingSlotsResult>> {
    try {
      return await get<WorkingSlotsResult>('/working-slots')
    } catch (error) {
      console.error('Error fetching all working slots:', error)
      throw error
    }
  }
}

export default ShiftService
