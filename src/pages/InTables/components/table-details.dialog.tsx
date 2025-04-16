"use client"

import { useState, useEffect } from "react"
import { Utensils, ShoppingBag, Receipt } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import { getStatusBadge } from "@/utils/table-utils"
import { toast } from "sonner"
import VoucherService from "@/services/voucher-service"

// Import the smaller components
import { TableInfoCard } from "./table-details/table-info-card"
import { TableStatusCard } from "./table-details/table-status-card"
import { OrderItemsList } from "./table-details/order-items-list"
import { VoucherSection } from "./table-details/voucher-section"
import { OrderInfoSection } from "./table-details/order-info-section"
import { AdditionalFees } from "./table-details/additional-fees"
import { OrderActions } from "./table-details/order-actions"

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
  const [isCancelingCheckout, setIsCancelingCheckout] = useState(false)

  // Voucher related states
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)
  const [voucherError, setVoucherError] = useState<string | null>(null)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

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

  // Function to check voucher
  const handleApplyVoucher = async (code: string) => {
    if (!code.trim() || !orderDetail) return

    setIsApplyingVoucher(true)
    setVoucherError(null)

    try {
      const voucherService = VoucherService.getInstance()

      // Step 1: Get voucher by code
      const voucherResponse = await voucherService.getVoucherByCode(code)

      if (voucherResponse.success && voucherResponse.result) {
        const voucher = voucherResponse.result

        // Check if voucher is available
        if (voucher.voucherStatus === "Available") {
          // Step 2: Apply voucher to order
          const applyResponse = await voucherService.addVoucherToOrder(orderDetail.id, voucher.id)

          if (applyResponse.success && applyResponse.result) {
            toast.success("Áp dụng mã giảm giá thành công")

            // Refresh order details to show updated prices and vouchers
            const orderService = OrderService.getInstance()
            const updatedResponse = await orderService.getOrderById(table.currentOrderId)
            if (updatedResponse.success && updatedResponse.result) {
              setOrderDetail(updatedResponse.result)
            }
          } else {
            setVoucherError(applyResponse.message || "Không thể áp dụng mã giảm giá")
          }
        } else {
          setVoucherError(getVoucherStatusMessage(voucher.voucherStatus))
        }
      } else {
        setVoucherError(voucherResponse.message || "Mã giảm giá không hợp lệ")
      }
    } catch (err) {
      setVoucherError("Đã xảy ra lỗi khi áp dụng mã giảm giá")
      console.error("Error applying voucher:", err)
    } finally {
      setIsApplyingVoucher(false)
    }
  }

  // Function to handle voucher removal
  const handleRemoveVoucher = async (orderVoucherId: string) => {
    try {
      const voucherService = VoucherService.getInstance()
      const response = await voucherService.removeVoucherOfOrder(orderVoucherId)

      if (response.success) {
        toast.success("Đã xóa mã giảm giá")

        // Refresh order details to show updated prices and vouchers
        if (orderDetail && table.currentOrderId) {
          const orderService = OrderService.getInstance()
          const updatedResponse = await orderService.getOrderById(table.currentOrderId)
          if (updatedResponse.success && updatedResponse.result) {
            setOrderDetail(updatedResponse.result)
          }
        }
      } else {
        toast.error(response.message || "Không thể xóa mã giảm giá")
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi xóa mã giảm giá")
      console.error("Error removing voucher:", err)
    }
  }

  // Function to get voucher status message
  const getVoucherStatusMessage = (status: string) => {
    switch (status) {
      case "Used":
        return "Mã giảm giá đã được sử dụng"
      case "Expired":
        return "Mã giảm giá đã hết hạn"
      case "Pending":
        return "Mã giảm giá chưa có hiệu lực"
      default:
        return "Mã giảm giá không hợp lệ"
    }
  }

  // cancel check out
  const handleCancelCheckout = async () => {
    if (!orderDetail || !table.currentOrderId) return

    setIsCancelingCheckout(true)
    try {
      const orderService = OrderService.getInstance()
      const response = await orderService.cancelCheckOutOrder(table.currentOrderId)

      if (response.success) {
        toast.success("Đã hủy checkout đơn hàng thành công")

        // Refresh order details to show updated status
        const updatedResponse = await orderService.getOrderById(table.currentOrderId)
        if (updatedResponse.success && updatedResponse.result) {
          setOrderDetail(updatedResponse.result)
        }
      } else {
        toast.error(response.message || "Không thể hủy checkout đơn hàng")
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi hủy checkout đơn hàng")
      console.error("Error canceling checkout:", err)
    } finally {
      setIsCancelingCheckout(false)
    }
  }

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] border-amber-200 max-w-[95vw]">
        <DialogHeader className="-mx-4 sm:-mx-6 mt-2 px-4 sm:px-6 sm:pt-3 rounded-t-lg border-b border-amber-100 sticky top-0 bg-white z-10">
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
          <TableInfoCard table={table} zones={zones_} />
          <TableStatusCard table={table} isTimerRunning={isTimerRunning} onTimeUp={handleTimeUp} />

          {/* Order Details Section */}
          {table.currentOrderId && (
            <Card className="border-amber-100 max-h-[50vh] overflow-y-auto  scrollbar-hide py-2">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2 mb-3 pr-2">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                    <h3 className="font-medium text-amber-900 text-xs sm:text-sm">Thông tin đơn hàng</h3>
                  </div>
                  {orderDetail && (
                    <Badge
                      className={`text-xs p-1 ${orderDetail.status === "Paid"
                        ? "bg-emerald-100 hover:bg-emerald-300 border-emerald-300 text-emerald-400"
                        : orderDetail.status === "CheckedOut"
                          ? "bg-blue-100 hover:bg-blue-300 border-blue-300 text-blue-600"
                          : "bg-amber-100 hover:bg-amber-300 border-amber-300 text-amber-600"
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
                    <OrderInfoSection orderDetail={orderDetail} formatCurrency={formatCurrency} />

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
                        <div className="">
                          {/* Order Items with fixed height and scrolling */}
                          <OrderItemsList
                            orderItems={orderDetail.orderItems}
                            formatCurrency={formatCurrency}
                            orderStatus={orderDetail.status}
                          />


                          {/* Additional Fees */}
                          <AdditionalFees fees={orderDetail.additionalFees} formatCurrency={formatCurrency} />

                          {/* Voucher section - Only show for Unpaid orders */}
                          {orderDetail.status === "Unpaid" && (
                            <>

                              <VoucherSection
                                orderVouchers={orderDetail.orderVouchers}
                                onApplyVoucher={handleApplyVoucher}
                                onRemoveVoucher={handleRemoveVoucher}
                                formatCurrency={formatCurrency}
                                isApplyingVoucher={isApplyingVoucher}
                                voucherError={voucherError}
                              />

                            </>
                          )}

                          {/* Total */}

                          {orderDetail.status === 'CheckedOut' && (
                            <div className="flex justify-between items-center border-t border-amber-100 pt-2 mt-3">
                              <div className="flex items-center gap-1">
                                <p className="font-medium text-amber-900 text-xs sm:text-sm">Tổng cộng</p>
                              </div>
                              <p className="font-bold text-amber-900 text-sm sm:text-base">
                                {formatCurrency(orderDetail.totalPrice)}
                              </p>
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

        <DialogFooter>
          {orderDetail && (
            <OrderActions
              status={orderDetail.status}
              onCheckOut={handleCheckOut}
              onCancelCheckout={handleCancelCheckout}
              isCheckingOut={isCheckingOut}
              isCancelingCheckout={isCancelingCheckout}
              onClose={() => onOpenChange(false)}
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
