export interface Day {
  id: string
  name: string
}

export interface WorkingSlot {
  id: string
  shiftName: string
  dayName: string
  shiftStart: string
  shiftEnd: string
  capacity: number
  dayId: string
  shiftId: string
  day: any
  shift: any
}

export interface Staff {
  id: string
  username: string
  fullName: string
  phone: string
  email: string
  staffType: string
  status: string
}

export interface StaffAbsence {
  id: string
  staffId: string
  workingSlotId: string
  absentDate: string
  staff?: Staff | null
  workingSlot?: WorkingSlot | null
}

export interface DayResponse {
  success: boolean
  result: {
    items: Day[]
    totalCount: number
  }
  message: string
  statusCode: number
}

export interface WorkingSlotResponse {
  success: boolean
  result: {
    items: WorkingSlot[]
    totalCount: number
  }
  message: string
  statusCode: number
}

export interface StaffResponse {
  success: boolean
  result: {
    items: Staff[]
    totalCount: number
  }
  message: string
  statusCode: number
}

export interface StaffAbsenceResponse {
  success: boolean
  result: {
    items: StaffAbsence[]
    totalCount: number
  }
  message: string
  statusCode: number
}

export interface CreateStaffAbsenceRequest {
  staffId: string
  workingSlotId: string
  absentDate: string
}
