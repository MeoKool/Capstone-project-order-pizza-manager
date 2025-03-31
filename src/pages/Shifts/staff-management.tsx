import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, Plus, CalendarDays, CheckSquare } from 'lucide-react'
import StaffScheduleCalendar from './components/staff-schedule-calendar'
import RegistrationApproval from './components/registration-approval'
import ShiftForm from './components/shift-form'
import WorkingSlotForm from './components/working-slot-form'

export default function StaffManagement() {
  const [, setActiveTab] = useState('calendar')

  return (
    <div className='mx-auto p-4 max-w-full bg-gradient-to-b from-blue-50 to-white min-h-screen'>
      <Tabs defaultValue='calendar' className='w-full' onValueChange={setActiveTab}>
        <TabsList className='w-full max-w-lg mx-auto mb-6 bg-blue-100'>
          <TabsTrigger
            value='calendar'
            className='flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white'
          >
            <CalendarDays className='h-4 w-4' />
            <span>Lịch làm việc</span>
          </TabsTrigger>
          <TabsTrigger
            value='approval'
            className='flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white'
          >
            <CheckSquare className='h-4 w-4' />
            <span>Duyệt đăng ký</span>
          </TabsTrigger>
          <TabsTrigger
            value='shifts'
            className='flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white'
          >
            <Clock className='h-4 w-4' />
            <span>Ca làm</span>
          </TabsTrigger>
          <TabsTrigger
            value='create'
            className='flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white'
          >
            <Plus className='h-4 w-4' />
            <span>Tạo lịch làm</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='calendar'>
          <div className='bg-white rounded-lg p-6 shadow-sm'>
            <StaffScheduleCalendar />
          </div>
        </TabsContent>

        <TabsContent value='approval'>
          <div className='bg-white rounded-lg p-6 shadow-sm'>
            <RegistrationApproval />
          </div>
        </TabsContent>

        <TabsContent value='shifts'>
          <div className='max-w-md mx-auto'>
            <ShiftForm />
          </div>
        </TabsContent>

        <TabsContent value='create'>
          <div className='max-w-md mx-auto'>
            <WorkingSlotForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
