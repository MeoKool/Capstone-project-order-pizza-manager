import type ApiResponse from '@/apis/apiUtils'
import { get, post, put } from '@/apis/apiUtils'
import { Workshop, WorkshopCreate, WorkshopResult } from '@/types/workshop'

// Add this new interface for workshop registrations
interface WorkshopRegisterResult {
  items: WorkshopRegister[]
  totalCount: number
}

interface WorkshopRegister {
  id: string
  customerPhone: string
  customerName: string
  workshopId: string
  workshopRegisterStatus: string
  registeredAt: string
  totalParticipant: number
  totalFee: number
  code: string
  tableId: string | null
  tableCode: string | null
}

export default class WorkshopService {
  private static instance: WorkshopService

  private constructor() {}

  public static getInstance(): WorkshopService {
    if (!WorkshopService.instance) {
      WorkshopService.instance = new WorkshopService()
    }
    return WorkshopService.instance
  }

  public getAllWorkshops(): Promise<ApiResponse<WorkshopResult>> {
    try {
      return get<WorkshopResult>(`/workshops?TakeCount=1000&IncludeProperties=WorkshopFoodDetails`)
    } catch (error) {
      console.error('Error fetching all workshops:', error)
      throw error
    }
  }

  public getWorkshopById(id: string): Promise<ApiResponse<Workshop>> {
    try {
      return get<Workshop>(`/workshops/${id}?includeProperties=WorkshopFoodDetails`)
    } catch (error) {
      console.error(`Error fetching workshop with ID ${id}:`, error)
      throw error
    }
  }

  public createWorkshop(workshop: WorkshopCreate): Promise<ApiResponse<Workshop>> {
    try {
      return post<Workshop>(`/workshops`, workshop)
    } catch (error) {
      console.error('Error creating workshop:', error)
      throw error
    }
  }
  public cancelWorkshop(workshopId: string): Promise<ApiResponse<void>> {
    try {
      return put<void>(`/workshops/cancel-workshop`, { workshopId })
    } catch (error) {
      console.error('Error cancelling workshop:', error)
      throw error
    }
  }
  public updateWorkshop(workshopId: string, payload: object): Promise<ApiResponse<void>> {
    try {
      return put<void>(`/workshops/update-workshop`, { workshopId, payload })
    } catch (error) {
      console.error('Error cancelling workshop:', error)
      throw error
    }
  }

  // Add this new method to the WorkshopService class
  public getWorkshopRegistrations(workshopId: string): Promise<ApiResponse<WorkshopRegisterResult>> {
    try {
      return get<WorkshopRegisterResult>(`/workshop-register?WorkshopId=${workshopId}`)
    } catch (error) {
      console.error(`Error fetching registrations for workshop ${workshopId}:`, error)
      throw error
    }
  }
}
