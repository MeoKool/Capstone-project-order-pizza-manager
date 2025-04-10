import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import type { Customer } from '@/types/customer'

interface CustomerDetailDialogProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomerDetailDialog({ customer, open, onOpenChange }: CustomerDetailDialogProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa cập nhật'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px] rounded-xl shadow-lg border-0'>
        <DialogHeader className='pb-4 mb-4 border-b'>
          <DialogTitle className='text-xl font-bold'>Thông tin khách hàng</DialogTitle>
          <DialogDescription className='text-muted-foreground mt-1'>
            Chi tiết thông tin của khách hàng.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          <div className='grid grid-cols-1 gap-4'>
            <div>
              <h3 className='text-sm font-medium text-muted-foreground mb-1'>Họ và tên</h3>
              <p className='text-base font-medium'>{customer.fullName || 'Chưa cập nhật'}</p>
            </div>

            <Separator />

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <h3 className='text-sm font-medium text-muted-foreground mb-1'>Email</h3>
                <p className='text-base'>{customer.email || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <h3 className='text-sm font-medium text-muted-foreground mb-1'>Trạng thái xác thực</h3>
                <Badge
                  variant={customer.isVerifiedEmail ? 'default' : 'secondary'}
                  className={
                    customer.isVerifiedEmail
                      ? 'bg-green-100 text-green-800 hover:bg-green-200 border-0'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-0'
                  }
                >
                  {customer.isVerifiedEmail ? 'Đã xác thực' : 'Chưa xác thực'}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <h3 className='text-sm font-medium text-muted-foreground mb-1'>Số điện thoại</h3>
                <p className='text-base'>{customer.phone}</p>
              </div>
              <div>
                <h3 className='text-sm font-medium text-muted-foreground mb-1'>Giới tính</h3>
                {customer.gender ? (
                  <Badge
                    variant='outline'
                    className={
                      customer.gender === 'Male'
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-0'
                        : customer.gender === 'Female'
                          ? 'bg-pink-100 text-pink-800 hover:bg-pink-200 border-0'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-0'
                    }
                  >
                    {customer.gender === 'Male' ? 'Nam' : customer.gender === 'Female' ? 'Nữ' : 'Khác'}
                  </Badge>
                ) : (
                  'Chưa cập nhật'
                )}
              </div>
            </div>

            <Separator />

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <h3 className='text-sm font-medium text-muted-foreground mb-1'>Ngày sinh</h3>
                <p className='text-base'>{formatDate(customer.dateOfBirth)}</p>
              </div>
              <div>
                <h3 className='text-sm font-medium text-muted-foreground mb-1'>ID người dùng</h3>
                <p className='text-base truncate' title={customer.appUserCustomerId || 'Chưa cập nhật'}>
                  {customer.appUserCustomerId ? customer.appUserCustomerId.substring(0, 8) + '...' : 'Chưa cập nhật'}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className='text-sm font-medium text-muted-foreground mb-1'>Địa chỉ</h3>
              <p className='text-base'>{customer.address || 'Chưa cập nhật'}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
