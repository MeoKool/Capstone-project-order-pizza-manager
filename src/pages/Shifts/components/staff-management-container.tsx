import { useState } from 'react'
import { Calendar, Plus, Settings } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CreateScheduleForm from './create-schedule-form'
import ManageSchedules from './manage-schedules'
import StaffScheduleCalendar from './staff-schedule-calendar'

export default function StaffManagementContainer() {
  const [activeTab, setActiveTab] = useState('calendar')

  return (
    <div className='space-y-6 p-6 bg-orange-50 rounded-lg'>
      <div className='flex items-center justify-end'>
        <div className='bg-orange-50  rounded-lg shadow-sm'>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className='bg-white border p-1 rounded-lg'>
              <TabsTrigger
                value='calendar'
                className='flex items-center gap-1 data-[state=active]:bg-green-600 data-[state=active]:text-white'
              >
                <Calendar className='h-4 w-4' />
                <span>Lịch</span>
              </TabsTrigger>

              <TabsTrigger
                value='create'
                className='flex items-center gap-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white'
              >
                <Plus className='h-4 w-4' />
                <span>Tạo mới</span>
              </TabsTrigger>
              <TabsTrigger
                value='manage'
                className='flex items-center gap-1 data-[state=active]:bg-amber-600 data-[state=active]:text-white'
              >
                <Settings className='h-4 w-4' />
                <span>Quản lý</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className='bg-white rounded-lg '>
        {activeTab === 'calendar' && <StaffScheduleCalendar />}
        {activeTab === 'create' && <CreateScheduleForm />}
        {activeTab === 'manage' && <ManageSchedules />}
      </div>
    </div>
  )
}
