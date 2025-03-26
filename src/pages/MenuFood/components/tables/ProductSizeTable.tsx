import { useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { ProductSize } from "@/types/product-sizes"

interface ProductSizeTableProps {
    productSizes: ProductSize[]
    isLoading: boolean
    onFilterByProduct: (productId: string) => void
}

export function ProductSizeTable({ productSizes, isLoading, onFilterByProduct }: ProductSizeTableProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Calculate pagination values
    const totalItems = productSizes.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
    const currentItems = productSizes.slice(startIndex, endIndex)

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
        const newItemsPerPage = parseInt(value)
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
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Tên (Name)</TableHead>
                            <TableHead className="w-[150px]">Đường kính (Diameter)</TableHead>
                            <TableHead>Mô tả (Description)</TableHead>
                            <TableHead className="w-[150px]">
                                <div className="flex items-center">
                                    Sản phẩm (Product)
                                    <Button variant="ghost" size="sm" className="ml-1 p-0">
                                        <Filter className="h-3 w-3" />
                                    </Button>
                                </div>
                            </TableHead>
                            <TableHead className="w-[150px]">Công thức (Recipes)</TableHead>
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
                                    </TableRow>
                                ))
                        ) : productSizes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Không có kích cỡ sản phẩm nào. Hãy thêm kích cỡ mới.
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentItems.map((size) => (
                                <TableRow key={size.id}>
                                    <TableCell className="font-medium">{size.id}</TableCell>
                                    <TableCell>{size.name}</TableCell>
                                    <TableCell>{size.diameter} cm</TableCell>
                                    <TableCell>{size.description || "-"}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto"
                                            onClick={() => onFilterByProduct(size.productId)}
                                        >
                                            {size.productId}
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        {size.recipes ? (
                                            <Badge>{Array.isArray(size.recipes) ? `${size.recipes.length} công thức` : '1 công thức'}</Badge>
                                        ) : (
                                            <Badge variant="outline">Không có</Badge>
                                        )}
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
                            <Select
                                value={itemsPerPage.toString()}
                                onValueChange={handleItemsPerPageChange}
                            >
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
        </div>
    )
}
