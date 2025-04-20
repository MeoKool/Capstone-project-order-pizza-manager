"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Phone, User, MapPin } from "lucide-react"
import type { Reservation } from "@/types/reservation"
import { useState, useEffect } from "react"
import TableService from "@/services/table-service"
import { getStatusColor, getStatusLabel } from "@/utils/table-utils"

interface ViewBookingDialogProps {
  reservation: Reservation
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewBookingDialog({ reservation, open, onOpenChange }: ViewBookingDialogProps) {
  // State to store table codes
  const [tableCodes, setTableCodes] = useState<Record<string, string>>({})
  const [loadingTables, setLoadingTables] = useState<boolean>(false)

  // Fetch table codes when the dialog opens
  useEffect(() => {
    if (open && reservation.tableAssignReservations && reservation.tableAssignReservations.length > 0) {
      fetchTableCodes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reservation])

  // Function to fetch table codes
  const fetchTableCodes = async () => {
    if (!reservation.tableAssignReservations || reservation.tableAssignReservations.length === 0) return

    setLoadingTables(true)
    const tableService = TableService.getInstance()
    const newTableCodes: Record<string, string> = {}

    try {
      // Create an array of promises for all table fetches
      const promises = reservation.tableAssignReservations.map(async (tableAssign) => {
        if (!tableAssign.tableId) return

        try {
          const response = await tableService.getTableById(tableAssign.tableId)
          if (response.success && response.result) {
            newTableCodes[tableAssign.tableId] = response.result.code || `Bàn ${tableAssign.tableId.substring(0, 4)}`
          }
        } catch (error) {
          console.error(`Error fetching table ${tableAssign.tableId}:`, error)
        }
      })

      // Wait for all promises to resolve
      await Promise.all(promises)
      setTableCodes(newTableCodes)
    } catch (error) {
      console.error("Error fetching table codes:", error)
    } finally {
      setLoadingTables(false)
    }
  }

  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr)

      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateTimeStr)
        return {
          date: "N/A",
          time: "N/A",
          fullDateTime: "N/A",
        }
      }

      // Format date as dd/MM/yyyy
      const day = date.getDate().toString().padStart(2, "0")
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const year = date.getFullYear()
      const formattedDate = `${day}/${month}/${year}`

      // Format time as HH:mm
      const hours = date.getHours().toString().padStart(2, "0")
      const minutes = date.getMinutes().toString().padStart(2, "0")
      const formattedTime = `${hours}:${minutes}`

      // Get day of week in Vietnamese
      const daysOfWeek = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]
      const dayOfWeek = daysOfWeek[date.getDay()]

      // Format full date time
      const fullDateTime = `${formattedTime} - ${dayOfWeek}, ${formattedDate}`

      return { date: formattedDate, time: formattedTime, fullDateTime }
    } catch (error) {
      console.error("Error formatting date:", error, "for input:", dateTimeStr)
      return {
        date: "N/A",
        time: "N/A",
        fullDateTime: "N/A",
      }
    }
  }

  const { fullDateTime } = formatDateTime(reservation.bookingTime)


  // Check if the reservation has tables assigned
  const hasTablesAssigned = reservation.tableAssignReservations && reservation.tableAssignReservations.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chi tiết đặt bàn</DialogTitle>
          <DialogDescription>Thông tin chi tiết về lịch đặt bàn.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Customer information section with more prominence */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-semibold text-blue-800">Khách hàng: {reservation.customerName}</h3>
              </div>

              <Badge variant="outline" className={getStatusColor(reservation.status)}>
                <div className="text-center w-24">{getStatusLabel(reservation.status)}</div>
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-blue-700"> Số điện thoại: {reservation.phoneNumber}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Thời gian đặt bàn</p>
                <p className="text-sm">{fullDateTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Số lượng khách</p>
                <p className="text-sm">{reservation.numberOfPeople} người</p>
              </div>
            </div>



            {/* Table information section */}
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Thông tin bàn</p>
                {hasTablesAssigned ? (
                  <div className="mt-1">
                    {loadingTables ? (
                      <p className="text-sm text-muted-foreground">Đang tải thông tin bàn...</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {reservation.tableAssignReservations.map((tableAssign, index) => (
                          <Badge
                            key={tableAssign.tableId || index}
                            variant="outline"
                            className="bg-orange-50 text-orange-700 border-orange-200"
                          >
                            {tableAssign.tableId && tableCodes[tableAssign.tableId]
                              ? tableCodes[tableAssign.tableId]
                              : `Bàn ${tableAssign.tableId?.substring(0, 4) || index + 1}`}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Tổng số bàn: {reservation.tableAssignReservations.length}
                    </p>
                  </div>
                ) : reservation.status === "Cancelled" ? (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 mt-1">
                    Đã hủy
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 mt-1">
                    Chưa xếp bàn
                  </Badge>
                )}
              </div>
            </div>
          </div>


        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
