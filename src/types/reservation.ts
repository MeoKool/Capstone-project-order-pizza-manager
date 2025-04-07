export interface Reservation {
    id: string
    bookingTime: string
    numberOfPeople: number
    phoneNumber: string
    customerName: string
    status: string
    customerId: string
    tableId: string | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customer: any | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    table: any | null
}


export interface ReservationsResult {
    items: Reservation[] | Reservation
    totalCount: number
}

