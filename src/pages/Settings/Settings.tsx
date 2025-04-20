import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { SettingsProvider, useSettings } from './components/settings-provider'
import { GeneralSettings } from './components/general-settings'
import { TaxSettings } from './components/tax-settings'
import { RegistrationSettings } from './components/registration-settings'
import { ReservationSlotSettings } from './components/reservation-slot-settings'
import { BookingNotificationSettings } from './components/booking-notification-settings'

function SettingsContent() {
  const { loading, error } = useSettings()
  const [activeTab, setActiveTab] = useState('general')

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='text-destructive'>Lỗi</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='mx-auto p-4 max-w-full'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Cài đặt hệ thống</h1>
        <p className='text-muted-foreground'>Quản lý các cài đặt và cấu hình hệ thống</p>
      </div>

      <Tabs defaultValue='general' value={activeTab} onValueChange={setActiveTab} className='space-y-4 mt-6'>
        <TabsList>
          <TabsTrigger value='general'>Cài đặt chung</TabsTrigger>
          <TabsTrigger value='registration'>Đăng ký</TabsTrigger>
          <TabsTrigger value='reservation'>Khung giờ đặt bàn</TabsTrigger>
          <TabsTrigger value='booking-notification'>Sắp xếp đặt bàn</TabsTrigger>
          <TabsTrigger value='tax'>Thuế & Phí</TabsTrigger>
        </TabsList>

        <TabsContent value='general' className='space-y-4'>
          <GeneralSettings />
        </TabsContent>

        <TabsContent value='registration' className='space-y-4'>
          <RegistrationSettings />
        </TabsContent>

        <TabsContent value='tax' className='space-y-4'>
          <TaxSettings />
        </TabsContent>

        <TabsContent value='reservation' className='space-y-4'>
          <ReservationSlotSettings />
        </TabsContent>
        <TabsContent value='booking-notification' className='space-y-4'>
          <BookingNotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <SettingsProvider>
      <SettingsContent />
    </SettingsProvider>
  )
}
