import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Search, UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import type { Staff, Zone } from '@/services/staff-zone-service'

interface AddStaffDialogProps {
  zones: Zone[]
  onAddStaff: (staffId: string, zoneId: string) => Promise<boolean>
}

export function AddStaffDialog({ zones, onAddStaff }: AddStaffDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedZone, setSelectedZone] = useState<string>('')
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  // Thêm state để lọc theo loại nhân viên
  const [filterStaffType, setFilterStaffType] = useState<string>('all')

  useEffect(() => {
    if (isOpen) {
      fetchStaff()
    }
  }, [isOpen])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://vietsac.id.vn/api/staffs?TakeCount=1000')
      const data = await response.json()

      if (data.success) {
        // Lọc chỉ lấy Staff và Cheff
        const filteredStaff = data.result.items.filter(
          (item: Staff) => item.staffType === 'Staff' || item.staffType === 'Cheff'
        )
        setStaff(filteredStaff)
      } else {
        toast.error('Không thể tải danh sách nhân viên')
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast.error('Đã xảy ra lỗi khi tải danh sách nhân viên')
    } finally {
      setLoading(false)
    }
  }

  const handleAddStaff = async () => {
    if (!selectedZone || !selectedStaff) {
      toast.error('Vui lòng chọn nhân viên và khu vực')
      return
    }

    setIsAdding(true)
    try {
      const success = await onAddStaff(selectedStaff, selectedZone)
      if (success) {
        toast.success('Đã thêm nhân viên vào khu vực thành công')
        setIsOpen(false)
        setSelectedZone('')
        setSelectedStaff('')
      }
    } catch (error) {
      console.error('Error adding staff to zone:', error)
    } finally {
      setIsAdding(false)
    }
  }

  // Cập nhật hàm lọc nhân viên để bao gồm cả lọc theo loại
  const filteredStaff = staff.filter((s) => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterStaffType === 'all' || s.staffType === filterStaffType
    return matchesSearch && matchesType
  })

  // Lấy chữ cái đầu của tên
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  // Lấy màu cho badge dựa trên loại nhân viên
  const getStaffTypeBadgeColor = (staffType: string) => {
    switch (staffType) {
      case 'Staff':
        return 'bg-blue-100 text-blue-800'
      case 'Cheff':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='green' className='gap-2'>
          <UserPlus className='h-4 w-4' />
          Thêm nhân viên vào khu vực
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Thêm nhân viên vào khu vực</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Chọn khu vực</label>
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger>
                <SelectValue placeholder='Chọn khu vực làm việc' />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline' className='capitalize'>
                        {zone.type === 'DininingArea' ? 'Phục vụ' : 'Bếp'}
                      </Badge>
                      <span>{zone.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Chọn nhân viên</label>
            <div className='relative'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                type='search'
                placeholder='Tìm kiếm nhân viên...'
                className='pl-8'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Thêm vào phần UI, ngay sau input tìm kiếm và trước ScrollArea */}
            <div className='flex gap-2 mt-2'>
              <Button
                variant={filterStaffType === 'all' ? 'yellow' : 'outline'}
                size='sm'
                onClick={() => setFilterStaffType('all')}
                className='flex-1'
              >
                Tất cả
              </Button>
              <Button
                variant={filterStaffType === 'Staff' ? 'yellow' : 'outline'}
                size='sm'
                onClick={() => setFilterStaffType('Staff')}
                className='flex-1'
              >
                Nhân viên
              </Button>
              <Button
                variant={filterStaffType === 'Cheff' ? 'yellow' : 'outline'}
                size='sm'
                onClick={() => setFilterStaffType('Cheff')}
                className='flex-1'
              >
                Đầu bếp
              </Button>
            </div>

            {loading ? (
              <div className='flex justify-center py-8'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
              </div>
            ) : (
              <ScrollArea className='h-[300px] rounded-md border p-2'>
                <div className='space-y-2'>
                  {filteredStaff.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-8 text-center text-muted-foreground'>
                      <Search className='h-8 w-8 mb-2' />
                      <p>Không tìm thấy nhân viên nào</p>
                    </div>
                  ) : (
                    filteredStaff.map((s) => (
                      <div
                        key={s.id}
                        className={`flex items-center justify-between p-2 rounded-md hover:bg-gray-50 cursor-pointer ${
                          selectedStaff === s.id ? 'bg-primary/5 border border-primary/20' : ''
                        }`}
                        onClick={() => setSelectedStaff(s.id)}
                      >
                        <div className='flex items-center gap-3'>
                          <Avatar className='h-8 w-8 border-2 border-white shadow-sm'>
                            <AvatarFallback
                              className={`text-xs ${
                                s.staffType === 'Cheff' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {getInitials(s.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className='font-medium leading-tight'>{s.fullName}</p>
                            <p className='text-xs text-muted-foreground'>
                              {s.status === 'FullTime' ? 'Toàn thời gian' : 'Bán thời gian'}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Badge className={getStaffTypeBadgeColor(s.staffType)}>
                            {s.staffType === 'Cheff' ? 'Đầu bếp' : 'Nhân viên'}
                          </Badge>
                          {selectedStaff === s.id && <div className='h-2 w-2 rounded-full bg-primary'></div>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button variant='outline' onClick={() => setIsOpen(false)}>
              Hủy
            </Button>
            <Button variant='green' onClick={handleAddStaff} disabled={!selectedZone || !selectedStaff || isAdding}>
              {isAdding ? <Loader2 className='h-4 w-4 mr-2 animate-spin' /> : <Plus className='h-4 w-4 mr-2' />}
              Thêm nhân viên
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
