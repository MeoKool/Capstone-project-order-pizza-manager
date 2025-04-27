export interface WorkshopResult {
  items: Workshop[]
  totalCount: number
}

export interface WorkshopFoodDetail {
  id: string
  productId: string
  product: null | string // Replace with proper Product interface if available
  name: string
  price: number
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
  totalRegisteredParticipant: number
  zoneId: string
  zone: null | string
  zoneName: string
  workshopFoodDetails: WorkshopFoodDetail[]
}

export interface WorkshopCreate {
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
  maxPizzaPerRegister: number
  maxParticipantPerRegister: number
  productIds: string[]
  zoneId: string
}

export enum WorkshopStatus {
  Scheduled = 'Scheduled',
  OpeningToRegister = 'OpeningToRegister',
  CloseRegister = 'ClosedRegister',
  Closed = 'Closed',
  Opening = 'Opening',
  Cancelled = 'Cancelled'
}
