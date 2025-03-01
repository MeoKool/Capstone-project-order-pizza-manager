"use client"

import { useState } from "react"

import { Users, MapPin, Clock, } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
// import { TableEditDialog } from "@/components/table-edit-dialog"
// import { TableHistoryDialog } from "@/components/table-history-dialog"
import TableResponse from "@/types/tables"
import { TableQRCode } from "./table-qr-code"
import { getStatusBadge, getStatusIcon } from "@/utils/table-utils"
import useZone from "@/hooks/useZone"
import { getZoneName } from "@/utils/zone-utils"
import { TableTimer } from "./table-timer"

interface TableDetailsDialogProps {
    table: TableResponse
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TableDetailsDialog({ table, open, onOpenChange }: TableDetailsDialogProps) {
    // const [showEditDialog, setShowEditDialog] = useState(false)
    // const [showHistoryDialog, setShowHistoryDialog] = useState(false)
    const [showQRCodeDialog, setShowQRCodeDialog] = useState(false)
    const [isTimerRunning, setIsTimerRunning] = useState(false)

    const { zones_, } = useZone()
    // Function to get action buttons based on table status
    const getActionButtons = (table: TableResponse) => {
        switch (table.status) {
            case "Closing":
                return (
                    <>
                        <div>Bảo trì</div>
                        <Button variant="outline">Booking</Button>
                    </>
                )
            case "Opening":
                return (
                    <>
                        <div>kkk</div>
                        {/* <Button variant="outline">kkk</Button> */}
                    </>
                )
            case "Booked":
                return (
                    <>
                        <div>hihi</div>
                        {/* <Button variant="outline">hihi</Button> */}
                    </>
                )
            case "Locked":
                return <div>Đóng bàn</div>
            default:
                return null
        }
    }
    // const handleOccupyTable = () => {


    //     setIsTimerRunning(true)
    // }
    // const handleFreeTable = () => {

    //     setIsTimerRunning(false)
    // }
    const handleTimeUp = () => {
        setIsTimerRunning(false)
        // Bạn có thể thêm logic thông báo cho nhân viên ở đây
        console.log(`Hết thời gian cho bàn ${table.id}`)
    }
    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <div className="flex items-center gap-2">
                                <div>{table.code}</div>
                                {table.code && (
                                    <Badge variant="outline" className="border-amber-500 text-amber-500">
                                        VIP
                                    </Badge>
                                )}
                            </div>
                            <div className="ml-2">{getStatusBadge(table.status)}</div>
                        </DialogTitle>
                        <DialogDescription>Chi tiết thông tin bàn ăn</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-[24px_1fr] items-start gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Sức chứa</p>
                                <p className="text-sm text-muted-foreground">{table.capacity} người</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-[24px_1fr] items-start gap-2">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Vị trí</p>
                                <p className="text-sm text-muted-foreground">{getZoneName(table.zoneId, zones_)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-[24px_1fr] items-start gap-2">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Cập nhật lần cuối</p>
                                <p className="text-sm text-muted-foreground">

                                </p>
                            </div>
                        </div>

                        {table.status !== "Opening" && (
                            <>
                                <Separator />
                                <div className="grid grid-cols-[24px_1fr] items-start gap-2">
                                    {getStatusIcon(table.status)}
                                    <div>
                                        <p className="font-medium">
                                            {table.status === "Closing" && "Thông tin bàn đang đóng"}
                                            {table.status === "Booked" && "Thông tin đặt trước"}
                                            {table.status === "Locked" && "Thông tin bảo trì"}
                                        </p>
                                        {table.status === "Booked" && (
                                            <div className="space-y-1 text-sm">
                                                <p>
                                                    Khách hàng: <span className="font-medium">{table.id}</span>
                                                </p>
                                                <p>
                                                    Thời gian còn lại: <span className="font-medium"><TableTimer isRunning={isTimerRunning} onTimeUp={handleTimeUp} /></span>
                                                </p>
                                            </div>
                                        )}
                                        {table.status === "Closing" && (
                                            <div className="space-y-1 text-sm">

                                                <p>
                                                    Thời gian đặt:{" "}
                                                    <span className="font-medium">
                                                        <p>
                                                            Thời gian còn lại: <span className="font-medium"><TableTimer isRunning={isTimerRunning} onTimeUp={handleTimeUp} /></span>
                                                        </p>
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                        {table.status === "Locked" && (
                                            <div className="space-y-1 text-sm">
                                                <p>
                                                    Ghi chú: <span className="font-medium">{table.code}</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button className="flex gap-2 w-full sm:w-auto">{getActionButtons(table)}</Button>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" onClick={() => setShowQRCodeDialog(true)}>
                                Xem mã QR
                            </Button>
                            {/* <Button variant="outline" onClick={() => setShowEditDialog(true)}>
                                Chỉnh sửa
                            </Button>
                            <Button variant="outline" onClick={() => setShowHistoryDialog(true)}>
                                Lịch sử
                            </Button> */}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* <TableEditDialog
                table={table}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                onUpdateTable={onUpdateTable}
            /> */}

            {/* <TableHistoryDialog tableId={table.id} open={showHistoryDialog} onOpenChange={setShowHistoryDialog} /> */}

            <TableQRCode table={table} open={showQRCodeDialog} onOpenChange={setShowQRCodeDialog} />

        </>
    )
}

