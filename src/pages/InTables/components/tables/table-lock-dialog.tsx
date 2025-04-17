"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Lock } from "lucide-react"
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
import type TableResponse from "@/types/tables"

interface TableLockDialogProps {
    table: TableResponse
    open: boolean
    onOpenChange: (open: boolean) => void
    onLockTable: (tableId: string, note: string) => Promise<void>
    isLoading: boolean
}

export function TableLockDialog({ table, open, onOpenChange, onLockTable, isLoading }: TableLockDialogProps) {
    const [note, setNote] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onLockTable(table.id, note)
    }
    useEffect(() => {
        if (open) {
            setNote("")
        }
    }, [open, table.id])
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-amber-500" />
                        <span>Khóa bàn {table.code} để bảo trì</span>
                    </DialogTitle>
                    <DialogDescription>
                        Bàn sẽ được khóa và không thể sử dụng cho đến khi được mở khóa. Vui lòng nhập lý do bảo trì.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Textarea
                                id="note"
                                placeholder="Nhập lý do bảo trì..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="min-h-[100px]"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-amber-200 text-amber-700"
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={isLoading || !note.trim()}>
                            {isLoading ? "Đang xử lý..." : "Xác nhận khóa bàn"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
