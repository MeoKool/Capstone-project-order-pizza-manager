"use client"

import { useState, useEffect } from "react"
import { DollarSign, ShoppingBag, Utensils, Users } from "lucide-react"
import StatCard from "./stat-card"
import OrderService from "@/services/order-service"
import type { Order } from "@/types/order"
import { toast } from "sonner"

export default function StatCards() {
    const [isLoading, setIsLoading] = useState(true)
    const [todayRevenue, setTodayRevenue] = useState(0)
    const [yesterdayRevenue, setYesterdayRevenue] = useState(0)
    const [activeOrders, setActiveOrders] = useState(0)
    const [newOrdersLastHour, setNewOrdersLastHour] = useState(0)
    const [tablesInUse, setTablesInUse] = useState(0)
    const [totalTables,] = useState(20) // Default value, could be fetched from a service
    const [customersToday, setCustomersToday] = useState(0)
    const [customersYesterday, setCustomersYesterday] = useState(0)

    useEffect(() => {
        fetchOrderData()
    }, [])

    const fetchOrderData = async () => {
        setIsLoading(true)
        try {
            const svc = OrderService.getInstance()
            const res = await svc.getAllOrders()

            if (res.success && Array.isArray(res.result.items)) {
                processOrderData(res.result.items)
            } else {
                throw new Error("Invalid data")
            }
        } catch (err) {
            console.error("Error fetching order data:", err)
            toast.error("Không thể tải dữ liệu đơn hàng")
        } finally {
            setIsLoading(false)
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

        const activeOrdersList = orders.filter((order) => order.status === "Unpaid")

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

        // Count unique tables in use
        const tablesInUseSet = new Set(activeOrdersList.filter((order) => order.tableId).map((order) => order.tableId))

        // Estimate customers (assuming average 2.5 customers per order)
        const estimatedCustomersToday = Math.round(todayOrders.length * 2.5)
        const estimatedCustomersYesterday = Math.round(yesterdayOrders.length * 2.5)

        // Update state
        setTodayRevenue(todayTotalRevenue)
        setYesterdayRevenue(yesterdayTotalRevenue)
        setActiveOrders(activeOrdersList.length)
        setNewOrdersLastHour(newOrdersInLastHour.length)
        setTablesInUse(tablesInUseSet.size)
        setCustomersToday(estimatedCustomersToday)
        setCustomersYesterday(estimatedCustomersYesterday)
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                description={isLoading ? "Đang tính toán..." : `${Math.round((tablesInUse / totalTables) * 100)}% công suất`}
                icon={<Utensils className="h-4 w-4 text-amber-600" />}
                trend="neutral"
                isLoading={isLoading}
            />
            <StatCard
                title="Khách hàng hôm nay"
                value={isLoading ? "Đang tải..." : customersToday.toString()}
                description={
                    isLoading
                        ? "Đang tính toán..."
                        : `${customersToday - customersYesterday > 0 ? "+" : ""}${customersToday - customersYesterday} khách so với hôm qua`
                }
                icon={<Users className="h-4 w-4 text-purple-600" />}
                trend={isLoading ? "neutral" : determineTrend(customersToday, customersYesterday)}
                isLoading={isLoading}
            />
        </div>
    )
}
