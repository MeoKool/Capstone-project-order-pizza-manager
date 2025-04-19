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
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Reservation } from "@/types/reservation"
import BookingService from "@/services/booking-service"
import useTable from "@/hooks/useTable"
import { Badge } from "@/components/ui/badge"
import { BookingSuccessToast } from "./toast-booking"

interface AssignTableDialogProps {
    reservation: Reservation | null
    open: boolean
    onClose: () => void
}

export function AssignTableDialog({ reservation, open, onClose }: AssignTableDialogProps) {
    // Change from single string to array of strings for multiple selection
    const [selectedTableIds, setSelectedTableIds] = useState<string[]>([])
    const [initialTableIds, setInitialTableIds] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const bookingService = BookingService.getInstance()

    // Sử dụng hook useTable để lấy danh sách bàn thực tế
    const { tables, loading: isLoadingTables, error: tableError } = useTable()

    // Reset form khi dialog mở
    useEffect(() => {
        if (open) {
            // If the reservation already has tables assigned, pre-select them
            if (reservation && reservation.tableAssignReservations && reservation.tableAssignReservations.length > 0) {
                const assignedTableIds = reservation.tableAssignReservations.map((ta) => ta.tableId)
                setSelectedTableIds(assignedTableIds)
                setInitialTableIds(assignedTableIds) // Store initial table IDs for comparison
            } else {
                setSelectedTableIds([])
                setInitialTableIds([])
            }
        }
    }, [open, reservation])

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

    // Handle checkbox change for table selection
    const handleTableSelectionChange = (tableId: string, checked: boolean) => {
        if (checked) {
            setSelectedTableIds((prev) => [...prev, tableId])
        } else {
            setSelectedTableIds((prev) => prev.filter((id) => id !== tableId))
        }
    }

    // Calculate total capacity of selected tables
    const calculateTotalCapacity = () => {
        return selectedTableIds.reduce((total, tableId) => {
            const table = tables.find((t) => t.id === tableId)
            return total + (table?.capacity || 0)
        }, 0)
    }

    // Update the handleSubmit function to implement the update logic
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (selectedTableIds.length === 0) {
            toast.error("Vui lòng chọn ít nhất một bàn")
            return
        }

        if (!reservation) {
            toast.error("Không tìm thấy thông tin đặt bàn")
            return
        }

        setIsSubmitting(true)
        try {
            // Check if there are existing table assignments that need to be canceled
            const hasExistingTables = initialTableIds.length > 0

            // Step 1: If there are existing tables, cancel all of them first
            if (hasExistingTables) {
                const cancelResponse = await bookingService.cancelAssignTableToReservation(reservation.id, initialTableIds)
                if (!cancelResponse.success) {
                    toast.error(cancelResponse.message || "Không thể hủy bàn đã đặt trước đó")
                    setIsSubmitting(false)
                    return
                }
            }

            // Step 2: Assign the newly selected tables
            const assignResponse = await bookingService.assignTableToReservation(reservation.id, selectedTableIds)


            const cusNameDisplay = reservation.customerName || "Khách hàng không xác định"
            const tableNameDisplay = selectedTableIds.length > 0 ? tables
                .filter((table) => selectedTableIds.includes(table.id))
                .map((table) => table.code)
                .join(", ")
                : "Không có bàn nào"


            if (assignResponse.success) {
                BookingSuccessToast({
                    message: hasExistingTables ? "Cập nhật bàn" : "Xếp bàn",
                    name: cusNameDisplay,
                    tableCode: tableNameDisplay
                });
                onClose()
            } else {
                toast.error(assignResponse.message || "Không thể xếp bàn")

                // If cancellation succeeded but assignment failed, try to restore the original tables
                if (hasExistingTables) {
                    try {
                        await bookingService.assignTableToReservation(reservation.id, initialTableIds)
                    } catch (restoreError) {
                        console.error("Failed to restore original table assignments:", restoreError)
                    }
                }
            }
        } catch (error) {
            console.error("Error updating table assignments:", error)
            toast.error("Có lỗi xảy ra khi xếp bàn")
            onClose()
        } finally {
            setIsSubmitting(false)
        }
    }

    // Lọc bàn theo trạng thái và số lượng người
    const getAvailableTables = () => {
        if (!reservation) return []

        // Filter tables that are closing or already assigned to this reservation
        return tables
            .filter((table) => {
                // Include tables that are either:
                // 1. Closing (available)
                // 2. Already assigned to this reservation
                const isAlreadyAssignedToThisReservation = reservation.tableAssignReservations?.some(
                    (ta) => ta.tableId === table.id,
                )

                return table.status === "Closing" || isAlreadyAssignedToThisReservation
            })
            .sort((a, b) => a.code.localeCompare(b.code)) // Sort tables by code alphabetically
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
    const totalCapacity = calculateTotalCapacity()
    const hasEnoughCapacity = totalCapacity >= reservation.numberOfPeople
    const hasExistingTables = initialTableIds.length > 0

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{hasExistingTables ? "Cập nhật bàn cho đặt chỗ" : "Xếp bàn cho đặt chỗ"}</DialogTitle>
                        <DialogDescription>
                            {hasExistingTables
                                ? "Chọn bàn để cập nhật cho lịch đặt chỗ này. Các bàn đã chọn trước đó sẽ bị hủy."
                                : "Chọn một hoặc nhiều bàn phù hợp cho lịch đặt chỗ này."}
                        </DialogDescription>
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

                        {/* Selected tables summary */}
                        {selectedTableIds.length > 0 && (
                            <div className="bg-muted p-3 rounded-md">
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="text-sm font-medium">Bàn đã chọn ({selectedTableIds.length})</Label>
                                    <Badge variant={hasEnoughCapacity ? "secondary" : "destructive"} className="text-xs">
                                        {totalCapacity} / {reservation.numberOfPeople} người
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedTableIds.map((tableId) => {
                                        const table = tables.find((t) => t.id === tableId)
                                        return (
                                            <Badge key={tableId} variant="outline" className="bg-background">
                                                {table?.code} ({table?.capacity} người)
                                            </Badge>
                                        )
                                    })}
                                </div>
                                {!hasEnoughCapacity && (
                                    <p className="text-xs text-destructive mt-2">
                                        Cảnh báo: Tổng số chỗ ngồi không đủ cho {reservation.numberOfPeople} người
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Display currently assigned tables if any */}
                        {hasExistingTables && (
                            <div className="bg-blue-50 p-3 rounded-md">
                                <Label className="text-sm font-medium text-blue-700">Bàn hiện tại</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {initialTableIds.map((tableId) => {
                                        const table = tables.find((t) => t.id === tableId)
                                        return (
                                            <Badge key={tableId} variant="outline" className="bg-white border-blue-200 text-blue-700">
                                                {table?.code} ({table?.capacity} người)
                                            </Badge>
                                        )
                                    })}
                                </div>
                                <p className="text-xs text-blue-600 mt-2">
                                    Lưu ý: Khi cập nhật, các bàn hiện tại sẽ bị hủy và thay thế bằng các bàn mới được chọn.
                                </p>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label>
                                Chọn bàn <span className="text-red-500">*</span>
                            </Label>
                            {isLoadingTables ? (
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    <span className="ml-2">Đang tải danh sách bàn...</span>
                                </div>
                            ) : availableTables.length === 0 ? (
                                <div className="text-center p-4 text-muted-foreground">Không có bàn nào phù hợp</div>
                            ) : (
                                <ScrollArea className="h-[200px] rounded-md border">
                                    <div className="p-4 space-y-3">
                                        {availableTables.map((table) => (
                                            <div key={table.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`table-${table.id}`}
                                                    checked={selectedTableIds.includes(table.id)}
                                                    onCheckedChange={(checked) => handleTableSelectionChange(table.id, checked === true)}
                                                />
                                                <Label
                                                    htmlFor={`table-${table.id}`}
                                                    className="flex flex-1 justify-between items-center cursor-pointer text-sm"
                                                >
                                                    <span>
                                                        {table.code}{" "}
                                                        {table.capacity < reservation.numberOfPeople && (
                                                            <span className="text-amber-500 text-xs">(không đủ chỗ)</span>
                                                        )}
                                                        {initialTableIds.includes(table.id) && (
                                                            <span className="text-blue-500 text-xs ml-1">(đã đặt)</span>
                                                        )}
                                                    </span>
                                                    <Badge variant="outline" className="ml-auto">
                                                        {table.capacity} người
                                                    </Badge>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                            {tableError && <p className="text-sm text-red-500">{tableError}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting || selectedTableIds.length === 0}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : hasExistingTables ? (
                                "Cập nhật bàn"
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
