export type Customer = {
  id: string
  fullName: string | null
  phone: string
  address: string | null
  verifiedCodeEmail: string | null
  isVerifiedEmail: boolean
  gender: string | null
  dateOfBirth: string | null
  email: string | null
  appUserCustomerId: string | null
}
export type CustomerResult = {
  items: Customer[]
  totalCount: number
}
