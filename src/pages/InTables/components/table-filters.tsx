import type { TableStatus } from '@/types/tables'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { CheckCircle, Clock, Lock, AlertTriangle, Coffee } from 'lucide-react'

interface TableFiltersProps {
  activeFilter: TableStatus | 'all'
  onFilterChange: (filter: TableStatus | 'all') => void
  counts: {
    all: number
    Opening: number
    Locked: number
    Reserved: number
    Closing: number
  }
}

export function TableFilters({ activeFilter, onFilterChange, counts }: TableFiltersProps) {
  const filters = [
    { value: 'all', label: 'Tất cả', icon: null, color: 'bg-gray-100' },
    { value: 'Opening', label: 'Trống', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
    { value: 'Locked', label: 'Đã khóa', icon: Lock, color: 'bg-amber-100 text-amber-700' },
    { value: 'Reserved', label: 'Đã đặt trước', icon: Clock, color: 'bg-blue-100 text-blue-700' },
    { value: 'Closing', label: 'Đã đóng', icon: AlertTriangle, color: 'bg-red-100 text-red-700' }
  ]

  return (
    <div className='min-w-full overflow-x-auto'>
      <Card className='p-1.5 sm:p-3 grid grid-cols-5 gap-1 sm:gap-2 border-amber-100 w-full min-w-[500px]'>
        {filters.map((filter) => {
          const Icon = filter.icon
          const isActive = activeFilter === filter.value

          return (
            <Button
              key={filter.value}
              variant={isActive ? 'default' : 'outline'}
              size='sm'
              className={`justify-between h-auto py-1.5 sm:py-3 px-1.5 sm:px-3 text-xs sm:text-sm ${
                isActive
                  ? filter.value === 'Opening'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : filter.value === 'Locked'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : filter.value === 'Reserved'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : filter.value === 'Closing'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-amber-600 hover:bg-amber-700'
                  : 'border-amber-200 text-amber-800 hover:bg-amber-50'
              }`}
              onClick={() => onFilterChange(filter.value as TableStatus | 'all')}
            >
              <div className='flex items-center'>
                {Icon ? (
                  <Icon className='mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                ) : (
                  <Coffee className='mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                )}
                <span>{filter.label}</span>
              </div>
              <Badge
                variant={isActive ? 'secondary' : 'outline'}
                className={`${isActive ? 'bg-white/20 text-white' : 'bg-white border-amber-200 text-amber-700'} text-xs px-1 sm:px-1.5 py-0 h-4 sm:h-5 min-w-[1.25rem] sm:min-w-[1.5rem]`}
              >
                {counts[filter.value as keyof typeof counts]}
              </Badge>
            </Button>
          )
        })}
      </Card>
    </div>
  )
}
