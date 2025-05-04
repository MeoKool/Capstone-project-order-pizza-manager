"use client"

import { useState, useEffect } from "react"
import { Utensils, ShoppingBag, Receipt, Loader2, CheckCircle, CreditCard, CircleX, Trash2 } from "lucide-react"
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
import type { OrderDetail, OrderItemDetail } from "@/types/order"
import OrderService from "@/services/order-service"
import useZone from "@/hooks/useZone"
import { getStatusBadge } from "@/utils/table-utils"
import { toast } from "sonner"
import VoucherService from "@/services/voucher-service"

// Import the smaller components
import { TableInfoCard } from "./tables-details/table-info-card"
import { TableStatusCard } from "./tables-details/table-status-card"
import { OrderItemsList } from "./tables-details/order-items-list"
import { VoucherSection } from "./tables-details/voucher-section"
import { OrderInfoSection } from "./tables-details/order-info-section"
import { AdditionalFees } from "./tables-details/additional-fees"
import { Button } from "@/components/ui/button"
import { PaymentDialog } from "./tables-details/payment-dialog"
import OrderProgress from "./tables-details/OrderLoadingBar/OrderLoadingBar"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { OrderCancelDialog } from "./tables/order-cancel-dialog"
import { CancelOrderItemDialog } from "./tables-details/cancel-order-item-dialog"

interface TableDetailsDialogProps {
  table: TableResponse
  open: boolean
  onOpenChange: (open: boolean) => void
  onTableUpdated?: () => void
}

