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

interface CreateIngredientDialogProps {
    isOpen: boolean
    onClose: () => void
    onCreateIngredient: (name: string, description: string) => Promise<void>
}

export function CreateIngredientDialog({ isOpen, onClose, onCreateIngredient }: CreateIngredientDialogProps) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState({ name: "", description: "" })

    const validateForm = () => {
        const newErrors = { name: "", description: "" }
        let isValid = true

        if (!name.trim()) {
            newErrors.name = "Tên nguyên liệu không được để trống"
            isValid = false
        }

        if (!description.trim()) {
            newErrors.description = "Mô tả không được để trống"
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
            await onCreateIngredient(name, description)
            resetForm()
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
                        <DialogTitle>Thêm Nguyên Liệu Mới</DialogTitle>
                        <DialogDescription>Nhập thông tin nguyên liệu mới vào form bên dưới.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Tên Nguyên Liệu <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nhập tên nguyên liệu"
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">
                                Mô Tả <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Nhập mô tả nguyên liệu"
                                rows={3}
                            />
                            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
