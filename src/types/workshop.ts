export interface WorkshopResponse {
  success: boolean
  result: WorkshopResult
  message: string
  statusCode: number
}

export interface WorkshopResult {
  items: Workshop[]
  totalCount: number
}

export interface WorkshopFoodDetail {
  id: string
  productId: string
  product: null | string // Replace with proper Product interface if available
}

export interface Workshop {
  id: string
  name: string
  header: string
  description: string
  location: string
  organizer: string
  hotLineContact: string
  workshopDate: string
  startRegisterDate: string
  endRegisterDate: string
  totalFee: number
  maxRegister: number
  maxPizzaPerRegister: number
  maxParticipantPerRegister: number
  workshopStatus: WorkshopStatus
  zoneId: string
  zone: null | string
  zoneName: string
  workshopFoodDetails: WorkshopFoodDetail[] // Replace 'any' with a proper WorkshopFoodDetail interface if available
}

export enum WorkshopStatus {
  Scheduled = 'Scheduled',
  Opening = 'Opening',
  Closed = 'Closed',
  Approved = 'Approved',
  Cancelled = 'Cancelled'
}
