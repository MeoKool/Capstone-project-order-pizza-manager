export interface Zone {
  id: string
  name: string
  description: string
  type: string
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
  username: string | null
  fullName: string
  phone: string
  email: string
  staffType: string
  status: string
}

export interface StaffSchedule {
  id: string
  staffName: string
  zoneName: string
  workingDate: string
  staffId: string
  zoneId: string
  workingSlotId: string
  staff: Staff
  zone: Zone
  workingSlot: WorkingSlot
}

export interface StaffSchedulesResult {
  items: StaffSchedule[]
  totalCount: number
}

export interface Shift {
  id: string
  name: string
  description: string
}

export interface ShiftsResult {
  items: Shift[]
  totalCount: number
}

export interface Day {
  id: string
  name: string
}

export interface DaysResult {
  items: Day[]
  totalCount: number
}

export interface WorkingSlotRegister {
  id: string
  staffName: string
  workingDate: string
  registerDate: string
  status: 'Approved' | 'Onhold' | 'Rejected'
  staffId: string
  workingSlotId: string
  staff: Staff | null
  workingSlot: WorkingSlot | null
}

export interface WorkingSlotRegistersResult {
  items: WorkingSlotRegister[]
  totalCount: number
}

export interface ZonesResult {
  items: Zone[]
  totalCount: number
}

export interface Config {
  id: string
  configType: string
  key: string
  value: string
}

export interface ConfigsResult {
  items: Config[]
  totalCount: number
}

export interface StaffZoneScheduleRequest {
  workingDate: string
  staffId: string
  zoneId: string
  workingSlotId: string
}
