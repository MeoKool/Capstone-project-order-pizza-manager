import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Filter, MoreHorizontal, Edit, Trash2, Eye, CalendarIcon } from 'lucide-react'
import WorkshopService from '../../services/workshop-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { Workshop } from '@/types/workshop'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/utils/utils'

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const navigate = useNavigate()
  const workshopService = WorkshopService.getInstance()

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
        return <Badge className='bg-blue-500'>Đã lên lịch</Badge>
      case 'Opening':
        return <Badge className='bg-green-500'>Đang mở</Badge>
      case 'Closed':
        return <Badge className='bg-gray-500'>Đã đóng</Badge>
      case 'Approved':
        return <Badge className='bg-blue-500'>Đã duyệt</Badge>
      case 'Cancelled':
        return <Badge className='bg-red-500'>Đã hủy</Badge>
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

  // Filter workshops by search term and selected date
  const filteredWorkshops = workshops.filter((workshop) => {
    const matchesSearch =
      workshop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.description.toLowerCase().includes(searchTerm.toLowerCase())

    // If date is selected, filter by date
    if (date) {
      const workshopDate = new Date(workshop.workshopDate)
      return (
        matchesSearch &&
        workshopDate.getDate() === date.getDate() &&
        workshopDate.getMonth() === date.getMonth() &&
        workshopDate.getFullYear() === date.getFullYear()
      )
    }

    return matchesSearch
  })

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'HH:mm dd/MM/yyyy', { locale: vi })
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

      <Card>
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
                    {date ? format(date, 'dd/MM/yyyy', { locale: vi }) : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar mode='single' selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>

              {date && (
                <Button variant='ghost' size='sm' onClick={clearDateFilter}>
                  Xóa bộ lọc ngày
                </Button>
              )}
            </div>

            <Button variant='outline' size='sm'>
              <Filter className='mr-2 h-4 w-4' /> Lọc
            </Button>
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
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên workshop</TableHead>
                    <TableHead>Thời gian diễn ra</TableHead>
                    <TableHead>Thời gian đăng ký</TableHead>
                    <TableHead>Khu vực</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className='text-right'>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkshops.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className='h-24 text-center'>
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWorkshops.map((workshop) => (
                      <TableRow key={workshop.id}>
                        <TableCell>{workshop.name}</TableCell>
                        <TableCell>{formatDate(workshop.workshopDate)}</TableCell>
                        <TableCell>
                          {formatDate(workshop.startRegisterDate)} - {formatDate(workshop.endRegisterDate)}
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
    </div>
  )
}
