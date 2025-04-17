import ApiResponse, { del, get, post } from '@/apis/apiUtils'

export interface ReservationSlot {
  id: string
  startTime: string
  endTime: string
  capacity: number
}

export interface ReservationSlotResponse {
  success: boolean
  result: {
    items: ReservationSlot[]
    totalCount: number
  }
  message: string
  statusCode: number
}

export interface CreateReservationSlotDto {
  startTime: string
  endTime: string
  capacity: number
}

class ReservationSlotService {
  private static instance: ReservationSlotService
  private baseUrl = 'https://vietsac.id.vn/api/reservation-slot-config'

  private constructor() {}

  public static getInstance(): ReservationSlotService {
    if (!ReservationSlotService.instance) {
      ReservationSlotService.instance = new ReservationSlotService()
    }
    return ReservationSlotService.instance
  }

  public async getAllSlots(): Promise<ReservationSlotResponse> {
    try {
      return await get(`${this.baseUrl}?TakeCount=1000`)
    } catch (error) {
      console.error('Error fetching reservation slots:', error)
      throw error
    }
  }

  public async createSlot(data: CreateReservationSlotDto): Promise<ApiResponse<void>> {
    try {
      return await post<void>(this.baseUrl, data)
    } catch (error) {
      console.error('Error creating reservation slot:', error)
      throw error
    }
  }

  public async deleteSlot(id: string): Promise<ApiResponse<void>> {
    try {
      return await del(`${this.baseUrl}/${id}?isHardDeleted=false`)
    } catch (error) {
      console.error(`Error deleting reservation slot with id ${id}:`, error)
      throw error
    }
  }
}

export default ReservationSlotService
