import {
    Users,
    MoreVertical,
    QrCode,
    Edit,
    History,
    Eye,
    Clock,
    Lock,
    Utensils,
    CircleX,
    ArrowRightLeft,
    XCircle,
    Phone,
    Layers,
    User,
    Calendar,
    Star,

} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getStatusBadge } from "@/utils/table-utils"
import type TableResponse from "@/types/tables"
import { TableTimer } from "../table-timer"
import { TableMergeBadge } from "../table-merge-badge"
import { TableUnmergeDialog } from "../table-unmerge-dialog"
import { useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface TableCardProps {
    table: TableResponse
    isLoading: boolean
    isTimerRunning: boolean
    onTimeUp: () => void
    onOpenTable: (tableId: string) => Promise<void>
    onCloseTable: (tableId: string) => Promise<void>
    onOpenDetails: (table: TableResponse) => void
    onOpenQRCode: (table: TableResponse) => void
    onOpenUpdateDialog: (table: TableResponse) => void
    onOpenLockDialog: (table: TableResponse) => void
    onOpenSwapDialog: (table: TableResponse) => void
    onOpenCancelOrderDialog: (table: TableResponse) => void
    onOpenReserveDialog: (table: TableResponse) => void
    handleCancelReservation: (table: TableResponse) => Promise<void>
    onTableUpdated?: () => void
}

export function TableCard({
    table,
    isLoading,
    isTimerRunning,
    onTimeUp,
    onOpenTable,
    onCloseTable,
    onOpenDetails,
    onOpenQRCode,
    onOpenUpdateDialog,
    onOpenLockDialog,
    onOpenSwapDialog,
    onOpenCancelOrderDialog,
    onOpenReserveDialog,
    handleCancelReservation,
    onTableUpdated
}: TableCardProps) {
    const [showUnmergeDialog, setShowUnmergeDialog] = useState(false)

    const [isTimerExpired, setIsTimerExpired] = useState(false)

    // Handler function to update the timer expired status
    const handleTimerStatusChange = (expired: boolean) => {
        setIsTimerExpired(expired)
    }
    const handleTimeUp = () => {

        // Call the parent's onTimeUp handler
        onTimeUp()
    }


    // Function to get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case "Opening":
                return "bg-emerald-50 border-emerald-200"
            case "Reserved":
                return "bg-blue-50 border-blue-200"
            case "Closing":
                return "bg-red-50 border-red-200"
            case "Locked":
                return "bg-amber-50 border-amber-200"
            default:
                return "bg-gray-50 border-gray-200"
        }
    }

    // Function to get status icon with color
    const getStatusIconWithColor = (status: string) => {
        switch (status) {
            case "Opening":
                return <Utensils className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
            case "Reserved":
                return <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            case "Closing":
                return <CircleX className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
            case "Locked":
                return <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
            default:
                return null
        }
    }
    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return ""
        try {
            return format(new Date(dateString), "HH:mm - dd/MM/yyyy", { locale: vi })
        } catch (error) {
            console.log("Error formatting date:", error);

            return dateString
        }
    }
    // Function to get action buttons based on table status
    const getActionButtons = () => {
        switch (table.status) {
            case "Closing":
                return (
                    <div className="flex w-full gap-1 sm:gap-2">
                        <Button
                            onClick={() => onOpenTable(table.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1 font-medium text-xs sm:text-sm py-1 h-7 sm:h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            disabled={isLoading}
                        >
                            {isLoading ? "Đang xử lý..." : "Mở bàn"}
                        </Button>
                        <Button
                            onClick={() => onOpenReserveDialog(table)}
                            variant="outline"
                            size="sm"
                            className="flex-1 font-medium text-xs sm:text-sm py-1 h-7 sm:h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
                            disabled={isLoading}
                        >
                            Đặt trước
                        </Button>
                    </div>
                )
            case "Opening":
                return (
                    <div className="flex w-full gap-1 sm:gap-2">
                        <Button
                            onClick={() => onCloseTable(table.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1 font-medium text-xs sm:text-sm py-1 h-7 sm:h-8 border-red-200 text-red-700 hover:bg-red-50"
                            disabled={isLoading}
                        >
                            {isLoading ? "Đang xử lý..." : "Đóng bàn"}
                        </Button>
                        <Button
                            onClick={() => onOpenLockDialog(table)}
                            variant="outline"
                            size="sm"
                            className="flex-1 font-medium text-xs sm:text-sm py-1 h-7 sm:h-8 border-amber-200 text-amber-700 hover:bg-amber-50"
                            disabled={isLoading}
                        >
                            Bảo trì
                        </Button>
                    </div>
                )
            case "Reserved":
                return (
                    <div className="flex w-full gap-1 sm:gap-2">

                        {table.currentReservation && (
                            <Button
                                onClick={() => handleCancelReservation(table)}
                                variant="outline"
                                size="sm"
                                className="flex-1 font-medium text-xs sm:text-sm py-1 h-7 sm:h-8 border-red-200 text-red-700 hover:bg-red-100"
                                disabled={isLoading}
                            >
                                Hủy xếp bàn
                            </Button>
                        )}
                    </div>
                )
            case "Locked":
                return (
                    <div className="flex w-full gap-1 sm:gap-2">
                        <Button
                            onClick={() => onOpenTable(table.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1 font-medium text-xs sm:text-sm py-1 h-7 sm:h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            disabled={isLoading}
                        >
                            {isLoading ? "Đang xử lý..." : "Mở bàn"}
                        </Button>
                        <Button
                            onClick={() => onCloseTable(table.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1 font-medium text-xs sm:text-sm py-1 h-7 sm:h-8 border-red-200 text-red-700 hover:bg-red-50"
                            disabled={isLoading}
                        >
                            {isLoading ? "Đang xử lý..." : "Đóng bàn"}
                        </Button>
                    </div>
                )
            default:
                return null
        }
    }
    const formatPhoneNumber = (phone: string) => {
        if (!phone) return ""
        return phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3")
    }

    return (
        <Card
            className={`overflow-hidden transition-all border-l-8 truncate ${table.tableMergeId && table.status === "Opening"
                ? "border-l-purple-500 border-purple-500"
                : table.status === "Opening"
                    ? "border-l-emerald-500 border-emerald-500"
                    : table.status === "Reserved"
                        ? "border-l-blue-500 border-blue-500"
                        : table.status === "Closing"
                            ? "border-l-red-500 border-red-500"
                            : table.status === "Locked"
                                ? "border-l-amber-500 border-amber-500"
                                : "border-l-gray-300"
                } hover:scale-[1.03] transition-transform duration-200`}
        >
            <CardHeader
                className={`flex flex-row items-center justify-between p-2 sm:p-4 ${getStatusColor(table.status)} border-b`}
            >
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="flex items-center justify-center h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-white">
                        {getStatusIconWithColor(table.status)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg sm:text-2xl">{table.code}</h3>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <div className="hidden sm:block">{getStatusBadge(table.status)}</div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-white/80">
                                <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="sr-only">Tùy chọn</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 sm:w-48 border-amber-200">
                            <DropdownMenuItem
                                onClick={() => onOpenDetails(table)}
                                className="flex items-center cursor-pointer hover:bg-amber-50 text-xs sm:text-sm py-1.5"
                            >
                                <Eye className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                                Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onOpenUpdateDialog(table)}
                                className="flex items-center cursor-pointer hover:bg-amber-50 text-xs sm:text-sm py-1.5"
                            >
                                <Edit className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                                Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onOpenDetails(table)}
                                className="flex items-center cursor-pointer hover:bg-amber-50 text-xs sm:text-sm py-1.5"
                            >
                                <History className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                                Lịch sử
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onOpenQRCode(table)}
                                className="flex items-center cursor-pointer hover:bg-amber-50 text-xs sm:text-sm py-1.5"
                            >
                                <QrCode className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                                Mã QR
                            </DropdownMenuItem>
                            {/* Add Lock table option to dropdown menu when table is not Locked and not Reserved */}
                            {table.status !== "Locked" && table.status !== "Reserved" && (
                                <DropdownMenuItem
                                    onClick={() => onOpenLockDialog(table)}
                                    className="flex items-center cursor-pointer hover:bg-amber-50 text-xs sm:text-sm py-1.5"
                                >
                                    <Lock className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                                    Khóa bàn
                                </DropdownMenuItem>
                            )}
                            {/* Add Swap table option to dropdown menu */}
                            {table.status === "Opening" && table.currentOrderId && (
                                <DropdownMenuItem
                                    onClick={() => onOpenSwapDialog(table)}
                                    className="flex items-center cursor-pointer hover:bg-amber-50 text-xs sm:text-sm py-1.5"
                                >
                                    <ArrowRightLeft className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                                    Chuyển bàn
                                </DropdownMenuItem>
                            )}
                            {/* Add Cancel order option to dropdown menu */}
                            {table.status === "Opening" && table.currentOrderId && (
                                <DropdownMenuItem
                                    onClick={() => onOpenCancelOrderDialog(table)}
                                    className="flex items-center cursor-pointer hover:bg-amber-50 text-xs sm:text-sm py-1.5"
                                >
                                    <XCircle className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                                    Hủy đơn hàng
                                </DropdownMenuItem>
                            )}
                            {table.status === "Closing" && (
                                <DropdownMenuItem
                                    onClick={() => onOpenReserveDialog(table)}
                                    className="flex items-center cursor-pointer hover:bg-amber-50 text-xs sm:text-sm py-1.5"
                                >
                                    <Clock className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                                    Đặt trước
                                </DropdownMenuItem>
                            )}
                            {/* Add Unmerge option if table is part of a merge group */}
                            {table.tableMergeId && (
                                <DropdownMenuItem
                                    onClick={() => setShowUnmergeDialog(true)}
                                    className="flex items-center cursor-pointer hover:bg-purple-50 text-xs sm:text-sm py-1.5"
                                >
                                    <Layers className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                                    Hủy ghép bàn
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
                <div className="space-y-2 sm:space-y-3 min-h-[80px] sm:min-h-[100px]">
                    <div className="flex items-center text-xs sm:text-sm bg-amber-50 p-1.5 sm:p-2.5 rounded-md border border-amber-200">
                        <Users className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                        <span className="text-amber-800 font-medium">Sức chứa:</span>
                        <Badge variant="outline" className="ml-auto font-medium text-xs py-0 bg-white border-amber-200 text-amber-700">
                            {table.capacity} người
                        </Badge>
                    </div>


                    {table.status === "Reserved" && (
                        <>
                            {table.currentReservation ? (
                                <>
                                    <div className="flex items-center text-xs sm:text-sm bg-blue-50 p-1.5 sm:p-2.5 rounded-md border border-blue-200">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex items-center flex-1 cursor-help">
                                                        <Users className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                                                        <span className="text-blue-700 font-medium truncate">
                                                            {table.currentReservation.customerName || "N/A"}
                                                        </span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="max-w-xs bg-white border border-l-4 border-l-blue-500 border-blue-200 p-3 shadow-md">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center">
                                                            <User className="h-4 w-4 text-blue-500 mr-2" />
                                                            <span className="font-medium text-blue-800">
                                                                Tên khách hàng: {table.currentReservation.customerName || "Không có tên"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Phone className="h-4 w-4 text-blue-500 mr-2" />
                                                            <span className="text-blue-700">
                                                                Số điện thoại: {formatPhoneNumber(table.currentReservation.phoneNumber) || "Không có SĐT"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                                                            <span className="text-blue-700">Giờ đặt bàn: {formatDate(table.currentReservation.bookingTime)}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Users className="h-4 w-4 text-blue-500 mr-2" />
                                                            <span className="text-blue-700">Số lượng khách: {table.currentReservation.numberOfPeople || 0} người</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Star className="h-4 w-4 text-blue-500 mr-2" />
                                                            <span className="text-blue-700">
                                                                Mức độ ưu tiên: {table.currentReservation.reservationPriorityStatus === "Priority"
                                                                    ? "Ưu tiên"
                                                                    : "Không ưu tiên"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>

                                    <div className="flex items-center justify-between text-xs sm:text-sm bg-blue-50 p-1.5 sm:p-2.5 rounded-md border border-blue-200">
                                        <div className="flex items-center">
                                            <Clock className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                                            <span className={`${isTimerExpired ? "text-red-700" : "text-blue-700"} font-medium`}>
                                                {isTimerExpired ? "Đã quá hạn:" : "Nhận bàn:"}
                                            </span>
                                        </div>
                                        <div className="font-medium text-blue-700">
                                            <TableTimer
                                                tableId={table.id}
                                                status={table.status}
                                                bookingTime={table.currentReservation.bookingTime}
                                                isRunning={isTimerRunning}
                                                onTimeUp={handleTimeUp}
                                                onStatusChange={handleTimerStatusChange}
                                                tableName={table.code}
                                                customerNameInTables={table.currentReservation.customerName || "Null"}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-between text-xs sm:text-sm bg-blue-50 p-1.5 sm:p-2.5 rounded-md">
                                    <div className="flex items-center">
                                        <Clock className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                                        <span className="text-blue-700 font-medium">Đã đặt trước</span>
                                    </div>
                                    <div className="font-medium text-blue-700">
                                        <TableTimer
                                            tableId={table.id}
                                            status={table.status}
                                            isRunning={isTimerRunning}
                                            onTimeUp={handleTimeUp}
                                            tableName={table.code}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {table.status === "Closing" && (
                        <>
                            <div className="flex items-center text-xs sm:text-sm bg-red-50 p-1.5 sm:p-2.5 rounded-md  border border-red-200">
                                <CircleX className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                                <span className="text-red-700 font-medium">Bàn đang đóng</span>
                            </div>
                            <div className="flex items-center  p-1.5 sm:p-2.5 rounded-md mt-3 border border-white">
                                <div className="h-4 sm:h-5 " />
                            </div>
                        </>
                    )}

                    {table.status === "Locked" && (
                        <div>
                            <div className="flex items-center text-xs sm:text-sm bg-orange-50 p-1.5 sm:p-2.5 rounded-md   border border-orange-200">
                                <Lock className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
                                <span className="text-amber-700 font-medium">Bàn đang khóa</span>
                            </div>
                            <div className="flex items-center  p-1.5 sm:p-2.5 rounded-md mt-3 border border-white">
                                <div className="h-4 sm:h-5 " />
                            </div>

                        </div>
                    )}

                    {table.status === "Opening" && (
                        <>
                            {/* Đang mở bàn - hiển thị đơn hàng */}
                            <div
                                onClick={() => onOpenDetails(table)}
                                className="flex items-center justify-between text-xs sm:text-sm bg-emerald-50 p-1.5 sm:p-2.5 rounded-md cursor-pointer hover:bg-emerald-100 transition-colors border border-emerald-200"
                            >
                                <div className="flex items-center">
                                    <Utensils className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                                    <span className="text-emerald-700 font-medium">Đơn hàng:</span>
                                </div>
                                {table.currentOrderId ? (
                                    <Badge
                                        variant="outline"
                                        className="font-medium text-xs bg-white border-emerald-200 text-emerald-700 py-0"
                                    >
                                        Đang phục vụ
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="font-medium text-xs bg-white border-emerald-200 text-emerald-700 py-0"
                                    >
                                        Chưa có đơn hàng
                                    </Badge>
                                )}
                            </div>

                            {/*Nếu không có bàn gộp, hiển thị thẻ trắng */}
                            {!table.tableMergeId && (
                                <div className="flex items-center  p-1.5 sm:p-2.5 rounded-md mt-3 border border-white">
                                    <div className="h-4 sm:h-5 " />
                                </div>
                            )}
                        </>
                    )}
                    {table.tableMergeId && (
                        <TableMergeBadge tableMergeName={table.tableMergeName} tableMergeId={table.tableMergeId} />
                    )}
                </div>


            </CardContent>
            <CardFooter className="flex px-4 py-2 items-center justify-between  border-t">
                {getActionButtons()}
            </CardFooter>
            {/* Unmerge Dialog */}
            <TableUnmergeDialog
                table={table}
                open={showUnmergeDialog}
                onOpenChange={setShowUnmergeDialog}
                onTableUpdated={() => {
                    // Create a callback that refreshes the data
                    if (onTableUpdated) {
                        onTableUpdated()
                    }
                }}
            />
        </Card>
    )
}
