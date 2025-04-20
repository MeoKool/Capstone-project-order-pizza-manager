"use client"

import { useState, useEffect } from "react"
import { Layers, Loader2, AlertTriangle } from "lucide-react"
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
import TableService from "@/services/table-service"

interface TableUnmergeDialogProps {
    table: TableResponse
    open: boolean
    onOpenChange: (open: boolean) => void
    onTableUpdated?: () => void
}

export function TableUnmergeDialog({ table, open, onOpenChange, onTableUpdated }: TableUnmergeDialogProps) {
    const [submitting, setSubmitting] = useState<boolean>(false)
    const tableService = TableService.getInstance()

    // Reset submitting state when dialog opens/closes
    useEffect(() => {
        if (!open) {
            setSubmitting(false)
        }
    }, [open])

    const handleUnmerge = async () => {
        if (!table.tableMergeId) {
            toast.error("Bàn này không thuộc nhóm ghép bàn nào")
            onOpenChange(false)
            return
        }

        if (submitting) return // Prevent multiple submissions

        setSubmitting(true)
        try {
            const response = await tableService.unMergeTable(table.id)

            if (response.success) {
                toast.success("Đã hủy ghép bàn thành công!")

                // Close the dialog first
                onOpenChange(false)

                // Then update the data with a small delay to ensure UI updates properly
                setTimeout(() => {
                    if (onTableUpdated) {
                        onTableUpdated()
                    }
                }, 100)
            } else {
                toast.error(response.message || "Không thể hủy ghép bàn. Vui lòng thử lại.")
                setSubmitting(false)
            }
        } catch (error) {
            console.error("Error unmerging table:", error)
            toast.error("Đã xảy ra lỗi khi hủy ghép bàn. Vui lòng thử lại.")
            setSubmitting(false)
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                if (submitting && newOpen === false) return // Prevent closing while submitting
                onOpenChange(newOpen)
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-purple-500" />
                        <span>Hủy ghép bàn {table.code}</span>
                    </DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn hủy ghép bàn này khỏi nhóm ghép bàn hiện tại không?
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-purple-800">Thông tin ghép bàn:</p>
                            <Badge variant="outline" className="bg-white border-purple-200 text-purple-700">
                                {table.tableMergeName || "Nhóm ghép bàn"}
                            </Badge>
                        </div>
                        <div className="text-sm text-purple-700 space-y-1">
                            <p>
                                Bàn: <span className="font-medium">{table.code}</span>
                            </p>
                            <p>
                                Mã nhóm: <span className="font-medium">{table.tableMergeId}</span>
                            </p>
                        </div>
                        <div className="mt-3 flex items-center text-xs text-amber-600">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            <p>Hủy ghép bàn sẽ tách bàn này ra khỏi nhóm ghép bàn hiện tại.</p>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-purple-200 text-purple-700"
                        disabled={submitting}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        onClick={handleUnmerge}
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            "Xác nhận hủy ghép bàn"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
