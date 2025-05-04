"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import OrderService from "@/services/order-service"
import type { Order } from "@/types/order"
import { toast } from "sonner"
import { getStatusOrderBadge } from "@/pages/Orders/components/StatusBadge"
import { useNavigate } from "react-router-dom"

// Type for simplified order data to display in the UI
interface OrderDisplayData {
    id: string
    orderCode: string
    tableCode: string
    totalPrice: number
    status: string
    endTime: string
}

export default function RecentOrders() {
    const [orders, setOrders] = useState<OrderDisplayData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const navigation = useNavigate()
    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        setIsLoading(true)
        try {
            const orderService = OrderService.getInstance()
            const response = await orderService.getAllOrders()

            if (response.success && response.result) {

                // Transform and simplify the order data for display
                const displayData: OrderDisplayData[] = response.result.items
                    .map((order: Order) => {
                        return {
                            id: order.id,
                            orderCode: order.orderCode || `#${order.id.substring(0, 4)}`,
                            tableCode: order.tableCode || "N/A",
                            totalPrice: order.totalPrice,
                            status: order.status,
                            endTime: order.endTime ? new Date(order.endTime).toLocaleDateString("vi-VN") : "N/A",
                        }
                    })
                    // Sort by date (newest first)
                    .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
                    // Take only the most recent 6
                    .slice(0, 6)

                setOrders(displayData)
            } else {
                toast.error("Không thể tải dữ liệu đơn hàng")
            }
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu đơn hàng:", error)
            toast.error("Không thể tải dữ liệu đơn hàng")
        } finally {
            setIsLoading(false)
        }
    }

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(value)
    }




    return (
        <Card className="h-full border-muted/60">
            <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-base">Đơn hàng gần đây</CardTitle>

                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                        onClick={fetchOrders}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        <span className="sr-only">Làm mới</span>
                    </Button>

                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-xs font-medium p-2">Mã đơn</TableHead>
                            <TableHead className="text-xs font-medium p-2">Bàn</TableHead>
                            <TableHead className="text-xs font-medium p-2 text-center">Trạng thái</TableHead>
                            <TableHead className="text-xs font-medium p-2 text-center">Giá trị</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <div className="flex justify-center items-center h-full">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <p className="text-muted-foreground">Không có đơn hàng nào</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id} className="hover:bg-muted/5">
                                    <TableCell className="text-xs p-2 font-medium">
                                        {order.orderCode}
                                        <div className="text-[10px] text-muted-foreground">{order.endTime}</div>
                                    </TableCell>
                                    <TableCell className="text-xs p-2">{order.tableCode || order.tableCode}</TableCell>
                                    <TableCell className="text-xs p-2">
                                        <div className="flex flex-col gap-1">
                                            {getStatusOrderBadge(order.status)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs p-2 text-right font-medium">
                                        {formatCurrency(order.totalPrice)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <div className="p-2 border-t text-center">
                    <Button variant="ghost" size="sm" className="text-xs h-7 w-full hover:bg-amber-50 text-amber-700"
                        onClick={() => navigation("/orders")}

                    >
                        Xem tất cả đơn hàng
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