export function TableDetailsDialog({ table, open, onOpenChange, onTableUpdated }: TableDetailsDialogProps) {
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { zones_ } = useZone()
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isCancelingCheckout, setIsCancelingCheckout] = useState(false)
  const [currentTable, setCurrentTable] = useState<TableResponse>(table)

  // Voucher related states
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)
  const [voucherError, setVoucherError] = useState<string | null>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  // Order item cancellation states
  const [selectedOrderItem, setSelectedOrderItem] = useState<OrderItemDetail | null>(null)
  const [isCancelItemDialogOpen, setIsCancelItemDialogOpen] = useState(false)
  const [isCancellingItem, setIsCancellingItem] = useState(false)
  const [cancelItemError, setCancelItemError] = useState<string | null>(null)


  // Update currentTable when table prop changes
  useEffect(() => {
    setCurrentTable(table)
  }, [table])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  // Fetch order items when the dialog opens and currentOrderId exists
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!currentTable.currentOrderId || !open) return

      setIsLoading(true)
      setError(null)

      try {
        const orderService = OrderService.getInstance()
        const response = await orderService.getOrderById(currentTable.currentOrderId)

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
  }, [currentTable.currentOrderId, open])

  // Function to refresh table data
  const refreshTableData = async () => {
    if (!currentTable.id) return

    try {
      const tableService = await import("@/services/table-service").then((module) => module.default.getInstance())
      const response = await tableService.getTableById(currentTable.id)

      if (response.success && response.result) {
        setCurrentTable(response.result)

        // If the table no longer has an order, clear the order detail
        if (!response.result.currentOrderId) {
          setOrderDetail(null)
        }
      }
    } catch (error) {
      console.error("Error refreshing table data:", error)
    }
  }

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
            const updatedResponse = await orderService.getOrderById(currentTable.currentOrderId)
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
        if (orderDetail && currentTable.currentOrderId) {
          const orderService = OrderService.getInstance()
          const updatedResponse = await orderService.getOrderById(currentTable.currentOrderId)
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
    if (!orderDetail || !currentTable.currentOrderId) return

    setIsCancelingCheckout(true)
    try {
      const orderService = OrderService.getInstance()
      const response = await orderService.cancelCheckOutOrder(currentTable.currentOrderId)

      if (response.success) {
        toast.success("Đã hủy checkout đơn hàng thành công")

        // Refresh order details to show updated status
        const updatedResponse = await orderService.getOrderById(currentTable.currentOrderId)
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
    if (!orderDetail || !currentTable.currentOrderId) return

    setIsCheckingOut(true)
    try {
      const orderService = OrderService.getInstance()
      const response = await orderService.checkOutOrder(currentTable.currentOrderId)

      if (response.success) {
        toast.success("Đã checkout đơn hàng thành công")

        // Refresh order details to show updated status
        const updatedResponse = await orderService.getOrderById(currentTable.currentOrderId)
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
    console.log(`Hết thời gian cho bàn ${currentTable.id}`)
  }

  // Function to open payment dialog and close details dialog
  const handleOpenPayment = () => {
    if (!orderDetail) return
    onOpenChange(false) // Close the details dialog
    setIsPaymentDialogOpen(true) // Open the payment dialog
  }

  // Function to refresh order details after payment
  const handlePaymentComplete = () => {
    if (currentTable.currentOrderId) {
      const orderService = OrderService.getInstance()
      orderService
        .getOrderById(currentTable.currentOrderId)
        .then((response) => {
          if (response.success && response.result) {
            setOrderDetail(response.result)
            // Reopen the details dialog after payment is complete
            onOpenChange(true)
          }
        })
        .catch((error) => {
          console.error("Error refreshing order details:", error)
        })
    }
  }

  // Handle order cancellation - keep dialog open and refresh data
  const handleOrderCancelled = async () => {
    // Refresh the table data to get the updated state
    await refreshTableData()

    // If there's a callback for table updates, call it
    if (onTableUpdated) {
      onTableUpdated()
    }
  }
  const handleOpenCancelItemDialog = (item: OrderItemDetail) => {
    setSelectedOrderItem(item)
    setIsCancelItemDialogOpen(true)
    setCancelItemError(null)
  }

  // Function to handle cancellation of an order item
  const handleCancel = async (orderItemId: string, reason: string) => {
    if (!reason.trim()) {
      setCancelItemError("Vui lòng nhập lý do hủy món")
      return false
    }

    setIsCancellingItem(true)
    setCancelItemError(null)

    try {
      const orderService = OrderService.getInstance()
      const response = await orderService.cancelOrderItem(orderItemId, reason)

      if (response.success) {
        toast.success("Hủy món thành công")
        setIsCancelItemDialogOpen(false)

        const updatedResponse = await orderService.getOrderById(currentTable.currentOrderId)
        if (updatedResponse.success && updatedResponse.result) {
          setOrderDetail(updatedResponse.result)
        }

        // If there's a callback for table updates, call it
        if (onTableUpdated) {
          onTableUpdated()
        }

        return true
      } else {
        setCancelItemError(response.message || "Không thể hủy món. Vui lòng thử lại.")
        return false
      }
    } catch (err) {
      console.error("Error cancelling order item:", err)
      setCancelItemError("Đã xảy ra lỗi khi hủy món. Vui lòng thử lại.")
      return false
    } finally {
      setIsCancellingItem(false)
    }
  }
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px] border-amber-200 max-w-[95vw]">
          <DialogHeader className="-mx-4 sm:-mx-6 mt-3 px-4 sm:px-6 sm:pt-3 rounded-t-lg border-b border-amber-100 sticky top-0 bg-white z-10">
            <DialogTitle className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="bg-amber-600 p-1 sm:p-1.5 rounded-md">
                  <Utensils className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="text-base sm:text-xl text-amber-800">{currentTable.code}</div>
              </div>
              <div className="ml-auto">{getStatusBadge(currentTable.status)}</div>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Chi tiết thông tin bàn ăn</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 sm:space-y-2">
            <TableInfoCard table={currentTable} zones={zones_} />
            <TableStatusCard table={currentTable} isTimerRunning={isTimerRunning} onTimeUp={handleTimeUp} />



            {/* Order Details Section */}
            {currentTable.currentOrderId ? (
              <Card className="border-amber-100  overflow-y-auto scrollbar-hide max-h-[50vh] py-2">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-1 mb-3 pr-2">
                    <div className="flex items-center gap-1">
                      <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                      <h3 className="font-medium text-amber-900 text-xs sm:text-sm">Thông tin đơn hàng</h3>
                    </div>
                    {orderDetail && <OrderStatusBadge status={orderDetail.status} />}
                  </div>

                  {isLoading ? (
                    <OrderProgress />
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
                              onOpenCancelDialog={handleOpenCancelItemDialog}
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
                            {orderDetail.status === "CheckedOut" && (
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
            ) : (
              <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Bàn này hiện không có đơn hàng nào</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-end">

            {currentTable.status === "Opening" && (
              <>
                {orderDetail && currentTable.status === "Opening" && (
                  <div className="flex flex-col-reverse sm:flex-row gap-2 mt-2 sm:mt-0 sm:justify-end">
                    <Button
                      onClick={() => setIsCancelDialogOpen(true)}
                      className="w-[160px] sm:w-auto bg-red-500 hover:bg-red-600 gap-1 text-white text-xs sm:text-sm py-1 px-2 h-7 sm:h-9"
                    >
                      <div className="flex items-center">
                        <Trash2 className="mr-1 h-4 w-4" />
                        <span>Hủy đơn hàng</span>
                      </div>
                    </Button>

                    {orderDetail.status === "Unpaid" && (
                      <>
                        <Button
                          onClick={handleCheckOut}
                          disabled={isCheckingOut}
                          className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm py-1 px-2 h-7 sm:h-9"
                        >
                          {isCheckingOut ? (
                            <div className="flex items-center">
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                              Đang xử lý...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Checkout đơn hàng
                            </div>
                          )}
                        </Button>
                      </>
                    )}

                    {/* Payment and Cancel checkout buttons only for CheckedOut state */}
                    {orderDetail.status === "CheckedOut" && (
                      <>
                        <Button
                          onClick={handleOpenPayment}
                          className="w-[170px] sm:w-auto bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm py-1 px-2 h-7 sm:h-9"
                        >
                          <div className="flex items-center">
                            <CreditCard className="mr-1 h-4 w-4" />
                            <span>Thanh toán</span>
                          </div>
                        </Button>
                        <Button
                          onClick={handleCancelCheckout}
                          disabled={isCancelingCheckout}
                          className="w-[180px] sm:w-auto bg-neutral-600 hover:bg-neutral-600 text-white text-xs sm:text-sm py-1 px-2 h-7 sm:h-9"
                        >
                          {isCancelingCheckout ? (
                            <div className="flex items-center">
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                              Đang xử lý
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <CircleX className="mr-1 h-4 w-4" />
                              Hủy Checkout
                            </div>
                          )}
                        </Button>
                      </>
                    )}

                  </div>
                )}
                {/* Close button for all states */}
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto border-amber-200 text-amber-700 hover:bg-amber-50 text-xs sm:text-sm py-1 h-7 sm:h-9"
                >
                  Đóng
                </Button>
              </>
            )}

            {currentTable.status !== "Opening" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto border-amber-200 text-amber-700 hover:bg-amber-50 text-xs sm:text-sm py-1 h-7 sm:h-9"
                >
                  Đóng
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {selectedOrderItem && (
        <CancelOrderItemDialog
          orderItem={selectedOrderItem}
          open={isCancelItemDialogOpen}
          onOpenChange={setIsCancelItemDialogOpen}
          onCancel={handleCancel}
          isSubmitting={isCancellingItem}
          error={cancelItemError}
        />
      )}
      {orderDetail && (
        <>
          <PaymentDialog
            orderId={orderDetail.id}
            totalAmount={orderDetail.totalPrice}
            open={isPaymentDialogOpen}
            onOpenChange={setIsPaymentDialogOpen}
            onPaymentComplete={handlePaymentComplete}
            onBackToDetails={() => {
              setIsPaymentDialogOpen(false)
              onOpenChange(true)
            }}
          />
        </>
      )}

      {currentTable && (
        <OrderCancelDialog
          table={currentTable}
          open={isCancelDialogOpen}
          onOpenChange={setIsCancelDialogOpen}
          onTableUpdated={onTableUpdated}
          onOrderCancelled={handleOrderCancelled}
        />
      )}
    </>
  )
}
