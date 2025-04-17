'use client'

import { useState, useEffect } from 'react'
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  Calendar,
  Filter,
  ChevronDown,
  ChevronRight,
  X,
  Ban
} from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OrderDetailsDialog } from './order-details-dialog'
import { type Order, PAYMENT_STATUS } from '@/types/order'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import OrderService from '@/services/order-service'
import React from 'react'

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100]
const orderService = OrderService.getInstance()

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [totalCount, setTotalCount] = useState(0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Order | null
    direction: 'asc' | 'desc'
  }>({ key: 'startTime', direction: 'desc' })
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined
  })
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchOrders()
  }, [currentPage, pageSize])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const response = await orderService.getAllOrders()
      if (response?.success && response.result) {
        setOrders(response.result.items)
        setTotalCount(response.result.totalCount)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearFilters = () => {
    setDateRange({ from: undefined, to: undefined })
    setStatusFilter(null)
    setSearchTerm('')
  }

  const handleDateSelect = (range: { from: Date | undefined; to?: Date | undefined }) => {
    // Safely handle date range selection
    setDateRange({
      from: range.from,
      to: range.to
    })
  }

  const filteredOrders = orders.filter((order) => {
    // Text search filter
    const matchesSearch =
      searchTerm === '' ||
      order.tableCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderCode?.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    const matchesStatus = statusFilter === null || order.status === statusFilter

    // Date range filter
    let matchesDateRange = true
    if (dateRange.from) {
      const orderDate = new Date(order.startTime)
      const fromDate = new Date(dateRange.from)
      fromDate.setHours(0, 0, 0, 0)

      if (dateRange.to) {
        // Set time to end of day for the "to" date for inclusive range
        const toDate = new Date(dateRange.to)
        toDate.setHours(23, 59, 59, 999)
        matchesDateRange = orderDate >= fromDate && orderDate <= toDate
      } else {
        matchesDateRange = orderDate >= fromDate
      }
    }

    return matchesSearch && matchesStatus && matchesDateRange
  })

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return sortConfig.direction === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number)
  })

  // Calculate total pages
  const totalPages = Math.ceil(filteredOrders.length / pageSize)
  const paginatedOrders = sortedOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSort = (key: keyof Order) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleViewDetails = async (orderId: string) => {
    try {
      const response = await orderService.getOrderById(orderId)
      if (response?.success && response.result) {
        setSelectedOrderDetail(response.result)
        setIsDetailsDialogOpen(true)
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case PAYMENT_STATUS.PAID:
        return (
          <div className='inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-50 text-green-600'>
            <CheckCircle2 className='mr-1 h-3.5 w-3.5' />
            Đã thanh toán
          </div>
        )
      case PAYMENT_STATUS.CHECKOUT:
        return (
          <div className='inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-50 text-blue-600'>
            <Clock className='mr-1 h-3.5 w-3.5' />
            Đã checkout
          </div>
        )
      case PAYMENT_STATUS.UNPAID:
        return (
          <div className='inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-amber-50 text-amber-600'>
            <AlertCircle className='mr-1 h-3.5 w-3.5' />
            Chưa thanh toán
          </div>
        )
      case PAYMENT_STATUS.CANCELLED:
        return (
          <div className='inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-red-50 text-red-600'>
            <Ban className='mr-1 h-3.5 w-3.5' />
            Đã hủy
          </div>
        )
      default:
        return (
          <div className='inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'>
            {status}
          </div>
        )
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatDateDisplay = (date: Date | undefined) => {
    if (!date) return ''
    return format(date, 'dd/MM/yyyy')
  }

  const toggleRowExpansion = (orderId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [orderId]: !prev[orderId]
    }))
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div className='space-y-1'>
          <h2 className='text-2xl font-bold'>Danh sách đơn hàng</h2>
          <p className='text-sm text-muted-foreground'>Tổng số {totalCount} đơn hàng</p>
        </div>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <Input
              placeholder='Tìm kiếm đơn hàng...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-[200px]'
            />

            {/* Date Range Picker */}
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant='outline' size='sm' className='h-9 border-dashed'>
                  <Calendar className='mr-2 h-4 w-4' />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {formatDateDisplay(dateRange.from)} - {formatDateDisplay(dateRange.to)}
                      </>
                    ) : (
                      formatDateDisplay(dateRange.from)
                    )
                  ) : (
                    'Chọn ngày'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <CalendarComponent
                  initialFocus
                  mode='range'
                  defaultMonth={dateRange.from}
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to
                  }}
                  onSelect={(range) => {
                    if (range) {
                      handleDateSelect(range)
                    } else {
                      // Handle the case when range is null (user cleared the selection)
                      setDateRange({ from: undefined, to: undefined })
                    }
                  }}
                  numberOfMonths={2}
                  locale={vi}
                />
                <div className='flex items-center justify-between p-3 border-t'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setDateRange({ from: undefined, to: undefined })
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                  <Button
                    size='sm'
                    onClick={() => {
                      setIsDatePickerOpen(false)
                    }}
                  >
                    Áp dụng
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className='h-9'>
                  <Filter className='mr-2 h-4 w-4' />
                  {statusFilter ? (
                    <>
                      Trạng thái:{' '}
                      {statusFilter === PAYMENT_STATUS.PAID
                        ? 'Đã thanh toán'
                        : statusFilter === PAYMENT_STATUS.UNPAID
                          ? 'Chưa thanh toán'
                          : statusFilter === PAYMENT_STATUS.CHECKOUT
                            ? 'Đã checkout'
                            : statusFilter === PAYMENT_STATUS.CANCELLED
                              ? 'Đã hủy'
                              : 'Khác'}
                    </>
                  ) : (
                    'Lọc trạng thái'
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-[200px]'>
                <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                  Tất cả
                  {statusFilter === null && <CheckCircle2 className='ml-auto h-4 w-4' />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(PAYMENT_STATUS.UNPAID)}>
                  Chưa thanh toán
                  {statusFilter === PAYMENT_STATUS.UNPAID && <CheckCircle2 className='ml-auto h-4 w-4' />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(PAYMENT_STATUS.PAID)}>
                  Đã thanh toán
                  {statusFilter === PAYMENT_STATUS.PAID && <CheckCircle2 className='ml-auto h-4 w-4' />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(PAYMENT_STATUS.CHECKOUT)}>
                  Đã checkout
                  {statusFilter === PAYMENT_STATUS.CHECKOUT && <CheckCircle2 className='ml-auto h-4 w-4' />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(PAYMENT_STATUS.CANCELLED)}>
                  Đã hủy
                  {statusFilter === PAYMENT_STATUS.CHECKOUT && <CheckCircle2 className='ml-auto h-4 w-4' />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active Filters */}
          {(dateRange.from || dateRange.to || statusFilter) && (
            <div className='flex items-center gap-2 ml-2'>
              <Button variant='destructive' size='sm' onClick={clearFilters} className='h-8 px-2 text-xs'>
                Xóa tất cả bộ lọc
              </Button>
            </div>
          )}

          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className='w-[140px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size} dòng / trang
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='rounded-md border shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow className='bg-gray-50'>
              <TableHead className='w-[60px] text-center'>STT</TableHead>
              <TableHead>
                <div className='flex items-center gap-2 cursor-pointer' onClick={() => handleSort('tableCode')}>
                  Bàn
                  <ArrowUpDown className='h-4 w-4' />
                </div>
              </TableHead>
              <TableHead>
                <div className='flex items-center gap-2 cursor-pointer' onClick={() => handleSort('startTime')}>
                  Thời gian bắt đầu
                  <ArrowUpDown className='h-4 w-4' />
                </div>
              </TableHead>
              <TableHead>
                <div className='flex items-center gap-2 cursor-pointer' onClick={() => handleSort('endTime')}>
                  Thời gian kết thúc
                  <ArrowUpDown className='h-4 w-4' />
                </div>
              </TableHead>
              <TableHead>
                <div className='flex items-center gap-2 cursor-pointer' onClick={() => handleSort('totalPrice')}>
                  Tổng tiền
                  <ArrowUpDown className='h-4 w-4' />
                </div>
              </TableHead>
              <TableHead>
                <div className='flex items-center gap-2 cursor-pointer' onClick={() => handleSort('status')}>
                  Trạng thái
                  <ArrowUpDown className='h-4 w-4' />
                </div>
              </TableHead>
              <TableHead className='text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className='text-center py-10'>
                  <div className='flex justify-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                  </div>
                  <p className='mt-2 text-sm text-muted-foreground'>Đang tải dữ liệu...</p>
                </TableCell>
              </TableRow>
            ) : paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='text-center py-10'>
                  <p className='text-muted-foreground'>Không có đơn hàng nào</p>
                  {(dateRange.from || dateRange.to || statusFilter || searchTerm) && (
                    <Button variant='outline' size='sm' onClick={clearFilters} className='mt-2'>
                      Xóa bộ lọc
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order, index) => (
                <React.Fragment key={order.id}>
                  <TableRow
                    className={`hover:bg-orange-100 cursor-pointer transition-colors ${
                      expandedRows[order.id] ? 'bg-orange-200 font-medium' : ''
                    }`}
                    onClick={() => toggleRowExpansion(order.id)}
                  >
                    <TableCell className='text-center font-medium'>
                      <div className='flex items-center justify-center'>
                        {expandedRows[order.id] ? (
                          <ChevronDown className='h-4 w-4 mr-1 text-primary' />
                        ) : (
                          <ChevronRight className='h-4 w-4 mr-1' />
                        )}
                        {(currentPage - 1) * pageSize + index + 1}
                      </div>
                    </TableCell>
                    <TableCell className='font-medium'>{order.tableCode}</TableCell>
                    <TableCell>{formatDate(order.startTime)}</TableCell>
                    <TableCell>{formatDate(order.endTime)}</TableCell>
                    <TableCell className='font-medium text-primary'>
                      {order.totalPrice ? order.totalPrice.toLocaleString('vi-VN') : 'Chưa thanh toán'} ₫
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon' onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewDetails(order.id)
                            }}
                          >
                            <Eye className='h-4 w-4 mr-2' />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Edit className='h-4 w-4 mr-2' />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className='text-destructive focus:text-destructive'
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className='h-4 w-4 mr-2' />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedRows[order.id] && <OrderDetailRows orderId={order.id} />}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center'>
        <p className='text-sm  w-80'>
          Hiển thị {paginatedOrders.length} trên tổng số {filteredOrders.length} đơn hàng
        </p>
        <Pagination className=''>
          <PaginationContent>
            <PaginationItem className='cursor-pointer'>
              <PaginationPrevious
                size='default'
                onClick={currentPage === 1 ? undefined : () => setCurrentPage((p) => Math.max(1, p - 1))}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum = i + 1
              if (totalPages > 5) {
                if (currentPage > 3) {
                  pageNum = currentPage - 3 + i
                }
                if (currentPage > totalPages - 2) {
                  pageNum = totalPages - 4 + i
                }
              }
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    size='default'
                    onClick={() => setCurrentPage(pageNum)}
                    isActive={currentPage === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
            <PaginationItem>
              <PaginationNext
                size='default'
                onClick={
                  currentPage === totalPages ? undefined : () => setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <OrderDetailsDialog
        orderDetail={selectedOrderDetail}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />
    </div>
  )
}

