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
import type { Voucher } from '@/types/voucher'

interface DeleteVoucherDialogProps {
  voucher: Voucher
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteVoucherDialog({ voucher, open, onOpenChange }: DeleteVoucherDialogProps) {
  const { deleteVoucher } = useVoucher()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteVoucher(voucher.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to delete voucher:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa voucher</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa voucher <span className='font-medium'>{voucher.code}</span>? Hành động này không
            thể hoàn tác.
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
              'Xóa voucher'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
