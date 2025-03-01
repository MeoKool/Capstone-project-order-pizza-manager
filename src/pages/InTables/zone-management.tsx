import useZone from '@/hooks/useZone'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/ui/search-bar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus } from 'lucide-react'
import React, { useState } from 'react'

const ZoneManagement: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const { zones_ } = useZone()
    const filteredZones = zones_.filter(
        (zone) =>
            zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            zone.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <SearchBar placeholder="Tìm kiếm khu vực..." value={searchQuery} onChange={setSearchQuery} />
                <Button className="h-8">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm khu vực mới
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead >Tên khu vực</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead className="text-right">Số lượng bàn</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredZones.map((zone) => (
                        <TableRow key={zone.id}>
                            <TableCell className="font-medium">{zone.name}</TableCell>
                            <TableCell>{zone.description}</TableCell>
                            <TableCell className="text-right">{zone.capacity}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default ZoneManagement