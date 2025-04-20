import {
  CreateStaffAbsenceRequest,
  DayResponse,
  StaffAbsenceResponse,
  StaffResponse,
  WorkingSlotResponse
} from '@/types/staff-absence'

export default class StaffAbsenceService {
  private static instance: StaffAbsenceService

  private constructor() {}

  public static getInstance(): StaffAbsenceService {
    if (!StaffAbsenceService.instance) {
      StaffAbsenceService.instance = new StaffAbsenceService()
    }
    return StaffAbsenceService.instance
  }

  public async getAllDays(): Promise<DayResponse> {
    try {
      const response = await fetch('https://vietsac.id.vn/api/days')
      return await response.json()
    } catch (error) {
      console.error('Error fetching days:', error)
      throw error
    }
  }

  public async getWorkingSlotsByDayId(dayId: string): Promise<WorkingSlotResponse> {
    try {
      const response = await fetch(`https://vietsac.id.vn/api/working-slots?DayId=${dayId}`)
      return await response.json()
    } catch (error) {
      console.error(`Error fetching working slots for day ${dayId}:`, error)
      throw error
    }
  }

  public async getAllStaff(): Promise<StaffResponse> {
    try {
      const response = await fetch('https://vietsac.id.vn/api/staffs?TakeCount=1000')
      return await response.json()
    } catch (error) {
      console.error('Error fetching staff:', error)
      throw error
    }
  }

  public async getAllAbsences(): Promise<StaffAbsenceResponse> {
    try {
      const response = await fetch(
        'https://vietsac.id.vn/api/staff-absences?TakeCount=1000&IncludeProperties=WorkingSlot&SortBy=WorkingSlot.shiftStart'
      )
      return await response.json()
    } catch (error) {
      console.error('Error fetching absences:', error)
      throw error
    }
  }

  public async createAbsence(request: CreateStaffAbsenceRequest): Promise<any> {
    try {
      const response = await fetch('https://vietsac.id.vn/api/staff-absences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })
      return await response.json()
    } catch (error) {
      console.error('Error creating absence:', error)
      throw error
    }
  }

  public async deleteAbsence(id: string): Promise<any> {
    try {
      const response = await fetch(`https://vietsac.id.vn/api/staff-absences/${id}?isHardDeleted=false`, {
        method: 'DELETE'
      })
      return await response.json()
    } catch (error) {
      console.error(`Error deleting absence ${id}:`, error)
      throw error
    }
  }
}
