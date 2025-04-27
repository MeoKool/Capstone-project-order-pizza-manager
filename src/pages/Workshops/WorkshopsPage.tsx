'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Filter, MoreHorizontal, Edit, Trash2, Eye, CalendarIcon, X } from 'lucide-react'
import WorkshopService from '../../services/workshop-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { WorkshopStatus, type Workshop } from '@/types/workshop'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/utils/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { formatVietnamDate } from '@/utils/date-utils'
import { Calendar } from '@/components/ui/calendar'

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [cancelWorkshopId, setCancelWorkshopId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const navigate = useNavigate()
  const workshopService = WorkshopService.getInstance()
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchWorkshops()
  }, [])

  const fetchWorkshops = async () => {
    try {
      setLoading(true)
      const response = await workshopService.getAllWorkshops()
      if (response.success) {
        setWorkshops(response.result.items)
      } else {
        console.error('Failed to fetch workshops:', response.message)
      }
    } catch (error) {
      console.error('Error fetching workshops:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return (
          <Badge className='bg-blue-100 hover:bg-blue-300 border-blue-500 text-xs px-1'>
            <div className='text-blue-600 text-center w-[110px] py-0.4'>Đã lên lịch</div>
          </Badge>
        )
      case 'OpeningToRegister':
        return (
          <Badge className='bg-green-100 hover:bg-green-300 border-green-500 text-xs px-1'>
            <div className='text-green-600 text-center w-[110px] py-0.4'>Đang mở đăng ký</div>
          </Badge>
        )
      case 'ClosedRegister':
        return (
          <Badge className='bg-gray-100 hover:bg-gray-300 border-gray-500 text-xs px-1'>
            <div className='text-gray-600 text-center w-[110px] py-0.4'>Đã đóng đăng ký</div>
          </Badge>
        )
      case 'Closed':
        return (
          <Badge className='bg-slate-100 hover:bg-slate-300 border-slate-500 text-xs px-1'>
            <div className='text-slate-600 text-center w-[110px] py-0.4'>Đã kết thúc</div>
          </Badge>
        )
      case 'Opening':
        return (
          <Badge className='bg-orange-100 hover:bg-orange-300 border-orange-500 text-xs px-1'>
            <div className='text-orange-600 text-center w-[110px] py-0.4'>Đang diễn ra</div>
          </Badge>
        )
      case 'Cancelled':
        return (
          <Badge className='bg-red-100 hover:bg-red-300 border-red-500 text-xs px-1'>
            <div className='text-red-600 text-center w-[110px] py-0.4'>Đã hủy</div>
          </Badge>
        )
      default:
        return <Badge className='bg-gray-400'>{status}</Badge>
    }
  }

  const handleViewDetails = (id: string) => {
    navigate(`/workshops/${id}`)
  }

  const handleEdit = (id: string) => {
    navigate(`/workshops/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa workshop này không?')) {
      try {
        // Implement delete API call when available
        // const response = await workshopService.deleteWorkshop(id)
        // if (response.success) {
        //   fetchWorkshops()
        // }
        console.log('Delete workshop:', id)
        // For now, just filter out the deleted workshop from the state
        setWorkshops(workshops.filter((workshop) => workshop.id !== id))
      } catch (error) {
        console.error('Error deleting workshop:', error)
      }
    }
  }

  const handleCancelWorkshop = async () => {
    if (!cancelWorkshopId) return

    try {
      const response = await workshopService.cancelWorkshop(cancelWorkshopId)
      if (response.success) {
        // Update the workshop status in the local state
        setWorkshops(
          workshops.map((workshop) =>
            workshop.id === cancelWorkshopId ? { ...workshop, workshopStatus: WorkshopStatus.Cancelled } : workshop
          )
        )
        toast.success('Workshop đã được hủy thành công!')
        // Fetch workshops again to refresh the list
        fetchWorkshops()
      } else {
        toast.error(response.message)
        console.error('Failed to cancel workshop:', response.message)
      }
    } catch (error) {
      console.error('Error cancelling workshop:', error)
    } finally {
      setCancelWorkshopId(null)
    }
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Nếu đang sắp xếp theo cột này, đổi hướng sắp xếp
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Nếu sắp xếp cột mới, đặt cột và hướng mặc định là tăng dần
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredWorkshops = workshops.filter((workshop) => {
    // Safely check if name or description includes search term
    const name = workshop.name || ''
    const description = workshop.description || ''
    const organizer = workshop.organizer || ''
    const location = workshop.location || ''

    const matchesSearch =
      searchTerm === '' ||
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.toLowerCase().includes(searchTerm.toLowerCase())

    // Check if workshop matches status filter
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(workshop.workshopStatus)

    // If date is selected, filter by workshop date (Thời gian diễn ra)
    if (date) {
      const workshopDate = new Date(workshop.workshopDate)
      return (
        matchesSearch &&
        matchesStatus &&
        workshopDate.getDate() === date.getDate() &&
        workshopDate.getMonth() === date.getMonth() &&
        workshopDate.getFullYear() === date.getFullYear()
      )
    }

    return matchesSearch && matchesStatus
  })

  // Sắp xếp workshops sau khi đã lọc
  const sortedWorkshops = [...filteredWorkshops].sort((a, b) => {
    if (!sortColumn) return 0

    let valueA, valueB

    switch (sortColumn) {
      case 'name':
        valueA = a.name || ''
        valueB = b.name || ''
        break
      case 'workshopDate':
        valueA = new Date(a.workshopDate).getTime()
        valueB = new Date(b.workshopDate).getTime()
        break
      case 'startRegisterDate':
        valueA = new Date(a.startRegisterDate).getTime()
        valueB = new Date(b.startRegisterDate).getTime()
        break
      case 'zoneName':
        valueA = a.zoneName || ''
        valueB = b.zoneName || ''
        break
      case 'workshopStatus':
        valueA = a.workshopStatus || ''
        valueB = b.workshopStatus || ''
        break
      default:
        return 0
    }

    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Format date to Vietnam time
  const formatDate = (dateString: string) => {
    try {
      return formatVietnamDate(dateString)
    } catch {
      return dateString
    }
  }

  const clearDateFilter = () => {
    setDate(undefined)
  }

  return (
    <div className='mx-auto p-4 max-w-full'>
      <div className='flex items-center justify-end mb-6 '>
        <Button variant='green' onClick={() => navigate('/workshops/create')}>
          <Plus className='mr-2 h-4 w-4' /> Tạo mới
        </Button>
      </div>

      <Card className='shadow-md border border-gray-200 rounded-xl'>
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between mt-2'>
            <div className='flex items-center space-x-4'>
              <div className='relative w-72'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Tìm kiếm workshop...'
                  className='pl-8'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn('justify-start text-left font-normal', !date && 'text-muted-foreground')}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {date ? format(date, 'dd/MM/yyyy', { locale: vi }) : <span>Chọn ngày bắt đầu</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar mode='single' selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>

              {date && (
                <Button variant='ghost' size='sm' onClick={clearDateFilter}>
                  Xóa bộ lọc ngày diễn ra
                </Button>
              )}
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant='outline' size='sm'>
                  <Filter className='mr-2 h-4 w-4' /> Lọc
                  {statusFilter.length > 0 && (
                    <Badge variant='secondary' className='ml-2 rounded-full'>
                      {statusFilter.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-4' align='end'>
                <div className='space-y-2'>
                  <h4 className='font-medium'>Trạng thái</h4>
                  <div className='grid gap-2'>
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='status-scheduled'
                        checked={statusFilter.includes('Scheduled')}
                        onCheckedChange={() => handleStatusFilterChange('Scheduled')}
                      />
                      <label htmlFor='status-scheduled' className='text-sm cursor-pointer'>
                        Đã lên lịch
                      </label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='status-opening-register'
                        checked={statusFilter.includes('OpeningToRegister')}
                        onCheckedChange={() => handleStatusFilterChange('OpeningToRegister')}
                      />
                      <label htmlFor='status-opening-register' className='text-sm cursor-pointer'>
                        Đang mở đăng ký
                      </label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='status-close-register'
                        checked={statusFilter.includes('ClosedRegister')}
                        onCheckedChange={() => handleStatusFilterChange('ClosedRegister')}
                      />
                      <label htmlFor='status-close-register' className='text-sm cursor-pointer'>
                        Đã đóng đăng ký
                      </label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='status-closed'
                        checked={statusFilter.includes('Closed')}
                        onCheckedChange={() => handleStatusFilterChange('Closed')}
                      />
                      <label htmlFor='status-closed' className='text-sm cursor-pointer'>
                        Đã đóng
                      </label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='status-opening'
                        checked={statusFilter.includes('Opening')}
                        onCheckedChange={() => handleStatusFilterChange('Opening')}
                      />
                      <label htmlFor='status-opening' className='text-sm cursor-pointer'>
                        Đang diễn ra
                      </label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='status-cancelled'
                        checked={statusFilter.includes('Cancelled')}
                        onCheckedChange={() => handleStatusFilterChange('Cancelled')}
                      />
                      <label htmlFor='status-cancelled' className='text-sm cursor-pointer'>
                        Đã hủy
                      </label>
                    </div>
                  </div>
                  {statusFilter.length > 0 && (
                    <Button variant='outline' size='sm' className='w-full mt-2' onClick={() => setStatusFilter([])}>
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex justify-center items-center h-64'>
              <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
            </div>
          ) : (
            <div className='rounded-md border'>
              <Table>
                <TableHeader className='bg-gray-50'>
                  <TableRow>
                    <TableHead className='font-semibold cursor-pointer' onClick={() => handleSort('name')}>
                      <div className='flex items-center'>
                        Tên workshop
                        <span className='ml-1 text-xs'>↑↓</span>
                      </div>
                    </TableHead>
                    <TableHead className='font-semibold cursor-pointer' onClick={() => handleSort('workshopDate')}>
                      <div className='flex items-center'>
                        Thời gian bắt đầu
                        <span className='ml-1 text-xs'>↑↓</span>
                      </div>
                    </TableHead>
                    <TableHead className='font-semibold cursor-pointer' onClick={() => handleSort('startRegisterDate')}>
                      <div className='flex items-center'>
                        Thời gian đăng ký
                        <span className='ml-1 text-xs'>↑↓</span>
                      </div>
                    </TableHead>
                    <TableHead className='font-semibold'>
                      <div className='flex items-center'>Số lượng đăng ký</div>
                    </TableHead>
                    <TableHead className='font-semibold cursor-pointer' onClick={() => handleSort('zoneName')}>
                      <div className='flex items-center'>
                        Khu vực
                        <span className='ml-1 text-xs'>↑↓</span>
                      </div>
                    </TableHead>
                    <TableHead className='font-semibold cursor-pointer' onClick={() => handleSort('workshopStatus')}>
                      <div className='flex items-center'>
                        Trạng thái
                        <span className='ml-1 text-xs'>↑↓</span>
                      </div>
                    </TableHead>
                    <TableHead className='text-right font-semibold'>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedWorkshops.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className='h-24 text-center'>
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedWorkshops.map((workshop) => (
                      <TableRow key={workshop.id}>
                        <TableCell>{workshop.name}</TableCell>
                        <TableCell>{formatDate(workshop.workshopDate)}</TableCell>
                        <TableCell>
                          {formatDate(workshop.startRegisterDate)} - {formatDate(workshop.endRegisterDate)}
                        </TableCell>
                        <TableCell>
                          {workshop.totalRegisteredParticipant}/{workshop.maxRegister} đăng ký
                        </TableCell>

                        <TableCell>{workshop.zoneName}</TableCell>

                        <TableCell>{getStatusBadge(workshop.workshopStatus)}</TableCell>
                        <TableCell className='text-right'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' className='h-8 w-8 p-0'>
                                <span className='sr-only'>Mở menu</span>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem onClick={() => handleViewDetails(workshop.id)}>
                                <Eye className='mr-2 h-4 w-4' />
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(workshop.id)}>
                                <Edit className='mr-2 h-4 w-4' />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setCancelWorkshopId(workshop.id)}
                                className='text-red-600'
                                disabled={workshop.workshopStatus === 'Cancelled'}
                              >
                                <X className='mr-2 h-4 w-4' />
                                Hủy workshop
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(workshop.id)} className='text-red-600'>
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
          )}
        </CardContent>
      </Card>

      {/* Cancel Workshop Dialog */}
      <AlertDialog open={!!cancelWorkshopId} onOpenChange={(open) => !open && setCancelWorkshopId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy workshop</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy workshop này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không, giữ lại</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelWorkshop} className='bg-red-600 hover:bg-red-700'>
              Có, hủy workshop
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
