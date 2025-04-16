'use client'

import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useVoucher } from './voucher-provider'
import type { VoucherType } from '@/types/voucher'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Search,
  X,
  Calendar,
  Ticket
} from 'lucide-react'
import { format, isValid, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { cn } from '@/utils/utils'

interface VoucherTypeTableProps {
  onEdit: (voucherType: VoucherType) => void
  onDelete: (voucherType: VoucherType) => void
  onGenerateVouchers: (voucherType: VoucherType) => void
}

export function VoucherTypeTable({ onEdit, onDelete, onGenerateVouchers }: VoucherTypeTableProps) {
  const { voucherTypes, loading } = useVoucher()
  const [searchTerm, setSearchTerm] = useState('')
  const [discountTypeFilter, setDiscountTypeFilter] = useState<string>('')
  const [dateFilter, setDateFilter] = useState<Date | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Filter voucher types based on search term and filters
  const filteredVoucherTypes = useMemo(() => {
    return voucherTypes.filter((type) => {
      const matchesSearch =
        searchTerm === '' ||
        type.batchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDiscountType = discountTypeFilter === '' || type.discountType === discountTypeFilter

      const matchesDate =
        !dateFilter ||
        (isValid(parseISO(type.startDate)) &&
          isValid(parseISO(type.endDate)) &&
          dateFilter >= new Date(type.startDate) &&
          dateFilter <= new Date(type.endDate))

      return matchesSearch && matchesDiscountType && matchesDate
    })
  }, [voucherTypes, searchTerm, discountTypeFilter, dateFilter])

  // Calculate pagination
  const totalPages = Math.ceil(filteredVoucherTypes.length / itemsPerPage)
  const paginatedVoucherTypes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredVoucherTypes.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredVoucherTypes, currentPage, itemsPerPage])

  const clearFilters = () => {
    setSearchTerm('')
    setDiscountTypeFilter('')
    setDateFilter(null)
  }

  const hasFilters = searchTerm !== '' || discountTypeFilter !== '' || dateFilter !== null

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

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row gap-4 mb-6 bg-gray-50/50 p-4 rounded-xl border'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Tìm kiếm theo mã lô, mô tả...'
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
          value={discountTypeFilter}
          onValueChange={(value) => {
            setDiscountTypeFilter(value)
            setCurrentPage(1) // Reset to first page on filter change
          }}
        >
          <SelectTrigger className='w-[180px] bg-white border-input'>
            <SelectValue placeholder='Loại giảm giá' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả loại</SelectItem>
            <SelectItem value='Percentage'>Phần trăm (%)</SelectItem>
            <SelectItem value='Direct'>Trực tiếp (VNĐ)</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-[180px] justify-start text-left font-normal bg-white border-input',
                !dateFilter && 'text-muted-foreground'
              )}
            >
              <Calendar className='mr-2 h-4 w-4' />
              {dateFilter ? format(dateFilter, 'PPP', { locale: vi }) : <span>Chọn ngày</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0'>
            <CalendarComponent
              mode='single'
              selected={dateFilter || undefined}
              onSelect={(date) => setDateFilter(date || null)}
              initialFocus
            />
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
          {discountTypeFilter && (
            <Badge
              variant='secondary'
              className='flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border-0'
            >
              Loại giảm giá: {discountTypeFilter === 'Percentage' ? 'Phần trăm (%)' : 'Trực tiếp (VNĐ)'}
              <Button
                variant='ghost'
                size='sm'
                className='h-4 w-4 p-0 ml-1 text-primary hover:bg-transparent'
                onClick={() => {
                  setDiscountTypeFilter('')
                  setCurrentPage(1) // Reset to first page on clear
                }}
              >
                <X className='h-3 w-3' />
                <span className='sr-only'>Xóa bộ lọc loại giảm giá</span>
              </Button>
            </Badge>
          )}
          {dateFilter && (
            <Badge
              variant='secondary'
              className='flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border-0'
            >
              Ngày: {format(dateFilter, 'dd/MM/yyyy')}
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
              <TableHead className='font-medium'>Mã lô</TableHead>
              <TableHead className='font-medium'>Mô tả</TableHead>
              <TableHead className='font-medium'>Loại giảm giá</TableHead>
              <TableHead className='font-medium'>Giá trị</TableHead>
              <TableHead className='font-medium'>Số lượng</TableHead>
              <TableHead className='font-medium'>Thời gian</TableHead>
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
                    <div className='h-5 bg-gray-200 rounded w-40'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-24'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-16'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-16'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-32'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-16'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-8'></div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredVoucherTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='h-24 text-center'>
                  Không tìm thấy loại voucher nào
                </TableCell>
              </TableRow>
            ) : (
              paginatedVoucherTypes.map((type) => (
                <TableRow key={type.id} className='hover:bg-gray-50/50 transition-colors'>
                  <TableCell className='font-medium'>{type.batchCode}</TableCell>
                  <TableCell>
                    <div className='max-w-[250px] truncate' title={type.description}>
                      {type.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={type.discountType === 'Percentage' ? 'default' : 'secondary'}
                      className={
                        type.discountType === 'Percentage'
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-0'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-0'
                      }
                    >
                      {type.discountType === 'Percentage' ? 'Phần trăm (%)' : 'Trực tiếp (VNĐ)'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {type.discountValue}
                    {type.discountType === 'Percentage' ? '%' : ' VNĐ'}
                  </TableCell>
                  <TableCell>{type.totalQuantity}</TableCell>
                  <TableCell>
                    <div className='text-xs'>
                      <div>Từ: {format(new Date(type.startDate), 'dd/MM/yyyy')}</div>
                      <div>Đến: {format(new Date(type.endDate), 'dd/MM/yyyy')}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm' className='h-8 w-8 p-0 rounded-full hover:bg-gray-100'>
                          <MoreHorizontal className='h-4 w-4' />
                          <span className='sr-only'>Mở menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => onEdit(type)}>Chỉnh sửa</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onGenerateVouchers(type)}>
                          <Ticket className='h-4 w-4 mr-2' />
                          Tạo voucher
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(type)}
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
      {!loading && filteredVoucherTypes.length > 0 && (
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
                {Math.min((currentPage - 1) * itemsPerPage + 1, filteredVoucherTypes.length)}
              </span>{' '}
              đến{' '}
              <span className='font-medium'>{Math.min(currentPage * itemsPerPage, filteredVoucherTypes.length)}</span>{' '}
              trong <span className='font-medium'>{filteredVoucherTypes.length}</span> kết quả
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
