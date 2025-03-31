"use client"

import { useState, useEffect } from "react"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Filter,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ProductSize } from "@/types/product-sizes"
import ProductService from "@/services/product-service"
import { ViewProductSizeDialog } from "./dialogs/ViewProductSizeDialog"

// Cập nhật interface để nhận tên sản phẩm
interface ProductSizeTableProps {
    productSizes: ProductSize[]
    isLoading: boolean
    onFilterByProduct: (productId: string, productName: string) => void
}

export function ProductSizeTable({ productSizes, isLoading, onFilterByProduct }: ProductSizeTableProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [productNames, setProductNames] = useState<Record<string, string>>({})
    const [loadingProductNames, setLoadingProductNames] = useState(false)
    const [viewingProductSizeId, setViewingProductSizeId] = useState<string | null>(null)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

    // Calculate pagination values
    const totalItems = productSizes.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
    const currentItems = productSizes.slice(startIndex, endIndex)

    // Fetch product names for the current page items
    useEffect(() => {
        const fetchProductNames = async () => {
            if (isLoading || currentItems.length === 0) return

            setLoadingProductNames(true)

            // Get unique product IDs from current page
            const uniqueProductIds = Array.from(new Set(currentItems.map((size) => size.productId)))

            // Filter out product IDs we already have names for
            const idsToFetch = uniqueProductIds.filter((id) => !productNames[id])

            if (idsToFetch.length === 0) {
                setLoadingProductNames(false)
                return
            }

            try {
                const productService = ProductService.getInstance()
                const newProductNames: Record<string, string> = { ...productNames }

                // Fetch product names in parallel
                await Promise.all(
                    idsToFetch.map(async (productId) => {
                        try {
                            // Sử dụng getProductById để lấy thông tin sản phẩm
                            const response = await productService.getProductById(productId)

                            // Nếu API trả về thành công và có dữ liệu
                            if (response.success && response.result) {
                                // Lưu tên sản phẩm vào cache
                                newProductNames[productId] = response.result.name
                                console.log(`Fetched product name for ID ${productId}: ${response.result.name}`)
                            } else {
                                // Nếu không có dữ liệu, hiển thị ID sản phẩm
                                newProductNames[productId] = `Sản phẩm #${productId}`
                                console.warn(`No product data found for ID ${productId}`)
                            }
                        } catch (error) {
                            console.error(`Error fetching product ${productId}:`, error)
                            newProductNames[productId] = `Sản phẩm #${productId}`
                        }
                    }),
                )

                // Cập nhật state với tên sản phẩm mới
                setProductNames(newProductNames)
                console.log(`Fetched names for ${idsToFetch.length} products`)
            } catch (error) {
                console.error("Error fetching product names:", error)
            } finally {
                setLoadingProductNames(false)
            }
        }

        fetchProductNames()
    }, [currentItems, isLoading, productNames])

    // Get product name by ID
    const getProductName = (productId: string) => {
        if (productNames[productId]) {
            return productNames[productId]
        }

        return loadingProductNames ? (
            <span className="flex items-center">
                <Skeleton className="h-4 w-4 mr-2 rounded-full animate-pulse" />
                Đang tải...
            </span>
        ) : (
            `Sản phẩm #${productId}`
        )
    }

    // Handle view product size details
    const handleViewDetails = (productSizeId: string) => {
        setViewingProductSizeId(productSizeId)
        setIsViewDialogOpen(true)
    }

    // Handle page changes
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages || 1)))
    }

    const goToFirstPage = () => goToPage(1)
    const goToPreviousPage = () => goToPage(currentPage - 1)
    const goToNextPage = () => goToPage(currentPage + 1)
    const goToLastPage = () => goToPage(totalPages)

    // Handle items per page change
    const handleItemsPerPageChange = (value: string) => {
        const newItemsPerPage = Number.parseInt(value)
        setItemsPerPage(newItemsPerPage)
        // Reset to first page when changing items per page
        setCurrentPage(1)
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Tên kích cỡ</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead className="w-[100px] text-right">Đường kính</TableHead>
                            <TableHead className="w-[200px]">
                                <div className="flex items-center">
                                    Sản phẩm (Product)
                                    <Button variant="ghost" size="sm" className="ml-1 p-0">
                                        <Filter className="h-3 w-3" />
                                    </Button>
                                </div>
                            </TableHead>
                            <TableHead className="w-[200px]">Công thức (Recipes)</TableHead>
                            <TableHead className="w-[100px] text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array(itemsPerPage)
                                .fill(0)
                                .map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Skeleton className="h-5 w-12" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-5 w-full" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-5 w-16" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-5 w-full" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-5 w-24" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-5 w-16" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-5 w-8 ml-auto" />
                                        </TableCell>
                                    </TableRow>
                                ))
                        ) : productSizes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Không có kích cỡ sản phẩm nào. Hãy thêm kích cỡ mới.
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentItems.map((size) => (
                                <TableRow key={size.id}>
                                    <TableCell>{size.name}</TableCell>
                                    <TableCell>{size.description || "-"}</TableCell>
                                    <TableCell className="w-[100px] text-right">{size.diameter}cm</TableCell>
                                    <TableCell>
                                        {/* Cập nhật hàm xử lý khi click vào tên sản phẩm */}
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto text-left"
                                            onClick={() => {
                                                const productName =
                                                    typeof getProductName(size.productId) === "string"
                                                        ? (getProductName(size.productId) as string)
                                                        : `Sản phẩm #${size.productId}`
                                                onFilterByProduct(size.productId, productName)
                                            }}
                                        >
                                            {getProductName(size.productId)}
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        {size.recipes ? (
                                            <Badge>{Array.isArray(size.recipes) ? `${size.recipes.length} công thức` : "1 công thức"}</Badge>
                                        ) : (
                                            <Badge variant="outline">Không có</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Mở menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleViewDetails(size.id)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Xem chi tiết
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {!isLoading && productSizes.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Hiển thị {startIndex + 1}-{endIndex} của {totalItems} kích cỡ sản phẩm
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Hiển thị:</span>
                            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue placeholder={itemsPerPage.toString()} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={goToFirstPage}
                                disabled={currentPage === 1}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                                <span className="sr-only">Trang đầu</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Trang trước</span>
                            </Button>

                            <span className="text-sm">
                                Trang <strong>{currentPage}</strong> / {totalPages || 1}
                            </span>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">Trang sau</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={goToLastPage}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                <ChevronsRight className="h-4 w-4" />
                                <span className="sr-only">Trang cuối</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <ViewProductSizeDialog
                productSizeId={viewingProductSizeId}
                open={isViewDialogOpen}
                onOpenChange={setIsViewDialogOpen}
            />
        </div>
    )
}

