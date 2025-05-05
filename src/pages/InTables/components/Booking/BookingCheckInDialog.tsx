"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Clock, Users, Phone, Calendar, Loader2, TableIcon } from "lucide-react"
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
import type { Reservation } from "@/types/reservation"
import BookingService from "@/services/booking-service"
import TableService from "@/services/table-service"

interface BookingCheckInDialogProps {
    reservation: Reservation
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function BookingCheckInDialog({ reservation, open, onOpenChange, onSuccess }: BookingCheckInDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [tableCodesMap, setTableCodesMap] = useState<Record<string, string>>({})
    const [tableIdForMerge, setTableIdForMerge] = useState<string[]>([])
    const [customerName, setCustomerName] = useState<string>("")
    console.log(reservation.customerName);

    const bookingService = BookingService.getInstance()
    const tableService = TableService.getInstance()

    // Set customer name when reservation changes
    useEffect(() => {
        if (reservation?.customerName) {
            // Validate that customerName is not a phone number
            const phoneNumberRegex = /^[0-9\s-+()]*$/
            if (!phoneNumberRegex.test(reservation.customerName)) {
                setCustomerName(reservation.customerName)
            } else {
                console.error("Invalid customer name format - appears to be a phone number")
                toast.error("Lỗi: Tên khách hàng không hợp lệ")
            }
        }
    }, [reservation])

    // Fetch table codes for all tables in tableAssignReservations
    useEffect(() => {
        async function fetchTableCodes() {
            if (!reservation?.tableAssignReservations?.length) return

            try {
                const tableIds = reservation.tableAssignReservations.map((t) => t.tableId).filter(Boolean) as string[]
                setTableIdForMerge(tableIds)

                // Create a map to store tableId -> tableCode
                const codesMap: Record<string, string> = {}

                // Fetch each table individually to get its code
                for (const tableId of tableIds) {
                    try {
                        const response = await tableService.getTableById(tableId)
                        if (response.success && response.result) {
                            codesMap[tableId] = response.result.code
                        }
                    } catch (error) {
                        console.error(`Error fetching table ${tableId}:`, error)
                    }
                }

                setTableCodesMap(codesMap)
            } catch (error) {
                console.error("Error fetching table codes:", error)
            }
        }

        fetchTableCodes()
    }, [reservation])

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
        if (!reservation) {
            toast.error("Không tìm thấy thông tin đặt bàn")
            return
        }

        // Validate customer name before proceeding
        if (!customerName || customerName.trim() === "") {
            toast.error("Không thể check-in: Tên khách hàng không hợp lệ")
            return
        }

        setIsSubmitting(true)
        try {
            const response = await bookingService.checkInReservation(reservation.id)

            if (response.success) {
                const sorted = Object.values(tableCodesMap).sort().join(", ")
                toast.success(`Check-in thành công cho khách hàng ${customerName}`)

                if (tableIdForMerge && tableIdForMerge.length >= 2) {
                    // Ensure we're using the validated customer name
                    const validatedCustomerName = customerName.trim()
                    const res = await tableService.mergeTable(tableIdForMerge, reservation.customerName)
                    if (res.success) {
                        setTimeout(() => {
                            toast.dismiss()
                            toast.success(`Gộp bàn ${sorted} thành công cho khách hàng ${validatedCustomerName} đặt bàn!`)
                        }, 900)
                        toast.error(`${res.message}`)
                    }
                    setTimeout(() => {
                        toast.dismiss()
                        toast.success(`Gộp bàn ${sorted} thành công cho khách hàng ${validatedCustomerName} đặt bàn!`)
                    }, 900)
                }

                // Close the dialog
                onOpenChange(false)

                // Call success callback
                if (onSuccess) {
                    onSuccess()
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Check-in đặt bàn</span>
                    </DialogTitle>
                    <DialogDescription>Xác nhận khách hàng đã đến và check-in cho đặt bàn này.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-blue-800">{customerName}</h3>
                            <Badge className="bg-blue-100 text-blue-800">Đã xác nhận</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Phone className="h-4 w-4 text-blue-500" />
                            <p className="text-sm text-blue-700">{formatPhoneNumber(reservation.phoneNumber)}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Thời gian đặt bàn</p>
                                <p className="text-sm">{formatDateTime(reservation.bookingTime)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Số người</p>
                                <p className="text-sm">{reservation.numberOfPeople} người</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <TableIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Bàn đã đặt</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {Object.entries(tableCodesMap).map(([tableId, tableCode]) => (
                                        <Badge
                                            key={tableId}
                                            variant="outline"
                                            className="bg-orange-50 text-orange-700 border-orange-200"
                                        >
                                            {tableCode}
                                        </Badge>
                                    ))}
                                </div>
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
                            <strong>Lưu ý:</strong> Sau khi check-in, trạng thái đặt bàn sẽ chuyển thành "Bàn Mở" và bàn sẽ gộp với số điện thoại của khách hàng để phục vụ.
                        </p>
                    </div>
                </div>

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
                        disabled={isSubmitting}
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