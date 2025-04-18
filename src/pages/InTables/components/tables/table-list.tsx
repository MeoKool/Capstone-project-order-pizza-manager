"use client"

import { useEffect, useState } from "react"
import { Coffee, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

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
import { Reservation } from "@/types/reservation"
import BookingService from "@/services/booking-service"

interface TableListProps {
    tables: TableResponse[]
    onTableUpdated?: () => void // Callback to refresh tables after update
}

export function TableList({ tables, onTableUpdated }: TableListProps) {
    const [selectedTable, setSelectedTable] = useState<TableResponse | null>(null)
    const [showReserveDialog, setShowReserveDialog] = useState(false)
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)
    const [showQRCodeDialog, setShowQRCodeDialog] = useState(false)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [showUpdateDialog, setShowUpdateDialog] = useState(false)
    const [showLockDialog, setShowLockDialog] = useState(false)
    const [showSwapDialog, setShowSwapDialog] = useState(false)
    const [showCancelOrderDialog, setShowCancelOrderDialog] = useState(false)
    const [runningTimers, setRunningTimers] = useState<{ [key: string]: boolean }>({})
    const [tableReservations, setTableReservations] = useState<{ [tableId: string]: Reservation }>({})
    const [loadingTableIds, setLoadingTableIds] = useState<string[]>([])
    const { zones_ } = useZone()

    const handleTimeUp = (tableId: string) => {
        setRunningTimers((prev) => ({ ...prev, [tableId]: false }))
        toast.warning(`Hết thời gian đặt trước cho bàn ${tables.find((t) => t.id === tableId)?.code || tableId}`)
        console.log(`Hết thời gian cho bàn ${tableId}`)
    }
    // Fetch reservations when component mounts or tables change
    useEffect(() => {
        fetchReservations()
    }, [tables])

    const fetchReservations = async () => {
        try {
            const bookingService = BookingService.getInstance()
            const response = await bookingService.getAllReservations()

            if (response.success && response.result) {
                // Handle both array and single item responses
                const items = Array.isArray(response.result.items) ? response.result.items : [response.result.items]

                // Create a map of tableId -> reservation
                const reservationsMap: { [tableId: string]: Reservation } = {}
                items.forEach((reservation) => {
                    if (reservation && reservation.tableId && reservation.tableId !== "") {
                        reservationsMap[reservation.tableId] = reservation
                    }
                })

                setTableReservations(reservationsMap)
            } else {
                // If the response is not successful, set an empty object
                setTableReservations({})
            }
        } catch (error) {
            console.error("Error fetching reservations:", error)
            // In case of error, set an empty object
            setTableReservations({})
        }
    }
    const handleOpenTable = async (tableId: string) => {
        setLoadingTableIds((prev) => [...prev, tableId]) // Set loading state for this table
        try {
            const tableSevice = TableService.getInstance()
            const res = await tableSevice.putOpenTable(tableId)


            const table = tables.find(t => t.id === tableId)
            const tableCode = table?.code || `ID: ${tableId}`


            if (res.success) {
                showTableLToast({ tableCode, message: 'đã được mở' })
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

            const table = tables.find(t => t.id === tableId)
            const tableCode = table?.code || `ID: ${tableId}`

            if (res.success) {
                showTableLToast({ tableCode, message: 'đã được đóng' })
            } else {
                toast.error(res.message)
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

            const table = tables.find(t => t.id === tableId)
            const tableCode = table?.code || `ID: ${tableId}`
            if (res.success) {
                showTableLToast({ tableCode, message: 'đã được khóa để bảo trì', note })
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
    // Group tables by zone
    const tablesByZone = tables.reduce<Record<string, TableResponse[]>>((acc, table) => {
        const zoneId = table.zoneId
        if (!acc[zoneId]) {
            acc[zoneId] = []
        }
        acc[zoneId].push(table)
        return acc
    }, {})

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
                    tableReservations={tableReservations}
                />
            ))}

            {/* Dialogs */}
            {selectedTable && (
                <>
                    <TableDetailsDialog table={selectedTable} open={showDetailsDialog} onOpenChange={setShowDetailsDialog} />
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
                    <TableReserveDialog
                        table={selectedTable}
                        open={showReserveDialog}
                        isLoading={loadingTableIds.includes(selectedTable.id)}
                        onOpenChange={(open) => {
                            setShowReserveDialog(open)
                            if (!open) {
                                // Refresh reservations when dialog closes
                                fetchReservations()
                                // Refresh tables
                                if (onTableUpdated) {
                                    onTableUpdated()
                                }
                            }
                        }}
                    />
                </>
            )}

            <TableAddDialog open={showAddDialog} onOpenChange={setShowAddDialog} onTableAdded={onTableUpdated} />
        </>
    )
}
