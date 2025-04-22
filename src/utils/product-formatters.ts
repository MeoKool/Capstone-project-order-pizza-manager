// Utility functions for formatting product-related data

import { ProductStatus } from "@/types/product"

// Function to format product type
export const formatProductType = (type: string): string => {
    switch (type) {
        case "ColdKitchen":
            return "Bếp lạnh"
        case "HotKitchen":
            return "Bếp nóng"
        default:
            return type
    }
}

// Function to format product status
export const formatProductStatus = (status: ProductStatus): string => {
    switch (status) {
        case "Available":
            return "Có sẵn"
        case "OutOfIngredient":
            return "Hết nguyên liệu"
        case "Locked":
            return "Đã khóa"
        default:
            return status
    }
}

// Function to get status badge variant
export const getStatusBadgeVariant = (status: ProductStatus): string => {
    switch (status) {
        case "Available":
            return "default"
        case "OutOfIngredient":
            return "secondary"
        case "Locked":
            return "destructive"
        default:
            return "secondary"
    }
}

// Function to check if product is available
export const isProductAvailable = (status: ProductStatus): boolean => {
    return status === "Available"
}
