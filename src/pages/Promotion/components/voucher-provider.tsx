'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Voucher, VoucherType, CreateVoucherTypeDto, CreateVoucherDto } from '@/types/voucher'
import VoucherService from '@/services/voucher-service'
import { toast } from 'sonner'

interface VoucherContextType {
  vouchers: Voucher[]
  voucherTypes: VoucherType[]
  voucherTotalCount: number
  voucherTypeTotalCount: number
  loading: boolean
  error: string | null
  fetchVouchers: () => Promise<void>
  fetchVoucherTypes: () => Promise<void>
  addVoucherType: (voucherType: CreateVoucherTypeDto) => Promise<void>
  updateVoucherType: (id: string, voucherType: Partial<CreateVoucherTypeDto>) => Promise<void>
  deleteVoucherType: (id: string) => Promise<void>
  addVoucher: (voucher: CreateVoucherDto) => Promise<void>
  createBulkVouchers: (voucherTypeId: string, quantity: number) => Promise<void>
  updateVoucher: (id: string, voucher: Partial<CreateVoucherDto>) => Promise<void>
  deleteVoucher: (id: string) => Promise<void>
}

const VoucherContext = createContext<VoucherContextType | undefined>(undefined)

export function VoucherProvider({ children }: { children: ReactNode }) {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [voucherTypes, setVoucherTypes] = useState<VoucherType[]>([])
  const [voucherTotalCount, setVoucherTotalCount] = useState(0)
  const [voucherTypeTotalCount, setVoucherTypeTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const voucherService = VoucherService.getInstance()

  const fetchVouchers = async () => {
    setLoading(true)
    try {
      const response = await voucherService.getAllVouchers()

      if (response.success) {
        setVouchers(response.result.items)
        setVoucherTotalCount(response.result.totalCount)
      } else {
        setError(response.message || 'Failed to fetch vouchers data')
      }
    } catch (err) {
      setError('An error occurred while fetching vouchers data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchVoucherTypes = async () => {
    setLoading(true)
    try {
      const response = await voucherService.getAllVoucherTypes()

      if (response.success) {
        setVoucherTypes(response.result.items)
        setVoucherTypeTotalCount(response.result.totalCount)
      } else {
        setError(response.message || 'Failed to fetch voucher types data')
      }
    } catch (err) {
      setError('An error occurred while fetching voucher types data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addVoucherType = async (voucherType: CreateVoucherTypeDto) => {
    console.log('Adding voucher type:', voucherType)
    try {
      const response = await voucherService.createVoucherType(voucherType)
      console.log('Add voucher type response:', response)

      if (response.success) {
        toast.success('Tạo loại voucher thành công')
        await fetchVoucherTypes()
      } else {
        console.error('Failed to add voucher type:', response.message)
        toast.error(response.message || 'Tạo loại voucher thất bại')
        throw new Error(response.message)
      }
    } catch (err) {
      console.error('Error adding voucher type:', err)
      toast.error('Đã xảy ra lỗi khi tạo loại voucher')
      throw err
    }
  }

  const updateVoucherType = async (id: string, voucherType: Partial<CreateVoucherTypeDto>) => {
    console.log('Updating voucher type:', { id, voucherType })
    try {
      const response = await voucherService.updateVoucherType(id, voucherType)
      console.log('Update voucher type response:', response)

      if (response.success) {
        toast.success('Cập nhật loại voucher thành công')
        setVoucherTypes((prev) => prev.map((type) => (type.id === id ? { ...type, ...voucherType } : type)))
      } else {
        console.error('Failed to update voucher type:', response.message)
        toast.error(response.message || 'Cập nhật loại voucher thất bại')
        throw new Error(response.message)
      }
    } catch (err) {
      console.error('Error updating voucher type:', err)
      toast.error('Đã xảy ra lỗi khi cập nhật loại voucher')
      throw err
    }
  }

  const deleteVoucherType = async (id: string) => {
    console.log('Deleting voucher type:', id)
    try {
      const response = await voucherService.deleteVoucherType(id)
      console.log('Delete voucher type response:', response)

      if (response.success) {
        toast.success('Xóa loại voucher thành công')
        setVoucherTypes((prev) => prev.filter((type) => type.id !== id))
        setVoucherTypeTotalCount((prev) => prev - 1)
      } else {
        console.error('Failed to delete voucher type:', response.message)
        toast.error(response.message || 'Xóa loại voucher thất bại')
        throw new Error(response.message)
      }
    } catch (err) {
      console.error('Error deleting voucher type:', err)
      toast.error('Đã xảy ra lỗi khi xóa loại voucher')
      throw err
    }
  }

  const addVoucher = async (voucher: CreateVoucherDto) => {
    console.log('Adding voucher:', voucher)
    try {
      const response = await voucherService.createVoucher(voucher)
      console.log('Add voucher response:', response)

      if (response.success) {
        toast.success('Tạo voucher thành công')
        await fetchVouchers()
      } else {
        console.error('Failed to add voucher:', response.message)
        toast.error(response.message || 'Tạo voucher thất bại')
        throw new Error(response.message)
      }
    } catch (err) {
      console.error('Error adding voucher:', err)
      toast.error('Đã xảy ra lỗi khi tạo voucher')
      throw err
    }
  }

  const createBulkVouchers = async (voucherTypeId: string, quantity: number) => {
    console.log('Creating bulk vouchers:', { voucherTypeId, quantity })
    try {
      const response = await voucherService.createBulkVouchers(voucherTypeId, quantity)
      console.log('Create bulk vouchers response:', response)

      if (response.success) {
        toast.success(`Tạo ${quantity} voucher thành công`)
        await fetchVouchers()
      } else {
        console.error('Failed to create bulk vouchers:', response.message)
        toast.error(response.message || 'Tạo voucher hàng loạt thất bại')
        throw new Error(response.message)
      }
    } catch (err) {
      console.error('Error creating bulk vouchers:', err)
      toast.error('Đã xảy ra lỗi khi tạo voucher hàng loạt')
      throw err
    }
  }

  const updateVoucher = async (id: string, voucher: Partial<CreateVoucherDto>) => {
    console.log('Updating voucher:', { id, voucher })
    try {
      const response = await voucherService.updateVoucher(id, voucher)
      console.log('Update voucher response:', response)

      if (response.success) {
        toast.success('Cập nhật voucher thành công')
        setVouchers((prev) =>
          prev.map((v) => {
            if (v.id === id) {
              // Ensure discountType is always a string
              const updatedVoucher = {
                ...v,
                ...voucher,
                discountType:
                  typeof voucher.discountType === 'number'
                    ? String(voucher.discountType)
                    : voucher.discountType || v.discountType
              }
              return updatedVoucher as Voucher
            }
            return v
          })
        )
      } else {
        console.error('Failed to update voucher:', response.message)
        toast.error(response.message || 'Cập nhật voucher thất bại')
        throw new Error(response.message)
      }
    } catch (err) {
      console.error('Error updating voucher:', err)
      toast.error('Đã xảy ra lỗi khi cập nhật voucher')
      throw err
    }
  }

  const deleteVoucher = async (id: string) => {
    console.log('Deleting voucher:', id)
    try {
      const response = await voucherService.deleteVoucher(id)
      console.log('Delete voucher response:', response)

      if (response.success) {
        toast.success('Xóa voucher thành công')
        setVouchers((prev) => prev.filter((v) => v.id !== id))
        setVoucherTotalCount((prev) => prev - 1)
      } else {
        console.error('Failed to delete voucher:', response.message)
        toast.error(response.message || 'Xóa voucher thất bại')
        throw new Error(response.message)
      }
    } catch (err) {
      console.error('Error deleting voucher:', err)
      toast.error('Đã xảy ra lỗi khi xóa voucher')
      throw err
    }
  }

  useEffect(() => {
    fetchVouchers()
    fetchVoucherTypes()
  }, [])

  const value = {
    vouchers,
    voucherTypes,
    voucherTotalCount,
    voucherTypeTotalCount,
    loading,
    error,
    fetchVouchers,
    fetchVoucherTypes,
    addVoucherType,
    updateVoucherType,
    deleteVoucherType,
    addVoucher,
    createBulkVouchers,
    updateVoucher,
    deleteVoucher
  }

  return <VoucherContext.Provider value={value}>{children}</VoucherContext.Provider>
}

export function useVoucher() {
  const context = useContext(VoucherContext)
  if (context === undefined) {
    throw new Error('useVoucher must be used within a VoucherProvider')
  }
  return context
}
