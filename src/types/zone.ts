export default interface ZoneRequest {
    name: string
    capacity: number,
    description: string
    status: ZoneStatus
}
export interface ZoneResponse extends ZoneRequest {
    id: string
}


export enum ZoneStatus {
    Available = 0,
    Unavailable = 1
}

export interface ZoneResult {
    items: ZoneResponse[]
    totalCount: number
}