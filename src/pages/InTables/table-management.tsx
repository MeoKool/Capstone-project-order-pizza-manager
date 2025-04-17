import useTable from '@/hooks/useTable'
import type { TableStatus } from '@/types/tables'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/ui/search-bar'
import { Plus, RefreshCw, Coffee, MapPin } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import { TableFilters } from './components/table-filters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TableAddDialog } from './components/table-add-dialog'
import useZone from '@/hooks/useZone'
import { connection } from '@/lib/signalr-client'
import { TableList } from './components/tables/table-list'

const TableManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<TableStatus | 'all'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [activeZone, setActiveZone] = useState<string | 'all'>('all')

  const { tables, loading, fetchAllTables } = useTable()
  const { zones_, fetchZones } = useZone()

  const filteredTables = tables.filter((table) => {
    const matchesSearch =
      table.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.zoneId.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = activeFilter === 'all' || table.status === activeFilter

    const matchesZone = activeZone === 'all' || table.zoneId === activeZone

    return matchesSearch && matchesFilter && matchesZone
  })

  const handleCreateTable = () => {
    setShowAddDialog(true)
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchAllTables(), fetchZones()])
    } finally {
      setIsLoading(false)
    }
  }

  const handleTableUpdated = () => {
    // Refresh the table list after a table is updated
    fetchAllTables()
  }
  // ------------------
  // Auto refresh khi nhận được sự kiện từ SIGNALR
  // ------------------
  useEffect(() => {
    const handleNewOrder = () => {
      fetchAllTables()
    }

    connection.on('OrderItemUpdatedStatus', handleNewOrder)
    return () => {
      connection.off('OrderItemUpdatedStatus', handleNewOrder)
    }
  }, [])
  const tableStatusCounts = {
    all: tables.length,
    Opening: tables.filter((t) => t.status === 'Opening').length,
    Locked: tables.filter((t) => t.status === 'Locked').length,
    Reserved: tables.filter((t) => t.status === 'Reserved').length,
    Closing: tables.filter((t) => t.status === 'Closing').length
  }

  return (
    <Card className='border-amber-100 shadow-sm'>
      <CardHeader className='pb-2 sm:pb-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
          <div>
            <CardTitle className='text-amber-800 flex items-center gap-2 text-base sm:text-lg'>
              <Coffee className='h-4 w-4 sm:h-5 sm:w-5 text-amber-600' />
              Quản lý bàn ăn
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>Quản lý tất cả các bàn trong nhà hàng</CardDescription>
          </div>
          <div className='flex items-center gap-2 self-end sm:self-auto'>
            <Badge variant='outline' className='text-xs sm:text-sm bg-white border-amber-200 text-amber-700'>
              Tổng số: {tables.length} bàn
            </Badge>
            <Button
              variant='outline'
              size='icon'
              className='h-7 w-7 sm:h-8 sm:w-8 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800'
              onClick={handleRefresh}
              disabled={isLoading || loading}
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isLoading || loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-3 sm:space-y-4 p-2 sm:p-4 md:p-6'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4'>
          <SearchBar placeholder='Tìm kiếm bàn, khu vực...' value={searchQuery} onChange={setSearchQuery} />
          <Button
            onClick={handleCreateTable}
            size='sm'
            className='h-8 sm:h-9 w-full sm:w-auto text-xs sm:text-sm bg-amber-600 hover:bg-amber-700 text-white'
          >
            <Plus className='mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4' />
            Thêm bàn mới
          </Button>
        </div>

        <div className='overflow-x-auto -mx-2 px-2'>
          <TableFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} counts={tableStatusCounts} />
        </div>

        <div className='overflow-x-auto -mx-2 px-2 mt-3'>
          <Card className='p-1.5 sm:p-3 flex flex-nowrap gap-1 sm:gap-2 border-amber-100 overflow-x-auto min-w-[500px]'>
            <Button
              variant={activeZone === 'all' ? 'default' : 'outline'}
              size='sm'
              className={`whitespace-nowrap text-xs sm:text-sm py-1.5 sm:py-3 px-2 sm:px-3 ${activeZone === 'all'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'border-amber-200 text-amber-800 hover:bg-amber-50'
                }`}
              onClick={() => setActiveZone('all')}
            >
              <Coffee className='mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4' />
              Tất cả khu vực
            </Button>

            {zones_.map((zone) => (
              <Button
                key={zone.id}
                variant={activeZone === zone.id ? 'default' : 'outline'}
                size='sm'
                className={`whitespace-nowrap text-xs sm:text-sm py-1.5 sm:py-3 px-2 sm:px-3 ${activeZone === zone.id
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'border-amber-200 text-amber-800 hover:bg-amber-50'
                  }`}
                onClick={() => setActiveZone(zone.id)}
              >
                <MapPin className='mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                {zone.name}
              </Button>
            ))}
          </Card>
        </div>

        <TableList tables={filteredTables} onTableUpdated={handleTableUpdated} />
        {filteredTables.length === 0 && searchQuery.length > 0 && (
          <div className='text-center py-6 sm:py-10 bg-amber-50 rounded-lg border border-amber-100'>
            <div className='flex flex-col items-center'>
              <Coffee className='h-8 w-8 sm:h-12 sm:w-12 text-amber-300 mb-2 sm:mb-3' />
              <p className='text-amber-800 font-medium text-sm sm:text-base'>
                Không tìm thấy bàn nào phù hợp với bộ lọc
              </p>
              <Button
                variant='link'
                onClick={() => {
                  setActiveFilter('all')
                  setActiveZone('all')
                  setSearchQuery('')
                }}
                className='text-amber-600 hover:text-amber-800 mt-1 sm:mt-2 text-xs sm:text-sm'
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        )}

        <TableAddDialog open={showAddDialog} onOpenChange={setShowAddDialog} onTableAdded={handleTableUpdated} />
      </CardContent>
    </Card>
  )
}

export default TableManagement
