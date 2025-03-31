"use client"

import { useState, useEffect, useCallback } from "react"
import type { ProductSize } from "@/types/product-sizes"
import ProductSizeService from "@/services/productsize-service"

type SortOption = "CreatedDate desc" | "Name asc" | "Name desc" | "Diameter desc" | "Diameter asc"

export function useProductSizes() {
    const [productSizes, setProductSizes] = useState<ProductSize[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [sortBy, setSortBy] = useState<SortOption>("CreatedDate desc")
    const [takeCount, setTakeCount] = useState(1000)
    const productSizeService = ProductSizeService.getInstance()

    const fetchProductSizes = useCallback(
        async (newSortBy: SortOption = sortBy, newTakeCount: number = takeCount) => {
            setLoading(true)
            try {
                const response = await productSizeService.getAllProductSizes(newTakeCount, newSortBy, "Recipes")

                if (response.success && response.result) {
                    // Check if items is an array, if not convert it to an array
                    const productSizesData = Array.isArray(response.result.items)
                        ? response.result.items
                        : [response.result.items]

                    setProductSizes(productSizesData)
                    console.log(`Fetched ${productSizesData.length} product sizes`)
                } else {
                    throw new Error(response.message || "Failed to fetch product sizes")
                }
            } catch (err) {
                console.error("Error fetching product sizes:", err)
                setError(err instanceof Error ? err : new Error("Unknown error"))
            } finally {
                setLoading(false)
            }
        },
        [sortBy, takeCount, productSizeService],
    )

    useEffect(() => {
        fetchProductSizes()
    }, [fetchProductSizes])

    const changeSortOrder = (newSortBy: SortOption) => {
        setSortBy(newSortBy)
        fetchProductSizes(newSortBy, takeCount)
    }

    const changeTakeCount = (newTakeCount: number) => {
        setTakeCount(newTakeCount)
        fetchProductSizes(sortBy, newTakeCount)
    }

    const getSortLabel = (sortOption: SortOption): string => {
        switch (sortOption) {
            case "CreatedDate desc":
                return "Mới nhất"
            case "Name asc":
                return "Tên: A-Z"
            case "Name desc":
                return "Tên: Z-A"
            case "Diameter desc":
                return "Đường kính: Tăng dần"
            case "Diameter asc":
                return "Đường kính: Giảm dần"
            default:
                return "Mới nhất"
        }
    }

    const refreshProductSizes = () => {
        fetchProductSizes(sortBy, takeCount)
    }

    return {
        productSizes,
        loading,
        error,
        sortBy,
        takeCount,
        changeSortOrder,
        changeTakeCount,
        getSortLabel,
        refreshProductSizes,
    }
}

export default useProductSizes

