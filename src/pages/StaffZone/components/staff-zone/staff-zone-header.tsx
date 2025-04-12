'use client'

import { Clock, Filter, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

interface StaffZoneHeaderProps {
  currentTime: Date
  searchTerm: string
  setSearchTerm: (value: string) => void
  filterZoneType: string
  setFilterZoneType: (value: string) => void
}

export function StaffZoneHeader({
  currentTime,
  searchTerm,
  setSearchTerm,
  filterZoneType,
  setFilterZoneType
}: StaffZoneHeaderProps) {
  // Format current time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  // Format current date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
      <div className='flex flex-col'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Clock className='h-4 w-4' />
          <span>{formatTime(currentTime)}</span>
          <span className='text-sm'>•</span>
          <span className='text-sm'>{formatDate(currentTime)}</span>
        </div>
      </div>
      <div className='flex w-full md:w-auto gap-2'>
        <div className='relative w-full md:w-auto'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            type='search'
            placeholder='Tìm kiếm nhân viên hoặc khu vực...'
            className='pl-8 w-full md:w-[250px]'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterZoneType} onValueChange={setFilterZoneType}>
          <SelectTrigger className='w-[130px]'>
            <div className='flex items-center gap-2'>
              <Filter className='h-4 w-4' />
              <span>Lọc</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả khu vực</SelectItem>
            <SelectItem value='DininingArea'>Khu vực phục vụ</SelectItem>
            <SelectItem value='KitchenArea'>Khu vực bếp</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
