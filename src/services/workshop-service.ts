import type ApiResponse from '@/apis/apiUtils'
import { get, post, put } from '@/apis/apiUtils'
import { Workshop, WorkshopCreate, WorkshopResult } from '@/types/workshop'

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
      return get<WorkshopResult>(`/workshops`)
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
  public cancelWorkshop(workshopId: string): Promise<ApiResponse<any>> {
    try {
      return put<any>(`/workshops/cancel-workshop`, { workshopId })
    } catch (error) {
      console.error('Error cancelling workshop:', error)
      throw error
    }
  }
  public updateWorkshop(workshopId: string): Promise<ApiResponse<any>> {
    try {
      return put<any>(`/workshops/cancel-workshop`, { workshopId })
    } catch (error) {
      console.error('Error cancelling workshop:', error)
      throw error
    }
  }
}
