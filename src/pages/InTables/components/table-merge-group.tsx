import { Layers } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

import type TableResponse from "@/types/tables"
import { TableCard } from './tables/table-card'
import { Button } from '@/components/ui/button'

interface TableMergeGroupProps {
    tableMergeName: string
    tables: TableResponse[]
    loadingTableIds: string[]
    runningTimers: { [key: string]: boolean }
    onTimeUp: (tableId: string) => void
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
    handleCancelMerge: (table: TableResponse) => void


}

export function TableMergeGroup({
    tableMergeName,
    tables,
    loadingTableIds,
    runningTimers,
    onTimeUp,
    onOpenTable,
    onCloseTable,
    onOpenDetails,
    onOpenQRCode,
    onOpenUpdateDialog,
    onOpenLockDialog,
    onOpenReserveDialog,
    onOpenSwapDialog,
    onOpenCancelOrderDialog,
    handleCancelReservation,
    onTableUpdated,
    handleCancelMerge
}: TableMergeGroupProps) {
    // Calculate total capacity of all tables in this merge group
    const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0)

    return (
        <div className="mb-6 last:mb-0">
            <div className="flex items-center mb-3 bg-purple-50 p-2 rounded-md border border-purple-100">
                <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mr-2" />
                <h3 className="font-medium text-purple-800 text-sm sm:text-base">Nhóm ghép bàn: {tableMergeName || "Nhóm ghép bàn"}</h3>
                <div className="ml-auto flex items-center gap-2">
                    <Badge variant="outline" className="bg-white text-purple-700 border-purple-200 text-xs">
                        {tables.length} bàn
                    </Badge>
                    <Badge variant="outline" className="bg-white text-purple-700 border-purple-200 text-xs">
                        Tổng: {totalCapacity} người
                    </Badge>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 text-xs hover:bg-red-600"
                        onClick={() => {
                            // Lấy ID của bàn đầu tiên trong nhóm để hủy ghép
                            if (tables.length > 0) {
                                const firstTable = tables[0]
                                if (firstTable.tableMergeId) {
                                    if (onTableUpdated) {
                                        onTableUpdated();
                                    }
                                    // Mở dialog hủy ghép bàn cho bàn đầu tiên trong nhóm
                                    handleCancelMerge(firstTable)
                                }
                            }
                        }}
                    >
                        <Layers className="mr-1 h-3 w-3" />
                        Hủy ghép bàn
                    </Button>
                </div>
            </div>

            <div className="grid gap-3 sm:gap-4 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tables.map((table) => (
                    <TableCard
                        key={table.id}
                        table={table}
                        isLoading={loadingTableIds.includes(table.id)}
                        isTimerRunning={runningTimers[table.id] || false}
                        onTimeUp={() => onTimeUp(table.id)}
                        onOpenTable={onOpenTable}
                        onCloseTable={onCloseTable}
                        onOpenDetails={onOpenDetails}
                        onOpenQRCode={onOpenQRCode}
                        onOpenUpdateDialog={onOpenUpdateDialog}
                        onOpenLockDialog={onOpenLockDialog}
                        onOpenSwapDialog={onOpenSwapDialog}
                        onOpenCancelOrderDialog={onOpenCancelOrderDialog}
                        onOpenReserveDialog={onOpenReserveDialog}
                        handleCancelReservation={handleCancelReservation}
                        onTableUpdated={onTableUpdated}
                    />
                ))}
            </div>
        </div>
    )
}
