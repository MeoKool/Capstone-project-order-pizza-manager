'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Loader2,
  TableIcon
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import type { Reservation } from '@/types/reservation'
import BookingService from '@/services/booking-service'
import TableService from '@/services/table-service'
import { ReservationPriorityStatus } from './reservationPriorityStatus'

interface BookingTableProps {
  reservations: Reservation[]
  isLoading: boolean
  getStatusLabel: (status: string) => string
  getStatusColor: (status: string) => string
  onView: (reservation: Reservation) => void
  onRefresh?: () => void
  onAssignTable?: (reservation: Reservation) => void
}

export function BookingTable({
  reservations,
  isLoading,
  getStatusLabel,
  getStatusColor,
  onView,
  onRefresh,
  onAssignTable = () => {}
}: BookingTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [tableCodes, setTableCodes] = useState<Record<string, string>>({})
  const [loadingTables, setLoadingTables] = useState<Record<string, boolean>>({})

  const bookingService = BookingService.getInstance()
  const tableService = TableService.getInstance()

  // Calculate pagination values
  const totalItems = reservations ? reservations.length : 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const currentItems = reservations ? reservations.slice(startIndex, endIndex) : []

  // Format date and time
  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr)
      if (isNaN(date.getTime())) return { date: 'N/A', time: 'N/A' }

      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      const formattedDate = `${day}/${month}/${year}`

      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const formattedTime = `${hours}:${minutes}`

      return { date: formattedDate, time: formattedTime }
    } catch (error) {
      console.error('Error formatting date:', error, 'for input:', dateTimeStr)
      return { date: 'N/A', time: 'N/A' }
    }
  }

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages || 1)))
  }

  const goToFirstPage = () => goToPage(1)
  const goToPreviousPage = () => goToPage(currentPage - 1)
  const goToNextPage = () => goToPage(currentPage + 1)
  const goToLastPage = () => goToPage(totalPages)

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number.parseInt(value))
    setCurrentPage(1)
  }

  // Action handlers
  const handleConfirm = async (id: string) => {
    setActionLoading(id + '-confirm')
    try {
      const response = await bookingService.confirmReservation(id)
      if (response.success) {
        toast.success('Đã xác nhận đặt bàn thành công!')
        if (onRefresh) onRefresh()
      } else {
        toast.error(response.message || 'Không thể xác nhận đặt bàn')
      }
    } catch (error) {
      console.error('Error confirming reservation:', error)
      toast.error('Có lỗi xảy ra khi xác nhận đặt bàn')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (id: string) => {
    setActionLoading(id + '-cancel')
    try {
      const response = await bookingService.cancelReservation(id)
      if (response.success) {
        toast.success('Đã hủy đặt bàn thành công!')
        if (onRefresh) onRefresh()
      } else {
        toast.error(response.message || 'Không thể hủy đặt bàn')
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error)
      toast.error('Có lỗi xảy ra khi hủy đặt bàn')
    } finally {
      setActionLoading(null)
    }
  }

  // Check if action buttons should be disabled
  const isConfirmDisabled = (status: string) => {
    return ['Confirmed', 'Checkedin', 'Cancelled'].includes(status)
  }

  const isCancelDisabled = (status: string) => {
    return ['Cancelled'].includes(status)
  }

  // Create a cache for table details to avoid redundant API calls
  const tableDetailsCache = useRef<Record<string, string>>({})

  // Optimized function to fetch table details
  const fetchTableDetails = async (tableId: string) => {
    if (!tableId || tableCodes[tableId]) return

    // Check if we're already loading this table
    if (loadingTables[tableId]) return

    // Check if we already have this table in our cache
    if (tableDetailsCache.current[tableId]) {
      setTableCodes((prev) => ({
        ...prev,
        [tableId]: tableDetailsCache.current[tableId]
      }))
      return
    }

    setLoadingTables((prev) => ({ ...prev, [tableId]: true }))
    try {
      const response = await tableService.getTableById(tableId)
      if (response.success && response.result) {
        const tableCode = response.result.code || `Bàn ${tableId.substring(0, 4)}`

        // Update the cache
        tableDetailsCache.current[tableId] = tableCode

        // Update state
        setTableCodes((prev) => ({
          ...prev,
          [tableId]: tableCode
        }))
      }
    } catch (error) {
      console.error(`Error fetching table ${tableId}:`, error)
    } finally {
      setLoadingTables((prev) => ({ ...prev, [tableId]: false }))
    }
  }

  // Replace the existing useEffect with this optimized version
  useEffect(() => {
    if (isLoading || !currentItems || currentItems.length === 0) return

    const fetchAllTableDetails = async () => {
      if (!currentItems) return

      // Get unique table IDs that we don't already have
      const uniqueTableIds = new Set<string>()

      currentItems.forEach((reservation) => {
        if (
          reservation &&
          reservation.tableId &&
          !tableCodes[reservation.tableId] &&
          !loadingTables[reservation.tableId] &&
          !tableDetailsCache.current[reservation.tableId]
        ) {
          uniqueTableIds.add(reservation.tableId)
        }
      })

      // Fetch details for each unique table ID
      for (const tableId of uniqueTableIds) {
        await fetchTableDetails(tableId)
      }
    }

    fetchAllTableDetails()
  }, [currentItems, isLoading])

  return (
    <div className='space-y-4'>
      <div className='rounded-md border overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[200px]'>Khách hàng</TableHead>
              <TableHead className='w-[200px] text-center'>Số điện thoại</TableHead>
              <TableHead className='text-center'>Cấp bậc</TableHead>
              <TableHead className='w-[120px] text-center'>Số người</TableHead>
              <TableHead className='w-[120px] text-center'>Ngày</TableHead>
              <TableHead className='w-[100px] text-center'>Giờ</TableHead>
              <TableHead className='w-[200px] text-center'>Trạng thái</TableHead>
              <TableHead className='w-[100px] text-center'>Bàn</TableHead>
              <TableHead className='w-[80px] text-center'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array(itemsPerPage)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className='h-5 w-12' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-5 w-full' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-5 w-24' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-5 w-12' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-5 w-20' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-5 w-12' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-5 w-24' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-5 w-12' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-5 w-8 ml-auto' />
                    </TableCell>
                  </TableRow>
                ))
            ) : !reservations || reservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className='h-24 text-center'>
                  Không có đặt bàn nào. Hãy thêm đặt bàn mới.
                </TableCell>
              </TableRow>
            ) : (
              currentItems &&
              currentItems.map((reservation) => {
                if (!reservation) return null

                const { date, time } = formatDateTime(reservation.bookingTime || '')
                const isConfirmLoading = actionLoading === reservation.id + '-confirm'
                const isCancelLoading = actionLoading === reservation.id + '-cancel'

                return (
                  <TableRow key={reservation.id}>
                    <TableCell>{reservation.customerName}</TableCell>
                    <TableCell className='text-center'>{reservation.phoneNumber}</TableCell>
                    <TableCell className='text-center'>
                      <ReservationPriorityStatus reservationPriorityStatus={reservation.reservationPriorityStatus} />
                    </TableCell>
                    <TableCell className='text-center'>{reservation.numberOfPeople}</TableCell>
                    <TableCell className='text-center'>{date}</TableCell>
                    <TableCell className='text-center'>{time}</TableCell>
                    <TableCell className='text-center'>
                      <Badge variant='outline' className={getStatusColor(reservation.status)}>
                        <div className='text-center w-24'>{getStatusLabel(reservation.status)}</div>
                      </Badge>
                    </TableCell>
                    <TableCell className='text-center'>
                      {reservation.tableId ? (
                        loadingTables[reservation.tableId] ? (
                          <Skeleton className='h-5 w-16' />
                        ) : (
                          <Badge variant='outline' className='bg-orange-50 text-orange-700 border-orange-200 p-1'>
                            <div className='w-14'>
                              {tableCodes[reservation.tableId]
                                ? tableCodes[reservation.tableId]
                                : `Bàn ${reservation.tableId.substring(0, 4)}`}
                            </div>
                          </Badge>
                        )
                      ) : (
                        <span className='text-muted-foreground text-sm'>Chưa xếp</span>
                      )}
                    </TableCell>
                    <TableCell className='text-center'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon'>
                            <MoreHorizontal className='h-4 w-4' />
                            <span className='sr-only'>Mở menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => onView(reservation)}>
                            <Eye className='mr-2 h-4 w-4' />
                            Xem chi tiết
                          </DropdownMenuItem>

                          {reservation.status === 'Confirmed' && (
                            <DropdownMenuItem onClick={() => onAssignTable(reservation)}>
                              <TableIcon className='mr-2 h-4 w-4' />
                              Xếp bàn
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          {reservation.status !== 'Cancelled' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleConfirm(reservation.id)}
                                disabled={isConfirmDisabled(reservation.status) || isConfirmLoading || isCancelLoading}
                                className='text-green-600 focus:text-green-600'
                              >
                                {isConfirmLoading ? (
                                  <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Đang xác nhận...
                                  </>
                                ) : (
                                  <>
                                    <Check className='mr-2 h-4 w-4' />
                                    Xác nhận đặt bàn
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleCancel(reservation.id)}
                                disabled={isCancelDisabled(reservation.status) || isConfirmLoading || isCancelLoading}
                                className='text-red-600 focus:text-red-600'
                              >
                                {isCancelLoading ? (
                                  <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Đang hủy...
                                  </>
                                ) : (
                                  <>
                                    <X className='mr-2 h-4 w-4' />
                                    Hủy đặt bàn
                                  </>
                                )}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && reservations && reservations.length > 0 && (
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div className='text-sm text-muted-foreground'>
            Hiển thị {startIndex + 1}-{endIndex} của {totalItems} đặt bàn
          </div>

          <div className='flex flex-wrap items-center gap-4'>
            <div className='flex items-center space-x-2'>
              <span className='text-sm font-medium'>Hiển thị:</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className='h-8 w-[70px]'>
                  <SelectValue placeholder={itemsPerPage.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='5'>5</SelectItem>
                  <SelectItem value='10'>10</SelectItem>
                  <SelectItem value='20'>20</SelectItem>
                  <SelectItem value='50'>50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='icon'
                className='h-8 w-8'
                onClick={goToFirstPage}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className='h-4 w-4' />
                <span className='sr-only'>Trang đầu</span>
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='h-8 w-8'
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className='h-4 w-4' />
                <span className='sr-only'>Trang trước</span>
              </Button>

              <span className='text-sm'>
                Trang <strong>{currentPage}</strong> / {totalPages || 1}
              </span>

              <Button
                variant='outline'
                size='icon'
                className='h-8 w-8'
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className='h-4 w-4' />
                <span className='sr-only'>Trang sau</span>
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='h-8 w-8'
                onClick={goToLastPage}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronsRight className='h-4 w-4' />
                <span className='sr-only'>Trang cuối</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
