'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
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
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import ReservationSlotService, {
  type ReservationSlot,
  type CreateReservationSlotDto
} from '@/services/reservation-slot-service'
import { TimeInput } from '@/components/time-input'

export function ReservationSlotSettings() {
  const [slots, setSlots] = useState<ReservationSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [slotToDelete, setSlotToDelete] = useState<string | null>(null)
  const [newSlot, setNewSlot] = useState<CreateReservationSlotDto>({
    startTime: '',
    endTime: '',
    capacity: 0
  })
  const [validationError, setValidationError] = useState<string | null>(null)

  const reservationSlotService = ReservationSlotService.getInstance()

  const fetchSlots = async () => {
    setLoading(true)
    try {
      const response = await reservationSlotService.getAllSlots()
      if (response.success) {
        // Sort slots by startTime
        const sortedSlots = [...response.result.items].sort((a, b) => a.startTime.localeCompare(b.startTime))
        setSlots(sortedSlots)
      } else {
        toast.error('Không thể tải khung giờ đặt bàn')
      }
    } catch (error) {
      console.error(error)
      toast.error('Đã xảy ra lỗi khi tải khung giờ đặt bàn')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlots()
  }, [])

  const handleCreateSlot = async () => {
    // Reset validation error
    setValidationError(null)

    // Validate input
    if (!newSlot.startTime || !newSlot.endTime || newSlot.capacity <= 0) {
      toast.error('Vui lòng điền đầy đủ thông tin khung giờ')
      return
    }

    // Validate that end time is after start time, with special handling for overnight slots
    if (!isValidTimeRange(newSlot.startTime, newSlot.endTime)) {
      setValidationError('Giờ kết thúc phải lớn hơn giờ bắt đầu')
      toast.error('Giờ kết thúc phải lớn hơn giờ bắt đầu')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await reservationSlotService.createSlot(newSlot)
      if (response.success) {
        toast.success('Đã thêm khung giờ đặt bàn mới')
        setIsDialogOpen(false)
        setNewSlot({
          startTime: '',
          endTime: '',
          capacity: 0
        })
        fetchSlots()
      } else {
        toast.error(response.message || 'Không thể thêm khung giờ đặt bàn')
      }
    } catch (error) {
      console.error(error)
      toast.error('Đã xảy ra lỗi khi thêm khung giờ đặt bàn')
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = (id: string) => {
    setSlotToDelete(id)
    setIsAlertOpen(true)
  }

  const handleDeleteSlot = async () => {
    if (!slotToDelete) return

    try {
      const response = await reservationSlotService.deleteSlot(slotToDelete)
      if (response.success) {
        toast.success('Đã xóa khung giờ đặt bàn')
        fetchSlots()
      } else {
        toast.error(response.message || 'Không thể xóa khung giờ đặt bàn')
      }
    } catch (error) {
      console.error(error)
      toast.error('Đã xảy ra lỗi khi xóa khung giờ đặt bàn')
    } finally {
      setSlotToDelete(null)
    }
  }

  // Format time for display (HH:MM:SS -> HH:MM)
  const formatTime = (time: string) => {
    return time.substring(0, 5)
  }

  // Check if time range is valid, with special handling for overnight slots
  const isValidTimeRange = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return true

    // Extract hours and minutes
    const startParts = startTime.split(':')
    const endParts = endTime.split(':')

    const startHour = Number.parseInt(startParts[0], 10)
    const startMinute = Number.parseInt(startParts[1], 10)
    const endHour = Number.parseInt(endParts[0], 10)
    const endMinute = Number.parseInt(endParts[1], 10)

    // Special case: If end time is 00:00 (midnight), it's valid regardless of start time
    if (endHour === 0 && endMinute === 0) return true

    // Special case: If start time is in the evening (after 20:00) and end time is in the morning (before 06:00)
    // This handles overnight slots
    if (startHour >= 20 && endHour < 6) return true

    // Normal case: end time should be greater than start time
    if (endHour > startHour) return true
    if (endHour === startHour && endMinute > startMinute) return true

    return false
  }

  const validateTimeChange = (startTime: string, endTime: string) => {
    if (startTime && endTime) {
      if (!isValidTimeRange(startTime, endTime)) {
        setValidationError('Giờ kết thúc phải lớn hơn giờ bắt đầu')
      } else {
        setValidationError(null)
      }
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Khung giờ đặt bàn</CardTitle>
          <CardDescription>Đang tải...</CardDescription>
        </CardHeader>
        <CardContent className='flex justify-center py-6'>
          <Loader2 className='h-6 w-6 animate-spin text-primary' />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Khung giờ đặt bàn</CardTitle>
            <CardDescription>Quản lý các khung giờ có thể đặt bàn</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant={'green'} className='ml-auto'>
                <Plus className='mr-2 h-4 w-4' />
                Thêm khung giờ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm khung giờ đặt bàn mới</DialogTitle>
                <DialogDescription>Nhập thông tin khung giờ đặt bàn mới</DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='start-time'>Giờ bắt đầu</Label>
                    <TimeInput
                      label=''
                      value={newSlot.startTime}
                      onChange={(time) => {
                        const newStartTime = `${time}:00`
                        setNewSlot({ ...newSlot, startTime: newStartTime })
                        validateTimeChange(newStartTime, newSlot.endTime)
                      }}
                      use24Hour={true}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='end-time'>Giờ kết thúc</Label>
                    <TimeInput
                      label=''
                      value={newSlot.endTime}
                      onChange={(time) => {
                        const newEndTime = `${time}:00`
                        setNewSlot({ ...newSlot, endTime: newEndTime })
                        validateTimeChange(newSlot.startTime, newEndTime)
                      }}
                      use24Hour={true}
                    />
                  </div>
                </div>
                {validationError && <div className='text-sm font-medium text-destructive'>{validationError}</div>}
                <div className='space-y-2'>
                  <Label htmlFor='capacity'>Số lượng bàn tối đa</Label>
                  <Input
                    id='capacity'
                    type='number'
                    min='1'
                    value={newSlot.capacity || ''}
                    onChange={(e) => setNewSlot({ ...newSlot, capacity: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateSlot} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className='mr-2 h-4 w-4' />
                      Lưu
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <div className='text-center py-6 text-muted-foreground'>
              Chưa có khung giờ đặt bàn nào. Hãy thêm khung giờ mới.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Giờ bắt đầu</TableHead>
                  <TableHead>Giờ kết thúc</TableHead>
                  <TableHead>Số lượng bàn tối đa</TableHead>
                  <TableHead className='text-right'>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell>{formatTime(slot.startTime)}</TableCell>
                    <TableCell>{formatTime(slot.endTime)}</TableCell>
                    <TableCell>{slot.capacity}</TableCell>
                    <TableCell className='text-right'>
                      <Button variant='ghost' size='icon' onClick={() => confirmDelete(slot.id)}>
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khung giờ này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSlot}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
