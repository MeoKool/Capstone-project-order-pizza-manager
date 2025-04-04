import type ApiResponse from '@/apis/apiUtils'
import { get, post, put } from '@/apis/apiUtils'
import type {
  ShiftsResult,
  Shift,
  DaysResult,
  StaffSchedulesResult,
  WorkingSlotRegistersResult,
  ZonesResult,
  ConfigsResult,
  StaffZoneScheduleRequest,
  SwapWorkingSlotRequestsResult,
  WorkingSlot
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
        TakeCount: 1000,
        IncludeProperties: 'Zone,Staff,WorkingSlot'
      }

      const queryParams = { ...defaultParams, ...params }

      return await get<StaffSchedulesResult>('https://vietsac.id.vn/api/staff-zone-schedules', queryParams)
    } catch (error) {
      console.error('Error fetching staff schedules:', error)
      throw error
    }
  }

  public async getStaffSchedulesByDate(workingDate: string): Promise<ApiResponse<StaffSchedulesResult>> {
    try {
      return await get<StaffSchedulesResult>('https://vietsac.id.vn/api/staff-zone-schedules', {
        WorkingDate: workingDate,
        IncludeProperties: 'Zone,Staff,WorkingSlot',
        TakeCount: 1000
      })
    } catch (error) {
      console.error('Error fetching staff schedules by date:', error)
      throw error
    }
  }

  public async getWorkingSlotRegisters(): Promise<ApiResponse<WorkingSlotRegistersResult>> {
    try {
      const params = {
        SortBy: 'registerDate',
        IncludeProperties: 'WorkingSlot',
        TakeCount: 1000
      }

      return await get<WorkingSlotRegistersResult>('https://vietsac.id.vn/api/working-slot-registers', params)
    } catch (error) {
      console.error('Error fetching working slot registers:', error)
      throw error
    }
  }

  public async getZones(): Promise<ApiResponse<ZonesResult>> {
    try {
      return await get<ZonesResult>('https://vietsac.id.vn/api/zones')
    } catch (error) {
      console.error('Error fetching zones:', error)
      throw error
    }
  }

  public async getConfigs(): Promise<ApiResponse<ConfigsResult>> {
    try {
      return await get<ConfigsResult>('https://vietsac.id.vn/api/configs')
    } catch (error) {
      console.error('Error fetching configs:', error)
      throw error
    }
  }

  public async approveWorkingSlotRegister(registerId: string): Promise<ApiResponse<any>> {
    try {
      return await put<any>(`https://vietsac.id.vn/api/working-slot-registers/approved/${registerId}`, {})
    } catch (error) {
      console.error('Error approving working slot register:', error)
      throw error
    }
  }

  public async createStaffZoneSchedule(data: StaffZoneScheduleRequest): Promise<ApiResponse<any>> {
    try {
      return await post<any>('https://vietsac.id.vn/api/staff-zone-schedules', data)
    } catch (error) {
      console.error('Error creating staff zone schedule:', error)
      throw error
    }
  }

  public async getSwapWorkingSlotRequests(): Promise<ApiResponse<SwapWorkingSlotRequestsResult>> {
    try {
      return await get<SwapWorkingSlotRequestsResult>(
        'https://vietsac.id.vn/api/swap-working-slots?Status=PendingManagerApprove&SortBy=requestDate'
      )
    } catch (error) {
      console.error('Error fetching swap working slot requests:', error)
      throw error
    }
  }

  public async getWorkingSlotById(id: string): Promise<ApiResponse<WorkingSlot>> {
    try {
      return await get<WorkingSlot>(`https://vietsac.id.vn/api/working-slots/${id}`)
    } catch (error) {
      console.error('Error fetching working slot by id:', error)
      throw error
    }
  }

  public async approveSwapWorkingSlot(id: string): Promise<ApiResponse<any>> {
    try {
      return await put<any>(`https://vietsac.id.vn/api/swap-working-slots/approved/${id}`, {})
    } catch (error) {
      console.error('Error approving swap working slot:', error)
      throw error
    }
  }

  public async rejectSwapWorkingSlot(id: string): Promise<ApiResponse<any>> {
    try {
      return await put<any>(`https://vietsac.id.vn/api/swap-working-slots/rejected/${id}`, {})
    } catch (error) {
      console.error('Error rejecting swap working slot:', error)
      throw error
    }
  }
}

export default StaffScheduleService
