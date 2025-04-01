import type ApiResponse from '@/apis/apiUtils'
import { get, post } from '@/apis/apiUtils'
import type {
  ShiftsResult,
  Shift,
  DaysResult,
  StaffSchedulesResult,
  WorkingSlotRegistersResult,
  ZonesResult,
  ConfigsResult,
  StaffZoneScheduleRequest
} from '@/types/staff-schedule'

class StaffScheduleService {
  private static instance: StaffScheduleService

  private constructor() {}

  public static getInstance(): StaffScheduleService {
    if (!StaffScheduleService.instance) {
      StaffScheduleService.instance = new StaffScheduleService()
    }
    return StaffScheduleService.instance
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
  }): Promise<ApiResponse<any>> {
    try {
      return await post<any>('/working-slots', data)
    } catch (error) {
      console.error('Error creating working slot:', error)
      throw error
    }
  }

  public async getStaffSchedules(params?: {
    year?: number
    month?: number
    day?: number
    dayOfWeek?: number
  }): Promise<ApiResponse<StaffSchedulesResult>> {
    try {
      const defaultParams = {
        year: 0,
        month: 0,
        day: 0,
        dayOfWeek: 0,
        IncludeProperties: 'Zone,Staff,WorkingSlot'
      }

      const queryParams = { ...defaultParams, ...params }

      return await get<StaffSchedulesResult>('/staff-zone-schedules', queryParams)
    } catch (error) {
      console.error('Error fetching staff schedules:', error)
      throw error
    }
  }

  public async getStaffSchedulesByDate(workingDate: string): Promise<ApiResponse<StaffSchedulesResult>> {
    try {
      return await get<StaffSchedulesResult>('/staff-zone-schedules', {
        WorkingDate: workingDate,
        IncludeProperties: 'WorkingSlot'
      })
    } catch (error) {
      console.error('Error fetching staff schedules by date:', error)
      throw error
    }
  }

  public async getWorkingSlotRegisters(): Promise<ApiResponse<WorkingSlotRegistersResult>> {
    try {
      const params = {
        IncludeProperties: 'WorkingSlot',
        SortBy: 'workingDate,WorkingSlot.dayName,WorkingSlot.shiftStart asc,WorkingSlot.shiftEnd asc,registerDate asc'
      }

      return await get<WorkingSlotRegistersResult>('/working-slot-registers', params)
    } catch (error) {
      console.error('Error fetching working slot registers:', error)
      throw error
    }
  }

  public async getZones(): Promise<ApiResponse<ZonesResult>> {
    try {
      return await get<ZonesResult>('/zones')
    } catch (error) {
      console.error('Error fetching zones:', error)
      throw error
    }
  }

  public async getConfigs(): Promise<ApiResponse<ConfigsResult>> {
    try {
      return await get<ConfigsResult>('/configs')
    } catch (error) {
      console.error('Error fetching configs:', error)
      throw error
    }
  }

  public async approveWorkingSlotRegister(registerId: string): Promise<ApiResponse<any>> {
    try {
      return await post<any>(`/working-slot-registers/approved/${registerId}`, {})
    } catch (error) {
      console.error('Error approving working slot register:', error)
      throw error
    }
  }

  public async createStaffZoneSchedule(data: StaffZoneScheduleRequest): Promise<ApiResponse<any>> {
    try {
      return await post<any>('/staff-zone-schedules', data)
    } catch (error) {
      console.error('Error creating staff zone schedule:', error)
      throw error
    }
  }
}

export default StaffScheduleService
