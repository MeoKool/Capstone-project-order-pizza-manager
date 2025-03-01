import useTable from '@/hooks/useTable'
import { TableStatus } from '@/types/tables'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/ui/search-bar'
import { Filter, Plus } from 'lucide-react'
import React, { useState } from 'react'
import { TableFilters } from './components/table-filters'
import { TableList } from './components/table-list'

const TableManagement: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [activeFilter, setActiveFilter] = useState<TableStatus | "all">("all")
    const [showFilters, setShowFilters] = useState(false)

    const { tables } = useTable()

    console.log(tables);
    const filteredTables = tables.filter((table) => {
        const matchesSearch =
            table.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            table.zoneId.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = activeFilter === "all" || table.status === activeFilter

        return matchesSearch && matchesFilter
    })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <SearchBar placeholder="Tìm kiếm bàn, khu vực..." value={searchQuery} onChange={setSearchQuery} />
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="h-8 px-2 lg:px-3" onClick={() => setShowFilters(!showFilters)}>
                        <Filter className="h-4 w-4" />
                    </Button>
                    {/* <PrintAllQRCodes tables={tables} /> */}
                    <Button size="sm" className="h-8">
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm bàn mới
                    </Button>
                </div>
            </div>

            {showFilters && <TableFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />}

            <TableList tables={filteredTables} />
        </div>)
}

export default TableManagement