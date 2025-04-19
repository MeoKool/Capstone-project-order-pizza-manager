"use client"

import { Card, CardContent } from "@/components/ui/card"
import type TableResponse from "@/types/tables"
import { getStatusIcon } from "@/utils/table-utils"
import { Users, Phone, Calendar, Clock, User, Star, MapPin, Table } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import { useEffect, useState } from "react"
import TableService from "@/services/table-service"
import { Reservation } from "@/types/reservation"
import { TableTimer } from "../table-timer"

interface TableStatusCardProps {
    table: TableResponse
    isTimerRunning: boolean
    onTimeUp: () => void
    reservation?: Reservation
}

export function TableStatusCard({ table, isTimerRunning, onTimeUp }: TableStatusCardProps) {
    const reservationData = table.currentReservation
    const [tableCodesMap, setTableCodesMap] = useState<Record<string, string>>({})

    // Fetch table codes for all tables in tableAssignReservations
    useEffect(() => {
        async function fetchTableCodes() {
            if (!reservationData?.tableAssignReservations?.length) return

            try {
                const tableService = TableService.getInstance()
                const tableIds = reservationData.tableAssignReservations.map((t) => t.tableId).filter(Boolean) as string[]

                // Create a map to store tableId -> tableCode
                const codesMap: Record<string, string> = {}

                // Fetch each table individually to get its code
                for (const tableId of tableIds) {
                    if (tableId === table.id) {
                        // We already have the current table's code
                        codesMap[tableId] = table.code
                    } else {
                        try {
                            const response = await tableService.getTableById(tableId)
                            if (response.success && response.result) {
                                codesMap[tableId] = response.result.code
                            }
                        } catch (error) {
                            console.error(`Error fetching table ${tableId}:`, error)
                        }
                    }
                }

                setTableCodesMap(codesMap)
            } catch (error) {
                console.error("Error fetching table codes:", error)
            }
        }

        fetchTableCodes()
    }, [reservationData, table.id, table.code])

    // Format phone number for display (e.g., 0912345678 -> 0912 345 678)
    const formatPhoneNumber = (phone: string) => {
        if (!phone) return ""
        return phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3")
    }

    // Format date time for display
    const formatDateTime = (dateTimeString: string) => {
        if (!dateTimeString) return ""
        const date = new Date(dateTimeString)
        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date)
    }

    // Get table code by tableId
    const getTableCode = (tableId: string) => {
        if (tableId === table.id) return table.code
        return tableCodesMap[tableId] || `Bàn ${tableId.slice(-4)}`
    }

    const getStatusInfo = () => {
        switch (table.status) {
            case "Closing":
                return {
                    title: "Thông tin bàn đang đóng",
                    content: (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center gap-2 bg-gray-50 p-2 rounded-md">
                                <span className="text-xs sm:text-sm text-gray-600">Trạng thái:</span>
                                <span className="text-xs sm:text-sm font-medium text-gray-800">Bàn đã đóng</span>
                            </div>
                            <div className="flex justify-between items-center gap-2 bg-gray-50 p-2 rounded-md">
                                <span className="text-xs sm:text-sm text-gray-600">Thời gian đóng:</span>
                                <span className="text-xs sm:text-sm font-medium text-gray-800">
                                    {new Date().toLocaleString("vi-VN")}
                                </span>
                            </div>
                        </div>
                    ),
                }
            case "Reserved":
                return {
                    title: "Thông tin đặt bàn trước",
                    content: (
                        <div className="space-y-3">
                            {reservationData ? (
                                <>

                                    {/* Customer Information Section */}
                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User className="h-4 w-4 text-blue-600" />
                                            <h4 className="font-medium text-blue-800 text-sm">Thông tin khách hàng</h4>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="h-3.5 w-3.5 text-blue-500" />
                                                    <span className="text-xs sm:text-sm text-blue-700">Khách hàng:</span>
                                                </div>
                                                <span className="text-xs sm:text-sm font-medium text-blue-800">
                                                    {reservationData.customerName || "N/A"}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="h-3.5 w-3.5 text-blue-500" />
                                                    <span className="text-xs sm:text-sm text-blue-700">Số điện thoại:</span>
                                                </div>
                                                <span className="text-xs sm:text-sm font-medium text-blue-800">
                                                    {formatPhoneNumber(reservationData.phoneNumber || "")}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="h-3.5 w-3.5 text-blue-500" />
                                                    <span className="text-xs sm:text-sm text-blue-700">Số người:</span>
                                                </div>
                                                <span className="text-xs sm:text-sm font-medium text-blue-800">
                                                    {reservationData.numberOfPeople} người
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                                    <span className="text-xs sm:text-sm text-blue-700">Thời gian đặt:</span>
                                                </div>
                                                <span className="text-xs sm:text-sm font-medium text-blue-800">
                                                    {formatDateTime(reservationData.bookingTime)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <Star className="h-3.5 w-3.5 text-blue-500" />
                                                    <span className="text-xs sm:text-sm text-blue-700">Ưu tiên:</span>
                                                </div>
                                                <Badge
                                                    className={`text-xs ${reservationData.reservationPriorityStatus === "Priority"
                                                        ? "bg-amber-100 text-amber-700 border-amber-300"
                                                        : "bg-gray-100 text-gray-700 border-gray-300"
                                                        }`}
                                                >
                                                    {reservationData.reservationPriorityStatus === "Priority" ? "Ưu tiên" : "Thường"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tables Information Section */}
                                    {reservationData.tableAssignReservations && reservationData.tableAssignReservations.length > 0 && (
                                        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Table className="h-4 w-4 text-emerald-600" />
                                                <h4 className="font-medium text-emerald-800 text-sm">Bàn đã đặt</h4>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                {reservationData.tableAssignReservations.map((tableAssign, index) => (
                                                    <div
                                                        key={tableAssign.tableId || index}
                                                        className={`flex items-center justify-center p-2 rounded-md border ${tableAssign.tableId === table.id
                                                            ? "bg-emerald-200 border-emerald-300 text-emerald-800"
                                                            : "bg-emerald-100 border-emerald-200 text-emerald-700"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="h-3 w-3" />
                                                            <span className="text-xs font-medium">
                                                                {getTableCode(tableAssign.tableId)}
                                                                {tableAssign.tableId === table.id && " (Hiện tại)"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Timer Section */}
                                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4 text-amber-600" />
                                                <span className="text-sm font-medium text-amber-800">Thời gian còn lại:</span>
                                            </div>
                                            <div className="font-medium text-amber-800 text-sm bg-white px-3 py-1 rounded-md border border-amber-200">
                                                <TableTimer
                                                    tableId={table.id}
                                                    status={table.status}
                                                    bookingTime={reservationData.bookingTime}
                                                    isRunning={isTimerRunning}
                                                    onTimeUp={onTimeUp}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-center">
                                        <span className="text-sm text-blue-700 font-medium">Không có thông tin đặt bàn</span>
                                    </div>
                                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4 text-amber-600" />
                                                <span className="text-sm font-medium text-amber-800">Thời gian còn lại:</span>
                                            </div>
                                            <div className="font-medium text-amber-800 text-sm bg-white px-3 py-1 rounded-md border border-amber-200">
                                                <TableTimer
                                                    tableId={table.id}
                                                    status={table.status}
                                                    isRunning={isTimerRunning}
                                                    onTimeUp={onTimeUp}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ),
                }
            case "Locked":
                return {
                    title: "Thông tin bảo trì",
                    content: (
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-amber-700 font-medium">Bàn đang trong trạng thái bảo trì</span>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                                <span className="text-xs sm:text-sm text-amber-600">Ghi chú: {table.note}</span>
                            </div>
                        </div>
                    ),
                }
            default:
                return null
        }
    }

    const statusInfo = getStatusInfo()

    if (!statusInfo) return null

    return (
        <Card className="border-amber-100 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-2 border-b border-amber-200">
                <div className="flex items-center gap-2">
                    {getStatusIcon(table.status)}
                    <h3 className="font-medium text-amber-900 text-sm">{statusInfo.title}</h3>
                </div>
            </div>
            <CardContent className="p-3 sm:p-4">{statusInfo.content}</CardContent>
        </Card>
    )
}
