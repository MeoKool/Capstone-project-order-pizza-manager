"use client"

import { useState } from "react"
import { Coffee, Plus, AlertTriangle, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
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

import { TableZoneGroup } from "./table-zone-group"
import { TableLockDialog } from "./table-lock-dialog"
import { getZoneName } from "@/utils/zone-utils"
import TableService from "@/services/table-service"
import type TableResponse from "@/types/tables"
import useZone from "@/hooks/useZone"
import { TableDetailsDialog } from "../table-details.dialog"
import { TableQRCode } from "../table-qr-code"
import { TableUpdateDialog } from "../table-update-dialog"
import { TableAddDialog } from "../table-add-dialog"
import { TableSwapDialog } from "./table-swap-dialog"
import { OrderCancelDialog } from "./order-cancel-dialog"
import { showTableLToast } from "../table-toast-notifications"
import { TableReserveDialog } from "./table-reserve-dialog"
import BookingService from "@/services/booking-service"
import { TableMergeGroup } from "../table-merge-group"
import { TableUnmergeDialog } from "../table-unmerge-dialog"

interface TableListProps {
    tables: TableResponse[]
    activeFilter?: "all" | "Opening" | "Locked" | "Reserved" | "Closing" | "Merged"
    onTableUpdated?: () => void // Callback to refresh tables after update
}

export function TableList({ tables, activeFilter = "all", onTableUpdated }: TableListProps) {
    const [selectedTable, setSelectedTable] = useState<TableResponse | null>(null)
    const [showReserveDialog, setShowReserveDialog] = useState(false)
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)
    const [showQRCodeDialog, setShowQRCodeDialog] = useState(false)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [showUpdateDialog, setShowUpdateDialog] = useState(false)
    const [showLockDialog, setShowLockDialog] = useState(false)
    const [showSwapDialog, setShowSwapDialog] = useState(false)
    const [showCancelOrderDialog, setShowCancelOrderDialog] = useState(false)
    const [showCancelReservationDialog, setShowCancelReservationDialog] = useState(false)
    const [cancelReservationTable, setCancelReservationTable] = useState<TableResponse | null>(null)
    const [runningTimers, setRunningTimers] = useState<{ [key: string]: boolean }>({})
    const [loadingTableIds, setLoadingTableIds] = useState<string[]>([])
    const [showUnmergeDialog, setShowUnmergeDialog] = useState(false)

    const { zones_ } = useZone()

    const handleTimeUp = (tableId: string) => {
        setRunningTimers((prev) => ({ ...prev, [tableId]: false }))
        toast.warning(`Hết thời gian đặt trước cho bàn ${tables.find((t) => t.id === tableId)?.code || tableId}`)
        console.log(`Hết thời gian cho bàn ${tableId}`)
    }

    const handleOpenTable = async (tableId: string) => {
        setLoadingTableIds((prev) => [...prev, tableId]) // Set loading state for this table
        try {
            const tableSevice = TableService.getInstance()
            const res = await tableSevice.putOpenTable(tableId)

            const table = tables.find((t) => t.id === tableId)
            const tableCode = table?.code || `ID: ${tableId}`

            if (res.success) {
                showTableLToast({ tableCode, message: "đã được mở" })
            } else {
                toast.error(res.message)
            }

            // Call the callback to refresh table data
            if (onTableUpdated) {
                onTableUpdated()
            }
        } catch (error) {
            console.error(`Lỗi khi mở bàn với ID: ${tableId}`, error)
            toast.error("Không thể mở bàn. Vui lòng thử lại.")
        } finally {
            setLoadingTableIds((prev) => prev.filter((id) => id !== tableId)) // Remove loading state
        }
    }

    const handleCloseTable = async (tableId: string) => {
        setLoadingTableIds((prev) => [...prev, tableId]) // Set loading state for this table
        try {
            const tableSevice = TableService.getInstance()
            const res = await tableSevice.putCloseTable(tableId)

            const table = tables.find((t) => t.id === tableId)
            const tableCode = table?.code || `ID: ${tableId}`

            if (res.success) {
                showTableLToast({ tableCode, message: "đã được đóng" })
            } else {
                toast.error("Bàn " + tableCode + " " + res.message)
            }

            // Call the callback to refresh table data
            if (onTableUpdated) {
                onTableUpdated()
            }
        } catch (error) {
            toast.error("Không thể đóng bàn. Vui lòng thử lại.")
            console.error(`Lỗi khi đóng bàn với ID: ${tableId}`, error)
        } finally {
            setLoadingTableIds((prev) => prev.filter((id) => id !== tableId)) // Remove loading state
        }
    }

    const handleLockTable = async (tableId: string, note: string) => {
        setLoadingTableIds((prev) => [...prev, tableId]) // Set loading state for this table
        try {
            const tableService = TableService.getInstance()
            const res = await tableService.putLockTable(tableId, note)

            const table = tables.find((t) => t.id === tableId)
            const tableCode = table?.code || `ID: ${tableId}`
            if (res.success) {
                showTableLToast({ tableCode, message: "đã được khóa để bảo trì", note })
                setShowLockDialog(false)
            } else {
                toast.error(res.message)
            }

            // Call the callback to refresh table data
            if (onTableUpdated) {
                onTableUpdated()
            }
        } catch (error) {
            toast.error("Không thể khóa bàn. Vui lòng thử lại.")
            console.error(`Lỗi khi khóa bàn với ID: ${tableId}`, error)
        } finally {
            setLoadingTableIds((prev) => prev.filter((id) => id !== tableId)) // Remove loading state
        }
    }
    const formatDateTime = (dateTimeString: string) => {
        if (!dateTimeString) return ""
        const date = new Date(dateTimeString)
        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date)
    }
    const handleOpenDetails = (table: TableResponse) => {
        setSelectedTable(table)
        setShowDetailsDialog(true)
    }

    const handleOpenQRCode = (table: TableResponse) => {
        setSelectedTable(table)
        setShowQRCodeDialog(true)
    }

    const handleOpenUpdateDialog = (table: TableResponse) => {
        setSelectedTable(table)
        setShowUpdateDialog(true)
    }

    const handleOpenLockDialog = (table: TableResponse) => {
        setSelectedTable(table)
        setShowLockDialog(true)
    }
    const handleOpenSwapDialog = (table: TableResponse) => {
        console.log("Opening swap dialog for table:", table.code)
        setSelectedTable(table)
        setShowSwapDialog(true)
    }

    const handleOpenCancelOrderDialog = (table: TableResponse) => {
        setSelectedTable(table)
        setShowCancelOrderDialog(true)
    }

    const handleOpenReserveDialog = (table: TableResponse) => {
        setSelectedTable(table)
        setShowReserveDialog(true)
    }
    const handleCancelMerge = (table: TableResponse) => {
        setSelectedTable(table)
        setShowUnmergeDialog(true)
    }
    // Step 1: Show the confirmation dialog
    const handleCancelReservation = async (table: TableResponse) => {
        if (!table.currentReservation || !table.currentReservationId) {
            toast.error("Không tìm thấy thông tin đặt bàn")
            return Promise.resolve()
        }

        // Set the table to be canceled and show the dialog
        setCancelReservationTable(table)
        setShowCancelReservationDialog(true)

        // Return a resolved promise since we're handling the actual cancellation in a separate function
        return Promise.resolve()
    }

    // Step 2: Execute the cancellation when confirmed
    const executeCancelReservation = async () => {
        if (!cancelReservationTable || !cancelReservationTable.currentReservation) {
            return
        }

        const table = cancelReservationTable
        setLoadingTableIds((prev) => [...prev, table.id])

        try {
            const bookingService = BookingService.getInstance()
            const response = await bookingService.cancelAssignTableToReservation(table.currentReservation.id, [table.id])

            if (response.success) {
                toast.success(`Đã hủy đặt bàn cho ${table.code} thành công`)
                // Refresh the table data
                if (onTableUpdated) {
                    onTableUpdated()
                }
            } else {
                toast.error(response.message || "Không thể hủy đặt bàn")
            }
        } catch (error) {
            console.error("Error canceling reservation:", error)
            toast.error("Có lỗi xảy ra khi hủy đặt bàn")
        } finally {
            setLoadingTableIds((prev) => prev.filter((id) => id !== table.id))
            // Close the dialog
            setShowCancelReservationDialog(false)
            setCancelReservationTable(null)
        }
    }

    // If the active filter is "Merged", group tables by their merge group name
    if (activeFilter === "Merged") {
        // Get only merged tables
        const mergedTables = tables.filter((table) => table.tableMergeId)

        if (mergedTables.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="rounded-full bg-white p-3 sm:p-4 mb-3 sm:mb-4 shadow-sm">
                        <Layers className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
                    </div>
                    <p className="text-purple-800 text-center font-medium text-sm sm:text-base">Không có bàn ghép nào</p>
                    <p className="text-xs sm:text-sm text-purple-600 text-center mt-1">Ghép bàn để tạo nhóm bàn lớn hơn</p>
                </div>
            )
        }

        // Group tables by their merge group name
        const tablesByMergeGroup: Record<string, TableResponse[]> = {}

        mergedTables.forEach((table) => {
            const mergeGroupId = table.tableMergeId || "unknown"
            const key = mergeGroupId

            if (!tablesByMergeGroup[key]) {
                tablesByMergeGroup[key] = []
            }

            tablesByMergeGroup[key].push(table)
        })

        return (
            <>
                {Object.entries(tablesByMergeGroup).map(([key, groupTables]) => {

                    return (
                        <TableMergeGroup
                            key={key}
                            tableMergeName={groupTables[0].tableMergeName || "Nhóm không tên"}
                            tables={groupTables}
                            loadingTableIds={loadingTableIds}
                            runningTimers={runningTimers}
                            onTimeUp={handleTimeUp}
                            onOpenTable={handleOpenTable}
                            onCloseTable={handleCloseTable}
                            onOpenDetails={handleOpenDetails}
                            onOpenQRCode={handleOpenQRCode}
                            onOpenUpdateDialog={handleOpenUpdateDialog}
                            onOpenLockDialog={handleOpenLockDialog}
                            onOpenSwapDialog={handleOpenSwapDialog}
                            onOpenCancelOrderDialog={handleOpenCancelOrderDialog}
                            onOpenReserveDialog={handleOpenReserveDialog}
                            handleCancelReservation={handleCancelReservation}
                            onTableUpdated={onTableUpdated}
                            handleCancelMerge={handleCancelMerge}
                        />
                    )
                })}

                {/* Dialogs */}
                {renderDialogs()}
            </>
        )
    }

    // Group tables by zone (original behavior)
    if (tables.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="rounded-full bg-white p-3 sm:p-4 mb-3 sm:mb-4 shadow-sm">
                    <Coffee className="h-6 w-6 sm:h-8 sm:w-8 text-amber-400" />
                </div>
                <p className="text-amber-800 text-center font-medium text-sm sm:text-base">Không có bàn nào</p>
                <p className="text-xs sm:text-sm text-amber-600 text-center mt-1">Thêm bàn mới để bắt đầu quản lý</p>
                <Button onClick={() => setShowAddDialog(true)} className="mt-4 bg-amber-600 hover:bg-amber-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm bàn đầu tiên
                </Button>
            </div>
        )
    }

    // Group tables by zone
    const tablesByZone = tables.reduce<Record<string, TableResponse[]>>((acc, table) => {
        const zoneId = table.zoneId
        if (!acc[zoneId]) {
            acc[zoneId] = []
        }
        acc[zoneId].push(table)
        return acc
    }, {})

    // Function to render all dialogs
    function renderDialogs() {
        return selectedTable ? (
            <>
                <TableDetailsDialog
                    table={selectedTable}
                    open={showDetailsDialog}
                    onOpenChange={setShowDetailsDialog}
                    onTableUpdated={onTableUpdated}
                />
                <TableQRCode table={selectedTable} open={showQRCodeDialog} onOpenChange={setShowQRCodeDialog} />
                <TableUpdateDialog
                    table={selectedTable}
                    open={showUpdateDialog}
                    onOpenChange={setShowUpdateDialog}
                    onTableUpdated={onTableUpdated}
                />
                <TableLockDialog
                    table={selectedTable}
                    open={showLockDialog}
                    onOpenChange={setShowLockDialog}
                    onLockTable={handleLockTable}
                    isLoading={loadingTableIds.includes(selectedTable.id)}
                />
                <TableSwapDialog
                    table={selectedTable}
                    open={showSwapDialog}
                    onOpenChange={setShowSwapDialog}
                    isLoading={loadingTableIds.includes(selectedTable.id)}
                    onTableUpdated={onTableUpdated}
                />
                <OrderCancelDialog
                    table={selectedTable}
                    open={showCancelOrderDialog}
                    onOpenChange={setShowCancelOrderDialog}
                    isLoading={loadingTableIds.includes(selectedTable.id)}
                    onTableUpdated={onTableUpdated}
                />
                <TableUnmergeDialog
                    table={selectedTable}
                    open={showUnmergeDialog}
                    onOpenChange={setShowUnmergeDialog}
                    onTableUpdated={onTableUpdated}
                />
                <TableReserveDialog
                    table={selectedTable}
                    open={showReserveDialog}
                    isLoading={loadingTableIds.includes(selectedTable.id)}
                    onOpenChange={(open) => {
                        setShowReserveDialog(open)
                        if (!open && onTableUpdated) {
                            onTableUpdated()
                        }
                    }}
                />
            </>
        ) : null
    }

    return (
        <>
            {Object.entries(tablesByZone).map(([zoneId, zoneTables]) => (
                <TableZoneGroup
                    key={zoneId}
                    zoneId={zoneId}
                    zoneName={getZoneName(zoneId, zones_)}
                    tables={zoneTables}
                    loadingTableIds={loadingTableIds}
                    runningTimers={runningTimers}
                    onTimeUp={handleTimeUp}
                    onOpenTable={handleOpenTable}
                    onCloseTable={handleCloseTable}
                    onOpenDetails={handleOpenDetails}
                    onOpenQRCode={handleOpenQRCode}
                    onOpenUpdateDialog={handleOpenUpdateDialog}
                    onOpenLockDialog={handleOpenLockDialog}
                    onOpenSwapDialog={handleOpenSwapDialog}
                    onOpenCancelOrderDialog={handleOpenCancelOrderDialog}
                    onOpenReserveDialog={handleOpenReserveDialog}
                    handleCancelReservation={handleCancelReservation}
                    onTableUpdated={onTableUpdated}
                />
            ))}

            {/* Dialogs */}
            {renderDialogs()}

            {/* Cancel Reservation Confirmation Dialog */}
            <AlertDialog open={showCancelReservationDialog} onOpenChange={setShowCancelReservationDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <span>Xác nhận hủy đặt bàn</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {cancelReservationTable && (
                                <>
                                    Bạn có chắc chắn muốn hủy đặt bàn cho <strong>{cancelReservationTable.code}</strong>?
                                    {cancelReservationTable.currentReservation && (
                                        <div className="mt-2 p-3 bg-blue-50 rounded-md text-blue-800 text-base">
                                            <p>
                                                <strong>Khách hàng:</strong> {cancelReservationTable.currentReservation.customerName}
                                            </p>
                                            <p>
                                                <strong>Số điện thoại:</strong> {cancelReservationTable.currentReservation.phoneNumber}
                                            </p>
                                            <p>
                                                <strong>Số người:</strong> {cancelReservationTable.currentReservation.numberOfPeople}
                                            </p>
                                            <p>
                                                <strong>Thời gian:</strong> {formatDateTime(cancelReservationTable.currentReservation.bookingTime)}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={!!cancelReservationTable && loadingTableIds.includes(cancelReservationTable.id)}
                        >
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeCancelReservation}
                            disabled={!!cancelReservationTable && loadingTableIds.includes(cancelReservationTable.id)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {cancelReservationTable && loadingTableIds.includes(cancelReservationTable.id)
                                ? "Đang xử lý..."
                                : "Xác nhận hủy đặt bàn"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <TableAddDialog open={showAddDialog} onOpenChange={setShowAddDialog} onTableAdded={onTableUpdated} />
        </>
    )
}
