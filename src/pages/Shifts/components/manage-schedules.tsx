import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TableIcon, Clock, CalendarDays } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { toast } from 'sonner'
import type { Shift } from '@/types/staff-schedule'

export default function ManageSchedules() {
  const [shiftsData, setShiftsData] = useState<Shift[]>([])
  const [workingSlots, setWorkingSlots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    fetchTableData()
  }, [])

  const fetchTableData = async () => {
    try {
      setIsLoading(true)

      // Fetch shifts data from API
      const shiftsResponse = await fetch('https://vietsac.id.vn/api/shifts')
      const shiftsData = await shiftsResponse.json()

      // Fetch working slots data from API
      const workingSlotsResponse = await fetch('https://vietsac.id.vn/api/working-slots?IncludeProperties=Day')
      const workingSlotsData = await workingSlotsResponse.json()

      if (shiftsData.success) {
        setShiftsData(shiftsData.result.items)
      }

      if (workingSlotsData.success) {
        setWorkingSlots(workingSlotsData.result.items)
      }
    } catch (error) {
      console.error('Error fetching table data:', error)
      toast.error('Không thể tải dữ liệu bảng')
    } finally {
      setIsLoading(false)
    }
  }

  // Pagination for table view
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentWorkingSlots = workingSlots.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(workingSlots.length / itemsPerPage)

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-8 h-[400px]'>
        <div className='flex flex-col items-center gap-2'>
          <div className='animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full'></div>
          <div className='text-amber-600 font-medium'>Đang tải dữ liệu...</div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-amber-800 flex items-center gap-2'>
          <TableIcon className='h-5 w-5 text-amber-600' />
          Quản lý ca làm và lịch làm việc
        </h2>
      </div>

      <Tabs defaultValue='shifts' className='w-full'>
        <TabsList className='bg-amber-100 mb-4'>
          <TabsTrigger
            value='shifts'
            className='flex items-center gap-1 data-[state=active]:bg-amber-600 data-[state=active]:text-white'
          >
            <Clock className='h-4 w-4' />
            <span>Ca làm</span>
          </TabsTrigger>
          <TabsTrigger
            value='workingSlots'
            className='flex items-center gap-1 data-[state=active]:bg-amber-600 data-[state=active]:text-white'
          >
            <CalendarDays className='h-4 w-4' />
            <span>Lịch làm việc</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='shifts' className='mt-0'>
          <Card>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Danh sách ca làm</CardTitle>
                  <CardDescription>Quản lý các ca làm trong hệ thống</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên ca làm</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className='text-right'>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shiftsData.length > 0 ? (
                    shiftsData.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell>{shift.name}</TableCell>
                        <TableCell>{shift.description}</TableCell>
                        <TableCell className='text-right'>
                          <Button
                            variant='outline'
                            size='sm'
                            className='border-amber-200 text-amber-700 hover:bg-amber-50'
                          >
                            Sửa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className='text-center py-4 text-gray-500'>
                        Không có dữ liệu ca làm
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='workingSlots' className='mt-0'>
          <Card>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Danh sách lịch làm việc</CardTitle>
                  <CardDescription>Quản lý các lịch làm việc trong hệ thống</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ca làm</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Giờ bắt đầu</TableHead>
                    <TableHead>Giờ kết thúc</TableHead>
                    <TableHead className='text-right'>Số lượng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentWorkingSlots.length > 0 ? (
                    currentWorkingSlots.map((slot) => (
                      <TableRow key={slot.id}>
                        <TableCell>{slot.shiftName}</TableCell>
                        <TableCell>{slot.dayName}</TableCell>
                        <TableCell>{slot.shiftStart.substring(0, 5)}</TableCell>
                        <TableCell>{slot.shiftEnd.substring(0, 5)}</TableCell>
                        <TableCell className='text-right'>{slot.capacity}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center py-4 text-gray-500'>
                        Không có dữ liệu lịch làm việc
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {workingSlots.length > 0 && (
                <Pagination className='mt-4'>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      const pageNumber = i + 1
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNumber)}
                            isActive={currentPage === pageNumber}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}
                    {totalPages > 5 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => setCurrentPage(totalPages)}
                            isActive={currentPage === totalPages}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
