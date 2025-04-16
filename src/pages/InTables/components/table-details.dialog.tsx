"use client"

import { useState, useEffect } from "react"
import { Users, MapPin, Clock, Utensils, ShoppingBag, Receipt, CreditCard, CalendarClock, Loader2, CheckCircle } from "lucide-react"
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
import { Card, CardContent } from "@/components/ui/card"
import type TableResponse from "@/types/tables"
import type { OrderDetail } from "@/types/order"
import OrderService from "@/services/order-service"
import useZone from "@/hooks/useZone"
import { TableTimer } from "./table-timer"
import { getZoneName } from "@/utils/zone-utils"
import { getStatusBadge, getStatusIcon } from "@/utils/table-utils"
import { toast } from "sonner"
interface TableDetailsDialogProps {
  table: TableResponse
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TableDetailsDialog({ table, open, onOpenChange }: TableDetailsDialogProps) {
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { zones_ } = useZone()
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)


  // Fetch order items when the dialog opens and currentOrderId exists
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!table.currentOrderId || !open) return

      setIsLoading(true)
      setError(null)

      try {
        const orderService = OrderService.getInstance()
        const response = await orderService.getOrderById(table.currentOrderId)

        if (response.success && response.result) {
          setOrderDetail(response.result)
          // Set orderItems from the orderDetail for backward compatibility
        } else {
          setOrderDetail(null)
          setError(response.message || "Không thể tải thông tin đơn hàng")
        }
      } catch (err) {
        setOrderDetail(null)
        setError("Đã xảy ra lỗi khi tải thông tin đơn hàng")
        console.error("Error fetching order details:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [table.currentOrderId, open])

  // Function to handle order checkout
  const handleCheckOut = async () => {
    if (!orderDetail || !table.currentOrderId) return

    setIsCheckingOut(true)
    try {
      const orderService = OrderService.getInstance()
      const response = await orderService.checkOutOrder(table.currentOrderId)

      if (response.success) {
        toast.success("Đã checkout đơn hàng thành công")

        // Refresh order details to show updated status
        const updatedResponse = await orderService.getOrderById(table.currentOrderId)
        if (updatedResponse.success && updatedResponse.result) {
          setOrderDetail(updatedResponse.result)
        }
      } else {
        toast.error(response.message || "Không thể checkout đơn hàng")
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi checkout đơn hàng")
      console.error("Error checking out order:", err)
    } finally {
      setIsCheckingOut(false)
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
        return (
          <Badge className="bg-amber-100 hover:bg-amber-300 border-amber-500 text-xs px-1">
            <div className="text-amber-600 text-center w-[98px] py-0.4">Đang chờ</div>
          </Badge>
        )
      case "Cancelled":
        return (
          <Badge className="bg-red-100 hover:bg-red-300 border-red-500 text-xs px-1">
            <div className="text-red-600 text-center w-[98px] py-0.4">Đã hủy</div>
          </Badge>
        )
      case "Serving":
        return (
          <Badge className="bg-blue-100 hover:bg-blue-300 border-blue-500 text-xs px-1">
            <div className="text-blue-600 text-center w-[98px] py-0.4">Đang phục vụ</div>
          </Badge>
        )
      case "Done":
        return (
          <Badge className="bg-green-100 hover:bg-green-300 border-green-500 text-xs px-1">
            <div className="text-green-600 text-center w-[98px] py-0.4">Hoàn thành</div>
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] border-amber-200 max-w-[95vw] min-h-[600px] ">
        <DialogHeader className="-mx-4 sm:-mx-6 px-4 sm:px-6 sm:pt-3 rounded-t-lg border-b border-amber-100">
          <DialogTitle className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="bg-amber-600 p-1 sm:p-1.5 rounded-md">
                <Utensils className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <div className="text-base sm:text-xl text-amber-800">{table.code}</div>
            </div>
            <div className="ml-auto">{getStatusBadge(table.status)}</div>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Chi tiết thông tin bàn ăn</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 sm:space-y-2">
          <Card className="border-amber-100">
            <CardContent className="p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900 text-xs sm:text-sm">Sức chứa</p>
                    <p className="text-xs sm:text-sm text-amber-700">{table.capacity} người</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900 text-xs sm:text-sm">Khu vực</p>
                    <p className="text-xs sm:text-sm text-amber-700"> Khu vực{getZoneName(table.zoneId, zones_)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900 text-xs sm:text-sm">Cập nhật lần cuối</p>
                    <p className="text-xs sm:text-sm text-amber-700">{new Date().toLocaleString("vi-VN")}</p>
                  </div>
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

          {/* Order Details Section */}
          {table.currentOrderId && (
            <Card className="border-amber-100">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2 mb-3 pr-2">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                    <h3 className="font-medium text-amber-900 text-xs sm:text-sm">Thông tin đơn hàng</h3>
                  </div>
                  {orderDetail && (
                    <Badge
                      className={`text-xs p-1 ${orderDetail.status === "Paid"
                        ? "bg-emerald-100 hover:bg-emerald-300  border-emerald-500 text-emerald-400"
                        : orderDetail.status === "CheckedOut"
                          ? "bg-blue-100 hover:bg-blue-300 border-blue-500 text-blue-600"
                          : "bg-amber-100 hover:bg-amber-300 border-amber-500 text-amber-600"
                        }`}
                    >
                      <div className="w-[98px] text-center truncate">
                        {orderDetail.status === "Paid"
                          ? "Đã thanh toán"
                          : orderDetail.status === "CheckedOut"
                            ? "Đã checkout"
                            : "Chưa thanh toán"}
                      </div>
                    </Badge>
                  )}
                </div>

                {isLoading ? (
                  <div className="text-center py-3">
                    <p className="text-xs sm:text-sm text-amber-700">Đang tải đơn hàng</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-3">
                    <p className="text-xs sm:text-sm text-red-500">{error}</p>
                  </div>
                ) : !orderDetail ? (
                  <div className="text-center py-3">
                    <p className="text-xs sm:text-sm text-amber-700">Không có thông tin đơn hàng</p>
                  </div>
                ) : (
                  <div className="">
                    {/* Order Info */}
                    <div className="grid grid-cols-2 items-center gap-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-1">
                        <CalendarClock className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
                        <span className="text-amber-700">Mã đơn:</span>
                      </div>
                      <div className="text-right font-medium text-amber-900">
                        {orderDetail.orderCode || "Chưa thanh toán"}
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
                        <span className="text-amber-700">Bắt đầu:</span>
                      </div>
                      <div className="text-right font-medium text-amber-900">
                        {new Date(orderDetail.startTime).toLocaleString("vi-VN")}
                      </div>

                      {orderDetail.endTime && (
                        <>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
                            <span className="text-amber-700">Kết thúc:</span>
                          </div>
                          <div className="text-right font-medium text-amber-900">
                            {new Date(orderDetail.endTime).toLocaleString("vi-VN")}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Order Items */}
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingBag className="h-4 w-4 text-amber-600" />
                        <h4 className="font-medium text-amber-900 text-xs sm:text-sm">Món ăn đã gọi</h4>
                      </div>

                      {!orderDetail.orderItems || orderDetail.orderItems.length === 0 ? (
                        <div className="text-center py-2">
                          <p className="text-xs sm:text-sm text-amber-700">Chưa có món ăn nào được gọi</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {/* Order Items with fixed height and scrolling */}
                          <div className="max-h-[200px] sm:max-h-[250px] overflow-y-auto space-y-2 scrollbar-hide ">
                            {orderDetail.orderItems.map((item) => (
                              <div key={item.id} className="border border-amber-100 rounded-md p-2">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium text-amber-900 text-xs sm:text-sm">{item.name}</p>
                                    <p className="text-xs text-amber-700">
                                      {item.quantity} x {formatCurrency(item.price)}
                                    </p>
                                    {item.note && (
                                      <p className="text-xs italic text-amber-600 mt-1">Ghi chú: {item.note}</p>
                                    )}

                                    {/* Display order item options if any */}
                                    {item.orderItemDetails && item.orderItemDetails.length > 0 && (
                                      <div className="mt-1 pl-2 border-l border-amber-100">
                                        {item.orderItemDetails.map((option) => (
                                          <p key={option.id} className="text-xs text-amber-600">
                                            + {option.name} ({formatCurrency(option.additionalPrice)})
                                          </p>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col justify-between min-h-[76px]">
                                    <div>{getOrderItemStatusBadge(item.orderItemStatus)}</div>
                                    <p className="font-medium text-amber-900 text-xs sm:text-sm text-right mt-auto">
                                      {formatCurrency(item.totalPrice)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Additional Fees - Outside the scrollable area */}
                          {orderDetail.additionalFees && orderDetail.additionalFees.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-amber-100">
                              <h4 className="font-medium text-amber-900 text-xs sm:text-sm mb-2">Phụ thu</h4>
                              {orderDetail.additionalFees.map((fee) => (
                                <div key={fee.id} className="flex justify-between text-xs sm:text-sm">
                                  <span className="text-amber-700">{fee.name}</span>
                                  <span className="font-medium text-amber-900">{formatCurrency(fee.value)}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Total - Outside the scrollable area */}
                          <div className="flex justify-between items-center border-t border-amber-100 pt-2 mt-3">
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                              <p className="font-medium text-amber-900 text-xs sm:text-sm">Tổng cộng</p>
                            </div>
                            <p className="font-bold text-amber-900 text-sm sm:text-base">
                              {formatCurrency(orderDetail.totalPrice)}
                            </p>
                          </div>
                          {/* Checkout Button - Only show for Unpaid orders */}
                          {orderDetail.status === "Unpaid" && (
                            <div className="mt-3 pt-2">
                              <Button
                                onClick={handleCheckOut}
                                disabled={isCheckingOut}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                              >
                                {isCheckingOut ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Checkout đơn hàng
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-1 sm:gap-2 mt-2 sm:mt-0">
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
