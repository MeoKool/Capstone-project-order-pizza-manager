"use client"

import { useState, useEffect } from "react"
import { Users, MapPin, Clock, Utensils, ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getStatusBadge, getStatusIcon } from "@/utils/table-utils"
import { getZoneName } from "@/utils/zone-utils"
import { TableTimer } from "./table-timer"
import { Card, CardContent } from "@/components/ui/card"
import useZone from "@/hooks/useZone"
import type TableResponse from "@/types/tables"
import type { OrderItem } from "@/types/order"
import OrderService from "@/services/order-service"

interface TableDetailsDialogProps {
  table: TableResponse
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TableDetailsDialog({ table, open, onOpenChange }: TableDetailsDialogProps) {
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { zones_ } = useZone()

  // Fetch order items when the dialog opens and currentOrderId exists
  useEffect(() => {
    const fetchOrderItems = async () => {
      if (!table.currentOrderId || !open) return

      setIsLoading(true)
      setError(null)

      try {
        const orderService = OrderService.getInstance()
        const response = await orderService.getOrderById(table.currentOrderId)
        if (response.success && response.result) {
          setOrderItems(response.result.items)
        } else {
          setError(response.message || "Không thể tải thông tin món ăn")
        }
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải thông tin món ăn")
        console.error("Error fetching order items:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderItems()
  }, [table.currentOrderId, open])

  const handleOpenTable = () => {
    return () => {
      console.log(`Mở bàn ${table.id}`)
    }
  }

  const handleCloseTable = () => {
    return () => {
      console.log(`Khóa bàn ${table.id}`)
    }
  }

  // Function to get action buttons based on table status
  const getActionButtons = (table: TableResponse) => {
    switch (table.status) {
      case "Closing":
        return (
          <>
            <Button
              onClick={handleOpenTable()}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm py-1 h-7 sm:h-9"
            >
              Mở bàn
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm py-1 h-7 sm:h-9"
            >
              Đặt trước
            </Button>
          </>
        )
      case "Opening":
        return (
          <>
            <Button
              variant="destructive"
              onClick={handleCloseTable()}
              className="flex-1 text-xs sm:text-sm py-1 h-7 sm:h-9"
            >
              Khóa bàn
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50 text-xs sm:text-sm py-1 h-7 sm:h-9"
            >
              Bảo trì
            </Button>
          </>
        )
      case "Reserved":
        return (
          <>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm py-1 h-7 sm:h-9">
              Xác nhận
            </Button>
            <Button variant="destructive" className="flex-1 text-xs sm:text-sm py-1 h-7 sm:h-9">
              Hủy đặt
            </Button>
          </>
        )
      case "Locked":
        return (
          <Button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm py-1 h-7 sm:h-9">
            Mở khóa
          </Button>
        )
      default:
        return null
    }
  }

  const handleTimeUp = () => {
    setIsTimerRunning(false)
    console.log(`Hết thời gian cho bàn ${table.id}`)
  }

  const getStatusInfo = () => {
    switch (table.status) {
      case "Closing":
        return {
          title: "Thông tin bàn đang đóng",
          content: (
            <div className="space-y-2">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Trạng thái:</span>
                <span className="text-xs sm:text-sm font-medium">Bàn đã đóng</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Thời gian đóng:</span>
                <span className="text-xs sm:text-sm font-medium">{new Date().toLocaleString("vi-VN")}</span>
              </div>
            </div>
          ),
        }
      case "Reserved":
        return {
          title: "Thông tin đặt trước",
          content: (
            <div className="space-y-2">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Khách hàng:</span>
                <span className="text-xs sm:text-sm font-medium">{table.id}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Thời gian còn lại:</span>
                <TableTimer
                  tableId={table.id}
                  status={table.status}
                  isRunning={isTimerRunning}
                  onTimeUp={handleTimeUp}
                />
              </div>
            </div>
          ),
        }
      case "Locked":
        return {
          title: "Thông tin bảo trì",
          content: (
            <div className="space-y-2">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Ghi chú:</span>
                <span className="text-xs sm:text-sm font-medium">{table.code}</span>
              </div>
            </div>
          ),
        }
      default:
        return null
    }
  }

  const statusInfo = getStatusInfo()

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  // Get order item status badge
  const getOrderItemStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-xs">Chờ</Badge>
      case "Serving":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">Đang phục vụ</Badge>
      case "Done":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-xs">Hoàn thành</Badge>
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] border-amber-200 max-w-[95vw] p-4 sm:p-6">
        <DialogHeader className="bg-gradient-to-r from-amber-50 to-orange-50 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 rounded-t-lg border-b border-amber-100">
          <DialogTitle className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="bg-amber-600 p-1 sm:p-1.5 rounded-md">
                <Utensils className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <div className="text-base sm:text-xl text-amber-800">{table.code}</div>
              {table.code && (
                <Badge variant="outline" className="border-amber-500 text-amber-500 bg-amber-50 text-xs">
                  VIP
                </Badge>
              )}
            </div>
            <div className="ml-auto">{getStatusBadge(table.status)}</div>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Chi tiết thông tin bàn ăn</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          <Card className="border-amber-100">
            <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-[20px_1fr] sm:grid-cols-[24px_1fr] items-start gap-2 sm:gap-3">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900 text-xs sm:text-sm">Sức chứa</p>
                  <p className="text-xs sm:text-sm text-amber-700">{table.capacity} người</p>
                </div>
              </div>

              <div className="grid grid-cols-[20px_1fr] sm:grid-cols-[24px_1fr] items-start gap-2 sm:gap-3">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900 text-xs sm:text-sm">Vị trí</p>
                  <p className="text-xs sm:text-sm text-amber-700">{getZoneName(table.zoneId, zones_)}</p>
                </div>
              </div>

              <div className="grid grid-cols-[20px_1fr] sm:grid-cols-[24px_1fr] items-start gap-2 sm:gap-3">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900 text-xs sm:text-sm">Cập nhật lần cuối</p>
                  <p className="text-xs sm:text-sm text-amber-700">{new Date().toLocaleString("vi-VN")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {statusInfo && (
            <Card className="border-amber-100">
              <CardContent className="p-3 sm:p-4">
                <div className="items-start gap-2 sm:gap-3">
                  {getStatusIcon(table.status)}
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="font-medium text-amber-900 text-xs sm:text-sm">{statusInfo.title}</h3>
                    {statusInfo.content}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Items Section */}
          {table.currentOrderId && (
            <Card className="border-amber-100">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                  <h3 className="font-medium text-amber-900 text-xs sm:text-sm">Món ăn đã gọi</h3>
                </div>

                {isLoading ? (
                  <div className="text-center py-3">
                    <p className="text-xs sm:text-sm text-amber-700">Đang tải...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-3">
                    <p className="text-xs sm:text-sm text-red-500">{error}</p>
                  </div>
                ) : orderItems.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-xs sm:text-sm text-amber-700">Chưa có món ăn nào được gọi</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="border border-amber-100 rounded-md p-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-amber-900 text-xs sm:text-sm">{item.name}</p>
                            <p className="text-xs text-amber-700">
                              {item.quantity} x {formatCurrency(item.price)}
                            </p>
                            {item.note && <p className="text-xs italic text-amber-600 mt-1">Ghi chú: {item.note}</p>}
                          </div>
                          <div className="flex flex-col items-end">
                            <p className="font-medium text-amber-900 text-xs sm:text-sm">
                              {formatCurrency(item.totalPrice)}
                            </p>
                            <div className="mt-1">{getOrderItemStatusBadge(item.orderItemStatus)}</div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Total */}
                    <div className="flex justify-between items-center border-t border-amber-100 pt-2 mt-3">
                      <p className="font-medium text-amber-900 text-xs sm:text-sm">Tổng cộng</p>
                      <p className="font-bold text-amber-900 text-sm sm:text-base">
                        {formatCurrency(orderItems.reduce((sum, item) => sum + item.totalPrice, 0))}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-1 sm:gap-2 mt-2 sm:mt-0">
          <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">{getActionButtons(table)}</div>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto border-amber-200 text-amber-700 hover:bg-amber-50 text-xs sm:text-sm py-1 h-7 sm:h-9"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
