"use client"

import { useState, useEffect, useRef } from "react"
import { DollarSign, ShoppingBag, Utensils } from "lucide-react"
import StatCard from "./stat-card"
import OrderService from "@/services/order-service"
import type { Order } from "@/types/order"
import { toast } from "sonner"
import TableResponse from "@/types/tables"

// Define the TableService interface based on the provided information
interface TableService {
    getAllTables: () => Promise<{
        success: boolean
        result: {
            items: TableResponse[]
            totalCount: number
        }
    }>
}

export default function StatCards() {
    const [isLoading, setIsLoading] = useState(true)
    const [todayRevenue, setTodayRevenue] = useState(0)
    const [yesterdayRevenue, setYesterdayRevenue] = useState(0)
    const [activeOrders, setActiveOrders] = useState(0)
    const [newOrdersLastHour, setNewOrdersLastHour] = useState(0)
    const [tablesInUse, setTablesInUse] = useState(0)
    const [totalTables, setTotalTables] = useState(0)


    // Reference to the TableService
    const tableServiceRef = useRef<TableService | null>(null)

    useEffect(() => {
        // Import the TableService dynamically to avoid issues with SSR
        import("@/services/table-service").then((module) => {
            tableServiceRef.current = module.default.getInstance()
            fetchData()
        })
    }, [])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            await Promise.all([fetchOrderData(), fetchTableData()])
        } catch (err) {
            console.error("Error fetching data:", err)
            toast.error("Không thể tải dữ liệu")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchTableData = async () => {
        try {
            if (!tableServiceRef.current) {
                console.error("TableService not initialized")
                return
            }

            const response = await tableServiceRef.current.getAllTables()

            if (response.success && Array.isArray(response.result.items)) {
                const tables = response.result.items
                const openTables = tables.filter((table) => table.status === "Opening")

                setTotalTables(tables.length)
                setTablesInUse(openTables.length)
            } else {
                throw new Error("Invalid table data")
            }
        } catch (err) {
            console.error("Error fetching table data:", err)
            toast.error("Không thể tải dữ liệu bàn")
        }
    }

    const fetchOrderData = async () => {
        try {
            const svc = OrderService.getInstance()
            const res = await svc.getAllOrders()

            if (res.success && Array.isArray(res.result.items)) {
                processOrderData(res.result.items)
            } else {
                throw new Error("Invalid order data")
            }
        } catch (err) {
            console.error("Error fetching order data:", err)
            toast.error("Không thể tải dữ liệu đơn hàng")
        }
    }

    const processOrderData = (orders: Order[]) => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const oneHourAgo = new Date(now)
        oneHourAgo.setHours(now.getHours() - 1)

        // Filter orders for different time periods
        const todayOrders = orders.filter((order) => {
            const orderDate = order.endTime ? new Date(order.endTime) : null
            return orderDate && orderDate >= today && orderDate < now
        })

        const yesterdayOrders = orders.filter((order) => {
            const orderDate = order.endTime ? new Date(order.endTime) : null
            return orderDate && orderDate >= yesterday && orderDate < today
        })

        const activeOrdersList = orders.filter((order) => order.status === "Unpaid" || order.status === "CheckedOut")

        const newOrdersInLastHour = orders.filter((order) => {
            const orderDate = order.endTime ? new Date(order.endTime) : null
            return orderDate && orderDate >= oneHourAgo && orderDate >= today && orderDate < now
        })

        // Calculate statistics
        const todayTotalRevenue = todayOrders
            .filter((order) => order.status === "Paid")
            .reduce((sum, order) => sum + order.totalPrice, 0)

        const yesterdayTotalRevenue = yesterdayOrders
            .filter((order) => order.status === "Paid")
            .reduce((sum, order) => sum + order.totalPrice, 0)


        // Update state
        setTodayRevenue(todayTotalRevenue)
        setYesterdayRevenue(yesterdayTotalRevenue)
        setActiveOrders(activeOrdersList.length)
        setNewOrdersLastHour(newOrdersInLastHour.length)

    }

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(value)
    }

    // Calculate percentage change
    const calculatePercentChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return Math.round(((current - previous) / previous) * 100)
    }

    // Determine trend
    const determineTrend = (current: number, previous: number) => {
        if (current === previous) return "neutral"
        return current > previous ? "up" : "down"
    }

    return (
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
            <StatCard
                title="Tổng doanh thu hôm nay"
                value={isLoading ? "Đang tải..." : formatCurrency(todayRevenue)}
                description={
                    isLoading ? "Đang tính toán..." : `${calculatePercentChange(todayRevenue, yesterdayRevenue)}% so với hôm qua`
                }
                icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
                trend={isLoading ? "neutral" : determineTrend(todayRevenue, yesterdayRevenue)}
                isLoading={isLoading}
            />
            <StatCard
                title="Đơn hàng đang phục vụ"
                value={isLoading ? "Đang tải..." : activeOrders.toString()}
                description={isLoading ? "Đang tính toán..." : `${newOrdersLastHour} đơn mới trong giờ qua`}
                icon={<ShoppingBag className="h-4 w-4 text-blue-600" />}
                trend="neutral"
                isLoading={isLoading}
            />
            <StatCard
                title="Bàn đang sử dụng"
                value={isLoading ? "Đang tải..." : `${tablesInUse}/${totalTables}`}
                description={
                    isLoading ? "Đang tính toán..." : `${Math.round((tablesInUse / totalTables) * 100 || 0)}% công suất`
                }
                icon={<Utensils className="h-4 w-4 text-amber-600" />}
                trend="neutral"
                isLoading={isLoading}
            />

        </div>
    )
}
