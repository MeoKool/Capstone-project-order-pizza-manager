import { useState } from "react"
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
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import type { Reservation } from "@/types/reservation"
import BookingService from "@/services/booking-service"
// Thêm import TableService
import TableService from "@/services/table-service"
import { useEffect } from "react"
import { AssignTableDialog } from "./AssignTableDialog"
import { GetReservationPriority, } from "./reservationPriorityStatus"

// Cập nhật interface để thêm onAssignTable và sửa lỗi
interface BookingTableProps {
    reservations: Reservation[]
    isLoading: boolean
    getStatusLabel?: (status: string) => string
    getStatusColor?: (status: string) => string
    onView: (reservation: Reservation) => void
    onRefresh?: () => void
    onAssignTable?: (reservation: Reservation) => void
}

// Cập nhật destructuring để thêm onAssignTable với giá trị mặc định
export function BookingTable({
    reservations,
    isLoading,
    getStatusLabel: customGetStatusLabel,
    getStatusColor: customGetStatusColor,
    onView,
    onRefresh,
    onAssignTable = () => { },
}: BookingTableProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const bookingService = BookingService.getInstance()
    // Thêm state để lưu trữ thông tin bàn
    const [tableCodes, setTableCodes] = useState<Record<string, string>>({})
    const [loadingTables, setLoadingTables] = useState<Record<string, boolean>>({})
    const tableService = TableService.getInstance()

    // Calculate pagination values
    const totalItems = reservations ? reservations.length : 0
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
    const currentItems = reservations ? reservations.slice(startIndex, endIndex) : []

    // Update the formatDateTime function to use bookingTime instead of bookingDate
    const formatDateTime = (dateTimeStr: string) => {
        try {
            // Handle the API date format: "2025-04-19T22:40:00"
            const date = new Date(dateTimeStr)

            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.error("Invalid date:", dateTimeStr)
                return { date: "N/A", time: "N/A" }
            }

            // Format date as dd/MM/yyyy
            const day = date.getDate().toString().padStart(2, "0")
            const month = (date.getMonth() + 1).toString().padStart(2, "0")
            const year = date.getFullYear()
            const formattedDate = `${day}/${month}/${year}`

            // Format time as HH:mm
            const hours = date.getHours().toString().padStart(2, "0")
            const minutes = date.getMinutes().toString().padStart(2, "0")
            const formattedTime = `${hours}:${minutes}`

            return { date: formattedDate, time: formattedTime }
        } catch (error) {
            console.error("Error formatting date:", error, "for input:", dateTimeStr)
            return { date: "N/A", time: "N/A" }
        }
    }

    // Handle page changes
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages || 1)))
    }

    const goToFirstPage = () => goToPage(1)
    const goToPreviousPage = () => goToPage(currentPage - 1)
    const goToNextPage = () => goToPage(currentPage + 1)
    const goToLastPage = () => goToPage(totalPages)

    // Handle items per page change
    const handleItemsPerPageChange = (value: string) => {
        const newItemsPerPage = Number.parseInt(value)
        setItemsPerPage(newItemsPerPage)
        // Reset to first page when changing items per page
        setCurrentPage(1)
    }

    // Update the getStatusLabel function to only include the 4 specific statuses
    const getStatusLabel = (status: string): string => {
        switch (status) {
            case "Created":
                return "Đã tạo"
            case "Confirmed":
                return "Đã xác nhận"
            case "Checkedin":
                return "Đã check-in"
            case "Cancelled":
                return "Đã hủy"
            default:
                return status
        }
    }

    // Update the getStatusColor function to only include the 4 specific statuses
    const getStatusColor = (status: string): string => {
        switch (status) {
            case "Created":
                return "bg-gray-100 text-gray-800"
            case "Confirmed":
                return "bg-blue-100 text-blue-800"
            case "Checkedin":
                return "bg-green-100 text-green-800"
            case "Cancelled":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    // Handle confirm reservation
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

    // Handle cancel reservation
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

    // Check if action buttons should be disabled based on status
    const isConfirmDisabled = (status: string) => {
        return ["Confirmed", "Checkedin", "Cancelled"].includes(status)
    }

    const isCancelDisabled = (status: string) => {
        return ["Cancelled"].includes(status)
    }

    // Cập nhật hàm handleAssignTableClick
    const handleAssignTableClick = (reservation: Reservation) => {
        onAssignTable(reservation)
    }

    // Xóa state và hàm không cần thiết
    // const [openAssignTable, setOpenAssignTable] = useState(false)
    // const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
    // const handleAssignTableDialogClose = () => {...}

    const [openAssignTable, setOpenAssignTable] = useState(false)
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

    const handleAssignTableDialogClose = () => {
        setOpenAssignTable(false)
        setSelectedReservation(null)
        if (onRefresh) onRefresh()
    }

    // Thêm hàm để lấy thông tin bàn
    const fetchTableDetails = async (tableId: string) => {
        if (!tableId || tableCodes[tableId]) return

        setLoadingTables((prev) => ({ ...prev, [tableId]: true }))
        try {
            const response = await tableService.getTableById(tableId)
            console.log(`Table response for ${tableId}:`, response) // Thêm log để debug
            if (response.success && response.result) {
                // Kiểm tra cấu trúc dữ liệu trả về
                console.log(`Table data for ${tableId}:`, response.result)
                setTableCodes((prev) => ({
                    ...prev,
                    [tableId]: response.result.code || `Bàn ${tableId.substring(0, 4)}`,
                }))
            }
        } catch (error) {
            console.error(`Error fetching table ${tableId}:`, error)
        } finally {
            setLoadingTables((prev) => ({ ...prev, [tableId]: false }))
        }
    }

    // Thêm useEffect để lấy thông tin bàn khi danh sách đặt bàn thay đổi
    useEffect(() => {
        // Chỉ thực hiện khi không đang loading và có dữ liệu
        if (isLoading || !currentItems || currentItems.length === 0) return

        const fetchAllTableDetails = async () => {
            // Đảm bảo currentItems không phải undefined trước khi filter
            if (!currentItems) return

            // Lọc ra các đặt bàn có tableId
            const reservationsWithTable = currentItems.filter((reservation) => reservation && reservation.tableId)

            // Nếu không có đặt bàn nào có tableId, không cần gọi API
            if (!reservationsWithTable || reservationsWithTable.length === 0) return

            console.log("Reservations with tableId:", reservationsWithTable)

            // Lấy thông tin cho từng bàn
            for (const reservation of reservationsWithTable) {
                if (reservation && reservation.tableId && !tableCodes[reservation.tableId]) {
                    console.log(`Fetching details for table ${reservation.tableId}`)
                    await fetchTableDetails(reservation.tableId)
                }
            }
        }

        fetchAllTableDetails()
    }, [currentItems, isLoading])

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
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

                                return (
                                    <TableRow key={reservation.id}>
                                        <TableCell>{reservation.customerName}</TableCell>
                                        <TableCell className="w-[150px] text-center">{reservation.phoneNumber}</TableCell>
                                        <TableCell className="w-[150px] text-center"><GetReservationPriority reservationPriorityStatus={reservation.reservationPriorityStatus} /></TableCell>
                                        <TableCell className="text-center">{reservation.numberOfPeople}</TableCell>
                                        <TableCell className="text-center">{date}</TableCell>
                                        <TableCell className="text-center">{time}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline"
                                                className={
                                                    `w-24 ${customGetStatusColor ? customGetStatusColor(reservation.status) : getStatusColor(reservation.status)
                                                    }`}
                                            >
                                                <div className="text-center w-24">
                                                    {customGetStatusLabel
                                                        ? customGetStatusLabel(reservation.status)
                                                        : getStatusLabel(reservation.status)}
                                                </div>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {reservation.tableId ? (
                                                loadingTables[reservation.tableId] ? (
                                                    <Skeleton className="h-5 w-16" />
                                                ) : (
                                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200  p-1">
                                                        <div className="w-14">
                                                            {tableCodes[reservation.tableId]
                                                                ? tableCodes[reservation.tableId]
                                                                : `Bàn ${reservation.tableId.substring(0, 4)}`}
                                                        </div>
                                                    </Badge>
                                                )
                                            ) : (
                                                <span className="text-muted-foreground text-sm">Chưa xếp</span>
                                            )}
                                        </TableCell>
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

                                                    {/* Chỉ hiển thị tùy chọn xếp bàn khi trạng thái không phải đã hủy */}
                                                    {reservation.status === "Confirmed" && (
                                                        <DropdownMenuItem onClick={() => handleAssignTableClick(reservation)}>
                                                            <TableIcon className="mr-2 h-4 w-4" />
                                                            Xếp bàn
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuSeparator />

                                                    {/* Chỉ hiển thị các nút hành động khi trạng thái không phải đã hủy */}
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

            {!isLoading && reservations && reservations.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Hiển thị {startIndex + 1}-{endIndex} của {totalItems} đặt bàn
                    </div>

                    <div className="flex items-center space-x-6">
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
            <AssignTableDialog
                open={openAssignTable}
                reservation={selectedReservation}
                onClose={handleAssignTableDialogClose}
            />
        </div>
    )
}

