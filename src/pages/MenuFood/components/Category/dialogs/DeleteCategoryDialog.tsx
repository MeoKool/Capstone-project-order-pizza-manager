"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle } from "lucide-react"
import type { CategoryModel } from "@/types/category"

interface DeleteCategoryDialogProps {
    category: CategoryModel
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => Promise<void>
}

export function DeleteCategoryDialog({ category, open, onOpenChange, onConfirm }: DeleteCategoryDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleDelete = async () => {
        setIsSubmitting(true)
        try {
            await onConfirm()
        } catch (error) {
            console.error("Error in dialog:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Xác nhận xóa danh mục
                    </DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn xóa danh mục <strong>"{category.name}"</strong>? Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                        Lưu ý: Việc xóa danh mục có thể ảnh hưởng đến các sản phẩm đang sử dụng danh mục này.
                    </p>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xóa...
                            </>
                        ) : (
                            "Xóa"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

