"use client"

import useZone from "@/hooks/useZone"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/ui/search-bar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, MoreHorizontal, Plus, RefreshCw, MapPin } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { AddZoneDialog } from "./components/add-zone-dialog"
import { toast } from "sonner"
import type { ZoneResponse } from "@/types/zone"
import { EditZoneDialog } from "./components/zone/edit-zone-dialog"


// Function to convert zone type to user-friendly display name
const getZoneTypeDisplayName = (type: string): string => {
  switch (type) {
    case "DininingArea":
      return "Khu vực ăn uống"
    case "KitchenArea":
      return "Khu vực bếp"
    case "WorkshopArea":
      return "Khu vực workshop"
    default:
      return type
  }
}

const ZoneManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedZone, setSelectedZone] = useState<ZoneResponse | null>(null)
  const [zones, setZones] = useState<ZoneResponse[]>([])

  const { zones_, fetchZones } = useZone()

  const filteredZones = zones.filter(
    (zone) =>
      zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const fetchZoneData = async () => {
    setIsLoading(true)
    try {
      await fetchZones()
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu khu vực:", error)
      toast.error("Không thể tải dữ liệu khu vực")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchZoneData()
  }

  const handleZoneAdded = () => {
    // Gọi API để lấy danh sách khu vực mới nhất
    fetchZoneData()
  }

  const handleZoneUpdated = () => {
    // Gọi API để lấy danh sách khu vực mới nhất
    fetchZoneData()
    setShowEditDialog(false)
    setSelectedZone(null)
  }

  const openEditDialog = (zone: ZoneResponse) => {
    setSelectedZone(zone)
    setShowEditDialog(true)
  }

  useEffect(() => {
    setZones(zones_)
  }, [zones_])

  useEffect(() => {
    // Tải dữ liệu khu vực khi component được mount
    fetchZoneData()
  }, [])
  return (
    <Card className="border-amber-100 shadow-sm">
      <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-600" />
              Quản lý khu vực
            </CardTitle>
            <CardDescription>Quản lý các khu vực trong nhà hàng</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm bg-white border-amber-200 text-amber-700">
              Tổng số: {zones.length} khu vực
            </Badge>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <SearchBar placeholder="Tìm kiếm khu vực..." value={searchQuery} onChange={setSearchQuery} />
          <Button
            className="h-9 w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm khu vực mới
          </Button>
        </div>

        <div className="rounded-md border border-amber-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-amber-50">
              <TableRow>
                <TableHead className="w-[30%] text-amber-800">Tên khu vực</TableHead>
                <TableHead className="w-[30%] text-amber-800">Mô tả</TableHead>
                <TableHead className="w-[15%] text-amber-800">Loại khu vực</TableHead>
                <TableHead className="w-[10%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredZones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-6">
                      <MapPin className="h-8 w-8 text-amber-300 mb-2" />
                      <p className="text-amber-800 font-medium">Không tìm thấy khu vực nào</p>
                      {searchQuery && (
                        <Button
                          variant="link"
                          onClick={() => setSearchQuery("")}
                          className="text-amber-600 hover:text-amber-800 mt-1"
                        >
                          Xóa tìm kiếm
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredZones.map((zone) => (
                  <TableRow key={zone.id} className="hover:bg-amber-50">
                    <TableCell className="font-medium text-amber-900">{zone.name}</TableCell>
                    <TableCell className="text-gray-600">{zone.description}</TableCell>
                    {/* Display user-friendly zone type name instead of raw value */}
                    <TableCell>{getZoneTypeDisplayName(zone.type)}</TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-700 hover:bg-amber-100">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Tùy chọn</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-amber-200">
                          <DropdownMenuItem
                            className="flex items-center cursor-pointer hover:bg-amber-50"
                            onClick={() => openEditDialog(zone)}
                          >
                            <Edit className="mr-2 h-4 w-4 text-amber-600" />
                            Chỉnh sửa
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
      </CardContent>

      <AddZoneDialog open={showAddDialog} onOpenChange={setShowAddDialog} onZoneAdded={handleZoneAdded} />

      {selectedZone && (
        <EditZoneDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onZoneUpdated={handleZoneUpdated}
          zone={selectedZone}
        />
      )}


    </Card>
  )
}

export default ZoneManagement
