export default interface TableResponse {
  id: string
  code: string
  capacity: number
  status: TableStatus
  zoneId: string
  currentOrderId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentOrder: any | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  zone: any | null
}

export interface TableResult {
  items: TableResponse[]
  totalCount: number
}

export type TableStatus = 'Opening' | 'Closing' | 'Reserved' | 'Locked'
