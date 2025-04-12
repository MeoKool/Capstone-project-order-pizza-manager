'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search } from 'lucide-react'

interface EmptyZoneStateProps {
  resetFilters: () => void
}

export function EmptyZoneState({ resetFilters }: EmptyZoneStateProps) {
  return (
    <Card className='border-gray-200 bg-gray-50'>
      <CardContent className='flex flex-col items-center justify-center py-12'>
        <div className='rounded-full bg-gray-100 p-3 mb-4'>
          <Search className='h-6 w-6 text-gray-400' />
        </div>
        <h3 className='text-lg font-medium'>Không tìm thấy khu vực nào</h3>
        <p className='text-muted-foreground text-center mt-1'>
          Hãy điều chỉnh tìm kiếm hoặc bộ lọc để tìm thấy những gì bạn đang tìm kiếm.
        </p>
        <Button variant='outline' className='mt-4' onClick={resetFilters}>
          Xóa bộ lọc
        </Button>
      </CardContent>
    </Card>
  )
}
