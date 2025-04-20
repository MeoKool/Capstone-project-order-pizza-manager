import { ReservationPriorityStatus, TableAssignReservation } from "./reservation"

export default interface TableResponse {
  id: string
  code: string
  capacity: number
  status: TableStatus
  zoneId: string
  note: string
  currentOrderId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentOrder: any | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  zone: any | null
  tableMergeId: string | null,
  tableMergeName: string | null,
  tableMerge: TableMerge,
  currentReservationId: string
  currentReservation: CurrentReservation
}
export interface TableMerge {
  id: string,
  name: string
}
export interface CurrentReservation {
  id: string
  bookingTime: string
  numberOfPeople: number
  phoneNumber: string
  customerName: string
  status: string
  customerId: string
  reservationPriorityStatus: ReservationPriorityStatus
  tableId: string | null
  tableAssignReservations: TableAssignReservation[]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customer: any | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any | null
}

export interface TableResult {
  items: TableResponse[]
  totalCount: number
}

export type TableStatus = 'Opening' | 'Closing' | 'Reserved' | 'Locked'