function OrderDetailRows({ orderId }: { orderId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orderDetail, setOrderDetail] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true)
      try {
        const response = await orderService.getOrderById(orderId)
        if (response?.success && response.result) {
          setOrderDetail(response.result)
        }
      } catch (error) {
        console.error('Failed to fetch order details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const calculateDuration = (startTime: string | null, endTime: string | null) => {
    if (!startTime || !endTime) return '—'

    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationMs = end.getTime() - start.getTime()

    const hours = Math.floor(durationMs / 3600000)
    const minutes = Math.floor((durationMs % 3600000) / 60000)

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`
    } else {
      return `${minutes} phút`
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Done':
        return (
          <div className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200'>
            <CheckCircle2 className='w-3 h-3 mr-1' />
            Đã hoàn thành
          </div>
        )
      case 'Cancelled':
        return (
          <div className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200'>
            <X className='w-3 h-3 mr-1' />
            Đã hủy
          </div>
        )
      case 'Pending':
      case 'Cooking':
        return (
          <div className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200'>
            <Clock className='w-3 h-3 mr-1' />
            Đang chế biến
          </div>
        )
      default:
        return (
          <div className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'>
            {status}
          </div>
        )
    }
  }

  if (isLoading) {
    return (
      <TableRow className='bg-gray-50'>
        <TableCell colSpan={7} className='text-center py-4'>
          <div className='flex justify-center'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
          </div>
          <p className='mt-2 text-sm text-muted-foreground'>Đang tải chi tiết đơn hàng...</p>
        </TableCell>
      </TableRow>
    )
  }

  if (!orderDetail || !orderDetail.orderItems || orderDetail.orderItems.length === 0) {
    return (
      <TableRow className='bg-gray-50'>
        <TableCell colSpan={7} className='text-center py-4'>
          <p className='text-muted-foreground'>Không có thông tin chi tiết</p>
        </TableCell>
      </TableRow>
    )
  }

  // First, add a header row for the detail columns
  return (
    <>
      <TableRow className='bg-gray-200 text-sm font-medium'>
        <TableCell className='py-2'></TableCell>
        <TableCell className='py-2 text-primary'>Tên món</TableCell>
        <TableCell className='py-2 text-center text-primary'>Bắt đầu</TableCell>
        <TableCell className='py-2 text-center text-primary'>Phục vụ</TableCell>
        <TableCell className='py-2 text-center text-primary'>Chế biến</TableCell>
        <TableCell className='py-2 text-center text-primary'>Hoàn thành</TableCell>
        <TableCell className='py-2 text-center text-primary'>Tổng thời gian</TableCell>
      </TableRow>

      {orderDetail.orderItems.map((item: any, index: number) => {
        const isEven = index % 2 === 0
        return (
          <TableRow key={item.id} className={`${isEven ? 'bg-white' : 'bg-gray-50'} text-sm`}>
            <TableCell className='py-2'></TableCell>
            <TableCell className='py-2'>
              <div className='flex flex-col'>
                <div>
                  <span className='font-medium'>{item.name}</span>
                  <span className='text-xs text-gray-500 ml-2'>(SL: {item.quantity})</span>
                </div>
                <div className='mt-1'>{getStatusBadge(item.orderItemStatus)}</div>
              </div>
            </TableCell>
            <TableCell className='py-2 text-center'>{formatTime(item.startTime)}</TableCell>
            <TableCell className='py-2 text-center'>{formatTime(item.startTimeServing)}</TableCell>
            <TableCell className='py-2 text-center'>{formatTime(item.startTimeCooking)}</TableCell>
            <TableCell className='py-2 text-center'>{formatTime(item.endTime)}</TableCell>
            <TableCell className='py-2 text-center font-medium text-primary'>
              {calculateDuration(item.startTime, item.endTime)}
            </TableCell>
          </TableRow>
        )
      })}
    </>
  )
}
