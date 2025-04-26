"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Clock, Users, Phone, Calendar, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type TableResponse from "@/types/tables"
import BookingService from "@/services/booking-service"
import { showTableLToast } from "./table-toast-notifications"
import TableService from "@/services/table-service"

interface TableCheckInDialogProps {
    table: TableResponse
    open: boolean
    onOpenChange: (open: boolean) => void
    onTableUpdated?: () => void
}

export function TableCheckInDialog({ table, open, onOpenChange, onTableUpdated }: TableCheckInDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const bookingService = BookingService.getInstance()
    const reservationData = table.currentReservation
    const [tableCodesMap, setTableCodesMap] = useState<Record<string, string>>({})
    const sorted = Object.values(tableCodesMap).sort().join(", ");
    const [tableIdForMerge, setTableIdForMerge] = useState<string[]>([])

    //convert



    const tableService = TableService.getInstance()
    // Fetch table codes for all tables in tableAssignReservations
    useEffect(() => {
        async function fetchTableCodes() {
            if (!reservationData?.tableAssignReservations?.length) return

            try {

                const tableIds = reservationData.tableAssignReservations.map((t) => t.tableId).filter(Boolean) as string[]
                setTableIdForMerge(tableIds)
                console.log(tableIds);

                // Create a map to store tableId -> tableCode
                const codesMap: Record<string, string> = {}

                // Fetch each table individually to get its code
                for (const tableId of tableIds) {
                    if (tableId === table.id) {
                        // We already have the current table's code
                        codesMap[tableId] = table.code
                    } else {
                        try {
                            const response = await tableService.getTableById(tableId)
                            if (response.success && response.result) {
                                codesMap[tableId] = response.result.code
                            }
                        } catch (error) {
                            console.error(`Error fetching table ${tableId}:`, error)
                        }
                    }
                }

                setTableCodesMap(codesMap)
            } catch (error) {
                console.error("Error fetching table codes:", error)
            }
        }

        fetchTableCodes()
    }, [reservationData, table.id, table.code])

    useEffect(() => {
        console.log('tableIdForMerge:', tableIdForMerge)
    }, [tableIdForMerge])

    // Format date and time for display
    const formatDateTime = (dateTimeStr: string) => {
        try {
            const date = new Date(dateTimeStr)
            if (isNaN(date.getTime())) return "N/A"

            const day = date.getDate().toString().padStart(2, "0")
            const month = (date.getMonth() + 1).toString().padStart(2, "0")
            const year = date.getFullYear()
            const hours = date.getHours().toString().padStart(2, "0")
            const minutes = date.getMinutes().toString().padStart(2, "0")

            // Get day of week in Vietnamese
            const daysOfWeek = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]
            const dayOfWeek = daysOfWeek[date.getDay()]

            return `${hours}:${minutes} - ${dayOfWeek}, ${day}/${month}/${year}`
        } catch (error) {
            console.error("Error formatting date:", error)
            return "N/A"
        }
    }

    // Format phone number for display
    const formatPhoneNumber = (phone: string) => {
        if (!phone) return ""
        return phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3")
    }

    const handleCheckIn = async () => {
        if (!table.currentReservation || !table.currentReservationId) {
            toast.error("Không tìm thấy thông tin đặt bàn")
            return
        }

        setIsSubmitting(true)
        try {
            const response = await bookingService.checkInReservation(table.currentReservationId)

            const userNameBooking = table.currentReservation.customerName
            if (response.success) {
                showTableLToast({
                    tableCode: sorted,
                    message: "đã được check-in thành công",
                    note: `Khách hàng ${table.currentReservation.customerName} đã đến`,
                })


                if (tableIdForMerge && tableIdForMerge.length >= 2) {
                    await tableService.mergeTable(tableIdForMerge, userNameBooking);
                    setTimeout(() => {
                        toast.dismiss();
                        toast.success(`Gộp bàn ${sorted} thành công cho khách hàng ${userNameBooking} đặt bàn !`);
                    }, 600);
                }
                // Close the dialog
                onOpenChange(false)

                // Refresh the table data
                if (onTableUpdated) {
                    onTableUpdated()
                }
            } else {
                toast.error(response.message || "Không thể check-in. Vui lòng thử lại.")
            }
        } catch (error) {
            console.error("Error checking in reservation:", error)
            toast.error("Có lỗi xảy ra khi check-in. Vui lòng thử lại.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Check if the table has a valid reservation
    const hasValidReservation = table.currentReservation && table.currentReservationId

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Check-in đặt bàn {table.code}</span>
                    </DialogTitle>
                    <DialogDescription>Xác nhận khách hàng đã đến và check-in cho đặt bàn này.</DialogDescription>
                </DialogHeader>

                {!hasValidReservation ? (
                    <div className="py-6 text-center">
                        <p className="text-red-500">Không tìm thấy thông tin đặt bàn cho bàn này.</p>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold text-blue-800">{table.currentReservation.customerName}</h3>
                                <Badge className="bg-blue-100 text-blue-800">Đã xác nhận</Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <Phone className="h-4 w-4 text-blue-500" />
                                <p className="text-sm text-blue-700">{formatPhoneNumber(table.currentReservation.phoneNumber)}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Thời gian đặt bàn</p>
                                    <p className="text-sm">{formatDateTime(table.currentReservation.bookingTime)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Số người</p>
                                    <p className="text-sm">{table.currentReservation.numberOfPeople} người</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Trạng thái</p>
                                    <p className="text-sm">Đang chờ check-in</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 p-3 rounded-md border border-amber-100 mt-4">
                            <p className="text-sm text-amber-700">
                                <strong>Lưu ý:</strong> Sau khi check-in, trạng thái đặt bàn sẽ chuyển thành "Đã check-in" và bàn sẽ
                                được mở để phục vụ.
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-blue-200 text-blue-700"
                        disabled={isSubmitting}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={isSubmitting || !hasValidReservation}
                        onClick={handleCheckIn}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Xác nhận check-in
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
