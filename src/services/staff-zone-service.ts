import type ApiResponse from '@/apis/apiUtils'
import { get, put, post } from '@/apis/apiUtils'

export interface Staff {
  id: string
  username: string | null
  fullName: string
  phone: string
  email: string
  staffType: string
  status: string
}

export interface Zone {
  id: string
  name: string
  description: string
  type: string
}

export interface StaffZone {
  id: string
  note: string | null
  staffId: string
  zoneId: string
  staff: Staff
  zone: Zone
}

export interface StaffZoneResult {
  items: StaffZone[]
  totalCount: number
}

export interface CreateStaffZoneDto {
  staffId: string
  zoneId: string
  note?: string
}

export interface UpdateStaffZoneDto {
  staffId?: string
  zoneId?: string
  note?: string
}

// Add these new interfaces for Zone data
export interface ZoneResult {
  items: Zone[]
  totalCount: number
}

class StaffZoneService {
  private static instance: StaffZoneService

  private constructor() {}

  public static getInstance(): StaffZoneService {
    if (!StaffZoneService.instance) {
      StaffZoneService.instance = new StaffZoneService()
    }
    return StaffZoneService.instance
  }

  /**
   * Get all staff zones
   */
  public async getAllStaffZones(): Promise<ApiResponse<StaffZoneResult>> {
    try {
      return await get<StaffZoneResult>('/staff-zones?TakeCount=1000&SortBy=zone.name&IncludeProperties=Staff%2CZone')
    } catch (error) {
      console.error('Error fetching all staff zones:', error)
      throw error
    }
  }

  /**
   * Move a staff to a different zone
   */
  public async moveStaffToZone(staffZoneId: string, staffId: string, zoneId: string): Promise<ApiResponse<StaffZone>> {
    try {
      return await put<StaffZone>(`/staff-zones/${staffZoneId}`, {
        staffId,
        zoneId
      })
    } catch (error) {
      console.error(`Error moving staff ${staffId} to zone ${zoneId}:`, error)
      throw error
    }
  }

  /**
   * Get all zones
   */
  public async getAllZones(): Promise<ApiResponse<ZoneResult>> {
    try {
      return await get<ZoneResult>('/zones?TakeCount=100&SortBy=name')
    } catch (error) {
      console.error('Error fetching all zones:', error)
      throw error
    }
  }

  /**
   * Get staff for a specific zone
   */
  public async getStaffByZoneId(zoneId: string): Promise<ApiResponse<StaffZoneResult>> {
    try {
      return await get<StaffZoneResult>(
        `/staff-zones?ZoneId=${zoneId}&TakeCount=1000&SortBy=zone.name&IncludeProperties=Staff%2CZone`
      )
    } catch (error) {
      console.error(`Error fetching staff for zone ${zoneId}:`, error)
      throw error
    }
  }

  /**
   * Create a new staff zone assignment
   */
  public async createStaffZone(staffId: string, zoneId: string, note?: string): Promise<ApiResponse<StaffZone>> {
    try {
      const data: CreateStaffZoneDto = {
        staffId,
        zoneId
      }

      if (note) {
        data.note = note
      }

      return await post<StaffZone>('/staff-zones', data)
    } catch (error) {
      console.error(`Error creating staff zone assignment for staff ${staffId} in zone ${zoneId}:`, error)
      throw error
    }
  }
}

export default StaffZoneService
