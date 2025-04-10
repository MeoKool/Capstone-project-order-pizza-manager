import { useState } from 'react'
import type { Customer } from '@/types/customer'
import { CustomerProvider } from './Components/customer-provider'
import { CustomerHeader } from './Components/customer-header'
import { CustomerTable } from './Components/customer-table'
import { CustomerDetailDialog } from './Components/customer-detail-dialog'

export default function CustomerPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDetailDialogOpen(true)
  }

  return (
    <CustomerProvider>
      <div className='h-full flex flex-col'>
        <div className='flex-1 p-6'>
          <CustomerHeader />
          <CustomerTable onViewCustomer={handleViewCustomer} />
          {selectedCustomer && (
            <CustomerDetailDialog
              customer={selectedCustomer}
              open={isDetailDialogOpen}
              onOpenChange={setIsDetailDialogOpen}
            />
          )}
        </div>
      </div>
    </CustomerProvider>
  )
}
