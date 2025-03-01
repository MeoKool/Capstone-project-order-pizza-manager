export default interface TableResponse {
    id: string
    code: string
    capacity: number
    status: TableStatus
    zoneId: string
    currentOrderId: string | null
    currentOrder: any | null
    zone: any | null
}

export interface TableResult {
    items: TableResponse[]
    totalCount: number
}

export type TableStatus = "Opening" | "Closing" | "Booked" | "Locked"