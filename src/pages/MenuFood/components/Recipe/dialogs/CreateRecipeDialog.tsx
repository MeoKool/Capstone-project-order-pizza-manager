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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { UnitType } from "@/types/recipe"

interface CreateRecipeDialogProps {
    isOpen: boolean
    onClose: () => void
    onCreateRecipe: (data: {
        productSizeId: string
        ingredientId: string
        unit: UnitType
        ingredientName: string
        quantity: number
    }) => Promise<void>
    productSizes: Array<{ id: string; name: string }>
    ingredients: Array<{ id: string; name: string }>
}

// Mapping đơn vị từ tiếng Anh sang tiếng Việt
const unitTypeMapping: Record<UnitType, string> = {
    [UnitType.Milligram]: "Miligram",
    [UnitType.Gram]: "Gram",
    [UnitType.Kilogram]: "Kilogram",
    [UnitType.Milliliter]: "Mililít",
    [UnitType.Liter]: "Lít",
    [UnitType.Piece]: "Cái/Miếng",
    [UnitType.Teaspoon]: "Thìa cà phê",
    [UnitType.Tablespoon]: "Thìa canh",
}

// Mapping ngược lại từ tiếng Việt sang tiếng Anh


export function CreateRecipeDialog({
    isOpen,
    onClose,
    onCreateRecipe,
    productSizes,
    ingredients,
}: CreateRecipeDialogProps) {
    const [productSizeId, setProductSizeId] = useState("")
    const [ingredientId, setIngredientId] = useState("")
    const [unit, setUnit] = useState<UnitType>(UnitType.Gram)
    const [quantity, setQuantity] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [ingredientName, setIngredientName] = useState("")
    const [errors, setErrors] = useState({
        productSizeId: "",
        ingredientId: "",
        unit: "",
        ingredientName: "",
        quantity: "",
    })

    const validateForm = () => {
        const newErrors = {
            productSizeId: "",
            ingredientId: "",
            unit: "",
            ingredientName: "",
            quantity: "",
        }
        let isValid = true

        if (!productSizeId) {
            newErrors.productSizeId = "Vui lòng chọn kích cỡ sản phẩm"
            isValid = false
        }

        if (!ingredientId) {
            newErrors.ingredientId = "Vui lòng chọn nguyên liệu"
            isValid = false
        }

        if (!unit) {
            newErrors.unit = "Vui lòng chọn đơn vị"
            isValid = false
        }

        if (!quantity) {
            newErrors.quantity = "Số lượng không được để trống"
            isValid = false
        } else {
            const quantityValue = Number(quantity)
            if (isNaN(quantityValue) || quantityValue <= 0) {
                newErrors.quantity = "Số lượng phải là số dương"
                isValid = false
            }
        }

        setErrors(newErrors)
        return isValid
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)
        try {
            await onCreateRecipe({
                productSizeId,
                ingredientId,
                unit,
                ingredientName,
                quantity: Number(quantity),
            })
            resetForm()
        } catch (error) {
            console.error("Error in dialog:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setProductSizeId("")
        setIngredientId("")
        setUnit(UnitType.Gram)
        setQuantity("")
        setErrors({
            productSizeId: "",
            ingredientId: "",
            ingredientName: "",
            unit: "",
            quantity: "",
        })
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    // Handle quantity input change with validation
    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        // Allow empty value for validation to handle
        if (value === "") {
            setQuantity("")
            return
        }

        // Only allow numeric input
        if (/^-?\d*\.?\d*$/.test(value)) {
            setQuantity(value)

            // Clear error if value is valid
            if (Number(value) > 0) {
                setErrors((prev) => ({ ...prev, quantity: "" }))
            }
        }
    }

    // Tìm tên của ProductSize dựa trên ID
    const getProductSizeName = (id: string) => {
        const productSize = productSizes.find((size) => size.id === id)
        return productSize ? productSize.name : id
    }

    // Tìm tên của Ingredient dựa trên ID
    const getIngredientName = (id: string) => {
        const ingredient = ingredients.find((ing) => ing.id === id)
        return ingredient ? ingredient.name : id
    }
    const handleIngredientChange = (id: string) => {
        setIngredientId(id)
        // Lưu tên nguyên liệu khi chọn
        const name = getIngredientName(id)
        setIngredientName(name)
    }
    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Thêm Công Thức Mới</DialogTitle>
                        <DialogDescription>Nhập thông tin công thức mới vào form bên dưới.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="productSize">
                                Kích cỡ sản phẩm <span className="text-red-500">*</span>
                            </Label>
                            <Select value={productSizeId} onValueChange={setProductSizeId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn kích cỡ sản phẩm">
                                        {productSizeId ? getProductSizeName(productSizeId) : "Chọn kích cỡ sản phẩm"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {productSizes.map((size) => (
                                        <SelectItem key={size.id} value={size.id}>
                                            {size.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.productSizeId && <p className="text-sm text-red-500">{errors.productSizeId}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="ingredient">
                                Nguyên liệu <span className="text-red-500">*</span>
                            </Label>
                            <Select value={ingredientId} onValueChange={handleIngredientChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn nguyên liệu">
                                        {ingredientId ? getIngredientName(ingredientId) : "Chọn nguyên liệu"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {ingredients.map((ingredient) => (
                                        <SelectItem key={ingredient.id} value={ingredient.id}>
                                            {ingredient.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.ingredientId && <p className="text-sm text-red-500">{errors.ingredientId}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="quantity">
                                    Số lượng <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    placeholder="Nhập số lượng"
                                />
                                {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="unit">
                                    Đơn vị <span className="text-red-500">*</span>
                                </Label>
                                <Select value={unit} onValueChange={(value) => setUnit(value as UnitType)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn đơn vị">{unitTypeMapping[unit]}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(unitTypeMapping).map(([unitType, unitName]) => (
                                            <SelectItem key={unitType} value={unitType}>
                                                {unitName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unit && <p className="text-sm text-red-500">{errors.unit}</p>}
                            </div>
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

