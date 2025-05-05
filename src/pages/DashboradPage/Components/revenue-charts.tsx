"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import CategoryService from "@/services/category-service"
import OrderService from "@/services/order-service"
import type { Order } from "@/types/order"
import { toast } from "sonner"

// Category color mapping
const CATEGORY_COLORS: Record<string, string> = {
  "Món chính": "#6366f1",
  "Đồ uống": "#10b981",
  "Tráng miệng": "#f59e0b",
  "Khai vị": "#ef4444",
  "Món ăn nhẹ": "#8b5cf6",
  "Món đặc biệt": "#ec4899",
  Combo: "#14b8a6",
  "Món chay": "#84cc16",
  "Hải sản": "#06b6d4",
  Lẩu: "#f43f5e",
}
const FALLBACK_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#84cc16", "#ec4899", "#bcdb30"]

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

// Get a color for a category
const getCategoryColor = (categoryName: string, index: number): string => {
  return CATEGORY_COLORS[categoryName] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

// Get week number in month (custom Vietnamese format)
const getWeekNumberInMonth = (date: Date): number => {
  const day = date.getDate()

  if (day <= 4) return 1
  if (day <= 11) return 2
  if (day <= 18) return 3
  if (day <= 25) return 4
  return 5
}

// Get date range for a given week (custom Vietnamese format)
const getWeekDateRange = (year: number, month: number, week: number) => {
  let startDay, endDay

  switch (week) {
    case 1:
      startDay = 1
      endDay = 4
      break
    case 2:
      startDay = 5
      endDay = 11
      break
    case 3:
      startDay = 12
      endDay = 18
      break
    case 4:
      startDay = 19
      endDay = 25
      break
    case 5:
      startDay = 26
      endDay = 31 // This will be adjusted if the month has fewer days
      break
    default:
      startDay = 1
      endDay = 7
  }

  const startOfWeek = new Date(year, month, startDay)
  const endOfWeek = new Date(year, month, endDay)

  // Adjust if end date exceeds month boundary
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
  if (endDay > lastDayOfMonth) {
    endOfWeek.setDate(lastDayOfMonth)
  }

  return { start: startOfWeek, end: endOfWeek }
}

// Format date as DD/MM
const formatDateShort = (date: Date) => date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })

