import { Card, CardContent } from "@/components/ui/card"
import type TableResponse from "@/types/tables"
import { TableTimer } from "../table-timer"
import { getStatusIcon } from "@/utils/table-utils"

interface TableStatusCardProps {
    table: TableResponse
    isTimerRunning: boolean
    onTimeUp: () => void
}

export function TableStatusCard({ table, isTimerRunning, onTimeUp }: TableStatusCardProps) {
    const getStatusInfo = () => {
        switch (table.status) {
            case "Closing":
                return {
                    title: "Thông tin bàn đang đóng",
                    content: (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center gap-2">
                                <span className="text-xs sm:text-sm text-muted-foreground">Trạng thái:</span>
                                <span className="text-xs sm:text-sm font-medium">Bàn đã đóng</span>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                                <span className="text-xs sm:text-sm text-muted-foreground">Thời gian đóng:</span>
                                <span className="text-xs sm:text-sm font-medium">{new Date().toLocaleString("vi-VN")}</span>
                            </div>
                        </div>
                    ),
                }
            case "Reserved":
                return {
                    title: "Thông tin đặt trước",
                    content: (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center gap-2">
                                <span className="text-xs sm:text-sm text-muted-foreground">Khách hàng:</span>
                                <span className="text-xs sm:text-sm font-medium">{table.id}</span>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                                <span className="text-xs sm:text-sm text-muted-foreground">Thời gian còn lại:</span>
                                <TableTimer tableId={table.id} status={table.status} isRunning={isTimerRunning} onTimeUp={onTimeUp} />
                            </div>
                        </div>
                    ),
                }
            case "Locked":
                return {
                    title: "Thông tin bảo trì",
                    content: (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center gap-2">
                                <span className="text-xs sm:text-sm text-muted-foreground">Ghi chú:</span>
                                <span className="text-xs sm:text-sm font-medium">{table.code}</span>
                            </div>
                        </div>
                    ),
                }
            default:
                return null
        }
    }

    const statusInfo = getStatusInfo()

    if (!statusInfo) return null

    return (
        <Card className="border-amber-100">
            <CardContent className="p-3 sm:p-4">
                <div className="items-start gap-2 sm:gap-3">
                    {getStatusIcon(table.status)}
                    <div className="space-y-2 sm:space-y-3">
                        <h3 className="font-medium text-amber-900 text-xs sm:text-sm">{statusInfo.title}</h3>
                        {statusInfo.content}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
