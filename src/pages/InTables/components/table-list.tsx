import { Users, MoreVertical, QrCode, Edit, History, Eye, Clock, Lock, Coffee, Utensils, MapPin, CircleX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type TableResponse from '@/types/tables'
import { useState } from 'react'
import { TableDetailsDialog } from './table-details.dialog'
import useZone from '@/hooks/useZone'
import { getStatusBadge } from '@/utils/table-utils'
import { getZoneName } from '@/utils/zone-utils'
import { TableTimer } from './table-timer'
import { Badge } from '@/components/ui/badge'
import api from '@/apis/axiosConfig'
import { toast } from 'sonner'

interface TableListProps {
  tables: TableResponse[]
  onTableUpdated?: () => void // Callback to refresh tables after update
}

export function TableList({ tables, onTableUpdated }: TableListProps) {
  const [selectedTable, setSelectedTable] = useState<TableResponse | null>()
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [runningTimers, setRunningTimers] = useState<{ [key: string]: boolean }>({})
  const [loadingTableIds, setLoadingTableIds] = useState<string[]>([]) // Track which tables are being updated
  const { zones_ } = useZone()

  const handleTimeUp = (tableId: string) => {
    setRunningTimers((prev) => ({ ...prev, [tableId]: false }))
    console.log(`Hết thời gian cho bàn ${tableId}`)
  }

  const handleOpenTable = async (tableId: string) => {
    setLoadingTableIds((prev) => [...prev, tableId]) // Set loading state for this table
    try {
      await api.put(`/tables/open-table/${tableId}`)
      toast.success('Bàn đã được mở')

      // Call the callback to refresh table data
      if (onTableUpdated) {
        onTableUpdated()
      }
    } catch (error) {
      console.error(`Lỗi khi mở bàn với ID: ${tableId}`, error)
      toast.error('Không thể mở bàn. Vui lòng thử lại.')
    } finally {
      setLoadingTableIds((prev) => prev.filter((id) => id !== tableId)) // Remove loading state
    }
  }

  const handleCloseTable = async (tableId: string) => {
    setLoadingTableIds((prev) => [...prev, tableId]) // Set loading state for this table
    try {
      await api.put(`/tables/close-table/${tableId}`)
      toast.success('Bàn đã được đóng')

      // Call the callback to refresh table data
      if (onTableUpdated) {
        onTableUpdated()
      }
    } catch (error) {
      console.error(`Lỗi khi đóng bàn với ID: ${tableId}`, error)
      toast.error('Không thể đóng bàn. Vui lòng thử lại.')
    } finally {
      setLoadingTableIds((prev) => prev.filter((id) => id !== tableId)) // Remove loading state
    }
  }

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Opening':
        return 'bg-emerald-50 border-emerald-200'
      case 'Reserved':
        return 'bg-blue-50 border-blue-200'
      case 'Closing':
        return 'bg-red-50 border-red-200'
      case 'Locked':
        return 'bg-amber-50 border-amber-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  // Function to get status icon with color
  const getStatusIconWithColor = (status: string) => {
    switch (status) {
      case 'Opening':
        return <Utensils className='h-4 w-4 sm:h-5 sm:w-5 text-emerald-500' />
      case 'Reserved':
        return <Clock className='h-4 w-4 sm:h-5 sm:w-5 text-blue-500' />
      case 'Closing':
        return <CircleX className='h-4 w-4 sm:h-5 sm:w-5 text-red-500' />
      case 'Locked':
        return <Lock className='h-4 w-4 sm:h-5 sm:w-5 text-amber-500' />
      default:
        return null
    }
  }

  // Function to get action buttons based on table status
  const getActionButtons = (table: TableResponse) => {
    const isLoading = loadingTableIds.includes(table.id)

    switch (table.status) {
      case 'Closing':
        return (
          <div className='flex gap-1 sm:gap-2 mt-2 sm:mt-4'>
            <Button
              onClick={() => handleOpenTable(table.id)}
              variant='outline'
              size='sm'
              className='flex-1 font-medium text-xs sm:text-sm py-1 h-7 sm:h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50'
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Mở bàn'}
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='flex-1 font-medium text-xs sm:text-sm py-1 h-7 sm:h-8 border-blue-200 text-blue-700 hover:bg-blue-50'
              disabled={isLoading}
            >
              Đặt trước
            </Button>
          </div>
        )
      case 'Opening':
        return (
          <div className='flex gap-1 sm:gap-2 mt-2 sm:mt-4'>
            <Button
              onClick={() => handleCloseTable(table.id)}
              variant='outline'
              size='sm'
              className='flex-1 font-medium text-xs sm:text-sm py-1 h-7 sm:h-8 border-red-200 text-red-700 hover:bg-red-50'
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Đóng bàn'}
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='flex-1 font-medium text-xs sm:text-sm py-1 h-7 sm:h-8 border-amber-200 text-amber-700 hover:bg-amber-50'
              disabled={isLoading}
            >
              Bảo trì
            </Button>
          </div>
        )
      case 'Reserved':
        return (
          <div className='flex gap-1 sm:gap-2 mt-2 sm:mt-4'>
            <Button
              size='sm'
              className='flex-1 font-medium text-xs sm:text-sm py-1 h-7 sm:h-8 bg-emerald-600 hover:bg-emerald-700 text-white'
              disabled={isLoading}
            >
              Xác nhận
            </Button>
            <Button
              variant='destructive'
              size='sm'
              className='flex-1 font-medium text-xs sm:text-sm py-1 h-7 sm:h-8'
              disabled={isLoading}
            >
              Hủy đặt
            </Button>
          </div>
        )
      case 'Locked':
        return (
          <div className='flex gap-1 sm:gap-2 mt-2 sm:mt-4'>
            <Button
              onClick={() => handleOpenTable(table.id)}
              size='sm'
              className='flex-1 font-medium text-xs sm:text-sm py-1 h-7 sm:h-8 bg-amber-600 hover:bg-amber-700 text-white'
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Mở khóa'}
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  const handleOpenDetails = (table: TableResponse) => {
    setSelectedTable(table)
    setShowDetailsDialog(true)
  }

  return (
    <>
      {tables.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-8 sm:py-12 px-4 bg-amber-50 rounded-lg border border-amber-100'>
          <div className='rounded-full bg-white p-3 sm:p-4 mb-3 sm:mb-4 shadow-sm'>
            <Coffee className='h-6 w-6 sm:h-8 sm:w-8 text-amber-400' />
          </div>
          <p className='text-amber-800 text-center font-medium text-sm sm:text-base'>Không có bàn nào</p>
          <p className='text-xs sm:text-sm text-amber-600 text-center mt-1'>Thêm bàn mới để bắt đầu quản lý</p>
        </div>
      ) : (
        // Group tables by zone
        <>
          {Object.entries(
            tables.reduce<Record<string, TableResponse[]>>((acc, table) => {
              const zoneId = table.zoneId
              if (!acc[zoneId]) {
                acc[zoneId] = []
              }
              acc[zoneId].push(table)
              return acc
            }, {})
          ).map(([zoneId, zoneTables]) => (
            <div key={zoneId} className='mb-6 last:mb-0'>
              <div className='flex items-center mb-3 bg-amber-50 p-2 rounded-md border border-amber-100'>
                <MapPin className='h-4 w-4 sm:h-5 sm:w-5 text-amber-600 mr-2' />
                <h3 className='font-medium text-amber-800 text-sm sm:text-base'>{getZoneName(zoneId, zones_)}</h3>
                <Badge variant='outline' className='ml-auto bg-white text-amber-700 border-amber-200 text-xs'>
                  {zoneTables.length} bàn
                </Badge>
              </div>

              <div className='grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {zoneTables.map((table) => (
                  <Card
                    key={table.id}
                    className={`overflow-hidden hover:shadow-md transition-all border-l-4 truncate ${table.status === 'Opening'
                      ? 'border-l-emerald-500'
                      : table.status === 'Reserved'
                        ? 'border-l-blue-500'
                        : table.status === 'Closing'
                          ? 'border-l-red-500'
                          : table.status === 'Locked'
                            ? 'border-l-amber-500'
                            : 'border-l-gray-300'
                      } hover:scale-[1.02] transition-transform duration-200`}
                  >
                    <CardHeader
                      className={`flex flex-row items-center justify-between p-2 sm:p-4 ${getStatusColor(table.status)} border-b`}
                    >
                      <div className='flex items-center space-x-2 sm:space-x-3'>
                        <div className='flex items-center justify-center h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-white shadow-sm'>
                          {getStatusIconWithColor(table.status)}
                        </div>
                        <div>
                          <h3 className='font-semibold text-lg sm:text-2xl'>{table.code}</h3>
                        </div>
                      </div>
                      <div className='flex items-center gap-1'>
                        <div className='hidden sm:block'>{getStatusBadge(table.status)}</div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-white/80'
                            >
                              <MoreVertical className='h-3 w-3 sm:h-4 sm:w-4' />
                              <span className='sr-only'>Tùy chọn</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='w-40 sm:w-48 border-amber-200'>
                            <DropdownMenuItem
                              onClick={() => handleOpenDetails(table)}
                              className='flex items-center cursor-pointer hover:bg-amber-50 text-xs sm:text-sm py-1.5'
                            >
                              <Eye className='mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-amber-600' />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenDetails(table)}
                              className='flex items-center cursor-pointer hover:bg-amber-50 text-xs sm:text-sm py-1.5'
                            >
                              <Edit className='mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-amber-600' />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenDetails(table)}
                              className='flex items-center cursor-pointer hover:bg-amber-50 text-xs sm:text-sm py-1.5'
                            >
                              <History className='mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-amber-600' />
                              Lịch sử
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenDetails(table)}
                              className='flex items-center cursor-pointer hover:bg-amber-50 text-xs sm:text-sm py-1.5'
                            >
                              <QrCode className='mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-amber-600' />
                              Mã QR
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className='p-2 sm:p-4'>
                      <div className='space-y-2 sm:space-y-3 min-h-[80px] sm:min-h-[100px]'>
                        <div className='flex items-center text-xs sm:text-sm bg-amber-50/50 p-1.5 sm:p-2.5 rounded-md'>
                          <Users className='mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-amber-600' />
                          <span className='text-amber-800'>Sức chứa:</span>
                          <Badge
                            variant='outline'
                            className='ml-auto font-medium text-xs bg-white border-amber-200 text-amber-700'
                          >
                            {table.capacity} người
                          </Badge>
                        </div>

                        {table.status === 'Reserved' && (
                          <div className='flex items-center justify-between text-xs sm:text-sm bg-blue-50 p-1.5 sm:p-2.5 rounded-md'>
                            <div className='flex items-center'>
                              <Clock className='mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-blue-500' />
                              <span className='text-blue-700 font-medium'>Thời gian:</span>
                            </div>
                            <div className='font-medium text-blue-700'>
                              <TableTimer
                                isRunning={runningTimers[table.id] || false}
                                onTimeUp={() => handleTimeUp(table.id)}
                              />
                            </div>
                          </div>
                        )}

                        {table.status === 'Closing' && (
                          <div className='flex items-center text-xs sm:text-sm bg-red-50 p-1.5 sm:p-2.5 rounded-md'>
                            <CircleX className='mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-red-500' />
                            <span className='text-red-700 font-medium'>Bàn đang đóng</span>
                          </div>
                        )}

                        {table.status === 'Locked' && (
                          <div className='flex items-center text-xs sm:text-sm bg-amber-50 p-1.5 sm:p-2.5 rounded-md'>
                            <Lock className='mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-amber-500' />
                            <span className='text-amber-700 font-medium'>Bàn đang khóa</span>
                          </div>
                        )}
                      </div>

                      {getActionButtons(table)}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {selectedTable && (
        <TableDetailsDialog table={selectedTable} open={showDetailsDialog} onOpenChange={setShowDetailsDialog} />
      )}
    </>
  )
}