export default function RevenueCharts() {
  const [activeTab, setActiveTab] = useState("daily")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categoryData, setCategoryData] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dailyData, setDailyData] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [year, setYear] = useState<string>(() => "2025")

  useEffect(() => {
    console.log("Fetching revenue for year", year)
    fetchRevenueData()
  }, [year])

  useEffect(() => {
    if (activeTab === "category") fetchCategories()
  }, [activeTab])

  // Fetch all orders and process
  const fetchRevenueData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const svc = OrderService.getInstance()
      const res = await svc.getAllOrders()
      console.log("API response:", res)
      if (res.success && Array.isArray(res.result.items)) {
        const paid = res.result.items.filter((o: Order) => o.status === "Paid" && o.endTime)
        console.log("Paid orders:", paid)
        processRevenueData(paid, Number.parseInt(year))
      } else {
        throw new Error("Invalid data")
      }
    } catch (err) {
      console.error(err)
      setError("Không thể tải dữ liệu doanh thu")
      toast.error("Không thể tải dữ liệu doanh thu")
    } finally {
      setIsLoading(false)
    }
  }

  // Process daily, weekly, monthly
  const processRevenueData = (orders: Order[], selectedYear: number) => {
    try {
      const monthNames = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`)
      const dailyMap = new Map<string, number>()
      const weeklyMap = new Map<string, number>()
      const monthlyMap = new Map<string, number>()

      // Initialize maps
      monthNames.forEach((m) => monthlyMap.set(m, 0))
      monthNames.forEach((m, mi) => {
        for (let w = 1; w <= 5; w++) {
          const { start, end } = getWeekDateRange(selectedYear, mi, w)
          const key = `${m} - Tuần ${w} (${formatDateShort(start)} - ${formatDateShort(end)})`
          weeklyMap.set(key, 0)
        }
      })
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      const tenDaysAgo = new Date(now)
      tenDaysAgo.setDate(now.getDate() - 9)
      for (let i = 0; i < 10; i++) {
        const d = new Date(tenDaysAgo)
        d.setDate(tenDaysAgo.getDate() + i)
        dailyMap.set(d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }), 0)
      }

      // Accumulate
      orders.forEach((o) => {
        const od = new Date(o.endTime!)
        if (isNaN(od.getTime()) || od.getFullYear() !== selectedYear) return
        const dayKey = od.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
        dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + o.totalPrice)
        const mn = monthNames[od.getMonth()]
        monthlyMap.set(mn, (monthlyMap.get(mn) || 0) + o.totalPrice)
        const wn = getWeekNumberInMonth(od)
        const wkKey = `${mn} - Tuần ${wn} (${formatDateShort(
          getWeekDateRange(selectedYear, od.getMonth(), wn).start,
        )} - ${formatDateShort(getWeekDateRange(selectedYear, od.getMonth(), wn).end)})`
        weeklyMap.set(wkKey, (weeklyMap.get(wkKey) || 0) + o.totalPrice)
      })

      setDailyData(Array.from(dailyMap, ([name, value]) => ({ name, value })))
      setWeeklyData(Array.from(weeklyMap, ([name, value]) => ({ name, value })).filter((i) => i.value > 0))
      setMonthlyData(Array.from(monthlyMap, ([name, value]) => ({ name, value })))
    } catch (err) {
      console.error("Error processing data", err)
      setError("Lỗi xử lý dữ liệu doanh thu")
      toast.error("Lỗi xử lý dữ liệu doanh thu")
    }
  }

  // Fetch categories for pie
  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const svc = CategoryService.getInstance()
      const res = await svc.getAllCategories()
      if (res.success && res.result.items.length) {
        const data = res.result.items.map((c) => ({
          name: c.name,
          value: Math.round(Math.random() * 45 + 5),
          id: c.id,
        }))
        const sum = data.reduce((a, b) => a + b.value, 0)
        setCategoryData(data.map((d) => ({ ...d, value: Math.round((d.value / sum) * 100) })))
      } else {
        setCategoryData([
          { name: "Món chính", value: 35, id: "1" },
          { name: "Đồ uống", value: 25, id: "2" },
        ])
      }
    } catch (err) {
      console.error(err)
      setError("Failed to load category data")
      toast.error("Failed to load category data")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Card className="lg:col-span-2 border-muted/60">
      <CardHeader className="px-4 py-3 border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-base">Biểu đồ doanh thu</CardTitle>
            <CardDescription className="text-xs">Phân tích doanh thu theo thời gian và danh mục</CardDescription>
          </div>
          <select
            className="text-xs border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="2025">Năm 2025</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="daily" onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 h-9">
            <TabsTrigger value="daily" className="text-xs">
              Theo ngày
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs">
              Theo tuần
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">
              Theo tháng
            </TabsTrigger>
            <TabsTrigger value="category" className="text-xs">
              Theo danh mục
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="h-[280px] mt-0">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            ) : dailyData.length === 0 || dailyData.every((item) => item.value === 0) ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Không có dữ liệu doanh thu cho năm {year}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(value) => `${value / 1000000}M`} tick={{ fontSize: 10 }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Doanh thu"]}
                    contentStyle={{ borderRadius: "6px", fontSize: "12px", border: "1px solid #e5e7eb" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: "#6366f1", r: 4 }}
                    activeDot={{ r: 6, fill: "#4f46e5" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="weekly" className="h-[280px] mt-0">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            ) : weeklyData.length === 0 || weeklyData.every((item) => item.value === 0) ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Không có dữ liệu doanh thu cho năm {year}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-45} textAnchor="end" height={70} />
                  <YAxis tickFormatter={(value) => `${value / 1000000}M`} tick={{ fontSize: 10 }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Doanh thu"]}
                    contentStyle={{ borderRadius: "6px", fontSize: "12px", border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="monthly" className="h-[280px] mt-0">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            ) : monthlyData.length === 0 || monthlyData.every((item) => item.value === 0) ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Không có dữ liệu doanh thu cho năm {year}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(value) => `${value / 1000000}M`} tick={{ fontSize: 10 }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Doanh thu"]}
                    contentStyle={{ borderRadius: "6px", fontSize: "12px", border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="category" className="h-[300px] mt-0">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            ) : categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Không có dữ liệu danh mục</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${entry.id || index}`} fill={getCategoryColor(entry.name, index)} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Tỷ lệ"]}
                    contentStyle={{ borderRadius: "6px", fontSize: "12px", border: "1px solid #e5e7eb" }}
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
