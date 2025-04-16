import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import { useVoucher } from './voucher-provider'
import type { VoucherType } from '@/types/voucher'

interface DeleteVoucherTypeDialogProps {
  voucherType: VoucherType
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteVoucherTypeDialog({ voucherType, open, onOpenChange }: DeleteVoucherTypeDialogProps) {
  const { deleteVoucherType } = useVoucher()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteVoucherType(voucherType.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to delete voucher type:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa loại voucher</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa loại voucher <span className='font-medium'>{voucherType.batchCode}</span>? Hành
            động này không thể hoàn tác và sẽ xóa tất cả các voucher thuộc loại này.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isDeleting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang xóa...
              </>
            ) : (
              'Xóa loại voucher'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
