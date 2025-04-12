import { MapPin, Users } from 'lucide-react'
import { StatCard } from './stat-card'

interface StaffZoneStatsProps {
  totalStaff: number
  totalZones: number
  diningZones: number
  kitchenZones: number
}

export function StaffZoneStats({ totalStaff, totalZones, diningZones, kitchenZones }: StaffZoneStatsProps) {
  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
      <StatCard
        title='Tổng nhân viên'
        value={totalStaff}
        icon={<Users className='h-5 w-5 text-blue-600' />}
        className='bg-blue-50 border-blue-200'
      />
      <StatCard
        title='Tổng khu vực'
        value={totalZones}
        icon={<MapPin className='h-5 w-5 text-purple-600' />}
        className='bg-purple-50 border-purple-200'
      />
      <StatCard
        title='Khu vực phục vụ'
        value={diningZones}
        icon={<MapPin className='h-5 w-5 text-emerald-600' />}
        className='bg-emerald-50 border-emerald-200'
      />
      <StatCard
        title='Khu vực bếp'
        value={kitchenZones}
        icon={<MapPin className='h-5 w-5 text-amber-600' />}
        className='bg-amber-50 border-amber-200'
      />
    </div>
  )
}
