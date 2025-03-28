import type React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ActiveFiltersProps {
    searchQuery: string
    categoryId: string
    sortBy: string
    getCategoryName: (categoryId: string) => string
    clearSearch: () => void
    clearFilter: () => void
    clearAllFilters: () => void
    getSortLabel: (option: string) => string
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
    searchQuery,
    categoryId,
    sortBy,
    getCategoryName,
    clearSearch,
    clearFilter,
    clearAllFilters,
    getSortLabel,
}) => {
    if (!searchQuery && !categoryId) {
        return (
            <Badge variant="secondary" className="flex items-center gap-1 h-9 w-52 text-sm">
                Sắp xếp: {getSortLabel(sortBy)}
            </Badge>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1 h-9 w-52 text-sm">
                Sắp xếp: {getSortLabel(sortBy)}
            </Badge>
            {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1 h-9 text-sm">
                    Tìm kiếm: {searchQuery}
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={clearSearch}>
                        <X className="h-3 w-3" />
                        <span className="sr-only">Xóa tìm kiếm</span>
                    </Button>
                </Badge>
            )}
            {categoryId && (
                <Badge variant="secondary" className="flex items-center gap-1  h-9 text-sm">
                    Danh mục: {getCategoryName(categoryId)}
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={clearFilter}>
                        <X className="h-3 w-3" />
                        <span className="sr-only">Xóa bộ lọc</span>
                    </Button>
                </Badge>
            )}
            <Button variant="outline" size="sm" onClick={clearAllFilters} className="text-sm h-9">
                Xóa tất cả bộ lọc
            </Button>

        </div>
    )
}

export default ActiveFilters

