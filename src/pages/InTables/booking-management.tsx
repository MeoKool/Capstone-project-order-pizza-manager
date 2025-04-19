'use client'

import type React from 'react'

import { useState, useEffect, useMemo } from 'react'
import { RefreshCw, ArrowUpDown, X, Filter, CalendarIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

import BookingService from '@/services/booking-service'
import type { Reservation } from '@/types/reservation'

import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { BookingTable } from './components/Booking/BookingTable'
import { ViewBookingDialog } from './components/Booking/ViewBookingDialog'
import { AssignTableDialog } from './components/Booking/AssignTableDialog'

// Define types for sorting and filtering
type SortOption =
  | 'newest'
  | 'oldest'
  | 'name-asc'
  | 'name-desc'
  | 'people-asc'
  | 'people-desc'
  | 'status-asc'
  | 'status-desc'
  | 'priorityStatus'

type StatusFilter = 'all' | 'Created' | 'Confirmed' | 'Checkedin' | 'Cancelled'

// Helper functions for status display
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'Created':
      return 'Đã tạo'
    case 'Confirmed':
      return 'Đã xác nhận'
    case 'Checkedin':
      return 'Đã check-in'
    case 'Cancelled':
      return 'Đã hủy'
    default:
      return status
  }
}

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Created':
      return 'bg-gray-50 text-gray-700 border-gray-200 p-1'
    case 'Confirmed':
      return 'bg-blue-50 text-blue-700 border-blue-200 p-1'
    case 'Checkedin':
      return 'bg-green-50 text-green-700 border-green-200 p-1'
    case 'Cancelled':
      return 'bg-red-50 text-red-700 border-red-200 p-1'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200 p-1'
  }
}

// Helper function to format date strings
export const formatDateString = (dateStr: string): string => {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'N/A'

    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  } catch (error) {
    console.error('Error formatting date string:', error, 'for input:', dateStr)
    return 'N/A'
  }
}

