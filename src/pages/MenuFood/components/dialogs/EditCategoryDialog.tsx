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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import type { CategoryModel } from "@/types/category"

interface EditCategoryDialogProps {
    category: CategoryModel
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (data: { name: string; description: string }) => Promise<void>
}

export function EditCategoryDialog({ category, open, onOpenChange, onSave }: EditCategoryDialogProps) {
    const [name, setName] = useState(category.name)
    const [description, setDescription] = useState(category.description || "")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState({ name: "", description: "" })

    // Update form when category changes
    useEffect(() => {
        if (category) {
            setName(category.name)
            setDescription(category.description || "")
        }
    }, [category])

    const validateForm = () => {
        const newErrors = { name: "", description: "" }
        let isValid = true

        if (!name.trim()) {
            newErrors.name = "Tên danh mục không được để trống"
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)
        try {
            await onSave({
                name,
                description,
            })
        } catch (error) {
            console.error("Error in dialog:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        // Reset errors
        setErrors({ name: "", description: "" })
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Chỉnh Sửa Danh Mục</DialogTitle>
                        <DialogDescription>Cập nhật thông tin danh mục.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">
                                Tên Danh Mục <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nhập tên danh mục"
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Mô Tả</Label>
                            <Textarea
                                id="edit-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Nhập mô tả danh mục"
                                rows={3}
                            />
                            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                "Lưu"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

