import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, Plus } from 'lucide-react'
import CalendarView from './components/calendar-view'
import ShiftForm from './components/shift-form'
import WorkingSlotForm from './components/working-slot-form'

export default function StaffManagement() {
  const [activeTab, setActiveTab] = useState('calendar')
  console.log(activeTab)

  return (
    <div className='mx-auto p-4 max-w-full'>
      <h1 className='text-2xl font-bold mb-6'>Quản lý lịch làm việc</h1>
      <Tabs defaultValue='calendar' className='w-full' onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='calendar' className='flex items-center gap-2'>
            <Calendar className='h-4 w-4' />
            <span className='hidden sm:inline'>Lịch làm việc</span>
          </TabsTrigger>
          <TabsTrigger value='shifts' className='flex items-center gap-2'>
            <Clock className='h-4 w-4' />
            <span className='hidden sm:inline'>Ca làm</span>
          </TabsTrigger>
          <TabsTrigger value='create' className='flex items-center gap-2'>
            <Plus className='h-4 w-4' />
            <span className='hidden sm:inline'>Tạo lịch làm</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value='calendar'>
          <Card>
            <CardHeader>
              <CardTitle>Lịch làm việc</CardTitle>
              <CardDescription>Xem lịch làm việc của nhân viên theo tuần hoặc tháng.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              <CalendarView />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='shifts'>
          <Card>
            <CardHeader>
              <CardTitle>Quản lý ca làm</CardTitle>
              <CardDescription>Tạo và quản lý các ca làm việc.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              <ShiftForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='create'>
          <Card>
            <CardHeader>
              <CardTitle>Tạo lịch làm việc</CardTitle>
              <CardDescription>Tạo lịch làm việc mới cho nhân viên.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              <WorkingSlotForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
