'use client'

import { useState } from 'react'
import { Users, MapPin, Clock, QrCode } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type TableResponse from '@/types/tables'
import { TableQRCode } from './table-qr-code'
import { getStatusBadge, getStatusIcon } from '@/utils/table-utils'
import useZone from '@/hooks/useZone'
import { getZoneName } from '@/utils/zone-utils'
import { TableTimer } from './table-timer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TableDetailsDialogProps {
  table: TableResponse
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TableDetailsDialog({ table, open, onOpenChange }: TableDetailsDialogProps) {
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [activeTab, setActiveTab] = useState('details')

  const { zones_ } = useZone()

  // Function to get action buttons based on table status
  const getActionButtons = (table: TableResponse) => {
    switch (table.status) {
      case 'Closing':
        return (
          <>
            <Button className='flex-1'>Mở bàn</Button>
            <Button variant='outline' className='flex-1'>
              Đặt trước
            </Button>
          </>
        )
      case 'Opening':
        return (
          <>
            <Button className='flex-1'>Khóa bàn</Button>
            <Button variant='outline' className='flex-1'>
              Bảo trì
            </Button>
          </>
        )
      case 'Booked':
        return (
          <>
            <Button className='flex-1'>Xác nhận</Button>
            <Button variant='outline' className='flex-1'>
              Hủy đặt
            </Button>
          </>
        )
      case 'Locked':
        return <Button className='flex-1'>Mở khóa</Button>
      default:
        return null
    }
  }

  const handleTimeUp = () => {
    setIsTimerRunning(false)
    console.log(`Hết thời gian cho bàn ${table.id}`)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-[550px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <div className='text-xl'>{table.code}</div>
                {table.code && (
                  <Badge variant='outline' className='border-amber-500 text-amber-500'>
                    VIP
                  </Badge>
                )}
              </div>
              <div className='ml-auto'>{getStatusBadge(table.status)}</div>
            </DialogTitle>
            <DialogDescription>Chi tiết thông tin bàn ăn</DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='details'>Chi tiết</TabsTrigger>
              <TabsTrigger value='qrcode'>Mã QR</TabsTrigger>
            </TabsList>

            <TabsContent value='details' className='space-y-4 py-4'>
              <div className='grid grid-cols-[24px_1fr] items-start gap-3'>
                <Users className='h-5 w-5 text-muted-foreground' />
                <div>
                  <p className='font-medium'>Sức chứa</p>
                  <p className='text-sm text-muted-foreground'>{table.capacity} người</p>
                </div>
              </div>

              <div className='grid grid-cols-[24px_1fr] items-start gap-3'>
                <MapPin className='h-5 w-5 text-muted-foreground' />
                <div>
                  <p className='font-medium'>Vị trí</p>
                  <p className='text-sm text-muted-foreground'>{getZoneName(table.zoneId, zones_)}</p>
                </div>
              </div>

              <div className='grid grid-cols-[24px_1fr] items-start gap-3'>
                <Clock className='h-5 w-5 text-muted-foreground' />
                <div>
                  <p className='font-medium'>Cập nhật lần cuối</p>
                  <p className='text-sm text-muted-foreground'>{new Date().toLocaleString('vi-VN')}</p>
                </div>
              </div>

              {table.status !== 'Opening' && (
                <>
                  <Separator />
                  <div className='grid grid-cols-[24px_1fr] items-start gap-3'>
                    {getStatusIcon(table.status)}
                    <div>
                      <p className='font-medium'>
                        {table.status === 'Closing' && 'Thông tin bàn đang đóng'}
                        {table.status === 'Booked' && 'Thông tin đặt trước'}
                        {table.status === 'Locked' && 'Thông tin bảo trì'}
                      </p>
                      {table.status === 'Booked' && (
                        <div className='space-y-2 text-sm mt-2'>
                          <div className='flex justify-between items-center'>
                            <p>
                              Khách hàng: <span className='font-medium'>{table.id}</span>
                            </p>
                          </div>
                          <div className='flex justify-between items-center'>
                            <p>Thời gian còn lại:</p>
                            <span className='font-medium'>
                              <TableTimer isRunning={isTimerRunning} onTimeUp={handleTimeUp} />
                            </span>
                          </div>
                        </div>
                      )}
                      {table.status === 'Closing' && (
                        <div className='space-y-2 text-sm mt-2'>
                          <div className='flex justify-between items-center'>
                            <p>Thời gian đặt:</p>
                            <span className='font-medium'>{new Date().toLocaleString('vi-VN')}</span>
                          </div>
                        </div>
                      )}
                      {table.status === 'Locked' && (
                        <div className='space-y-2 text-sm mt-2'>
                          <p>
                            Ghi chú: <span className='font-medium'>{table.code}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value='history' className='py-4'>
              <div className='space-y-4'>
                <div className='text-sm text-muted-foreground'>
                  <p>Lịch sử hoạt động của bàn sẽ được hiển thị ở đây.</p>
                </div>

                <div className='border rounded-md p-4'>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline'>Mở bàn</Badge>
                        <span className='text-sm'>12/03/2025 08:30</span>
                      </div>
                      <span className='text-sm text-muted-foreground'>Nhân viên: Admin</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline'>Đóng bàn</Badge>
                        <span className='text-sm'>12/03/2025 10:45</span>
                      </div>
                      <span className='text-sm text-muted-foreground'>Nhân viên: Admin</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='qrcode' className='py-4'>
              <div className='flex flex-col items-center justify-center py-4'>
                <div className='text-center mb-4'>
                  <div className='w-48 h-48 mx-auto bg-gray-100 rounded-md flex items-center justify-center'>
                    <QrCode className='w-24 h-24 text-gray-400' />
                  </div>
                  <p className='mt-4 font-semibold'>{table.code}</p>
                  <p className='text-sm text-muted-foreground'>ID: {table.id}</p>
                </div>
                <Button onClick={() => setShowQRCodeDialog(true)}>Xem mã QR đầy đủ</Button>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className='flex flex-col sm:flex-row gap-2'>
            <div className='flex gap-2 w-full sm:w-auto'>{getActionButtons(table)}</div>
            <Button variant='outline' onClick={() => onOpenChange(false)} className='w-full sm:w-auto'>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TableQRCode table={table} open={showQRCodeDialog} onOpenChange={setShowQRCodeDialog} />
    </>
  )
}
