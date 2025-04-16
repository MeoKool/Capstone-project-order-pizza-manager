import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useVoucher } from './voucher-provider'
import type { Voucher } from '@/types/voucher'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Search, X } from 'lucide-react'
import { format, isValid, parseISO } from 'date-fns'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'

interface VoucherTableProps {
  onDelete: (voucher: Voucher) => void
}

export function VoucherTable({ onDelete }: VoucherTableProps) {
  const { vouchers, voucherTypes, loading } = useVoucher()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [voucherTypeFilter, setVoucherTypeFilter] = useState<string>('')
  const [dateFilter, setDateFilter] = useState<Date | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Filter vouchers based on search term and filters
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((voucher) => {
      const matchesSearch = searchTerm === '' || voucher.code.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === '' || voucher.voucherStatus === statusFilter

      const matchesVoucherType = voucherTypeFilter === '' || voucher.voucherBatchId === voucherTypeFilter

      const matchesDate =
        !dateFilter ||
        (voucher.expiryDate && isValid(parseISO(voucher.expiryDate)) && new Date(voucher.expiryDate) >= dateFilter)

      return matchesSearch && matchesStatus && matchesVoucherType && matchesDate
    })
  }, [vouchers, searchTerm, statusFilter, voucherTypeFilter, dateFilter])

  // Calculate pagination
  const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage)
  const paginatedVouchers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredVouchers.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredVouchers, currentPage, itemsPerPage])

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setVoucherTypeFilter('')
    setDateFilter(null)
  }

  const hasFilters = searchTerm !== '' || statusFilter !== '' || voucherTypeFilter !== '' || dateFilter !== null

  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(1)
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  const goToLastPage = () => setCurrentPage(totalPages)
  const goToPage = (page: number) => setCurrentPage(page)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than or equal to maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always include first page
      pageNumbers.push(1)

      // Calculate start and end of middle pages
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if we're at the beginning
      if (currentPage <= 2) {
        endPage = 3
      }

      // Adjust if we're at the end
      if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('...')
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('...')
      }

      // Always include last page
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  // Get voucher type name by ID
  const getVoucherTypeName = (id: string) => {
    const voucherType = voucherTypes.find((type) => type.id === id)
    return voucherType ? voucherType.batchCode : 'N/A'
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row gap-4 mb-6 bg-gray-50/50 p-4 rounded-xl border'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Tìm kiếm theo mã voucher...'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            className='pl-9 border-input focus:ring-2 focus:ring-offset-1 focus:ring-primary/20 bg-white'
          />
          {searchTerm && (
            <Button
              variant='ghost'
              size='sm'
              className='absolute right-0 top-0 h-9 w-9 p-0 hover:bg-transparent'
              onClick={() => {
                setSearchTerm('')
                setCurrentPage(1) // Reset to first page on clear
              }}
            >
              <X className='h-4 w-4' />
              <span className='sr-only'>Xóa tìm kiếm</span>
            </Button>
          )}
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value)
            setCurrentPage(1) // Reset to first page on filter change
          }}
        >
          <SelectTrigger className='w-[180px] bg-white border-input'>
            <SelectValue placeholder='Trạng thái' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả trạng thái</SelectItem>
            <SelectItem value='Available'>Khả dụng</SelectItem>
            <SelectItem value='Used'>Đã sử dụng</SelectItem>
            <SelectItem value='Expired'>Hết hạn</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={voucherTypeFilter}
          onValueChange={(value) => {
            setVoucherTypeFilter(value)
            setCurrentPage(1) // Reset to first page on filter change
          }}
        >
          <SelectTrigger className='w-[180px] bg-white border-input'>
            <SelectValue placeholder='Loại voucher' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả loại</SelectItem>
            {voucherTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.batchCode}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverContent className='w-auto p-0'>
            <CalendarComponent
              mode='single'
              selected={dateFilter || undefined}
              onSelect={(date) => setDateFilter(date || null)}
              initialFocus
            />{' '}
          </PopoverContent>
        </Popover>
        {hasFilters && (
          <Button
            variant='outline'
            onClick={() => {
              clearFilters()
              setCurrentPage(1) // Reset to first page on clear filters
            }}
            className='border-gray-300 hover:bg-gray-50 bg-white'
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {hasFilters && (
        <div className='flex flex-wrap gap-2 mb-4'>
          {searchTerm && (
            <Badge
              variant='secondary'
              className='flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border-0'
            >
              <Search className='h-3 w-3 mr-1' />
              Tìm kiếm: {searchTerm}
              <Button
                variant='ghost'
                size='sm'
                className='h-4 w-4 p-0 ml-1 text-primary hover:bg-transparent'
                onClick={() => {
                  setSearchTerm('')
                  setCurrentPage(1) // Reset to first page on clear
                }}
              >
                <X className='h-3 w-3' />
                <span className='sr-only'>Xóa tìm kiếm</span>
              </Button>
            </Badge>
          )}
          {statusFilter && (
            <Badge
              variant='secondary'
              className='flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border-0'
            >
              Trạng thái:{' '}
              {statusFilter === 'Available' ? 'Khả dụng' : statusFilter === 'Used' ? 'Đã sử dụng' : 'Hết hạn'}
              <Button
                variant='ghost'
                size='sm'
                className='h-4 w-4 p-0 ml-1 text-primary hover:bg-transparent'
                onClick={() => {
                  setStatusFilter('')
                  setCurrentPage(1) // Reset to first page on clear
                }}
              >
                <X className='h-3 w-3' />
                <span className='sr-only'>Xóa bộ lọc trạng thái</span>
              </Button>
            </Badge>
          )}
          {voucherTypeFilter && (
            <Badge
              variant='secondary'
              className='flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border-0'
            >
              Loại voucher: {getVoucherTypeName(voucherTypeFilter)}
              <Button
                variant='ghost'
                size='sm'
                className='h-4 w-4 p-0 ml-1 text-primary hover:bg-transparent'
                onClick={() => {
                  setVoucherTypeFilter('')
                  setCurrentPage(1) // Reset to first page on clear
                }}
              >
                <X className='h-3 w-3' />
                <span className='sr-only'>Xóa bộ lọc loại voucher</span>
              </Button>
            </Badge>
          )}
          {dateFilter && (
            <Badge
              variant='secondary'
              className='flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border-0'
            >
              Ngày hết hạn: {format(dateFilter, 'dd/MM/yyyy')}
              <Button
                variant='ghost'
                size='sm'
                className='h-4 w-4 p-0 ml-1 text-primary hover:bg-transparent'
                onClick={() => {
                  setDateFilter(null)
                  setCurrentPage(1) // Reset to first page on clear
                }}
              >
                <X className='h-3 w-3' />
                <span className='sr-only'>Xóa bộ lọc ngày</span>
              </Button>
            </Badge>
          )}
        </div>
      )}

      <div className='rounded-xl border overflow-hidden shadow-sm'>
        <Table>
          <TableHeader className='bg-gray-50'>
            <TableRow>
              <TableHead className='font-medium'>Mã voucher</TableHead>
              <TableHead className='font-medium'>Loại giảm giá</TableHead>
              <TableHead className='font-medium'>Giá trị</TableHead>
              <TableHead className='font-medium'>Trạng thái</TableHead>
              <TableHead className='font-medium'>Loại voucher</TableHead>
              <TableHead className='w-[80px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index} className='animate-pulse'>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-24'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-24'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-16'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-20'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-24'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-8'></div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredVouchers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='h-24 text-center'>
                  Không tìm thấy voucher nào
                </TableCell>
              </TableRow>
            ) : (
              paginatedVouchers.map((voucher) => (
                <TableRow key={voucher.id} className='hover:bg-gray-50/50 transition-colors'>
                  <TableCell className='font-medium'>{voucher.code}</TableCell>
                  <TableCell>
                    <Badge
                      variant={voucher.discountType === 'Percentage' ? 'default' : 'secondary'}
                      className={
                        voucher.discountType === 'Percentage'
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-0'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-0'
                      }
                    >
                      {voucher.discountType === 'Percentage' ? 'Phần trăm (%)' : 'Trực tiếp (VNĐ)'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {voucher.discountValue}
                    {voucher.discountType === 'Percentage' ? '%' : ' VNĐ'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        voucher.voucherStatus === 'Available'
                          ? 'default'
                          : voucher.voucherStatus === 'Used'
                            ? 'secondary'
                            : 'outline'
                      }
                      className={
                        voucher.voucherStatus === 'Available'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 border-0'
                          : voucher.voucherStatus === 'Used'
                            ? 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-0'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-0'
                      }
                    >
                      {voucher.voucherStatus === 'Available' && 'Khả dụng'}
                      {voucher.voucherStatus === 'Used' && 'Đã sử dụng'}
                      {voucher.voucherStatus === 'Expired' && 'Hết hạn'}
                    </Badge>
                  </TableCell>
                  <TableCell>{getVoucherTypeName(voucher.voucherBatchId)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm' className='h-8 w-8 p-0 rounded-full hover:bg-gray-100'>
                          <MoreHorizontal className='h-4 w-4' />
                          <span className='sr-only'>Mở menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() => onDelete(voucher)}
                          className='text-destructive focus:text-destructive'
                        >
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

      {/* Pagination */}
      {!loading && filteredVouchers.length > 0 && (
        <div className='flex items-center justify-between mt-6'>
          <div className='flex items-center gap-2'>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(1) // Reset to first page when changing items per page
              }}
            >
              <SelectTrigger className='w-[120px] h-8'>
                <SelectValue placeholder='Hiển thị' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='5'>5 hàng</SelectItem>
                <SelectItem value='10'>10 hàng</SelectItem>
                <SelectItem value='20'>20 hàng</SelectItem>
                <SelectItem value='50'>50 hàng</SelectItem>
              </SelectContent>
            </Select>
            <p className='text-sm text-muted-foreground'>
              Hiển thị{' '}
              <span className='font-medium'>
                {Math.min((currentPage - 1) * itemsPerPage + 1, filteredVouchers.length)}
              </span>{' '}
              đến <span className='font-medium'>{Math.min(currentPage * itemsPerPage, filteredVouchers.length)}</span>{' '}
              trong <span className='font-medium'>{filteredVouchers.length}</span> kết quả
            </p>
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

            <div className='flex items-center'>
              {getPageNumbers().map((page, index) =>
                typeof page === 'number' ? (
                  <Button
                    key={index}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size='icon'
                    className={`h-8 w-8 ${currentPage === page ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ) : (
                  <span key={index} className='px-2 text-muted-foreground'>
                    {page}
                  </span>
                )
              )}
            </div>

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
      )}
    </div>
  )
}
