import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Toaster } from 'sonner'
import { StaffAbsenceTable } from './staff-absence-table'
import { AddAbsenceDialog } from './add-absence-dialog'

export default function StaffAbsencePage() {
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false)
  const [refreshKey, setRefreshKey] = useState<number>(0)

  const handleAddSuccess = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-red-800'>Quản lý xin nghỉ</h1>
      </div>

      <Card>
        <CardHeader className='pb-2'></CardHeader>
        <CardContent>
          <StaffAbsenceTable key={refreshKey} onAddClick={() => setAddDialogOpen(true)} />
        </CardContent>
      </Card>

      <AddAbsenceDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSuccess={handleAddSuccess} />

      <Toaster />
    </div>
  )
}
