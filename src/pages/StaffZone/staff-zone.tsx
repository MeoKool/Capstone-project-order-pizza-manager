'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import StaffZoneService, { type StaffZone, type Zone } from '@/services/staff-zone-service'
import { StaffZoneHeader } from './components/staff-zone/staff-zone-header'
import { StaffZoneGuide } from './components/staff-zone/staff-zone-guide'
import { StaffZoneStats } from './components/staff-zone/staff-zone-stats'
import { EmptyZoneState } from './components/staff-zone/empty-zone-state'
import { DroppableZone } from './components/staff-zone/droppable-zone'
import { StaffZoneOverlay } from './components/staff-zone/staff-zone-overlay'
import { AddStaffDialog } from './components/staff-zone/add-staff-dialog'

interface ZoneWithStaff {
  zone: Zone
  staffZones: StaffZone[]
}

export default function StaffZoneManagement() {
  const [zones, setZones] = useState<Zone[]>([])
  const [zoneWithStaff, setZoneWithStaff] = useState<Record<string, ZoneWithStaff>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterZoneType, setFilterZoneType] = useState<string>('all')
  const [activeStaffZone, setActiveStaffZone] = useState<StaffZone | null>(null)
  const [isMoving, setIsMoving] = useState(false)
  const [movingStaffId, setMovingStaffId] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid')

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Lower activationConstraint for easier dragging
      activationConstraint: {
        distance: 3, // Reduced from 5 to make dragging more responsive
        tolerance: 5, // Add tolerance for better detection
        delay: 0 // No delay for immediate response
      }
    })
  )

  useEffect(() => {
    fetchZonesAndStaff()

    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const fetchZonesAndStaff = async () => {
    try {
      setLoading(true)
      const staffZoneService = StaffZoneService.getInstance()

      // First, fetch all zones
      const zonesResponse = await staffZoneService.getAllZones()

      if (!zonesResponse.success) {
        setError(zonesResponse.message || 'Failed to fetch zones')
        return
      }

      const allZones = zonesResponse.result.items
      setZones(allZones)

      // Then fetch staff for each zone
      const zoneStaffMap: Record<string, ZoneWithStaff> = {}

      for (const zone of allZones) {
        const staffResponse = await staffZoneService.getStaffByZoneId(zone.id)

        if (staffResponse.success) {
          zoneStaffMap[zone.id] = {
            zone,
            staffZones: staffResponse.result.items
          }
        } else {
          console.error(`Failed to fetch staff for zone ${zone.id}: ${staffResponse.message}`)
        }
      }

      setZoneWithStaff(zoneStaffMap)
    } catch (err) {
      setError('An error occurred while fetching data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Filter zones based on search term and zone type
  const filteredZones = Object.values(zoneWithStaff).filter(({ zone, staffZones }) => {
    const matchesSearch =
      searchTerm === '' ||
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffZones.some((staffZone) => staffZone.staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesZoneType = filterZoneType === 'all' || zone.type === filterZoneType

    return matchesSearch && matchesZoneType
  })

  // Get stats
  const totalStaff = new Set(
    Object.values(zoneWithStaff).flatMap(({ staffZones }) => staffZones.map((sz) => sz.staff.id))
  ).size

  const totalZones = zones.length
  const diningZones = zones.filter((zone) => zone.type === 'DininingArea').length
  const kitchenZones = zones.filter((zone) => zone.type === 'KitchenArea').length

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const staffZone = active.data.current?.staffZone as StaffZone

    if (staffZone) {
      setActiveStaffZone(staffZone)
    }
  }

  // Handle drag end
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    setActiveStaffZone(null)

    // If no drop target or same zone, do nothing
    if (!over || !active || !active.data.current?.staffZone) return

    const staffZone = active.data.current.staffZone as StaffZone
    const targetZoneId = over.id as string
    const sourceZoneId = staffZone.zone.id

    // Don't do anything if dropping in the same zone
    if (sourceZoneId === targetZoneId) return

    setIsMoving(true)
    setMovingStaffId(staffZone.staff.id)

    // Optimistically update UI
    const updatedZoneWithStaff = { ...zoneWithStaff }

    // Remove from source zone
    updatedZoneWithStaff[sourceZoneId] = {
      ...updatedZoneWithStaff[sourceZoneId],
      staffZones: updatedZoneWithStaff[sourceZoneId].staffZones.filter((sz) => sz.id !== staffZone.id)
    }

    // Add to target zone with updated zone reference
    const updatedStaffZone = {
      ...staffZone,
      zoneId: targetZoneId,
      zone: zones.find((z) => z.id === targetZoneId) || staffZone.zone
    }

    updatedZoneWithStaff[targetZoneId] = {
      ...updatedZoneWithStaff[targetZoneId],
      staffZones: [...updatedZoneWithStaff[targetZoneId].staffZones, updatedStaffZone]
    }

    // Update state immediately for better UX
    setZoneWithStaff(updatedZoneWithStaff)

    try {
      const staffZoneService = StaffZoneService.getInstance()
      const response = await staffZoneService.moveStaffToZone(staffZone.id, staffZone.staff.id, targetZoneId)

      if (response.success) {
        toast.success(`${staffZone.staff.fullName} đã được chuyển sang khu vực mới`)
        // No need to fetch again, we already updated the UI
      } else {
        toast.error(response.message || 'Đã xảy ra lỗi khi chuyển nhân viên')
        // Revert the optimistic update on error
        await fetchZonesAndStaff()
      }
    } catch (err) {
      console.error('Error moving staff:', err)
      toast.error('Đã xảy ra lỗi không mong muốn khi chuyển nhân viên')
      // Revert the optimistic update on error
      await fetchZonesAndStaff()
    } finally {
      setIsMoving(false)
      setMovingStaffId(null)
    }
  }

  // Thêm nhân viên vào khu vực
  const handleAddStaff = async (staffId: string, zoneId: string): Promise<boolean> => {
    try {
      const staffZoneService = StaffZoneService.getInstance()
      const response = await staffZoneService.createStaffZone(staffId, zoneId)

      if (response.success) {
        // Refresh data after adding
        await fetchZonesAndStaff()
        return true
      } else {
        toast.error(response.message || 'Không thể thêm nhân viên vào khu vực')
        return false
      }
    } catch (error) {
      console.error('Error adding staff to zone:', error)
      toast.error('Đã xảy ra lỗi khi thêm nhân viên vào khu vực')
      return false
    }
  }

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('')
    setFilterZoneType('all')
  }

  if (loading) {
    return (
      <div className='container mx-auto py-6 space-y-6'>
        <div className='flex flex-col md:flex-row justify-between gap-4'>
          <Skeleton className='h-12 w-full md:w-1/3' />
          <Skeleton className='h-12 w-full md:w-1/3' />
        </div>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className='h-24 w-full rounded-lg' />
          ))}
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className='h-64 w-full rounded-lg' />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='container mx-auto py-6'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className='mx-auto p-4 max-w-full'>
      {/* Hướng dẫn sử dụng */}
      <StaffZoneGuide />
      <div className='mb-10'></div>
      {/* Header with time and search */}
      <StaffZoneHeader
        currentTime={currentTime}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterZoneType={filterZoneType}
        setFilterZoneType={setFilterZoneType}
      />
      <div className='mb-10'></div>

      {/* Stats cards */}
      <StaffZoneStats
        totalStaff={totalStaff}
        totalZones={totalZones}
        diningZones={diningZones}
        kitchenZones={kitchenZones}
      />

      {/* Main content */}
      <div className='flex justify-between items-center my-4'>
        <h2 className='text-xl font-semibold'>Phân công khu vực</h2>
        <AddStaffDialog zones={zones} onAddStaff={handleAddStaff} />
      </div>

      <Tabs defaultValue='grid' className='w-full' onValueChange={(value) => setActiveView(value as 'grid' | 'list')}>
        <div className='flex justify-between items-center mb-4'>
          <div></div> {/* Empty div for spacing */}
          <TabsList>
            <TabsTrigger value='grid' className='flex items-center gap-2'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <rect width='7' height='7' x='3' y='3' rx='1' />
                <rect width='7' height='7' x='14' y='3' rx='1' />
                <rect width='7' height='7' x='14' y='14' rx='1' />
                <rect width='7' height='7' x='3' y='14' rx='1' />
              </svg>
              Lưới
            </TabsTrigger>
            <TabsTrigger value='list' className='flex items-center gap-2'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <line x1='3' x2='21' y1='6' y2='6' />
                <line x1='3' x2='21' y1='12' y2='12' />
                <line x1='3' x2='21' y1='18' y2='18' />
              </svg>
              Danh sách
            </TabsTrigger>
          </TabsList>
        </div>

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <TabsContent value='grid' className='mt-0'>
            {filteredZones.length === 0 ? (
              <EmptyZoneState resetFilters={resetFilters} />
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {filteredZones.map(({ zone, staffZones }) => (
                  <DroppableZone
                    key={zone.id}
                    zone={zone}
                    staffZones={staffZones}
                    isMoving={isMoving}
                    movingStaffId={movingStaffId}
                    isGridView={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value='list' className='mt-0'>
            {filteredZones.length === 0 ? (
              <EmptyZoneState resetFilters={resetFilters} />
            ) : (
              <div className='space-y-4'>
                {filteredZones.map(({ zone, staffZones }) => (
                  <DroppableZone
                    key={zone.id}
                    zone={zone}
                    staffZones={staffZones}
                    isMoving={isMoving}
                    movingStaffId={movingStaffId}
                    isGridView={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Drag Overlay - shows what's being dragged */}
          <StaffZoneOverlay activeStaffZone={activeStaffZone} activeView={activeView} getInitials={getInitials} />
        </DndContext>
      </Tabs>
    </div>
  )
}
