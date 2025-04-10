import ApiResponse, { get } from '@/apis/apiUtils'
import { ZoneResult } from '@/types/zone'

export default class ZoneService {
  private static instance: ZoneService
  private constructor() {}
  public static getInstance(): ZoneService {
    if (!ZoneService.instance) {
      ZoneService.instance = new ZoneService()
    }
    return ZoneService.instance
  }
  public getAllZones(): Promise<ApiResponse<ZoneResult>> {
    try {
      return get<ZoneResult>(`/zones?SortBy=name`)
    } catch (error) {
      console.error('Error fetching all zones:', error)
      throw error
    }
  }
}
