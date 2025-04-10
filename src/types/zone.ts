export default interface ZoneRequest {
  name: string
  capacity: number
  description: string
  type: 'DininingArea' | 'WorkshopArea' | 'KitchenArea'
}
export interface ZoneResponse extends ZoneRequest {
  id: string
}

export interface ZoneResult {
  items: ZoneResponse[]
  totalCount: number
}
