import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useStaff } from './staff-provider'
import type { Staff } from '@/types/staff'
import { MoreHorizontal, Search, X } from 'lucide-react'
import { EditStaffDialog } from './edit-staff-dialog'
import { DeleteStaffDialog } from './delete-staff-dialog'

export function StaffTable() {
  const { staff, loading } = useStaff()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Filter staff based on search term and filters
  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      searchTerm === '' ||
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm)

    const matchesStatus = statusFilter === '' || statusFilter === 'all' || member.status === statusFilter
    const matchesType = typeFilter === '' || typeFilter === 'all' || member.staffType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (staff: Staff) => {
    setDeletingStaff(staff)
    setIsDeleteDialogOpen(true)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setTypeFilter('')
  }

  const hasFilters = searchTerm !== '' || statusFilter !== '' || typeFilter !== ''

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Tìm kiếm theo tên, email, số điện thoại...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-8'
          />
          {searchTerm && (
            <Button
              variant='ghost'
              size='sm'
              className='absolute right-0 top-0 h-9 w-9 p-0'
              onClick={() => setSearchTerm('')}
            >
              <X className='h-4 w-4' />
              <span className='sr-only'>Clear search</span>
            </Button>
          )}
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Trạng thái' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả trạng thái</SelectItem>
            <SelectItem value='FullTime'>Toàn thời gian</SelectItem>
            <SelectItem value='PartTime'>Bán thời gian</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Loại nhân viên' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả loại</SelectItem>
            <SelectItem value='Staff'>Nhân viên</SelectItem>
            <SelectItem value='Manager'>Quản lý</SelectItem>
            <SelectItem value='Cheff'>Đầu bếp</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant='outline' onClick={clearFilters}>
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {hasFilters && (
        <div className='flex flex-wrap gap-2'>
          {searchTerm && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              Tìm kiếm: {searchTerm}
              <Button variant='ghost' size='sm' className='h-4 w-4 p-0 ml-1' onClick={() => setSearchTerm('')}>
                <X className='h-3 w-3' />
                <span className='sr-only'>Xóa tìm kiếm</span>
              </Button>
            </Badge>
          )}
          {statusFilter && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              Trạng thái: {statusFilter === 'FullTime' ? 'Toàn thời gian' : 'Bán thời gian'}
              <Button variant='ghost' size='sm' className='h-4 w-4 p-0 ml-1' onClick={() => setStatusFilter('')}>
                <X className='h-3 w-3' />
                <span className='sr-only'>Xóa bộ lọc trạng thái</span>
              </Button>
            </Badge>
          )}
          {typeFilter && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              Loại: {typeFilter === 'Staff' ? 'Nhân viên' : typeFilter === 'Manager' ? 'Quản lý' : 'Đầu bếp'}
              <Button variant='ghost' size='sm' className='h-4 w-4 p-0 ml-1' onClick={() => setTypeFilter('')}>
                <X className='h-3 w-3' />
                <span className='sr-only'>Xóa bộ lọc loại</span>
              </Button>
            </Badge>
          )}
        </div>
      )}

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên đăng nhập</TableHead>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Chức vụ</TableHead>
              <TableHead>Hình thức làm việc</TableHead>
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
                    <div className='h-5 bg-gray-200 rounded w-8'></div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='h-24 text-center'>
                  Không tìm thấy nhân viên nào
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className='font-medium'>{member.username}</TableCell>

                  <TableCell className='font-medium'>{member.fullName}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.staffType === 'Manager'
                          ? 'default'
                          : member.staffType === 'Cheff'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {member.staffType === 'Staff' && 'Nhân viên'}
                      {member.staffType === 'Manager' && 'Quản lý'}
                      {member.staffType === 'Cheff' && 'Đầu bếp'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'FullTime' ? 'default' : 'secondary'}>
                      {member.status === 'FullTime' ? 'Toàn thời gian' : 'Bán thời gian'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                          <MoreHorizontal className='h-4 w-4' />
                          <span className='sr-only'>Mở menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => handleEdit(member)}>Chỉnh sửa</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(member)}
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

      {editingStaff && (
        <EditStaffDialog staff={editingStaff} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
      )}

      {deletingStaff && (
        <DeleteStaffDialog staff={deletingStaff} open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} />
      )}
    </div>
  )
}
