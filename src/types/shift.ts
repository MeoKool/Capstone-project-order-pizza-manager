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

export interface WorkingSlot {
  id: string
  shiftStart: string
  shiftEnd: string
  capacity: number
  dayId: string
  shiftId: string
  day?: Day
  shift?: Shift
  registeredCount?: number
}

export interface WorkingSlotsResult {
  items: WorkingSlot[]
  totalCount: number
}
