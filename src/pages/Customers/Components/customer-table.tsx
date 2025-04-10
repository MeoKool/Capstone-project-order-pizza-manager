import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useCustomer } from './customer-provider'
import type { Customer } from '@/types/customer'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, MoreHorizontal, Search, X } from 'lucide-react'

interface CustomerTableProps {
  onViewCustomer: (customer: Customer) => void
}

export function CustomerTable({ onViewCustomer }: CustomerTableProps) {
  const { customers, loading } = useCustomer()
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState<string>('')
  const [verifiedFilter, setVerifiedFilter] = useState<string>('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Filter customers based on search term and filters
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        searchTerm === '' ||
        (customer.fullName && customer.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        customer.phone.includes(searchTerm) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesGender = genderFilter === '' || genderFilter === 'all' || customer.gender === genderFilter
      const matchesVerified =
        verifiedFilter === '' ||
        verifiedFilter === 'all' ||
        (verifiedFilter === 'verified' && customer.isVerifiedEmail) ||
        (verifiedFilter === 'unverified' && !customer.isVerifiedEmail)

      return matchesSearch && matchesGender && matchesVerified
    })
  }, [customers, searchTerm, genderFilter, verifiedFilter])

  // Calculate pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredCustomers, currentPage, itemsPerPage])

  const clearFilters = () => {
    setSearchTerm('')
    setGenderFilter('')
    setVerifiedFilter('')
  }

  const hasFilters = searchTerm !== '' || genderFilter !== '' || verifiedFilter !== ''

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
            placeholder='Tìm kiếm theo tên, email, số điện thoại...'
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
              <span className='sr-only'>Clear search</span>
            </Button>
          )}
        </div>
        <Select
          value={genderFilter}
          onValueChange={(value) => {
            setGenderFilter(value)
            setCurrentPage(1) // Reset to first page on filter change
          }}
        >
          <SelectTrigger className='w-[180px] bg-white border-input'>
            <SelectValue placeholder='Giới tính' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả giới tính</SelectItem>
            <SelectItem value='Male'>Nam</SelectItem>
            <SelectItem value='Female'>Nữ</SelectItem>
            <SelectItem value='Other'>Khác</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={verifiedFilter}
          onValueChange={(value) => {
            setVerifiedFilter(value)
            setCurrentPage(1) // Reset to first page on filter change
          }}
        >
          <SelectTrigger className='w-[180px] bg-white border-input'>
            <SelectValue placeholder='Trạng thái xác thực' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả trạng thái</SelectItem>
            <SelectItem value='verified'>Đã xác thực</SelectItem>
            <SelectItem value='unverified'>Chưa xác thực</SelectItem>
          </SelectContent>
        </Select>
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
          {genderFilter && (
            <Badge
              variant='secondary'
              className='flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border-0'
            >
              Giới tính: {genderFilter === 'Male' ? 'Nam' : genderFilter === 'Female' ? 'Nữ' : 'Khác'}
              <Button
                variant='ghost'
                size='sm'
                className='h-4 w-4 p-0 ml-1 text-primary hover:bg-transparent'
                onClick={() => {
                  setGenderFilter('')
                  setCurrentPage(1) // Reset to first page on clear
                }}
              >
                <X className='h-3 w-3' />
                <span className='sr-only'>Xóa bộ lọc giới tính</span>
              </Button>
            </Badge>
          )}
          {verifiedFilter && (
            <Badge
              variant='secondary'
              className='flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border-0'
            >
              Trạng thái: {verifiedFilter === 'verified' ? 'Đã xác thực' : 'Chưa xác thực'}
              <Button
                variant='ghost'
                size='sm'
                className='h-4 w-4 p-0 ml-1 text-primary hover:bg-transparent'
                onClick={() => {
                  setVerifiedFilter('')
                  setCurrentPage(1) // Reset to first page on clear
                }}
              >
                <X className='h-3 w-3' />
                <span className='sr-only'>Xóa bộ lọc trạng thái</span>
              </Button>
            </Badge>
          )}
        </div>
      )}

      <div className='rounded-xl border overflow-hidden shadow-sm'>
        <Table>
          <TableHeader className='bg-gray-50'>
            <TableRow>
              <TableHead className='font-medium'>Họ và tên</TableHead>
              <TableHead className='font-medium'>Email</TableHead>
              <TableHead className='font-medium'>Số điện thoại</TableHead>
              <TableHead className='font-medium'>Giới tính</TableHead>
              <TableHead className='font-medium'>Ngày sinh</TableHead>
              <TableHead className='font-medium'>Trạng thái xác thực</TableHead>
              <TableHead className='w-[80px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index} className='animate-pulse'>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-32'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-40'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-24'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-20'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-24'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-24'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-8'></div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='h-24 text-center'>
                  Không tìm thấy khách hàng nào
                </TableCell>
              </TableRow>
            ) : (
              paginatedCustomers.map((customer) => (
                <TableRow key={customer.id} className='hover:bg-gray-50/50 transition-colors'>
                  <TableCell className='font-medium'>{customer.fullName || 'Chưa cập nhật'}</TableCell>
                  <TableCell>{customer.email || 'Chưa cập nhật'}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    {customer.gender ? (
                      <Badge
                        variant='outline'
                        className={
                          customer.gender === 'Male'
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-0'
                            : customer.gender === 'Female'
                              ? 'bg-pink-100 text-pink-800 hover:bg-pink-200 border-0'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-0'
                        }
                      >
                        {customer.gender === 'Male' ? 'Nam' : customer.gender === 'Female' ? 'Nữ' : 'Khác'}
                      </Badge>
                    ) : (
                      'Chưa cập nhật'
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.dateOfBirth
                      ? new Date(customer.dateOfBirth).toLocaleDateString('vi-VN')
                      : 'Chưa cập nhật'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={customer.isVerifiedEmail ? 'default' : 'secondary'}
                      className={
                        customer.isVerifiedEmail
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 border-0'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-0'
                      }
                    >
                      {customer.isVerifiedEmail ? 'Đã xác thực' : 'Chưa xác thực'}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => onViewCustomer(customer)}>
                          <Eye className='h-4 w-4 mr-2' />
                          Xem chi tiết
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
      {!loading && filteredCustomers.length > 0 && (
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
                {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCustomers.length)}
              </span>{' '}
              đến <span className='font-medium'>{Math.min(currentPage * itemsPerPage, filteredCustomers.length)}</span>{' '}
              trong <span className='font-medium'>{filteredCustomers.length}</span> kết quả
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
