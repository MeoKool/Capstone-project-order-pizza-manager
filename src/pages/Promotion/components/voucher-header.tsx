import { Button } from '@/components/ui/button'
import { PlusCircle, Ticket } from 'lucide-react'
import { useVoucher } from './voucher-provider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface VoucherHeaderProps {
  onAddVoucherType: () => void
  onAddVoucher: () => void
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function VoucherHeader({ onAddVoucherType, onAddVoucher, activeTab, setActiveTab }: VoucherHeaderProps) {
  const { voucherTotalCount, voucherTypeTotalCount } = useVoucher()

  return (
    <div className='flex flex-col gap-4 mb-8 bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border shadow-sm'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Quản lý Voucher</h1>
          <p className='text-muted-foreground mt-1'>Tạo và quản lý các loại voucher và voucher cá nhân</p>
        </div>
        <div className='flex gap-2'>
          {activeTab === 'types' ? (
            <Button variant='green' onClick={onAddVoucherType}>
              <PlusCircle className='h-4 w-4 mr-2' />
              Thêm loại voucher
            </Button>
          ) : (
            <Button variant='green' onClick={onAddVoucher}>
              <Ticket className='h-4 w-4 mr-2' />
              Tạo voucher
            </Button>
          )}
        </div>
      </div>

      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full max-w-md grid-cols-2'>
            <TabsTrigger
              value='types'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              Loại Voucher ({voucherTypeTotalCount})
            </TabsTrigger>
            <TabsTrigger
              value='vouchers'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              Voucher ({voucherTotalCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
