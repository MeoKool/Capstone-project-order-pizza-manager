'use client'

import { useState, useEffect, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format, isValid, parse } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, Loader2, MoreHorizontal, Search, Trash2 } from 'lucide-react'
import StaffAbsenceService from '@/services/staff-absence-service'
import type { Staff, StaffAbsence } from '@/types/staff-absence'
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

interface StaffAbsenceTableProps {
  onAddClick: () => void
}

export function StaffAbsenceTable({ onAddClick }: StaffAbsenceTableProps) {
  const [absences, setAbsences] = useState<StaffAbsence[]>([])
  const [filteredAbsences, setFilteredAbsences] = useState<StaffAbsence[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [absenceToDelete, setAbsenceToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const staffAbsenceService = StaffAbsenceService.getInstance()

  // Tạo hàm fetchData dưới dạng useCallback để có thể sử dụng lại
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [absencesResponse, staffResponse] = await Promise.all([
        staffAbsenceService.getAllAbsences(),
        staffAbsenceService.getAllStaff()
      ])

      if (absencesResponse.success) {
        setAbsences(absencesResponse.result.items)
        setFilteredAbsences(absencesResponse.result.items)
      }

      if (staffResponse.success) {
        setStaff(staffResponse.result.items)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Không thể tải dữ liệu đơn xin nghỉ')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    filterAbsences()
  }, [searchTerm, selectedDate, absences])

  const filterAbsences = () => {
    let filtered = [...absences]

    // Filter by search term (staff name)
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((absence) => {
        const staffMember = staff.find((s) => s.id === absence.staffId)
        return staffMember?.fullName.toLowerCase().includes(term) || staffMember?.username.toLowerCase().includes(term)
      })
    }

    // Filter by date
    if (selectedDate && isValid(selectedDate)) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      filtered = filtered.filter((absence) => absence.absentDate === dateStr)
    }

    setFilteredAbsences(filtered)
  }

  const getStaffName = (staffId: string) => {
    const staffMember = staff.find((s) => s.id === staffId)
    return staffMember ? `${staffMember.fullName}` : 'Không xác định'
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = parse(dateStr, 'yyyy-MM-dd', new Date())
      return format(date, 'dd/MM/yyyy', { locale: vi })
    } catch (error) {
      console.log('Error parsing date:', error)
      return dateStr
    }
  }

  const handleDeleteClick = (id: string) => {
    setAbsenceToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!absenceToDelete) return

    setIsDeleting(true)
    try {
      await staffAbsenceService.deleteAbsence(absenceToDelete)

      toast.success('Đã xóa đơn xin nghỉ thành công')

      // Refresh data
      fetchData()
    } catch (error) {
      console.error('Error deleting absence:', error)
      toast.error('Không thể xóa đơn xin nghỉ')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setAbsenceToDelete(null)
    }
  }

  return (
    <>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2 w-full max-w-sm'>
          <div className='relative w-full'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Tìm kiếm theo tên nhân viên...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-8'
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' className='w-[240px] justify-start text-left font-normal'>
                <CalendarIcon className='mr-2 h-4 w-4' />
                {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: vi }) : <span>Chọn ngày</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
              <Calendar mode='single' selected={selectedDate} onSelect={setSelectedDate} initialFocus locale={vi} />
              {selectedDate && (
                <div className='p-3 border-t border-border'>
                  <Button variant='ghost' size='sm' onClick={() => setSelectedDate(undefined)} className='w-full'>
                    Xóa bộ lọc ngày
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
        <Button onClick={onAddClick} className='bg-red-500 hover:bg-red-600'>
          Thêm đơn xin nghỉ
        </Button>
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center py-8'>
          <Loader2 className='h-8 w-8 animate-spin text-red-500' />
        </div>
      ) : (
        <div className='border rounded-md'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Ngày nghỉ</TableHead>
                <TableHead>Ca làm việc</TableHead>
                <TableHead className='w-[100px]'>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAbsences.length > 0 ? (
                filteredAbsences.map((absence) => (
                  <TableRow key={absence.id}>
                    <TableCell className='font-medium'>{getStaffName(absence.staffId)}</TableCell>
                    <TableCell>{formatDate(absence.absentDate)}</TableCell>
                    <TableCell>
                      {absence.workingSlot
                        ? `${absence.workingSlot.shiftName} (${absence.workingSlot.shiftStart.substring(
                            0,
                            5
                          )} - ${absence.workingSlot.shiftEnd.substring(0, 5)})`
                        : 'Không xác định'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' className='h-8 w-8 p-0'>
                            <span className='sr-only'>Mở menu</span>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            className='text-red-600 focus:text-red-600 cursor-pointer'
                            onClick={() => handleDeleteClick(absence.id)}
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center'>
                    Không có đơn xin nghỉ nào
                    {searchTerm || selectedDate ? ' phù hợp với bộ lọc' : ''}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đơn xin nghỉ này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className='bg-red-500 hover:bg-red-600'
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
