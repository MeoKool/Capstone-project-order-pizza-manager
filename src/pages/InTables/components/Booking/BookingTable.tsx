import { useState, useEffect, useRef } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Loader2,
  TableIcon,
  Trash2,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import type { Reservation } from "@/types/reservation"
import BookingService from "@/services/booking-service"
import TableService from "@/services/table-service"
import { ReservationPriorityStatus } from "./reservationPriorityStatus"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface BookingTableProps {
  reservations: Reservation[]
  isLoading: boolean
  getStatusLabel: (status: string) => string
  getStatusColor: (status: string) => string
  onView: (reservation: Reservation) => void
  onRefresh?: () => void
  onAssignTable?: (reservation: Reservation) => void
}

export function BookingTable({
  reservations,
  isLoading,
  getStatusLabel,
  getStatusColor,
  onView,
  onRefresh,
  onAssignTable = () => { },
}: BookingTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [tableCodes, setTableCodes] = useState<Record<string, string>>({})
  const [loadingTables, setLoadingTables] = useState<Record<string, boolean>>({})
  const [isUnassignDialogOpen, setIsUnassignDialogOpen] = useState(false)
  const [unassignData, setUnassignData] = useState<{
    reservationId: string
    tableIds: string[]
    allTables: boolean
  } | null>(null)

  const bookingService = BookingService.getInstance()
  const tableService = TableService.getInstance()

  // Calculate pagination values
  const totalItems = reservations ? reservations.length : 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const currentItems = reservations ? reservations.slice(startIndex, endIndex) : []

  // Format date and time
  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr)
      if (isNaN(date.getTime())) return { date: "N/A", time: "N/A" }

      const day = date.getDate().toString().padStart(2, "0")
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const year = date.getFullYear()
      const formattedDate = `${day}/${month}/${year}`

      const hours = date.getHours().toString().padStart(2, "0")
      const minutes = date.getMinutes().toString().padStart(2, "0")
      const formattedTime = `${hours}:${minutes}`

      return { date: formattedDate, time: formattedTime }
    } catch (error) {
      console.error("Error formatting date:", error, "for input:", dateTimeStr)
      return { date: "N/A", time: "N/A" }
    }
  }

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages || 1)))
  }

  const goToFirstPage = () => goToPage(1)
  const goToPreviousPage = () => goToPage(currentPage - 1)
  const goToNextPage = () => goToPage(currentPage + 1)
  const goToLastPage = () => goToPage(totalPages)

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number.parseInt(value))
    setCurrentPage(1)
  }

  // Action handlers
  const handleConfirm = async (id: string) => {
    setActionLoading(id + "-confirm")
    try {
      const response = await bookingService.confirmReservation(id)
      if (response.success) {
        toast.success("Đã xác nhận đặt bàn thành công!")
        if (onRefresh) onRefresh()
      } else {
        toast.error(response.message || "Không thể xác nhận đặt bàn")
      }
    } catch (error) {
      console.error("Error confirming reservation:", error)
      toast.error("Có lỗi xảy ra khi xác nhận đặt bàn")
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (id: string) => {
    setActionLoading(id + "-cancel")
    try {
      const response = await bookingService.cancelReservation(id)
      if (response.success) {
        toast.success("Đã hủy đặt bàn thành công!")
        if (onRefresh) onRefresh()
      } else {
        toast.error(response.message || "Không thể hủy đặt bàn")
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error)
      toast.error("Có lỗi xảy ra khi hủy đặt bàn")
    } finally {
      setActionLoading(null)
    }
  }

  // Handle unassign table confirmation
  const handleUnassignTable = (reservationId: string, tableIds: string[], allTables = false) => {
    setUnassignData({ reservationId, tableIds, allTables })
    setIsUnassignDialogOpen(true)
  }

  // Execute unassign table action
  const executeUnassignTable = async () => {
    if (!unassignData) return

    const { reservationId, tableIds, allTables } = unassignData
    setActionLoading(reservationId + "-unassign")

    try {
      const response = await bookingService.cancelAssignTableToReservation(reservationId, tableIds)
      if (response.success) {
        toast.success(
          allTables
            ? "Đã hủy tất cả bàn đã đặt thành công!"
            : tableIds.length > 1
              ? "Đã hủy các bàn đã chọn thành công!"
              : "Đã hủy bàn đã chọn thành công!",
        )
        if (onRefresh) onRefresh()
      } else {
        toast.error(response.message || "Không thể hủy bàn đã đặt")
      }
    } catch (error) {
      console.error("Error unassigning tables:", error)
      toast.error("Có lỗi xảy ra khi hủy bàn đã đặt")
    } finally {
      setActionLoading(null)
      setUnassignData(null)
    }
  }

  // Check if action buttons should be disabled
  const isConfirmDisabled = (status: string) => {
    return ["Confirmed", "Checkedin", "Cancelled"].includes(status)
  }

  const isCancelDisabled = (status: string) => {
    return ["Cancelled"].includes(status)
  }

  // Create a cache for table details to avoid redundant API calls
  const tableDetailsCache = useRef<Record<string, string>>({})

  // Optimized function to fetch table details
  const fetchTableDetails = async (tableId: string) => {
    if (!tableId || tableCodes[tableId]) return

    // Check if we're already loading this table
    if (loadingTables[tableId]) return

    // Check if we already have this table in our cache
    if (tableDetailsCache.current[tableId]) {
      setTableCodes((prev) => ({
        ...prev,
        [tableId]: tableDetailsCache.current[tableId],
      }))
      return
    }

    setLoadingTables((prev) => ({ ...prev, [tableId]: true }))
    try {
      const response = await tableService.getTableById(tableId)
      if (response.success && response.result) {
        const tableCode = response.result.code || `Bàn ${tableId.substring(0, 4)}`

        // Update the cache
        tableDetailsCache.current[tableId] = tableCode

        // Update state
        setTableCodes((prev) => ({
          ...prev,
          [tableId]: tableCode,
        }))
      }
    } catch (error) {
      console.error(`Error fetching table ${tableId}:`, error)
    } finally {
      setLoadingTables((prev) => ({ ...prev, [tableId]: false }))
    }
  }

  // Process reservations to extract and fetch table information
  useEffect(() => {
    if (isLoading || !currentItems || currentItems.length === 0) return

    const processReservations = async () => {
      for (const reservation of currentItems) {
        if (!reservation) continue

        // Get table IDs from tableAssignReservations array
        if (reservation.tableAssignReservations && reservation.tableAssignReservations.length > 0) {
          for (const tableAssign of reservation.tableAssignReservations) {
            if (
              tableAssign.tableId &&
              !tableCodes[tableAssign.tableId] &&
              !loadingTables[tableAssign.tableId] &&
              !tableDetailsCache.current[tableAssign.tableId]
            ) {
              await fetchTableDetails(tableAssign.tableId)
            }
          }
        }
      }
    }

    processReservations()
  }, [currentItems, isLoading])

  // Function to render table badges
  const renderTableBadges = (reservation: Reservation) => {
    // Get table IDs from tableAssignReservations array
    const tableIds = reservation.tableAssignReservations?.map((ta) => ta.tableId) || []

    if (tableIds.length === 0) {
      return (
        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 p-1">
          <h1 className="text-xs">Chưa xếp</h1>
        </Badge>
      )
    }

    if (tableIds.length === 1) {
      const tableId = tableIds[0]
      return loadingTables[tableId] ? (
        <Skeleton className="h-5 w-16" />
      ) : (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 p-1">
          <div className="w-14">{tableCodes[tableId] ? tableCodes[tableId] : `Bàn ${tableId.substring(0, 4)}`}</div>
        </Badge>
      )
    }

    // Sort table IDs by their codes
    const sortedTableIds = [...tableIds].sort((a, b) => {
      const codeA = tableCodes[a] || `Bàn ${a.substring(0, 4)}`
      const codeB = tableCodes[b] || `Bàn ${b.substring(0, 4)}`
      return codeA.localeCompare(codeB)
    })

    // Multiple tables
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-wrap gap-1">
              {sortedTableIds.slice(0, 2).map((tableId) =>
                loadingTables[tableId] ? (
                  <Skeleton key={tableId} className="h-5 w-12" />
                ) : (
                  <Badge
                    key={tableId}
                    variant="outline"
                    className="bg-orange-50 text-orange-700 border-orange-200 p-1 text-xs"
                  >
                    {tableCodes[tableId] ? tableCodes[tableId] : `Bàn ${tableId.substring(0, 4)}`}
                  </Badge>
                ),
              )}
              {sortedTableIds.length > 2 && (
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 p-1 text-xs">
                  +{sortedTableIds.length - 2}
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold text-xs">Tất cả bàn đã đặt:</p>
              <div className="flex flex-wrap gap-1">
                {sortedTableIds.map((tableId) => (
                  <Badge
                    key={tableId}
                    variant="outline"
                    className="bg-orange-50 text-orange-700 border-orange-200 p-1 text-xs"
                  >
                    {tableCodes[tableId] ? tableCodes[tableId] : `Bàn ${tableId.substring(0, 4)}`}
                  </Badge>
                ))}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Check if a reservation has tables assigned
  const hasTablesAssigned = (reservation: Reservation) => {
    return reservation.tableAssignReservations && reservation.tableAssignReservations.length > 0
  }

  // Get table IDs from a reservation
  const getTableIds = (reservation: Reservation) => {
    return reservation.tableAssignReservations?.map((ta) => ta.tableId) || []
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Khách hàng</TableHead>
              <TableHead className="w-[200px] text-center">Số điện thoại</TableHead>
              <TableHead className="text-center">Cấp bậc</TableHead>
              <TableHead className="w-[120px] text-center">Số người</TableHead>
              <TableHead className="w-[120px] text-center">Ngày</TableHead>
              <TableHead className="w-[100px] text-center">Giờ</TableHead>
              <TableHead className="w-[200px] text-center">Trạng thái</TableHead>
              <TableHead className="w-[100px] text-center">Bàn</TableHead>
              <TableHead className="w-[80px] text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array(itemsPerPage)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-5 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
            ) : !reservations || reservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Không có đặt bàn nào. Hãy thêm đặt bàn mới.
                </TableCell>
              </TableRow>
            ) : (
              currentItems &&
              currentItems.map((reservation) => {
                if (!reservation) return null

                const { date, time } = formatDateTime(reservation.bookingTime || "")
                const isConfirmLoading = actionLoading === reservation.id + "-confirm"
                const isCancelLoading = actionLoading === reservation.id + "-cancel"
                const isUnassignLoading = actionLoading === reservation.id + "-unassign"
                const tableIds = getTableIds(reservation)

                return (
                  <TableRow key={reservation.id}>
                    <TableCell>{reservation.customerName}</TableCell>
                    <TableCell className="text-center">{reservation.phoneNumber}</TableCell>
                    <TableCell className="text-center">
                      <ReservationPriorityStatus reservationPriorityStatus={reservation.reservationPriorityStatus} />
                    </TableCell>
                    <TableCell className="text-center">{reservation.numberOfPeople}</TableCell>
                    <TableCell className="text-center">{date}</TableCell>
                    <TableCell className="text-center">{time}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={getStatusColor(reservation.status)}>
                        <div className="text-center w-24">{getStatusLabel(reservation.status)}</div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{renderTableBadges(reservation)}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Mở menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(reservation)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>

                          {reservation.status === "Confirmed" && (
                            <DropdownMenuItem onClick={() => onAssignTable(reservation)}>
                              <TableIcon className="mr-2 h-4 w-4" />
                              {hasTablesAssigned(reservation) ? "Thêm/Sửa bàn" : "Xếp bàn"}
                            </DropdownMenuItem>
                          )}

                          {/* Show unassign table options if tables are assigned */}
                          {hasTablesAssigned(reservation) && (
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger
                                disabled={isUnassignLoading}
                                className="text-amber-600 focus:text-amber-600"
                              >
                                {isUnassignLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang hủy bàn...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hủy bàn đã đặt
                                  </>
                                )}
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem
                                    onClick={() => handleUnassignTable(reservation.id, tableIds, true)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hủy tất cả bàn
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {tableIds.map((tableId) => (
                                    <DropdownMenuItem
                                      key={tableId}
                                      onClick={() => handleUnassignTable(reservation.id, [tableId])}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Hủy bàn {tableCodes[tableId] || tableId.substring(0, 4)}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                          )}

                          <DropdownMenuSeparator />

                          {reservation.status !== "Cancelled" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleConfirm(reservation.id)}
                                disabled={isConfirmDisabled(reservation.status) || isConfirmLoading || isCancelLoading}
                                className="text-green-600 focus:text-green-600"
                              >
                                {isConfirmLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xác nhận...
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Xác nhận đặt bàn
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleCancel(reservation.id)}
                                disabled={isCancelDisabled(reservation.status) || isConfirmLoading || isCancelLoading}
                                className="text-red-600 focus:text-red-600"
                              >
                                {isCancelLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang hủy...
                                  </>
                                ) : (
                                  <>
                                    <X className="mr-2 h-4 w-4" />
                                    Hủy đặt bàn
                                  </>
                                )}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation dialog for unassigning tables */}
      <AlertDialog open={isUnassignDialogOpen} onOpenChange={setIsUnassignDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy bàn</AlertDialogTitle>
            <AlertDialogDescription>
              {unassignData?.allTables
                ? "Bạn có chắc chắn muốn hủy tất cả bàn đã đặt cho lịch đặt chỗ này không?"
                : unassignData?.tableIds.length === 1
                  ? `Bạn có chắc chắn muốn hủy bàn ${tableCodes[unassignData.tableIds[0]] || unassignData.tableIds[0].substring(0, 4)
                  } không?`
                  : "Bạn có chắc chắn muốn hủy các bàn đã chọn không?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading === unassignData?.reservationId + "-unassign"}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeUnassignTable}
              disabled={actionLoading === unassignData?.reservationId + "-unassign"}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading === unassignData?.reservationId + "-unassign" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!isLoading && reservations && reservations.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {startIndex + 1}-{endIndex} của {totalItems} đặt bàn
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Hiển thị:</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={itemsPerPage.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
                <span className="sr-only">Trang đầu</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Trang trước</span>
              </Button>

              <span className="text-sm">
                Trang <strong>{currentPage}</strong> / {totalPages || 1}
              </span>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Trang sau</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToLastPage}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronsRight className="h-4 w-4" />
                <span className="sr-only">Trang cuối</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
