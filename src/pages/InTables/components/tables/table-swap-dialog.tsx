"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowRightLeft, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type TableResponse from "@/types/tables"
import OrderService from "@/services/order-service"
import useTable from "@/hooks/useTable"
import { showTableLToast } from "../table-toast-notifications"

// Custom styles for radio button

interface TableSwapDialogProps {
    table: TableResponse
    open: boolean
    onOpenChange: (open: boolean) => void
    isLoading?: boolean
    onTableUpdated?: () => void
}

export function TableSwapDialog({
    table,
    open,
    onOpenChange,
    isLoading = false,
    onTableUpdated,
}: TableSwapDialogProps) {
    const [selectedTableId, setSelectedTableId] = useState<string>("")
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [submitting, setSubmitting] = useState<boolean>(false)
    const { tables, loading: loadingTables, fetchAllTables } = useTable()

    // Reset form and refresh tables when dialog opens
    useEffect(() => {
        if (open) {
            setSelectedTableId("")
            setSearchQuery("")
            fetchAllTables() // Refresh tables to get the latest status
        }
    }, [open, fetchAllTables])

    // Filter available tables - only show tables with "Closing" status
    const availableTables = tables
        .filter((t) => {
            // 1. Not the current table
            // 2. Only in "Closing" status (available for swapping)
            // 3. Match the search query if provided
            const matchesSearch = searchQuery ? t.code.toLowerCase().includes(searchQuery.toLowerCase()) : true
            const isAvailable = t.status === "Closing" // Only "Closing" status
            const isNotCurrentTable = t.id !== table.id

            return isNotCurrentTable && isAvailable && matchesSearch
        })
        .sort((a, b) => a.code.localeCompare(b.code)) // Sort by table code

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedTableId) {
            toast.error("Vui lòng chọn bàn để chuyển đến")
            return
        }

        if (!table.currentOrderId) {
            toast.error("Không tìm thấy đơn hàng để chuyển")
            return
        }

        setSubmitting(true)
        try {
            const orderService = OrderService.getInstance()
            const response = await orderService.swapTable(table.currentOrderId, selectedTableId)

            if (response.success) {
                const selectedTable = tables.find((t) => t.id === selectedTableId)
                const sourceTableCode = table.code
                const targetTableCode = selectedTable?.code || "bàn mới"

                showTableLToast({
                    tableCode: sourceTableCode,
                    message: `đã được chuyển sang `,
                    targetTableCode: targetTableCode,
                })

                if (onTableUpdated) {
                    onTableUpdated()
                }

                onOpenChange(false)
            } else {
                toast.error(response.message || "Không thể chuyển bàn. Vui lòng thử lại.")
            }
        } catch (error) {
            console.error("Error swapping table:", error)
            toast.error("Đã xảy ra lỗi khi chuyển bàn. Vui lòng thử lại.")
        } finally {
            setSubmitting(false)
        }
    }

    // Count total available tables for display
    const totalClosingTables = tables.filter((t) => t.status === "Closing" && t.id !== table.id).length
    const filteredCount = availableTables.length
    const isFiltering = searchQuery.trim() !== ""

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowRightLeft className="h-5 w-5 text-amber-500" />
                        <span>Chuyển bàn {table.code}</span>
                    </DialogTitle>
                    <DialogDescription>
                        Chọn bàn mới để chuyển đơn hàng hiện tại từ bàn {table.code}.
                        {!table.currentOrderId && (
                            <div className="mt-2 text-red-500 text-sm">Lưu ý: Bàn này không có đơn hàng nào đang hoạt động.</div>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="space-y-4 py-2 flex-1 overflow-hidden flex flex-col">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-amber-500" />
                            <Input
                                placeholder="Tìm kiếm bàn theo mã..."
                                className="pl-8 border-amber-200"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {isFiltering && (
                                <div className="text-xs text-amber-600 mt-1 pl-1">
                                    Hiển thị {filteredCount} / {totalClosingTables} bàn đang đóng
                                </div>
                            )}
                        </div>

                        <div className="border rounded-md border-amber-100 flex-1 overflow-hidden ">
                            <ScrollArea className="h-[350px] max-h-[calc(90vh-250px)]">
                                <div className="p-2">
                                    {loadingTables ? (
                                        <div className="flex flex-col items-center justify-center h-full py-8">
                                            <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-2" />
                                            <p className="text-sm text-amber-700">Đang tải danh sách bàn...</p>
                                        </div>
                                    ) : availableTables.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                                            <ArrowRightLeft className="h-10 w-10 text-amber-300 mb-2" />
                                            <p className="text-sm text-amber-800 font-medium">Không tìm thấy bàn phù hợp</p>
                                            <p className="text-xs text-amber-600 max-w-[250px] mx-auto mt-1">
                                                {isFiltering
                                                    ? "Không tìm thấy bàn nào khớp với từ khóa tìm kiếm."
                                                    : 'Không có bàn nào ở trạng thái "Đang đóng" để chuyển đến.'}
                                            </p>
                                            {isFiltering && (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="text-amber-600 mt-2"
                                                    onClick={() => setSearchQuery("")}
                                                >
                                                    Xóa bộ lọc
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <RadioGroup value={selectedTableId} onValueChange={setSelectedTableId}>
                                            <div className="space-y-2">
                                                {availableTables.map((availableTable) => (
                                                    <div
                                                        key={availableTable.id}
                                                        className={`p-3 rounded-md border transition-colors ${selectedTableId === availableTable.id
                                                            ? "border-amber-400 bg-amber-50"
                                                            : "border-amber-100 hover:border-amber-200 hover:bg-amber-50/50"
                                                            }`}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem
                                                                value={availableTable.id}
                                                                id={availableTable.id}
                                                                className="text-amber-500 border-amber-300 data-[state=checked]:border-amber-500 data-[state=checked]:text-amber-500"
                                                            />
                                                            <Label
                                                                htmlFor={availableTable.id}
                                                                className="flex flex-1 justify-between items-center cursor-pointer"
                                                            >
                                                                <div>
                                                                    <p className="font-medium">{availableTable.code}</p>
                                                                    <p className="text-xs text-muted-foreground">Đang đóng có thể chuyển</p>
                                                                </div>
                                                                <Badge variant="outline" className="ml-auto bg-white border-amber-200 text-amber-700">
                                                                    {availableTable.capacity} người
                                                                </Badge>
                                                            </Label>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </RadioGroup>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-amber-200 text-amber-700"
                            disabled={submitting || isLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="bg-amber-600 hover:bg-amber-700"
                            disabled={submitting || isLoading || !selectedTableId || !table.currentOrderId}
                        >
                            {submitting || isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                                    Xác nhận chuyển bàn
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
