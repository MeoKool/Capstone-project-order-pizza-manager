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

interface SwapActionDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  action: 'approve' | 'reject' | null
  isSubmitting: boolean
  onConfirm: () => void
}

export function SwapActionDialog({ isOpen, onOpenChange, action, isSubmitting, onConfirm }: SwapActionDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {action === 'approve' ? 'Duyệt yêu cầu đổi ca' : 'Từ chối yêu cầu đổi ca'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {action === 'approve' ? (
              <div>
                <h1>Bạn có chắc chắn muốn duyệt yêu cầu đổi ca này?</h1>
                <h1>Hành động này sẽ cập nhật lịch làm việc của cả hai nhân viên.</h1>
              </div>
            ) : (
              'Bạn có chắc chắn muốn từ chối yêu cầu đổi ca này?'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={action === 'approve' ? 'bg-red-500 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'}
          >
            {isSubmitting ? 'Đang xử lý...' : action === 'approve' ? 'Duyệt' : 'Từ chối'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