function BookingPage() {
  // State for reservations data
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [viewingReservation, setViewingReservation] = useState<Reservation | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [assigningReservation, setAssigningReservation] = useState<Reservation | null>(null)
  const [isAssignTableDialogOpen, setIsAssignTableDialogOpen] = useState(false)

  // Filtering and sorting states
  const [sortOption, setSortOption] = useState<SortOption>('newest')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dateFilter, setDateFilter] = useState<Date | undefined>(new Date())

  const bookingService = BookingService.getInstance()

  // Fetch reservations from API
  const fetchReservations = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await bookingService.getAllReservations()
      if (response.success && response.result) {
        // Ensure we have an array of reservations
        const reservationsData = Array.isArray(response.result.items) ? response.result.items : [response.result.items]
        setReservations(reservationsData)
      } else {
        console.error('Failed to fetch reservations:', response)
        setError('Không thể tải danh sách đặt bàn')
      }
    } catch (error) {
      console.error('Error fetching reservations:', error)
      setError('Không thể tải danh sách đặt bàn')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper functions for sorting
  const getStatusSortValue = (status: string): number => {
    switch (status) {
      case 'Created':
        return 1
      case 'Confirmed':
        return 2
      case 'Checkedin':
        return 3
      case 'Cancelled':
        return 4
      default:
        return 99
    }
  }

  const getPrioritySortValue = (status: string): number => {
    switch (status) {
      case 'Priority':
        return 1
      case 'NonPriority':
        return 2
      default:
        return 99
    }
  }

  // Apply filters and sorting to get filtered reservations
  const filteredReservations = useMemo(() => {
    let result = [...reservations]

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((reservation) => reservation.status.toLowerCase() === statusFilter.toLowerCase())
    }

    // Apply date filter
    if (dateFilter) {
      result = result.filter((reservation) => {
        const bookingDate = new Date(reservation.bookingTime)
        return (
          bookingDate.getFullYear() === dateFilter.getFullYear() &&
          bookingDate.getMonth() === dateFilter.getMonth() &&
          bookingDate.getDate() === dateFilter.getDate()
        )
      })
    }

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (reservation) =>
          reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reservation.phoneNumber.includes(searchTerm)
      )
    }

    // Apply sorting
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime())
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.bookingTime).getTime() - new Date(b.bookingTime).getTime())
        break
      case 'name-asc':
        result.sort((a, b) => a.customerName.localeCompare(b.customerName))
        break
      case 'name-desc':
        result.sort((a, b) => b.customerName.localeCompare(a.customerName))
        break
      case 'people-asc':
        result.sort((a, b) => a.numberOfPeople - b.numberOfPeople)
        break
      case 'people-desc':
        result.sort((a, b) => b.numberOfPeople - a.numberOfPeople)
        break
      case 'status-asc':
        result.sort((a, b) => getStatusSortValue(a.status) - getStatusSortValue(b.status))
        break
      case 'status-desc':
        result.sort((a, b) => getStatusSortValue(b.status) - getStatusSortValue(a.status))
        break
      case 'priorityStatus':
        result.sort(
          (a, b) =>
            getPrioritySortValue(a.reservationPriorityStatus) - getPrioritySortValue(b.reservationPriorityStatus)
        )
        break
    }

    return result
  }, [reservations, searchTerm, sortOption, statusFilter, dateFilter])

  // Fetch reservations on component mount
  useEffect(() => {
    fetchReservations()
  }, [])

  // Get label for sort option
  const getSortLabel = (option: SortOption): string => {
    switch (option) {
      case 'newest':
        return 'Mới nhất'
      case 'oldest':
        return 'Cũ nhất'
      case 'priorityStatus':
        return 'Độ ưu tiên'
      case 'name-asc':
        return 'Tên: A-Z'
      case 'name-desc':
        return 'Tên: Z-A'
      case 'people-asc':
        return 'Số người: Tăng dần'
      case 'people-desc':
        return 'Số người: Giảm dần'
      case 'status-asc':
        return 'Trạng thái: Tăng dần'
      case 'status-desc':
        return 'Trạng thái: Giảm dần'
    }
  }

  // Event handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setDateFilter(undefined)
    setSortOption('newest')
  }

  const handleViewReservation = (reservation: Reservation) => {
    setViewingReservation(reservation)
    setIsViewDialogOpen(true)
  }

  const handleAssignTable = (reservation: Reservation) => {
    setAssigningReservation(reservation)
    setIsAssignTableDialogOpen(true)
  }

  return (
    <div className='mx-auto py-6'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
          <div>
            <CardTitle className='text-2xl'>Quản lý đặt bàn</CardTitle>
            <CardDescription>Quản lý thông tin đặt bàn và lịch hẹn của khách hàng.</CardDescription>
          </div>
          <Button variant='outline' onClick={fetchReservations} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </CardHeader>

        <CardContent>
          {/* Filters section */}
          <div className='flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-2 mb-6'>
            <div className='relative flex-1 max-w-md'>
              <Input
                type='text'
                placeholder='Tìm kiếm theo tên hoặc SĐT...'
                className='w-full'
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <button className='absolute right-3 top-1/2 transform -translate-y-1/2' onClick={clearSearch}>
                  <X className='h-4 w-4 text-gray-500' />
                </button>
              )}
            </div>

            <div className='flex flex-wrap gap-2'>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <SelectTrigger className='w-[150px]'>
                  <div className='flex items-center gap-2'>
                    <Filter className='h-4 w-4' />
                    <SelectValue placeholder='Trạng thái'>
                      {statusFilter === 'all' ? 'Tất cả trạng thái' : getStatusLabel(statusFilter)}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tất cả trạng thái</SelectItem>
                  <SelectItem value='Created'>Đã tạo</SelectItem>
                  <SelectItem value='Confirmed'>Đã xác nhận</SelectItem>
                  <SelectItem value='Checkedin'>Đã check-in</SelectItem>
                  <SelectItem value='Cancelled'>Đã hủy</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline' className='w-[180px] justify-start text-left font-normal'>
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {dateFilter ? formatDateString(dateFilter.toISOString()) : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar mode='single' selected={dateFilter} onSelect={setDateFilter} initialFocus />
                </PopoverContent>
              </Popover>

              <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                <SelectTrigger className='w-[180px]'>
                  <div className='flex items-center gap-2'>
                    <ArrowUpDown className='h-4 w-4' />
                    <SelectValue placeholder='Sắp xếp'>{getSortLabel(sortOption)}</SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='newest'>Mới nhất</SelectItem>
                  <SelectItem value='oldest'>Cũ nhất</SelectItem>
                  <SelectItem value='priorityStatus'>Độ ưu tiên</SelectItem>
                  <SelectItem value='name-asc'>Tên: A-Z</SelectItem>
                  <SelectItem value='name-desc'>Tên: Z-A</SelectItem>
                  <SelectItem value='people-asc'>Số người: Tăng dần</SelectItem>
                  <SelectItem value='people-desc'>Số người: Giảm dần</SelectItem>
                  <SelectItem value='status-asc'>Trạng thái: Tăng dần</SelectItem>
                  <SelectItem value='status-desc'>Trạng thái: Giảm dần</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error alert */}
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Active filters display */}
          {(searchTerm || statusFilter !== 'all' || dateFilter || sortOption !== 'newest') && (
            <div className='flex flex-wrap items-center gap-2 mb-4'>
              {searchTerm && (
                <Badge variant='secondary' className='flex items-center gap-1'>
                  Tìm kiếm: {searchTerm}
                  <Button variant='ghost' size='sm' className='h-4 w-4 p-0 ml-1' onClick={clearSearch}>
                    <X className='h-3 w-3' />
                    <span className='sr-only'>Xóa tìm kiếm</span>
                  </Button>
                </Badge>
              )}

              {statusFilter !== 'all' && (
                <Badge variant='secondary' className='flex items-center gap-1'>
                  Trạng thái: {getStatusLabel(statusFilter)}
                  <Button variant='ghost' size='sm' className='h-4 w-4 p-0 ml-1' onClick={() => setStatusFilter('all')}>
                    <X className='h-3 w-3' />
                    <span className='sr-only'>Xóa bộ lọc</span>
                  </Button>
                </Badge>
              )}

              {dateFilter && (
                <Badge variant='secondary' className='flex items-center gap-1'>
                  Ngày: {formatDateString(dateFilter.toISOString())}
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-4 w-4 p-0 ml-1'
                    onClick={() => setDateFilter(undefined)}
                  >
                    <X className='h-3 w-3' />
                    <span className='sr-only'>Xóa bộ lọc</span>
                  </Button>
                </Badge>
              )}

              {sortOption !== 'newest' && (
                <Badge variant='outline' className='flex items-center gap-1'>
                  Sắp xếp: {getSortLabel(sortOption)}
                </Badge>
              )}

              <Button variant='outline' size='sm' onClick={clearFilters}>
                Xóa tất cả bộ lọc
              </Button>
            </div>
          )}

          {/* Booking table */}
          <BookingTable
            reservations={filteredReservations}
            isLoading={isLoading}
            getStatusLabel={getStatusLabel}
            getStatusColor={getStatusColor}
            onView={handleViewReservation}
            onRefresh={fetchReservations}
            onAssignTable={handleAssignTable}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      {viewingReservation && (
        <ViewBookingDialog
          reservation={viewingReservation}
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
        />
      )}

      {assigningReservation && (
        <AssignTableDialog
          reservation={assigningReservation}
          open={isAssignTableDialogOpen}
          onClose={() => {
            setIsAssignTableDialogOpen(false)
            setAssigningReservation(null)
            fetchReservations()
          }}
        />
      )}
    </div>
  )
}

export default BookingPage
