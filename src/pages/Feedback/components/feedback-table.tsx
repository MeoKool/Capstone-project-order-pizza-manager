'use client'

import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useFeedback } from './feedback-provider'
import type { Feedback } from '@/types/feedback'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  MoreHorizontal,
  Search,
  Star,
  X
} from 'lucide-react'

interface FeedbackTableProps {
  onViewFeedback: (feedback: Feedback) => void
}

export function FeedbackTable({ onViewFeedback }: FeedbackTableProps) {
  const { feedbacks, loading } = useFeedback()
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState<string>('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Filter feedbacks based on search term and filters
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((feedback) => {
      const matchesSearch =
        searchTerm === '' || (feedback.comments && feedback.comments.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesRating = ratingFilter === '' || ratingFilter === 'all' || feedback.rating.toString() === ratingFilter

      return matchesSearch && matchesRating
    })
  }, [feedbacks, searchTerm, ratingFilter])

  // Calculate pagination
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage)
  const paginatedFeedbacks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredFeedbacks.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredFeedbacks, currentPage, itemsPerPage])

  const clearFilters = () => {
    setSearchTerm('')
    setRatingFilter('')
  }

  const hasFilters = searchTerm !== '' || ratingFilter !== ''

  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(1)
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  const goToLastPage = () => setCurrentPage(totalPages)
  const goToPage = (page: number) => setCurrentPage(page)

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return (
      <div className='flex items-center'>
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className='ml-2 text-sm font-medium'>{rating}/5</span>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row gap-4 mb-6 bg-gray-50/50 p-4 rounded-xl border'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Tìm kiếm theo nội dung đánh giá...'
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
          value={ratingFilter}
          onValueChange={(value) => {
            setRatingFilter(value)
            setCurrentPage(1) // Reset to first page on filter change
          }}
        >
          <SelectTrigger className='w-[180px] bg-white border-input'>
            <SelectValue placeholder='Đánh giá sao' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả đánh giá</SelectItem>
            <SelectItem value='5'>5 sao</SelectItem>
            <SelectItem value='4'>4 sao</SelectItem>
            <SelectItem value='3'>3 sao</SelectItem>
            <SelectItem value='2'>2 sao</SelectItem>
            <SelectItem value='1'>1 sao</SelectItem>
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
          {ratingFilter && ratingFilter !== 'all' && (
            <Badge
              variant='secondary'
              className='flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border-0'
            >
              Đánh giá: {ratingFilter} sao
              <Button
                variant='ghost'
                size='sm'
                className='h-4 w-4 p-0 ml-1 text-primary hover:bg-transparent'
                onClick={() => {
                  setRatingFilter('')
                  setCurrentPage(1) // Reset to first page on clear
                }}
              >
                <X className='h-3 w-3' />
                <span className='sr-only'>Xóa bộ lọc đánh giá</span>
              </Button>
            </Badge>
          )}
        </div>
      )}

      <div className='rounded-xl border overflow-hidden shadow-sm'>
        <Table>
          <TableHeader className='bg-gray-50'>
            <TableRow>
              <TableHead className='font-medium'>Đánh giá</TableHead>
              <TableHead className='font-medium'>Nội dung</TableHead>
              <TableHead className='font-medium'>Ngày đánh giá</TableHead>
              <TableHead className='w-[80px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index} className='animate-pulse'>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-20'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-32'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-40'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-32'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-5 bg-gray-200 rounded w-8'></div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredFeedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='h-24 text-center'>
                  Không tìm thấy đánh giá nào
                </TableCell>
              </TableRow>
            ) : (
              paginatedFeedbacks.map((feedback) => (
                <TableRow key={feedback.id} className='hover:bg-gray-50/50 transition-colors'>
                  <TableCell>{renderStars(feedback.rating)}</TableCell>
                  <TableCell className='max-w-xs truncate' title={feedback.comments}>
                    {feedback.comments || 'Không có nội dung'}
                  </TableCell>
                  <TableCell>{formatDate(feedback.feedbackDate)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm' className='h-8 w-8 p-0 rounded-full hover:bg-gray-100'>
                          <MoreHorizontal className='h-4 w-4' />
                          <span className='sr-only'>Mở menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => onViewFeedback(feedback)}>
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
      {!loading && filteredFeedbacks.length > 0 && (
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
                {Math.min((currentPage - 1) * itemsPerPage + 1, filteredFeedbacks.length)}
              </span>{' '}
              đến <span className='font-medium'>{Math.min(currentPage * itemsPerPage, filteredFeedbacks.length)}</span>{' '}
              trong <span className='font-medium'>{filteredFeedbacks.length}</span> kết quả
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
