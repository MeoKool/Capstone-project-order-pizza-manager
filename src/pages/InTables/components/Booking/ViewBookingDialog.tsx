"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// Remove the import for format and vi from date-fns
// import { format } from "date-fns"
// import { vi } from "date-fns/locale"
import { Calendar, Users, Phone, User } from "lucide-react"
import type { Reservation } from "@/types/reservation"

interface ViewBookingDialogProps {
    reservation: Reservation
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ViewBookingDialog({ reservation, open, onOpenChange }: ViewBookingDialogProps) {
    // Update the formatDateTime function to use bookingTime instead of bookingDate
    const formatDateTime = (dateTimeStr: string) => {
        try {
            // Handle the API date format: "2025-04-07T10:08:01.197Z"
            const date = new Date(dateTimeStr)

            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.error("Invalid date:", dateTimeStr)
                return {
                    date: "N/A",
                    time: "N/A",
                    fullDateTime: "N/A",
                }
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

            // Get day of week in Vietnamese
            const daysOfWeek = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]
            const dayOfWeek = daysOfWeek[date.getDay()]

            // Format full date time
            const fullDateTime = `${formattedTime} - ${dayOfWeek}, ${formattedDate}`

            return { date: formattedDate, time: formattedTime, fullDateTime }
        } catch (error) {
            console.error("Error formatting date:", error, "for input:", dateTimeStr)
            return {
                date: "N/A",
                time: "N/A",
                fullDateTime: "N/A",
            }
        }
    }

    const { fullDateTime } = formatDateTime(reservation.bookingTime)

    // Get status label and color
    const getStatusLabel = (status: string): string => {
        switch (status.toLowerCase()) {
            case "created":
                return "Đã tạo"
            case "pending":
                return "Chờ xác nhận"
            case "confirmed":
                return "Đã xác nhận"
            case "checkedin":
                return "Đã check-in"
            case "cancelled":
                return "Đã hủy"
            case "completed":
                return "Hoàn thành"
            default:
                return status
        }
    }

    const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case "created":
                return "bg-gray-100 text-gray-800"
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "confirmed":
                return "bg-blue-100 text-blue-800"
            case "checkedin":
                return "bg-green-100 text-green-800"
            case "cancelled":
                return "bg-red-100 text-red-800"
            case "completed":
                return "bg-green-100 text-green-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Chi tiết đặt bàn</DialogTitle>
                    <DialogDescription>Thông tin chi tiết về lịch đặt bàn.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{reservation.customerName}</h3>
                        <Badge className={getStatusColor(reservation.status)}>{getStatusLabel(reservation.status)}</Badge>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Thời gian đặt bàn</p>
                                <p className="text-sm">{fullDateTime}</p>
                            </div>
                        </div>

                        {/* Update the component to use numberOfPeople instead of guestCount */}
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Số người</p>
                                <p className="text-sm">{reservation.numberOfPeople} người</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Số điện thoại</p>
                                <p className="text-sm">{reservation.phoneNumber}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Mã khách hàng</p>
                                <p className="text-sm">{reservation.customerId || "Không có"}</p>
                            </div>
                        </div>

                        {reservation.tableId && (
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 flex items-center justify-center text-muted-foreground">
                                    <span className="text-lg">🪑</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Bàn số</p>
                                    <p className="text-sm">{reservation.tableId}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground">Mã đặt bàn: {reservation.id}</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

