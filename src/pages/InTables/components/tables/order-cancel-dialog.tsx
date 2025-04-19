"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import type TableResponse from "@/types/tables"
import OrderService from "@/services/order-service"

interface OrderCancelDialogProps {
    table: TableResponse
    open: boolean
    onOpenChange: (open: boolean) => void
    isLoading?: boolean
    onTableUpdated?: () => void
    onOrderCancelled?: () => void
}

export function OrderCancelDialog({
    table,
    open,
    onOpenChange,
    isLoading = false,
    onTableUpdated,
    onOrderCancelled,
}: OrderCancelDialogProps) {
    const [reason, setReason] = useState("")
    const [loading, setLoading] = useState(false)

    // Reset reason when dialog opens or when a different table is selected
    useEffect(() => {
        if (open) {
            setReason("")
        }
    }, [open, table.id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!table.currentOrderId) {
            toast.error("Không tìm thấy đơn hàng để hủy")
            return
        }

        if (!reason.trim()) {
            toast.error("Vui lòng nhập lý do hủy đơn hàng")
            return
        }

        setLoading(true)
        try {
            const orderService = OrderService.getInstance()
            const res = await orderService.cancelOrder(table.currentOrderId, reason)

            const tableCode = table.code
            const resasonCancel = reason
            if (res.success) {
                // Call the callback to refresh table data
                if (onTableUpdated) {
                    onTableUpdated()
                }

                // Notify parent component that order was cancelled
                if (onOrderCancelled) {
                    onOrderCancelled()
                }

                toast.success(`Bàn ${tableCode} đã được hủy đơn hàng: ${resasonCancel}`)

                // Reset the form and close this dialog
                setReason("")
                onOpenChange(false)
            } else {
                toast.error(res.message || "Không thể hủy đơn hàng. Vui lòng thử lại.")
            }
        } catch (error) {
            console.error(`Lỗi khi hủy đơn hàng với ID: ${table.currentOrderId}`, error)
            toast.error("Đã xảy ra lỗi khi hủy đơn hàng. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                if (!newOpen) {
                    // Reset form when dialog is closed
                    setReason("")
                }
                onOpenChange(newOpen)
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <span>Hủy đơn hàng</span>
                    </DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn hủy đơn hàng hiện tại của bàn {table.code}? Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label htmlFor="reason" className="text-sm font-medium">
                                Lý do hủy đơn hàng <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                id="reason"
                                placeholder="Nhập lý do hủy đơn hàng..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="min-h-[100px]"
                                required
                            />
                            <p className="text-xs text-gray-500">Lý do hủy đơn hàng là bắt buộc</p>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setReason("")
                                onOpenChange(false)
                            }}
                            className="border-gray-200"
                            disabled={loading || isLoading}
                        >
                            Quay lại
                        </Button>
                        <Button type="submit" variant="destructive" disabled={loading || isLoading || !reason.trim()}>
                            {loading || isLoading ? "Đang xử lý..." : "Xác nhận hủy đơn hàng"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
