import type React from "react"
import { useState, useEffect } from "react"
import { Layers, Search, Loader2, AlertTriangle } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import TableService from "@/services/table-service"
import useTable from "@/hooks/useTable"

interface TableMergeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onTableUpdated?: () => void
}

export function TableMergeDialog({ open, onOpenChange, onTableUpdated }: TableMergeDialogProps) {
    const [selectedTableIds, setSelectedTableIds] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [groupName, setGroupName] = useState<string>("")

    const { tables, loading: loadingTables, fetchAllTables } = useTable()
    const tableService = TableService.getInstance()

    // Reset form and refresh tables when dialog opens
    useEffect(() => {
        if (open) {
            setSelectedTableIds([])
            setSearchQuery("")
            setGroupName("")
            fetchAllTables() // Refresh tables to get the latest status
        }
    }, [open, fetchAllTables])

    // Filter available tables - only show tables with "Closing" status and not already merged
    const availableTables = tables
        .filter((t) => {
            // Only show tables that are:
            // 1. In "Closing" status (available for merging)
            // 2. Not already part of a merge group
            // 3. Match the search query if provided
            const matchesSearch = searchQuery ? t.code.toLowerCase().includes(searchQuery.toLowerCase()) : true
            const isAvailable = t.status === "Closing" // Only "Closing" status
            const isNotMerged = !t.tableMergeId // Not already merged

            return isAvailable && isNotMerged && matchesSearch
        })
        .sort((a, b) => a.code.localeCompare(b.code)) // Sort by table code

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (selectedTableIds.length < 2) {
            toast.error("Vui lòng chọn ít nhất 2 bàn để ghép")
            return
        }

        if (!groupName.trim()) {
            toast.error("Vui lòng nhập tên nhóm ghép bàn")
            return
        }

        setSubmitting(true)
        try {
            const response = await tableService.mergeTable(selectedTableIds, groupName)

            if (response.success) {
                toast.success("Ghép bàn thành công!")

                if (onTableUpdated) {
                    onTableUpdated()
                }

                onOpenChange(false)
            } else {
                toast.error(response.message || "Không thể ghép bàn. Vui lòng thử lại.")
            }
        } catch (error) {
            console.error("Error merging tables:", error)
            toast.error("Đã xảy ra lỗi khi ghép bàn. Vui lòng thử lại.")
        } finally {
            setSubmitting(false)
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

    // Count total available tables for display
    const totalClosingTables = tables.filter((t) => t.status === "Closing" && !t.tableMergeId).length
    const filteredCount = availableTables.length
    const isFiltering = searchQuery.trim() !== ""

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-purple-500" />
                        <span>Ghép bàn</span>
                    </DialogTitle>
                    <DialogDescription>Chọn các bàn để ghép thành một nhóm bàn lớn hơn.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="space-y-4 py-2 flex-1 overflow-hidden flex flex-col">
                        {/* Group name input */}
                        <div className="space-y-2">
                            <Label htmlFor="group-name">
                                Tên nhóm ghép bàn <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="group-name"
                                placeholder="Nhập tên nhóm ghép bàn"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="border-purple-200"
                                required
                            />
                        </div>

                        {/* Table search */}
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-purple-500" />
                            <Input
                                placeholder="Tìm kiếm bàn theo mã..."
                                className="pl-8 border-purple-200"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {isFiltering && (
                                <div className="text-xs text-purple-600 mt-1 pl-1">
                                    Hiển thị {filteredCount} / {totalClosingTables} bàn đang đóng
                                </div>
                            )}
                        </div>

                        {/* Selected tables summary */}
                        {selectedTableIds.length > 0 && (
                            <div className="bg-purple-50 p-3 rounded-md border border-purple-100">
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="text-sm font-medium text-purple-800">Bàn đã chọn ({selectedTableIds.length})</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                                        onClick={() => setSelectedTableIds([])}
                                    >
                                        Bỏ chọn tất cả
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedTableIds.map((tableId) => {
                                        const table = tables.find((t) => t.id === tableId)
                                        return (
                                            <Badge key={tableId} variant="outline" className="bg-white border-purple-200 text-purple-700">
                                                {table?.code} ({table?.capacity} người)
                                            </Badge>
                                        )
                                    })}
                                </div>
                                {selectedTableIds.length < 2 && (
                                    <p className="text-xs text-red-500 mt-2">Vui lòng chọn ít nhất 2 bàn để ghép</p>
                                )}
                            </div>
                        )}

                        {/* Table selection */}
                        <div className="border rounded-md border-purple-100 flex-1 overflow-hidden">
                            <ScrollArea className="h-[350px] max-h-[calc(90vh-350px)]">
                                <div className="p-2">
                                    {loadingTables ? (
                                        <div className="flex flex-col items-center justify-center h-full py-8">
                                            <Loader2 className="h-8 w-8 text-purple-500 animate-spin mb-2" />
                                            <p className="text-sm text-purple-700">Đang tải danh sách bàn...</p>
                                        </div>
                                    ) : availableTables.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                                            <AlertTriangle className="h-10 w-10 text-purple-300 mb-2" />
                                            <p className="text-sm text-purple-800 font-medium">Không tìm thấy bàn phù hợp</p>
                                            <p className="text-xs text-purple-600 max-w-[250px] mx-auto mt-1">
                                                {isFiltering
                                                    ? "Không tìm thấy bàn nào khớp với từ khóa tìm kiếm."
                                                    : 'Không có bàn nào ở trạng thái "Đang đóng" để ghép.'}
                                            </p>
                                            {isFiltering && (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="text-purple-600 mt-2"
                                                    onClick={() => setSearchQuery("")}
                                                >
                                                    Xóa bộ lọc
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {availableTables.map((table) => (
                                                <div
                                                    key={table.id}
                                                    className={`p-3 rounded-md border transition-colors ${selectedTableIds.includes(table.id)
                                                        ? "border-purple-400 bg-purple-50"
                                                        : "border-purple-100 hover:border-purple-200 hover:bg-purple-50/50"
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`table-${table.id}`}
                                                            checked={selectedTableIds.includes(table.id)}
                                                            onCheckedChange={(checked) => handleTableSelectionChange(table.id, checked === true)}
                                                            className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                                        />
                                                        <Label
                                                            htmlFor={`table-${table.id}`}
                                                            className="flex flex-1 justify-between items-center cursor-pointer"
                                                        >
                                                            <div>
                                                                <p className="font-medium">{table.code}</p>
                                                                <p className="text-xs text-muted-foreground">Đang đóng</p>
                                                            </div>
                                                            <Badge variant="outline" className="ml-auto bg-white border-purple-200 text-purple-700">
                                                                {table.capacity} người
                                                            </Badge>
                                                        </Label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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
                            className="border-purple-200 text-purple-700"
                            disabled={submitting}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700"
                            disabled={submitting || selectedTableIds.length < 2 || !groupName.trim()}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Layers className="mr-2 h-4 w-4" />
                                    Xác nhận ghép bàn
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
