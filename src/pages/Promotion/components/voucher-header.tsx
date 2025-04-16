'use client'

import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
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
      <div className='flex justify-between items-center'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full max-w-md'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger
              value='types'
              className='data-[state=active]:bg-yellow-600 data-[state=active]:text-primary-foreground'
            >
              Loại Voucher ({voucherTypeTotalCount})
            </TabsTrigger>
            <TabsTrigger
              value='vouchers'
              className='data-[state=active]:bg-yellow-600 data-[state=active]:text-primary-foreground'
            >
              Voucher ({voucherTotalCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'types' && (
          <Button variant='green' onClick={onAddVoucherType} className='ml-4'>
            <PlusCircle className='h-4 w-4 mr-2' />
            Thêm loại voucher
          </Button>
        )}

        {activeTab === 'vouchers' && (
          <Button variant='green' onClick={onAddVoucher} className='ml-4'>
            <PlusCircle className='h-4 w-4 mr-2' />
            Thêm voucher
          </Button>
        )}
      </div>
    </div>
  )
}
