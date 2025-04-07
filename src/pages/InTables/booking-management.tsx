"use client"

// Xóa các import không cần thiết
import type React from "react"

import { useState, useEffect } from "react"
import { RefreshCw, ArrowUpDown, X, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

import BookingService from "@/services/booking-service"
import type { Reservation } from "@/types/reservation"
import { BookingTable } from "./components/Booking/BookingTable"
import { ViewBookingDialog } from "./components/Booking/ViewBookingDialog"
import { AssignTableDialog } from "./components/Booking/AssignTableDialog"

type SortOption =
    | "newest"
    | "oldest"
    | "name-asc"
    | "name-desc"
    | "people-asc"
    | "people-desc"
    | "status-asc"
    | "status-desc"
// Cập nhật type StatusFilter để chỉ bao gồm 4 trạng thái
type StatusFilter = "all" | "Created" | "Confirmed" | "Checkedin" | "Cancelled"

function BookingPage() {
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const bookingService = BookingService.getInstance()

    // Dialog states - keep only view dialog
    const [viewingReservation, setViewingReservation] = useState<Reservation | null>(null)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

    // Thêm state và hàm xử lý cho AssignTableDialog
    const [assigningReservation, setAssigningReservation] = useState<Reservation | null>(null)
    const [isAssignTableDialogOpen, setIsAssignTableDialogOpen] = useState(false)

    // Sorting and filtering
    const [sortOption, setSortOption] = useState<SortOption>("newest")
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
    const [dateFilter, setDateFilter] = useState<string>("")

    const fetchReservations = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await bookingService.getAllReservations()
            if (response.success && response.result) {
                // Check if items is an array, if not convert it to an array
                const reservationsData = Array.isArray(response.result.items) ? response.result.items : [response.result.items]
                setReservations(reservationsData)
                console.log("Fetched reservations:", reservationsData)
            } else {
                console.error("Failed to fetch reservations:", response)
                setError("Không thể tải danh sách đặt bàn")
            }
        } catch (error) {
            console.error("Error fetching reservations:", error)
            setError("Không thể tải danh sách đặt bàn")
        } finally {
            setIsLoading(false)
        }
    }

    // Cập nhật hàm getStatusSortValue để chỉ bao gồm 4 trạng thái
    const getStatusSortValue = (status: string): number => {
        switch (status) {
            case "Created":
                return 1
            case "Confirmed":
                return 2
            case "Checkedin":
                return 3
            case "Cancelled":
                return 4
            default:
                return 99 // Các trạng thái không xác định sẽ được xếp cuối
        }
    }

    // Cập nhật phần useEffect để sử dụng hàm getStatusSortValue
    useEffect(() => {
        let result = [...reservations]

        // Apply status filter
        if (statusFilter !== "all") {
            result = result.filter((reservation) => reservation.status.toLowerCase() === statusFilter.toLowerCase())
        }

        // Apply date filter
        if (dateFilter) {
            const filterDate = new Date(dateFilter)
            result = result.filter((reservation) => {
                const bookingDate = new Date(reservation.bookingTime)
                return (
                    bookingDate.getFullYear() === filterDate.getFullYear() &&
                    bookingDate.getMonth() === filterDate.getMonth() &&
                    bookingDate.getDate() === filterDate.getDate()
                )
            })
        }

        // Apply search filter
        if (searchTerm) {
            result = result.filter(
                (reservation) =>
                    reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    reservation.phoneNumber.includes(searchTerm),
            )
        }

        // Update the sorting options to use bookingTime instead of bookingDate
        switch (sortOption) {
            case "newest":
                result.sort((a, b) => new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime())
                break
            case "oldest":
                result.sort((a, b) => new Date(a.bookingTime).getTime() - new Date(b.bookingTime).getTime())
                break
            case "name-asc":
                result.sort((a, b) => a.customerName.localeCompare(b.customerName))
                break
            case "name-desc":
                result.sort((a, b) => b.customerName.localeCompare(a.customerName))
                break
            case "people-asc":
                result.sort((a, b) => a.numberOfPeople - b.numberOfPeople)
                break
            case "people-desc":
                result.sort((a, b) => b.numberOfPeople - a.numberOfPeople)
                break
            case "status-asc":
                result.sort((a, b) => getStatusSortValue(a.status) - getStatusSortValue(b.status))
                break
            case "status-desc":
                result.sort((a, b) => getStatusSortValue(b.status) - getStatusSortValue(a.status))
                break
        }

        setFilteredReservations(result)
    }, [reservations, searchTerm, sortOption, statusFilter, dateFilter])

    useEffect(() => {
        fetchReservations()
    }, [])

    // Cập nhật hàm getSortLabel để thêm nhãn cho các tùy chọn sắp xếp theo trạng thái
    const getSortLabel = (option: SortOption): string => {
        switch (option) {
            case "newest":
                return "Mới nhất"
            case "oldest":
                return "Cũ nhất"
            case "name-asc":
                return "Tên: A-Z"
            case "name-desc":
                return "Tên: Z-A"
            case "people-asc":
                return "Số người: Tăng dần"
            case "people-desc":
                return "Số người: Giảm dần"
            case "status-asc":
                return "Trạng thái: Tăng dần"
            case "status-desc":
                return "Trạng thái: Giảm dần"
        }
    }

    // Update the getStatusLabel function to only include the 4 specific statuses
    const getStatusLabel = (status: string): string => {
        switch (status) {
            case "Created":
                return "Đã tạo"
            case "Confirmed":
                return "Đã xác nhận"
            case "Checkedin":
                return "Đã check-in"
            case "Cancelled":
                return "Đã hủy"
            default:
                return status
        }
    }

    // Update the getStatusColor function to only include the 4 specific statuses
    const getStatusColor = (status: string): string => {
        switch (status) {
            case "Created":
                return "bg-gray-100 text-gray-800"
            case "Confirmed":
                return "bg-blue-100 text-blue-800"
            case "Checkedin":
                return "bg-green-100 text-green-800"
            case "Cancelled":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    const clearSearch = () => {
        setSearchTerm("")
    }

    const clearFilters = () => {
        setSearchTerm("")
        setStatusFilter("all")
        setDateFilter("")
        setSortOption("newest")
    }

    const handleViewReservation = (reservation: Reservation) => {
        setViewingReservation(reservation)
        setIsViewDialogOpen(true)
    }

    // Cập nhật hàm handleAssignTable
    const handleAssignTable = (reservation: Reservation) => {
        setAssigningReservation(reservation)
        setIsAssignTableDialogOpen(true)
    }

    // Update the formatDateString function to handle the API date format
    const formatDateString = (dateStr: string): string => {
        try {
            // Handle the API date format or input date format
            const date = new Date(dateStr)
            if (isNaN(date.getTime())) return "N/A"

            const day = date.getDate().toString().padStart(2, "0")
            const month = (date.getMonth() + 1).toString().padStart(2, "0")
            const year = date.getFullYear()

            return `${day}/${month}/${year}`
        } catch (error) {
            console.error("Error formatting date string:", error, "for input:", dateStr)
            return "N/A"
        }
    }

    return (
        <div className="mx-auto py-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Quản lý đặt bàn</CardTitle>
                        <CardDescription>Quản lý thông tin đặt bàn và lịch hẹn của khách hàng.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Tìm kiếm theo tên hoặc SĐT..."
                                className="w-64"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            {searchTerm && (
                                <button className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={clearSearch}>
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            )}
                        </div>

                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                            <SelectTrigger className="w-[150px]">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    <SelectValue placeholder="Trạng thái">
                                        {statusFilter === "all" ? "Tất cả trạng thái" : getStatusLabel(statusFilter)}
                                    </SelectValue>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="Created">Đã tạo</SelectItem>
                                <SelectItem value="Confirmed">Đã xác nhận</SelectItem>
                                <SelectItem value="Checkedin">Đã check-in</SelectItem>
                                <SelectItem value="Cancelled">Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="relative">
                            <Input
                                type="date"
                                className="w-[180px]"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            />
                            {dateFilter && (
                                <button
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    onClick={() => setDateFilter("")}
                                >
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            )}
                        </div>

                        <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                            <SelectTrigger className="w-[180px]">
                                <div className="flex items-center gap-2">
                                    <ArrowUpDown className="h-4 w-4" />
                                    <SelectValue placeholder="Sắp xếp">{getSortLabel(sortOption)}</SelectValue>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Mới nhất</SelectItem>
                                <SelectItem value="oldest">Cũ nhất</SelectItem>
                                <SelectItem value="name-asc">Tên: A-Z</SelectItem>
                                <SelectItem value="name-desc">Tên: Z-A</SelectItem>
                                <SelectItem value="people-asc">Số người: Tăng dần</SelectItem>
                                <SelectItem value="people-desc">Số người: Giảm dần</SelectItem>
                                <SelectItem value="status-asc">Trạng thái: Tăng dần</SelectItem>
                                <SelectItem value="status-desc">Trạng thái: Giảm dần</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" onClick={fetchReservations} disabled={isLoading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                            Làm mới
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {(searchTerm || statusFilter !== "all" || dateFilter || sortOption !== "newest") && (
                        <div className="flex items-center gap-2 mb-4">
                            {searchTerm && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    Tìm kiếm: {searchTerm}
                                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={clearSearch}>
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">Xóa tìm kiếm</span>
                                    </Button>
                                </Badge>
                            )}

                            {statusFilter !== "all" && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    Trạng thái: {getStatusLabel(statusFilter)}
                                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => setStatusFilter("all")}>
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">Xóa bộ lọc</span>
                                    </Button>
                                </Badge>
                            )}

                            {dateFilter && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    Ngày: {formatDateString(dateFilter)}
                                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => setDateFilter("")}>
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">Xóa bộ lọc</span>
                                    </Button>
                                </Badge>
                            )}

                            {sortOption !== "newest" && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                    Sắp xếp: {getSortLabel(sortOption)}
                                </Badge>
                            )}

                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                Xóa tất cả bộ lọc
                            </Button>
                        </div>
                    )}

                    <BookingTable
                        reservations={filteredReservations}
                        isLoading={isLoading}
                        getStatusLabel={getStatusLabel}
                        getStatusColor={getStatusColor}
                        onView={handleViewReservation}
                        onRefresh={fetchReservations}
                        onAssignTable={handleAssignTable}
                    />
                </CardContent>
            </Card>

            {viewingReservation && (
                <ViewBookingDialog
                    reservation={viewingReservation}
                    open={isViewDialogOpen}
                    onOpenChange={setIsViewDialogOpen}
                />
            )}

            {assigningReservation && (
                // Cập nhật cách gọi AssignTableDialog
                <AssignTableDialog
                    reservation={assigningReservation}
                    open={isAssignTableDialogOpen}
                    onClose={() => {
                        setIsAssignTableDialogOpen(false)
                        setAssigningReservation(null)
                        fetchReservations()
                    }}
                />
            )}
        </div>
    )
}

export default BookingPage

