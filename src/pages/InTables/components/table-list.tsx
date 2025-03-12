
import { Users, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import TableResponse from "@/types/tables"
import { useState } from "react"
import { TableDetailsDialog } from "./table-details.dialog"
import useZone from "@/hooks/useZone"
import { getStatusBadge, getStatusIcon } from "@/utils/table-utils"
import { getZoneName } from "@/utils/zone-utils"
import { TableTimer } from "./table-timer"

interface TableListProps {
    tables: TableResponse[],

}

export function TableList({ tables }: TableListProps) {
    const [selectedTable, setSelectedTable] = useState<TableResponse | null>()
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)
    const [runningTimers, setRunningTimers] = useState<{ [key: string]: boolean }>({})
    const { zones_, } = useZone()


    const handleTimeUp = (tableId: string) => {
        setRunningTimers((prev) => ({ ...prev, [tableId]: false }))
        console.log(`Hết thời gian cho bàn ${tableId}`)
    }

    // const handleOpeningTables = async () => {
    //     // console.log("opening table:", tableId)
    //     // const orderService = OrderService.getInstance()
    //     // const tableService = TableService.getInstance()
    //     // try {
    //     //     const response = await tableService.putOpenTable(tableId)
    //     //     const responseOrder = await orderService.createOrder(JSON.stringify({ tableId }))
    //     //     if (response.success && responseOrder) {
    //     //         console.log("Table opened successfully:", response.result)
    //     //         onTableUpdate()
    //     //         // Thực hiện các thao tác tiếp theo nếu cần, ví dụ: cập nhật trạng thái UI
    //     //     } else {
    //     //         console.error("Failed to open table:", response.message)
    //     //     }
    //     // } catch (error) {
    //     //     console.error("Error handling putOpenTable:", error)
    //     // }
    // }
    // Function to get action buttons based on table status
    const getActionButtons = (table: TableResponse) => {
        switch (table.status) {
            case "Closing":
                return (
                    <>
                        <Button>Bảo trì</Button>
                        <Button variant="outline">Booking</Button>
                        <div >Mở bàn </div>
                    </>
                )
            case "Opening":
                return (
                    <>
                        <Button>###</Button>
                        <Button variant="outline">###</Button>
                    </>
                )
            case "Booked":
                return (
                    <>
                        <Button>@@@</Button>
                        <Button variant="outline">@@</Button>
                    </>
                )
            case "Locked":
                return <Button>Đóng bàn</Button>
            default:
                return null
        }
    }


    const handleOpenDetails = (table: TableResponse) => {
        setSelectedTable(table);
        setShowDetailsDialog(true)
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tables.map((table) => (
                    <Card key={table.id} className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between border-b p-4">
                                <div className="flex items-center space-x-2">
                                    <h3 className="font-medium">{table.code}</h3>
                                    {getStatusBadge(table.status)}
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                            <span className="sr-only">Tùy chọn</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleOpenDetails(table)}>Xem chi tiết</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleOpenDetails(table)}>Chỉnh sửa</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleOpenDetails(table)}>Lịch sử</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="p-4">
                                <div className="grid gap-2">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Users className="mr-1 h-4 w-4" />
                                        <span>Sức chứa: {table.capacity} người</span>
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <span className="mr-1">📍</span>
                                        <span>{getZoneName(table.zoneId, zones_)}</span>
                                    </div>

                                    {table.status === "Opening" && table.currentOrderId && (
                                        <div className="mt-2 flex items-center text-sm">
                                            {getStatusIcon(table.status)}
                                            {/* <span className="ml-1 font-medium text-green-500">Đơn hàng: {table.currentOrderId}</span> */}
                                            <span className="ml-1 font-medium text-green-500">Đơn hàng: currentID</span>
                                        </div>
                                    )}

                                    {table.status === "Booked" && (
                                        <div className="mt-2 flex items-center text-sm">
                                            {getStatusIcon(table.status)}
                                            <span className="ml-1 font-medium text-blue-500">Đã đặt trước</span>
                                            <TableTimer
                                                isRunning={runningTimers[table.id] || false}
                                                onTimeUp={() => handleTimeUp(table.id)}
                                            />
                                        </div>
                                    )}

                                    {table.status === "Closing" && (
                                        <div className="mt-2 flex items-center text-sm">
                                            {getStatusIcon(table.status)}
                                            <span className="ml-1 font-medium text-red-500">Đang bảo trì</span>
                                        </div>
                                    )}
                                    {table.status === "Locked" && (
                                        <div className="mt-2 flex items-center text-sm">
                                            {getStatusIcon(table.status)}
                                            <span className="ml-1 font-medium text-amber-500">Đang bảo trì</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center justify-between gap-2">{getActionButtons(table)}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {selectedTable && (
                <TableDetailsDialog table={selectedTable} open={showDetailsDialog} onOpenChange={setShowDetailsDialog} />
            )}
        </>
    )
}

