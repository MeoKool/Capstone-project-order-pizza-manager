'use client'

import { useState } from 'react'
import { Users, MapPin, Clock, Printer, Download, Utensils } from 'lucide-react'
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
import { getStatusBadge, getStatusIcon } from '@/utils/table-utils'
import useZone from '@/hooks/useZone'
import { getZoneName } from '@/utils/zone-utils'
import { TableTimer } from './table-timer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent } from '@/components/ui/card'

interface TableDetailsDialogProps {
  table: TableResponse
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TableDetailsDialog({ table, open, onOpenChange }: TableDetailsDialogProps) {
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [qrSize, setQrSize] = useState<'small' | 'medium' | 'large'>('medium')
  const { zones_ } = useZone()

  const apiPublic = import.meta.env.VITE_PUBLIC_WEBSITE_URL || 'https://example.com'
  const qrCodeData = `${apiPublic}${table.id}/?tableCode=${table.code}`

  const getQrSize = () => {
    switch (qrSize) {
      case 'small':
        return 120
      case 'large':
        return 250
      default:
        return 180
    }
  }
  const handleOpenTable = () => {
    return () => {
      console.log(`Mở bàn ${table.id}`)
    }
  }

  const handleCloseTable = () => {
    return () => {
      console.log(`Khóa bàn ${table.id}`)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>In mã QR - ${table.code}</title>
            <style>
              body { 
                font-family: system-ui, sans-serif; 
                text-align: center; 
                padding: 20px; 
                background-color: #fffbeb;
              }
              .qr-container { 
                margin: 0 auto; 
                max-width: 400px;
                padding: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .table-info { margin-top: 20px; }
              .table-name { 
                font-size: 24px; 
                font-weight: bold; 
                margin-bottom: 5px;
                color: #92400e;
              }
              .table-id { 
                font-size: 14px; 
                color: #666; 
              }
              .restaurant-name {
                font-size: 16px;
                color: #92400e;
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeData)}" />
              <div class="table-info">
                <div class="table-name">${table.code}</div>
                <div class="table-id">ID: ${table.id}</div>
                <div class="restaurant-name">Nhà hàng của bạn</div>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  const handleDownload = () => {
    const canvas = document.querySelector('#qr-code-area svg') as SVGElement
    if (!canvas) return

    const svgData = new XMLSerializer().serializeToString(canvas)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)

    const downloadLink = document.createElement('a')
    downloadLink.href = svgUrl
    downloadLink.download = `qr-code-${table.code}.svg`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  // Function to get action buttons based on table status
  const getActionButtons = (table: TableResponse) => {
    switch (table.status) {
      case 'Closing':
        return (
          <>
            <Button
              onClick={handleOpenTable()}
              className='flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm py-1 h-7 sm:h-9'
            >
              Mở bàn
            </Button>
            <Button
              variant='outline'
              className='flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm py-1 h-7 sm:h-9'
            >
              Đặt trước
            </Button>
          </>
        )
      case 'Opening':
        return (
          <>
            <Button
              variant='destructive'
              onClick={handleCloseTable()}
              className='flex-1 text-xs sm:text-sm py-1 h-7 sm:h-9'
            >
              Khóa bàn
            </Button>
            <Button
              variant='outline'
              className='flex-1 border-amber-200 text-amber-700 hover:bg-amber-50 text-xs sm:text-sm py-1 h-7 sm:h-9'
            >
              Bảo trì
            </Button>
          </>
        )
      case 'Reserved':
        return (
          <>
            <Button className='flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm py-1 h-7 sm:h-9'>
              Xác nhận
            </Button>
            <Button variant='destructive' className='flex-1 text-xs sm:text-sm py-1 h-7 sm:h-9'>
              Hủy đặt
            </Button>
          </>
        )
      case 'Locked':
        return (
          <Button className='flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm py-1 h-7 sm:h-9'>
            Mở khóa
          </Button>
        )
      default:
        return null
    }
  }

  const handleTimeUp = () => {
    setIsTimerRunning(false)
    console.log(`Hết thời gian cho bàn ${table.id}`)
  }

  const getStatusInfo = () => {
    switch (table.status) {
      case 'Closing':
        return {
          title: 'Thông tin bàn đang đóng',
          content: (
            <div className='space-y-2'>
              <div className='flex justify-between items-center gap-2'>
                <span className='text-xs sm:text-sm text-muted-foreground'>Trạng thái:</span>
                <span className='text-xs sm:text-sm font-medium'>Bàn đã đóng</span>
              </div>
              <div className='flex justify-between items-center gap-2'>
                <span className='text-xs sm:text-sm text-muted-foreground'>Thời gian đóng:</span>
                <span className='text-xs sm:text-sm font-medium'>{new Date().toLocaleString('vi-VN')}</span>
              </div>
            </div>
          )
        }
      case 'Reserved':
        return {
          title: 'Thông tin đặt trước',
          content: (
            <div className='space-y-2'>
              <div className='flex justify-between items-center gap-2'>
                <span className='text-xs sm:text-sm text-muted-foreground'>Khách hàng:</span>
                <span className='text-xs sm:text-sm font-medium'>{table.id}</span>
              </div>
              <div className='flex justify-between items-center gap-2'>
                <span className='text-xs sm:text-sm text-muted-foreground'>Thời gian còn lại:</span>
                <TableTimer isRunning={isTimerRunning} onTimeUp={handleTimeUp} />
              </div>
            </div>
          )
        }
      case 'Locked':
        return {
          title: 'Thông tin bảo trì',
          content: (
            <div className='space-y-2'>
              <div className='flex justify-between items-center gap-2'>
                <span className='text-xs sm:text-sm text-muted-foreground'>Ghi chú:</span>
                <span className='text-xs sm:text-sm font-medium'>{table.code}</span>
              </div>
            </div>
          )
        }
      default:
        return null
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[550px] border-amber-200 max-w-[95vw] p-4 sm:p-6'>
        <DialogHeader className='bg-gradient-to-r from-amber-50 to-orange-50 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 rounded-t-lg border-b border-amber-100'>
          <DialogTitle className='flex items-center gap-2 sm:gap-3'>
            <div className='flex items-center gap-1 sm:gap-2'>
              <div className='bg-amber-600 p-1 sm:p-1.5 rounded-md'>
                <Utensils className='h-3 w-3 sm:h-4 sm:w-4 text-white' />
              </div>
              <div className='text-base sm:text-xl text-amber-800'>{table.code}</div>
              {table.code && (
                <Badge variant='outline' className='border-amber-500 text-amber-500 bg-amber-50 text-xs'>
                  VIP
                </Badge>
              )}
            </div>
            <div className='ml-auto'>{getStatusBadge(table.status)}</div>
          </DialogTitle>
          <DialogDescription className='text-xs sm:text-sm'>Chi tiết thông tin bàn ăn</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-2 bg-amber-50 border border-amber-100 h-8 sm:h-10'>
            <TabsTrigger
              value='details'
              className='data-[state=active]:bg-amber-600 data-[state=active]:text-white text-xs sm:text-sm'
            >
              Chi tiết
            </TabsTrigger>
            <TabsTrigger
              value='qrcode'
              className='data-[state=active]:bg-amber-600 data-[state=active]:text-white text-xs sm:text-sm'
            >
              Mã QR
            </TabsTrigger>
          </TabsList>

          <TabsContent value='details' className='space-y-3 sm:space-y-4 py-3 sm:py-4'>
            <Card className='border-amber-100'>
              <CardContent className='p-3 sm:p-4 space-y-3 sm:space-y-4'>
                <div className='grid grid-cols-[20px_1fr] sm:grid-cols-[24px_1fr] items-start gap-2 sm:gap-3'>
                  <Users className='h-4 w-4 sm:h-5 sm:w-5 text-amber-600' />
                  <div>
                    <p className='font-medium text-amber-900 text-xs sm:text-sm'>Sức chứa</p>
                    <p className='text-xs sm:text-sm text-amber-700'>{table.capacity} người</p>
                  </div>
                </div>

                <div className='grid grid-cols-[20px_1fr] sm:grid-cols-[24px_1fr] items-start gap-2 sm:gap-3'>
                  <MapPin className='h-4 w-4 sm:h-5 sm:w-5 text-amber-600' />
                  <div>
                    <p className='font-medium text-amber-900 text-xs sm:text-sm'>Vị trí</p>
                    <p className='text-xs sm:text-sm text-amber-700'>{getZoneName(table.zoneId, zones_)}</p>
                  </div>
                </div>

                <div className='grid grid-cols-[20px_1fr] sm:grid-cols-[24px_1fr] items-start gap-2 sm:gap-3'>
                  <Clock className='h-4 w-4 sm:h-5 sm:w-5 text-amber-600' />
                  <div>
                    <p className='font-medium text-amber-900 text-xs sm:text-sm'>Cập nhật lần cuối</p>
                    <p className='text-xs sm:text-sm text-amber-700'>{new Date().toLocaleString('vi-VN')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {statusInfo && (
              <Card className='border-amber-100'>
                <CardContent className='p-3 sm:p-4'>
                  <div className='items-start gap-2 sm:gap-3'>
                    {getStatusIcon(table.status)}
                    <div className='space-y-2 sm:space-y-3'>
                      <h3 className='font-medium text-amber-900 text-xs sm:text-sm'>{statusInfo.title}</h3>
                      {statusInfo.content}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value='qrcode' className='py-3 sm:py-4'>
            <Card className='border-amber-100'>
              <CardContent className='p-3 sm:p-6 space-y-4 sm:space-y-6'>
                <div className='flex flex-col items-center justify-center'>
                  <div className='text-center' id='qr-code-area'>
                    <QRCodeSVG
                      value={qrCodeData}
                      size={getQrSize()}
                      level='H'
                      includeMargin={true}
                      className='rounded-md border-4 border-amber-100 p-1'
                    />
                    <p className='mt-2 sm:mt-4 font-semibold text-sm sm:text-lg text-amber-800'>{table.code}</p>
                    <p className='text-xs sm:text-sm text-amber-600'>ID: {table.id}</p>
                  </div>
                </div>

                <Separator className='bg-amber-100' />

                <div className='space-y-3 sm:space-y-4'>
                  <div>
                    <h3 className='text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-amber-800'>Kích thước mã QR</h3>
                    <div className='flex gap-1 sm:gap-2'>
                      <Button
                        variant={qrSize === 'small' ? 'default' : 'outline'}
                        onClick={() => setQrSize('small')}
                        className={`flex-1 text-xs sm:text-sm py-1 h-7 sm:h-9 ${qrSize === 'small' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-200 text-amber-700 hover:bg-amber-50'}`}
                      >
                        Nhỏ
                      </Button>
                      <Button
                        variant={qrSize === 'medium' ? 'default' : 'outline'}
                        onClick={() => setQrSize('medium')}
                        className={`flex-1 text-xs sm:text-sm py-1 h-7 sm:h-9 ${qrSize === 'medium' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-200 text-amber-700 hover:bg-amber-50'}`}
                      >
                        Vừa
                      </Button>
                      <Button
                        variant={qrSize === 'large' ? 'default' : 'outline'}
                        onClick={() => setQrSize('large')}
                        className={`flex-1 text-xs sm:text-sm py-1 h-7 sm:h-9 ${qrSize === 'large' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-200 text-amber-700 hover:bg-amber-50'}`}
                      >
                        Lớn
                      </Button>
                    </div>
                  </div>

                  <div className='flex gap-1 sm:gap-2'>
                    <Button
                      onClick={handlePrint}
                      className='flex-1 bg-amber-600 hover:bg-amber-700 text-xs sm:text-sm py-1 h-7 sm:h-9'
                    >
                      <Printer className='mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                      In mã QR
                    </Button>
                    <Button
                      variant='outline'
                      onClick={handleDownload}
                      className='flex-1 border-amber-200 text-amber-700 hover:bg-amber-50 text-xs sm:text-sm py-1 h-7 sm:h-9'
                    >
                      <Download className='mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                      Tải xuống SVG
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className='flex flex-col sm:flex-row gap-1 sm:gap-2 mt-2 sm:mt-0'>
          <div className='flex gap-1 sm:gap-2 w-full sm:w-auto'>{getActionButtons(table)}</div>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='w-full sm:w-auto border-amber-200 text-amber-700 hover:bg-amber-50 text-xs sm:text-sm py-1 h-7 sm:h-9'
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
