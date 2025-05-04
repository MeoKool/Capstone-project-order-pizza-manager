import ApiResponse, { get, put } from '@/apis/apiUtils'
import { ZoneResult, ZoneUpdate } from '@/types/zone'

export default class ZoneService {
  private static instance: ZoneService
  private constructor() { }
  public static getInstance(): ZoneService {
    if (!ZoneService.instance) {
      ZoneService.instance = new ZoneService()
    }
    return ZoneService.instance
  }
  public async getAllZones(): Promise<ApiResponse<ZoneResult>> {
    try {
      return await get<ZoneResult>(`/zones?SortBy=name`)
    } catch (error) {
      console.error('Error fetching all zones:', error)
      throw error
    }
  }
  public async updateZone(id: string, data: ZoneUpdate): Promise<ApiResponse<void>> {
    try {
      return await put<void>(`/zones/${id}`, data)
    } catch (error) {
      console.log(`Error update zone id: ${id}`, error);
      throw error
    }
  }

}
