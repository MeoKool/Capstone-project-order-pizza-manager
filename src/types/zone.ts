export default interface ZoneRequest {
  name: string
  description: string
  type: TYPEZONES
}
export interface ZoneResponse extends ZoneRequest {
  id: string
}

export type TYPEZONES = 'DininingArea' | 'WorkshopArea' | 'KitchenArea'

export interface ZoneResult {
  items: ZoneResponse[]
  totalCount: number
}
export interface ZoneUpdate {
  id: string
  name: string
  description: string
  type: TYPEZONES
}