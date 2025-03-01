import { TableStatus } from "@/types/tables"
import { Button } from "@/components/ui/button"

interface TableFiltersProps {
    activeFilter: TableStatus | "all"
    onFilterChange: (filter: TableStatus | "all") => void
}

export function TableFilters({ activeFilter, onFilterChange }: TableFiltersProps) {
    const filters = [
        { value: "all", label: "Tất cả" },
        { value: "Opening", label: "Trống" },
        { value: "Locked", label: "Đã khóa" },
        { value: "Booked", label: "Đã đặt trước" },
        { value: "Closed", label: "Bảo trì" },
    ]

    return (
        <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
                <Button
                    key={filter.value}
                    variant={activeFilter === filter.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => onFilterChange(filter.value as TableStatus | "all")}
                >
                    {filter.label}
                </Button>
            ))}
        </div>
    )
}

