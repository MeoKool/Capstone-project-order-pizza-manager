export interface Staff {
  id: string
  username: string
  fullName: string
  phone: string
  email: string
  staffType: StaffType
  status: 'FullTime' | 'PartTime'
  password: string
}

export interface StaffResult {
  items: Staff[]
  totalCount: number
}

export interface StaffModel {
  success: boolean
  result: StaffResult
  message: string
  statusCode: number
}

export enum StaffType {
  Staff = 'Staff',
  Manager = 'Manager',
  ChefF = 'Cheff'
}
