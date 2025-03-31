"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CategoryModel } from "@/types/category"
import { Edit, Trash2 } from "lucide-react"

interface CategoryTableProps {
    categories: CategoryModel[]
    isLoading: boolean
    onEdit: (category: CategoryModel) => void
    onDelete: (category: CategoryModel) => void
}

export function CategoryTable({ categories, isLoading, onEdit, onDelete }: CategoryTableProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Calculate pagination values
    const totalItems = categories.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
    const currentItems = categories.slice(startIndex, endIndex)

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
        <div className="w-full">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="ml-4">Tên (Loại)</TableHead>
                            <TableHead>Mô tả (Description)</TableHead>
                            <TableHead className="w-[140px] text-center">Thao tác</TableHead>
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
                                            <Skeleton className="h-5 w-full" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-5 w-20 ml-auto" />
                                        </TableCell>
                                    </TableRow>
                                ))
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Không có danh mục nào. Hãy thêm danh mục mới.
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentItems.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>{category.description || "-"}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-around">
                                            <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">Edit {category.name}</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive"
                                                onClick={() => onDelete(category)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete {category.name}</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {!isLoading && categories.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Hiển thị {startIndex + 1}-{endIndex} của {totalItems} danh mục
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
        </div>
    )
}

