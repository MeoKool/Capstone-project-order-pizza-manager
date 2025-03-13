import useZone from '@/hooks/useZone'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/ui/search-bar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, MoreHorizontal, Plus, RefreshCw, Trash2 } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const ZoneManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { zones_ } = useZone()

  const filteredZones = zones_.filter(
    (zone) =>
      zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
  }

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Quản lý khu vực</CardTitle>
            <CardDescription>Quản lý các khu vực trong nhà hàng</CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant='outline' className='text-sm'>
              Tổng số: {zones_.length} khu vực
            </Badge>
            <Button variant='outline' size='icon' className='h-8 w-8' onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
          <SearchBar placeholder='Tìm kiếm khu vực...' value={searchQuery} onChange={setSearchQuery} />
          <Button className='h-9 w-full sm:w-auto'>
            <Plus className='mr-2 h-4 w-4' />
            Thêm khu vực mới
          </Button>
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[40%]'>Tên khu vực</TableHead>
                <TableHead className='w-[40%]'>Mô tả</TableHead>
                <TableHead className='text-right w-[15%]'>Số lượng bàn</TableHead>
                <TableHead className='w-[5%]'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredZones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center'>
                    Không tìm thấy khu vực nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredZones.map((zone) => (
                  <TableRow key={zone.id}>
                    <TableCell className='font-medium'>{zone.name}</TableCell>
                    <TableCell>{zone.description}</TableCell>
                    <TableCell className='text-right'>
                      <Badge variant='outline'>{zone.capacity}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon' className='h-8 w-8'>
                            <MoreHorizontal className='h-4 w-4' />
                            <span className='sr-only'>Tùy chọn</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem className='flex items-center'>
                            <Edit className='mr-2 h-4 w-4' />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem className='flex items-center text-destructive focus:text-destructive'>
                            <Trash2 className='mr-2 h-4 w-4' />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default ZoneManagement
