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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useProducts from "@/hooks/useProducts"

interface CreateProductSizeDialogProps {
    isOpen: boolean
    onClose: () => void
    onCreateProductSize: (data: {
        name: string
        diameter: number
        description: string
        productId: string
    }) => Promise<void>
}

export function CreateProductSizeDialog({ isOpen, onClose, onCreateProductSize }: CreateProductSizeDialogProps) {
    const [name, setName] = useState("")
    const [diameter, setDiameter] = useState("")
    const [description, setDescription] = useState("")
    const [productId, setProductId] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState({
        name: "",
        diameter: "",
        description: "",
        productId: "",
    })

    // Assuming you have a hook to fetch products
    const { productALL, loading } = useProducts()

    const validateForm = () => {
        const newErrors = {
            name: "",
            diameter: "",
            description: "",
            productId: "",
        }
        let isValid = true

        if (!name.trim()) {
            newErrors.name = "Tên kích cỡ không được để trống"
            isValid = false
        }

        if (!diameter.trim()) {
            newErrors.diameter = "Đường kính không được để trống"
            isValid = false
        } else if (isNaN(Number(diameter)) || Number(diameter) <= 0) {
            newErrors.diameter = "Đường kính phải là số dương"
            isValid = false
        }

        if (!description.trim()) {
            newErrors.description = "Mô tả không được để trống"
            isValid = false
        }

        if (!productId) {
            newErrors.productId = "Vui lòng chọn sản phẩm"
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
            await onCreateProductSize({
                name,
                diameter: Number(diameter),
                description,
                productId,
            })
            resetForm()
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setName("")
        setDiameter("")
        setDescription("")
        setProductId("")
        setErrors({ name: "", diameter: "", description: "", productId: "" })
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Thêm kích cỡ sản phẩm mới</DialogTitle>
                        <DialogDescription>Nhập thông tin kích cỡ sản phẩm mới vào form bên dưới.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    Tên kích cỡ <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nhập tên kích cỡ"
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="diameter">
                                    Đường kính (cm) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="diameter"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={diameter}
                                    onChange={(e) => setDiameter(e.target.value)}
                                    placeholder="Nhập đường kính"
                                />
                                {errors.diameter && <p className="text-sm text-red-500">{errors.diameter}</p>}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="product">
                                Sản phẩm <span className="text-red-500">*</span>
                            </Label>
                            <Select value={productId} onValueChange={setProductId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn sản phẩm" />
                                </SelectTrigger>
                                <SelectContent>
                                    {loading ? (
                                        <SelectItem value="loading" disabled>
                                            Đang tải sản phẩm...
                                        </SelectItem>
                                    ) : productALL.length === 0 ? (
                                        <SelectItem value="empty" disabled>
                                            Không có sản phẩm nào
                                        </SelectItem>
                                    ) : (
                                        productALL.map((product) => (
                                            <SelectItem key={product.id} value={product.id}>
                                                {product.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.productId && <p className="text-sm text-red-500">{errors.productId}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">
                                Mô tả <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Nhập mô tả kích cỡ sản phẩm"
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

