export default interface TableDataModels {
    id: string
    code: string
    capacity: number
    status: string
    zoneId: string
    currentOrderId: string | null
    currentOrder: any | null
    zone: any | null
}

export interface TableResult {
    items: TableDataModels[]
    totalCount: number
}