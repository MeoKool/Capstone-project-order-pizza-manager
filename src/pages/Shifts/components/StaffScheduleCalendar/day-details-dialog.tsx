import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { CalendarDays, Users, AlertCircle, ArrowRightLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { StaffSchedule, WorkingSlotRegister, SwapWorkingSlotRequest, Zone } from '@/types/staff-schedule'
import { SchedulesList } from './schedules-list'
import { RegistrationsList } from './registrations-list'
import { SwapRequestsList } from './swap-requests-list'

interface DayDetailsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | null
  schedules: StaffSchedule[]
  registrations: WorkingSlotRegister[]
  swapRequests: SwapWorkingSlotRequest[]
  activeTab: 'schedules' | 'registrations' | 'swaps'
  onTabChange: (tab: 'schedules' | 'registrations' | 'swaps') => void
  onRegistrationSelect: (registration: WorkingSlotRegister) => void
  onSwapRequestSelect: (request: SwapWorkingSlotRequest) => void
  zones: Zone[]
}

export function DayDetailsDialog({
  isOpen,
  onOpenChange,
  selectedDate,
  schedules,
  registrations,
  swapRequests,
  activeTab,
  onTabChange,
  onRegistrationSelect,
  onSwapRequestSelect,
  zones
}: DayDetailsDialogProps) {
  if (!selectedDate) return null

  // Count pending registrations (excluding approved ones with zoneId)
  const pendingRegistrationsCount = registrations.filter(
    (reg) => !(reg.status === 'Approved' && reg.zoneId !== null)
  ).length

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader className='shrink-0'>
          <DialogTitle className='text-xl flex items-center gap-2 text-red-700'>
            <CalendarDays className='h-5 w-5' />
            {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
          </DialogTitle>
        </DialogHeader>

        <div className='flex-1 overflow-auto' style={{ minHeight: '200px' }}>
          <Tabs
            value={activeTab}
            onValueChange={(v) => onTabChange(v as 'schedules' | 'registrations' | 'swaps')}
            className='w-full h-full flex flex-col'
          >
            <TabsList className='bg-orange-100 mb-4 w-full sticky top-0 z-10'>
              <TabsTrigger
                value='schedules'
                className='flex items-center gap-1 data-[state=active]:bg-red-500 data-[state=active]:text-white flex-1'
              >
                <Users className='h-4 w-4' />
                <span>Lịch làm việc</span>
              </TabsTrigger>
              <TabsTrigger
                value='registrations'
                className='flex items-center gap-1 data-[state=active]:bg-red-500 data-[state=active]:text-white flex-1'
              >
                <AlertCircle className='h-4 w-4' />
                <span>Yêu cầu đăng ký</span>
                <Badge className='ml-1 bg-orange-200 text-red-800 hover:bg-orange-100'>
                  {pendingRegistrationsCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value='swaps'
                className='flex items-center gap-1 data-[state=active]:bg-red-500 data-[state=active]:text-white flex-1'
              >
                <ArrowRightLeft className='h-4 w-4' />
                <span>Yêu cầu đổi ca</span>
                <Badge className='ml-1 bg-orange-200 text-red-800 hover:bg-orange-100'>{swapRequests.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <div className='flex-1 overflow-auto'>
              <TabsContent value='schedules' className='mt-0'>
                <SchedulesList schedules={schedules} zones={zones} />
              </TabsContent>

              <TabsContent value='registrations' className='mt-0'>
                <RegistrationsList registrations={registrations} onSelect={onRegistrationSelect} />
              </TabsContent>

              <TabsContent value='swaps' className='mt-0'>
                <SwapRequestsList swapRequests={swapRequests} onSelect={onSwapRequestSelect} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className='mt-4 border-t pt-4 shrink-0'>
          <DialogClose asChild>
            <Button className='bg-red-500 hover:bg-red-600 text-white'>Đóng</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
