export interface VoucherType {
  id: string
  batchCode: string
  description: string
  startDate: string
  endDate: string
  totalQuantity: number
  discountValue: number
  discountType: string
}

export interface VoucherTypeResult {
  items: VoucherType[]
  totalCount: number
}

export interface Voucher {
  id: string
  code: string
  discountType: string
  discountValue: number
  voucherStatus: 'Available' | 'Used' | 'PendingPayment' | 'PendingPayment'
  voucherBatchId: string
  voucherBatch: VoucherType | null
  expiryDate?: string
}

export interface VoucherResult {
  items: Voucher[]
  totalCount: number
}

export interface CreateVoucherTypeDto {
  batchCode: string
  description: string
  startDate: string
  endDate: string
  totalQuantity: number
  discountValue: number
  discountType: string
}

export interface CreateVoucherDto {
  code: string
  discountType: number
  expiryDate: string
  voucherTypeId: string
}
export interface AddVoucherToOrder {
  id: string
}

export interface OrderVoucher {
  id: string
  orderId: string
  voucherId: string
  voucher: Voucher
}
