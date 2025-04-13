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
  Filter
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

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100]
const orderService = OrderService.getInstance()

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [totalCount, setTotalCount] = useState(0)
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
                          : 'Đã checkout'}
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

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50'>
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
                <TableRow key={order.id} className='hover:bg-muted/50'>
                  <TableCell className='text-center font-medium'>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                  <TableCell>{order.tableCode}</TableCell>
                  <TableCell>{formatDate(order.startTime)}</TableCell>
                  <TableCell>{formatDate(order.endTime)}</TableCell>
                  <TableCell className='font-medium'>
                    {order.totalPrice ? order.totalPrice.toLocaleString('vi-VN') : 'Chưa thanh toán'} ₫
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => handleViewDetails(order.id)}>
                          <Eye className='h-4 w-4 mr-2' />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className='h-4 w-4 mr-2' />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='text-destructive focus:text-destructive'>
                          <Trash2 className='h-4 w-4 mr-2' />
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

      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          Hiển thị {paginatedOrders.length} trên tổng số {filteredOrders.length} đơn hàng
        </p>
        <Pagination className='cursor-pointer'>
          <PaginationContent>
            <PaginationItem>
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
