export interface Reservation {
    id: string
    bookingTime: string
    numberOfPeople: number
    phoneNumber: string
    customerName: string
    status: string
    customerId: string
    reservationPriorityStatus: ReservationPriorityStatus
    tableId: string | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customer: any | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    table: any | null
}
export enum ReservationPriorityStatus {
    NonPriority = "NonPriority",
    Priority = "Priority",
}

export interface ReservationsResult {
    items: Reservation[] | Reservation
    totalCount: number
}

