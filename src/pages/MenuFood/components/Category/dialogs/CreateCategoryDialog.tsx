"use client"

import type React from "react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface CreateCategoryDialogProps {
    isOpen: boolean
    onClose: () => void
    onCreateCategory: (data: { name: string; description: string }) => Promise<void>
}

export function CreateCategoryDialog({ isOpen, onClose, onCreateCategory }: CreateCategoryDialogProps) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState({ name: "", description: "" })

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
            await onCreateCategory({
                name,
                description,
            })
            resetForm()
        } catch (error) {
            console.error("Error in dialog:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setName("")
        setDescription("")
        setErrors({ name: "", description: "" })
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Thêm Danh Mục Mới</DialogTitle>
                        <DialogDescription>Nhập thông tin danh mục mới vào form bên dưới.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Tên Danh Mục <span className="text-red-500">*</span>
                            </Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên danh mục" />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Mô Tả</Label>
                            <Textarea
                                id="description"
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

