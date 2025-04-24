import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type React from 'react'

import TableManagement from './table-management'
import ZoneManagement from './zone-management'
import { LayoutGrid, ListFilter } from 'lucide-react'
import BookingPage from './booking-management'
import { useNavigate, useParams } from 'react-router-dom'

const InTables: React.FC = () => {
  const navigate = useNavigate()
  const { tab = 'tables' } = useParams<{ tab: string }>()

  const handleTabChange = (value: string) => {
    navigate(`/in-tables/${value}`)
  }
  return (
    <div className='mx-auto p-4 max-w-full bg-[#f8f9fa]'>
      <Tabs value={tab} onValueChange={handleTabChange} className='space-y-6'>
        <div className='flex items-center justify-between'>
          <TabsList className='grid w-full max-w-md grid-cols-3 p-1 bg-amber-50 border border-amber-100'>
            <TabsTrigger
              value='tables'
              className='flex items-center gap-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white'
            >
              <LayoutGrid className='h-4 w-4' />
              <span>Quản lý bàn ăn</span>
            </TabsTrigger>
            <TabsTrigger
              value='zones'
              className='flex items-center gap-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white'
            >
              <ListFilter className='h-4 w-4' />
              <span>Quản lý khu vực</span>
            </TabsTrigger>
            <TabsTrigger
              value='booking'
              className='flex items-center gap-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white'
            >
              <ListFilter className='h-4 w-4' />
              <span>Quản lý đặt bàn</span>
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value='tables' className='w-full'>
          <TableManagement />
        </TabsContent>
        <TabsContent value='zones' className='w-full'>
          <ZoneManagement />
        </TabsContent>
        <TabsContent value='booking' className='w-full'>
          <BookingPage />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default InTables
