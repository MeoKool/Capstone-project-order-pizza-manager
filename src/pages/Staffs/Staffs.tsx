import { useState } from 'react'
import { StaffProvider } from './components/staff-provider'
import { StaffHeader } from './components/staff-header'
import { StaffTable } from './components/staff-table'
import { AddStaffDialog } from './components/add-staff-dialog'

export default function StaffPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <StaffProvider>
      <div className='h-full flex flex-col'>
        <div className='flex-1 p-6'>
          <StaffHeader onAddStaff={() => setIsAddDialogOpen(true)} />
          <StaffTable />
          <AddStaffDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
        </div>
      </div>
    </StaffProvider>
  )
}
