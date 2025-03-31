"use client"

import type React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationControlsProps {
    currentPage: number
    totalPages: number
    startIndex: number
    endIndex: number
    totalCount: number
    goToPage: (page: number) => void
    searchQuery?: string
    categoryId?: string
    getCategoryName?: (categoryId: string) => string
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalCount,
    goToPage,
    searchQuery,
    categoryId,
    getCategoryName,
}) => {
    return (
        <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
                Hiển thị {startIndex}-{Math.min(endIndex, totalCount)} của {totalCount} món ăn
                {searchQuery && ` phù hợp với "${searchQuery}"`}
                {categoryId && getCategoryName && ` trong danh mục ${getCategoryName(categoryId)}`}
            </div>

            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                >
                    <ChevronsLeft className="h-4 w-4" />
                    <span className="sr-only">Trang đầu</span>
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Trang trước</span>
                </Button>

                <span className="text-sm">
                    Trang <strong>{currentPage}</strong> / {totalPages}
                </span>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Trang sau</span>
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronsRight className="h-4 w-4" />
                    <span className="sr-only">Trang cuối</span>
                </Button>
            </div>
        </div>
    )
}

export default PaginationControls

