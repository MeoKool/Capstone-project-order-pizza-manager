"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle } from "lucide-react"
import type { OrderItemDetail } from "@/types/order"

interface CancelOrderItemDialogProps {
    orderItem: OrderItemDetail
    open: boolean
    onOpenChange: (open: boolean) => void
    onCancel: (orderItemId: string, reason: string) => Promise<boolean>
    isSubmitting: boolean
    error: string | null
}

export function CancelOrderItemDialog({ orderItem, open, onOpenChange, error, isSubmitting, onCancel }: CancelOrderItemDialogProps) {
    const [reason, setReason] = useState("")


    const handleCancel = async () => {
        const success = await onCancel(orderItem.id, reason)
        if (success) {
            setReason("")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] border-red-200">
                <DialogHeader>
                    <DialogTitle className="text-red-600">Xác nhận hủy món</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <div className="mb-4 bg-red-50 p-3 rounded-md border border-red-100">
                        <h3 className="font-medium text-red-800 mb-1">Thông tin món hủy:</h3>
                        <p className="text-sm text-red-700">{orderItem.name}</p>
                        <p className="text-sm text-red-700">Số lượng: {orderItem.quantity}</p>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-start">
                            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-red-700">
                            Lý do hủy <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder="Vui lòng nhập lý do hủy món..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="resize-none h-24 border-red-200 focus-visible:ring-red-400"
                        />
                        <p className="text-xs text-gray-500">Lý do hủy sẽ được ghi lại để theo dõi và cải thiện dịch vụ.</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                        disabled={isSubmitting}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            "Xác nhận hủy"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
