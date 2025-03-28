import type React from "react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
    searchQuery: string
    hasFilters: boolean
    clearAllFilters: () => void
}

const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery, hasFilters, clearAllFilters }) => {
    return (
        <div className="col-span-full text-center py-44">
            <p className="text-muted-foreground text-lg">
                {searchQuery
                    ? `Không tìm thấy món ăn nào có tên "${searchQuery}"`
                    : "Không tìm thấy món ăn nào phù hợp với bộ lọc"}
            </p>
            {hasFilters && (

                <Button variant="green" onClick={clearAllFilters} className="mt-4" >
                    Đặt lại tất cả bộ lọc
                </Button>
            )}
        </div>
    )
}

export default EmptyState

