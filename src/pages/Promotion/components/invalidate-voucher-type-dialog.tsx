'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Ban } from 'lucide-react'
import type { VoucherType } from '@/types/voucher'
import { useVoucher } from './voucher-provider'

interface InvalidateVoucherTypeDialogProps {
  voucherType: VoucherType
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvalidateVoucherTypeDialog({ voucherType, open, onOpenChange }: InvalidateVoucherTypeDialogProps) {
  const { invalidateVoucherType } = useVoucher()
  const [isLoading, setIsLoading] = useState(false)

  const handleInvalidate = async () => {
    try {
      setIsLoading(true)
      await invalidateVoucherType(voucherType.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Error invalidating voucher batch:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Ban className='h-5 w-5 text-destructive' />
            Vô hiệu hóa lô voucher
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn vô hiệu hóa lô voucher <span className='font-semibold'>{voucherType.batchCode}</span>?
            Hành động này sẽ làm cho tất cả các voucher trong lô này không thể sử dụng được nữa.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button variant='destructive' onClick={handleInvalidate} disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Vô hiệu hóa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
