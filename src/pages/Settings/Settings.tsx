import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { SettingsProvider } from './components/settings-provider'
import { GeneralSettings } from './components/general-settings'
import { TaxSettings } from './components/tax-settings'

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

      <Tabs defaultValue='general' value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
        <TabsList>
          <TabsTrigger value='general'>Cài đặt chung</TabsTrigger>
          <TabsTrigger value='tax'>Thuế & Phí</TabsTrigger>
        </TabsList>

        <TabsContent value='general' className='space-y-4'>
          <GeneralSettings />
        </TabsContent>

        <TabsContent value='tax' className='space-y-4'>
          <TaxSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Missing import for useSettings
import { useSettings } from './components/settings-provider'

export default function SettingsPage() {
  return (
    <SettingsProvider>
      <SettingsContent />
    </SettingsProvider>
  )
}
