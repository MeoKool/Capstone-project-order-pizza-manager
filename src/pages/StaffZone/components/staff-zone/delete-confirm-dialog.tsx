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
import type { StaffZone } from '@/services/staff-zone-service'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staffZone: StaffZone | null
  onConfirm: () => Promise<void>
  isDeleting: boolean
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  staffZone,
  onConfirm,
  isDeleting
}: DeleteConfirmDialogProps) {
  if (!staffZone) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa nhân viên</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa <span className='font-medium text-foreground'>{staffZone.staff.fullName}</span>{' '}
            khỏi khu vực <span className='font-medium text-foreground'>{staffZone.zone.name}</span>?
            <br />
            <br />
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isDeleting}
            className='bg-red-500 hover:bg-red-600 focus:ring-red-500'
          >
            {isDeleting ? (
              <>
                <svg
                  className='mr-2 h-4 w-4 animate-spin'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Đang xóa...
              </>
            ) : (
              'Xóa'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
