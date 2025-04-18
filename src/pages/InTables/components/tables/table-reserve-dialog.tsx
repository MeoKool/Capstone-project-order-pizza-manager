
import { useState, useEffect } from "react"
import { Clock, Users, Calendar, Check, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import type TableResponse from "@/types/tables"
import BookingService from "@/services/booking-service"
import { Reservation } from "@/types/reservation"

interface TableReserveDialogProps {
    table: TableResponse
    open: boolean
    onOpenChange: (open: boolean) => void
    isLoading?: boolean
}

export function TableReserveDialog({ table, open, onOpenChange, isLoading = false }: TableReserveDialogProps) {
    // State for existing reservations
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [loadingReservations, setLoadingReservations] = useState<boolean>(false)
    const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null)
    const [assigningTable, setAssigningTable] = useState<boolean>(false)
    const [timeWindow,] = useState<"30min" | "60min">("60min")

    // Reset state and fetch reservations when dialog opens
    useEffect(() => {
        if (open) {
            setSelectedReservationId(null)
            setSearchQuery("")
            // Fetch existing reservations
            fetchReservations()
        }
    }, [open, timeWindow])

    // Filter reservations when search query changes
    useEffect(() => {
        if (reservations.length > 0) {
            const filtered = reservations.filter(
                (reservation) =>
                    reservation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    reservation.phoneNumber.includes(searchQuery),
            )
            setFilteredReservations(filtered)
        }
    }, [searchQuery, reservations])

    const fetchReservations = async () => {
        setLoadingReservations(true)
        try {
            const bookingService = BookingService.getInstance()
            const response = await bookingService.getAllReservations()

            if (response.success && response.result) {
                // Handle both array and single item responses
                const items = Array.isArray(response.result.items) ? response.result.items : [response.result.items]

                // Get current time
                const now = new Date()

                // Calculate the time window end (either 30 or 60 minutes from now)
                const timeWindowMinutes = timeWindow === "30min" ? 30 : 60
                const timeWindowEnd = new Date(now.getTime() + timeWindowMinutes * 60000)

                // Filter reservations based on criteria:
                // 1. Status is "Confirmed"
                // 2. No table assigned yet
                // 3. Booking time is within the specified time window from now
                const availableReservations = items.filter((reservation) => {
                    // Check if status is "Confirmed"
                    if (reservation.status !== "Confirmed") return false

                    // Check if no table is assigned
                    if (reservation.tableId && reservation.tableId !== "") return false

                    // Check if booking time is within the time window
                    const bookingTime = new Date(reservation.bookingTime)
                    return bookingTime >= now && bookingTime <= timeWindowEnd
                })

                // Sort by booking time (closest first)
                availableReservations.sort((a, b) => {
                    return new Date(a.bookingTime).getTime() - new Date(b.bookingTime).getTime()
                })

                setReservations(availableReservations)
                setFilteredReservations(availableReservations)
            }
        } catch (error) {
            console.error("Error fetching reservations:", error)
        } finally {
            setLoadingReservations(false)
        }
    }

    const handleAssignTable = async () => {
        if (!selectedReservationId) return

        setAssigningTable(true)
        try {
            const bookingService = BookingService.getInstance()
            const response = await bookingService.assignTableToReservation(selectedReservationId, table.id)

            if (response.success) {
                // Close the dialog when done
                onOpenChange(false)
            }
        } catch (error) {
            console.error("Error assigning table to reservation:", error)
        } finally {
            setAssigningTable(false)
        }
    }

    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString)
        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date)
    }

    // Calculate time remaining until reservation
    const getTimeRemaining = (bookingTime: string) => {
        const now = new Date()
        const reservationTime = new Date(bookingTime)
        const diffMs = reservationTime.getTime() - now.getTime()

        // Convert to minutes
        const diffMinutes = Math.floor(diffMs / 60000)

        if (diffMinutes < 60) {
            return `${diffMinutes} phút nữa`
        } else {
            const hours = Math.floor(diffMinutes / 60)
            const minutes = diffMinutes % 60
            return `${hours} giờ ${minutes > 0 ? `${minutes} phút` : ""} nữa`
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <span>Gán bàn {table.code} cho đặt trước</span>
                    </DialogTitle>
                    <DialogDescription>Chọn đặt bàn đã xác nhận sắp đến để gán cho bàn này.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">


                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-blue-500" />
                        <Input
                            placeholder="Tìm kiếm theo tên hoặc số điện thoại"
                            className="pl-8 border-blue-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <ScrollArea className="h-[300px] rounded-md border border-blue-100 p-2">
                        {loadingReservations ? (
                            <div className="space-y-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center space-x-2 p-2">
                                        <Skeleton className="h-4 w-4 rounded-full" />
                                        <div className="space-y-1 flex-1">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-3 w-3/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredReservations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                                <Calendar className="h-10 w-10 text-blue-300 mb-2" />
                                <p className="text-sm text-blue-800 font-medium">Không tìm thấy đặt bàn</p>
                                <p className="text-xs text-blue-600">
                                    Không có đặt bàn nào đã xác nhận trong 30 phút tới
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredReservations.map((reservation) => (
                                    <div
                                        key={reservation.id}
                                        className={`p-2 rounded-md cursor-pointer transition-colors ${selectedReservationId === reservation.id
                                            ? "bg-blue-100 border border-blue-300"
                                            : "hover:bg-blue-50 border border-transparent"
                                            }`}
                                        onClick={() => setSelectedReservationId(reservation.id)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium text-sm text-blue-800">{reservation.customerName}</p>
                                                <p className="text-xs text-blue-600">{reservation.phoneNumber}</p>
                                                <div className="mt-1 text-xs text-emerald-600 font-medium">
                                                    {getTimeRemaining(reservation.bookingTime)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-medium text-blue-700">{formatDateTime(reservation.bookingTime)}</p>
                                                <div className="flex items-center mt-1 justify-end">
                                                    <Users className="h-3 w-3 text-blue-500 mr-1" />
                                                    <span className="text-xs text-blue-600">{reservation.numberOfPeople} người</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-blue-200 text-blue-700"
                    >
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={!selectedReservationId || assigningTable || isLoading}
                        onClick={handleAssignTable}
                    >
                        {assigningTable || isLoading ? (
                            "Đang xử lý..."
                        ) : (
                            <>
                                <Check className="mr-1 h-4 w-4" />
                                Gán bàn
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
