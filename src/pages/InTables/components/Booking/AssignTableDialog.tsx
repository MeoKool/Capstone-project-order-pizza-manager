"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Reservation } from "@/types/reservation"
import BookingService from "@/services/booking-service"
import useTable from "@/hooks/useTable"

interface AssignTableDialogProps {
    reservation: Reservation | null
    open: boolean
    onClose: () => void
}

export function AssignTableDialog({ reservation, open, onClose }: AssignTableDialogProps) {
    const [selectedTableId, setSelectedTableId] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const bookingService = BookingService.getInstance()

    // Sử dụng hook useTable để lấy danh sách bàn thực tế
    const { tables, loading: isLoadingTables, error: tableError } = useTable()

    // Reset form khi dialog mở
    useEffect(() => {
        if (open) {
            setSelectedTableId("")

        }
    }, [open])

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

            return `${hours}:${minutes} - ${day}/${month}/${year}`
        } catch (error) {
            console.error("Error formatting date:", error)
            return "N/A"
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedTableId) {
            toast.error("Vui lòng chọn bàn")
            return
        }

        if (!reservation) {
            toast.error("Không tìm thấy thông tin đặt bàn")
            return
        }

        setIsSubmitting(true)
        try {
            // Sử dụng phương thức mới từ BookingService thay vì TableService
            const response = await bookingService.assignTableToReservation(reservation.id, selectedTableId)

            if (response.success) {
                toast.success("Đã xếp bàn thành công!")
                onClose()
            } else {
                toast.error(response.message || "Không thể xếp bàn")
            }
        } catch (error) {
            console.error("Error assigning table:", error)
            toast.error("Có lỗi xảy ra khi xếp bàn")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Lọc bàn theo trạng thái và số lượng người
    const getAvailableTables = () => {
        if (!reservation) return []

        return tables.filter((table) => table.status === "Closing" && table.capacity >= reservation.numberOfPeople)
    }

    // Nếu không có reservation, không hiển thị nội dung dialog
    if (!reservation) {
        return (
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Xếp bàn cho đặt chỗ</DialogTitle>
                        <DialogDescription>Không tìm thấy thông tin đặt bàn.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" onClick={onClose}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    const availableTables = getAvailableTables()

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Xếp bàn cho đặt chỗ</DialogTitle>
                        <DialogDescription>Chọn bàn phù hợp cho lịch đặt chỗ này.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Khách hàng</Label>
                                <p className="font-medium">{reservation.customerName}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Số người</Label>
                                <p className="font-medium">{reservation.numberOfPeople} người</p>
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Thời gian</Label>
                            <p className="font-medium">{formatDateTime(reservation.bookingTime)}</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="table-select">
                                Chọn bàn <span className="text-red-500">*</span>
                            </Label>
                            <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                                <SelectTrigger id="table-select">
                                    <SelectValue placeholder="Chọn bàn" />
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoadingTables ? (
                                        <SelectItem value="loading" disabled>
                                            <Loader2 className="mr-2 h-4 w-4 inline animate-spin" />
                                            Đang tải danh sách bàn...
                                        </SelectItem>
                                    ) : availableTables.length === 0 ? (
                                        <SelectItem value="empty" disabled>
                                            Không có bàn nào phù hợp
                                        </SelectItem>
                                    ) : (
                                        availableTables.map((table) => (
                                            <SelectItem key={table.id} value={table.id}>
                                                {table.code} - {table.capacity} người
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {tableError && <p className="text-sm text-red-500">{tableError}</p>}
                        </div>

                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !selectedTableId}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Xác nhận"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

