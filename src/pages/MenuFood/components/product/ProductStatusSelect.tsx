"use client"

import { useState } from "react"
import { Check, AlertCircle, Lock } from "lucide-react"

import ProductService from "@/services/product-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { formatProductStatus } from "@/utils/product-formatters"
import type { ProductStatus } from "@/types/product"
import { toast } from "sonner"

interface ProductStatusSelectProps {
    productId: string
    currentStatus: ProductStatus
    onStatusChange: (newStatus: ProductStatus) => void
}

export function ProductStatusSelect({ productId, currentStatus, onStatusChange }: ProductStatusSelectProps) {
    const [selectedStatus, setSelectedStatus] = useState<ProductStatus>(currentStatus)
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const productService = ProductService.getInstance()

    // Function to handle status update
    const handleStatusUpdate = async () => {
        if (!productId || selectedStatus === currentStatus) return

        setUpdatingStatus(true)
        try {
            // Update the service method call to send the actual status string
            const response = await productService.updateStatusProduct(productId, selectedStatus)

            if (response.success) {
                // Call the callback with the new status
                onStatusChange(selectedStatus)
                toast.success(`Cập nhật trạng thái thành ${formatProductStatus(selectedStatus)} thành công`)

            } else {
                throw new Error(response.message || "Không thể cập nhật trạng thái sản phẩm")
            }
        } catch (err) {
            console.error("Error updating product status:", err)
            toast.error(
                `Có lỗi xảy ra khi cập nhật trạng thái sản phẩm: ${err instanceof Error ? err.message : "Lỗi không xác định"}`)

            // Reset to current status on error
            setSelectedStatus(currentStatus)
        } finally {
            setUpdatingStatus(false)
        }
    }

    // Function to get the appropriate icon for each status
    const getStatusIcon = (status: ProductStatus) => {
        switch (status) {
            case "Available":
                return <Check className="h-4 w-4 text-green-500" />
            case "OutOfIngredient":
                return <AlertCircle className="h-4 w-4 text-amber-500" />
            case "Locked":
                return <Lock className="h-4 w-4 text-red-500" />
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Select
                value={selectedStatus}
                onValueChange={(value: ProductStatus) => setSelectedStatus(value)}
                disabled={updatingStatus}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Available">
                        <div className="flex items-center gap-2">
                            {getStatusIcon("Available")}
                            <span>Có sẵn</span>
                        </div>
                    </SelectItem>
                    <SelectItem value="OutOfIngredient">
                        <div className="flex items-center gap-2">
                            {getStatusIcon("OutOfIngredient")}
                            <span>Hết nguyên liệu</span>
                        </div>
                    </SelectItem>
                    <SelectItem value="Locked">
                        <div className="flex items-center gap-2">
                            {getStatusIcon("Locked")}
                            <span>Đã khóa</span>
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>

            <Button onClick={handleStatusUpdate} disabled={updatingStatus || selectedStatus === currentStatus} size="sm">
                {updatingStatus ? (
                    <>
                        Cập nhật...
                    </>
                ) : (
                    "Cập nhật"
                )}
            </Button>
        </div>
    )
}
