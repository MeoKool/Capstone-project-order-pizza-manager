"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Ban, Clock, Receipt, Utensils, CalendarDays, FileText, PlusCircle } from "lucide-react"
import type { OrderDetail } from "@/types/order"
import { Card, CardContent } from "@/components/ui/card"

interface OrderDetailsDialogProps {
  orderDetail: OrderDetail
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailsDialog({ orderDetail, open, onOpenChange }: OrderDetailsDialogProps) {
  if (!orderDetail) return null

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }


  const calculateDuration = (startTime: string | null, endTime: string | null) => {
    if (!startTime || !endTime) return "—"

    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationMs = end.getTime() - start.getTime()

    const hours = Math.floor(durationMs / 3600000)
    const minutes = Math.floor((durationMs % 3600000) / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`
    } else {
      return `${minutes} phút ${seconds} giây`
    }
  }

  const sortedFees = [...orderDetail.additionalFees].sort((a, b) => a.name.localeCompare(b.name))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Done":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Đã hoàn thành
          </Badge>
        )
      case "Cooking":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 flex items-center gap-1">
            <Utensils className="h-3 w-3" />
            Đang chế biến
          </Badge>
        )
      case "Serving":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Đang phục vụ
          </Badge>
        )
      case "Pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Đang chờ
          </Badge>
        )
      case "Cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 flex items-center gap-1">
            <Ban className="h-3 w-3" />
            Đã hủy
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Calculate total quantity of all items
  const totalQuantity = orderDetail.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[650px]">
        <DialogHeader className="py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Receipt className="h-5 w-5 text-slate-600" />
              Chi tiết đơn hàng
            </DialogTitle>
            {orderDetail.orderCode && (
              <Badge variant="outline" className="bg-slate-100 border-slate-200 text-slate-700">
                {orderDetail.orderCode}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex justify-between">
          <div className="flex justify-start items-center">
            <h1 className="text-sm text-muted-foreground flex items-center gap-1">
              <Utensils className="h-3.5 w-3.5 text-slate-400" />
              Bàn:
            </h1>
            <h1 className="ml-1 font-medium text-sm text-slate-800">{orderDetail.tableCode}</h1>
          </div>
          <div className="flex justify-start items-center">
            <h1 className="text-sm text-muted-foreground  flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
              Thời gian:
            </h1>
            <h1 className="ml-1 font-medium text-sm text-slate-800">{formatDate(orderDetail.startTime)}</h1>
          </div>
          <div className="flex justify-start items-center">
            <h1 className="text-sm text-muted-foreground flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              Số món:
            </h1>
            <h1 className="ml-1 font-medium text-sm text-slate-800">
              {orderDetail.orderItems?.length || 0} loại ({totalQuantity} món)
            </h1>
          </div>
        </div>


        <div className="max-h-[50vh] overflow-auto scrollbar-hide">
          <div className="">
            {orderDetail.orderItems &&
              orderDetail.orderItems.map((item) => {
                const isCancelled = item.orderItemStatus === "Cancelled"
                return (
                  <Card key={item.id} className={`mb-2 last:mb-0 ${isCancelled ? "bg-red-50/30" : "bg-white"}`}>
                    <CardContent className={`p-4 relative ${isCancelled ? "overflow-hidden" : ""}`}>
                      {/* Diagonal strikethrough for cancelled items */}
                      {isCancelled && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute inset-0 bg-red-50/30"></div>
                          <div className="absolute top-0 left-0 w-full h-full">
                            <div className="absolute top-0 left-0 w-[200%] h-[1px] bg-red-200 origin-top-left rotate-45 transform translate-y-0"></div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-medium text-base ${isCancelled ? "text-red-700" : "text-slate-800"}`}>
                            {item.name}
                          </h3>
                          <p className={`text-sm ${isCancelled ? "text-red-500/80" : "text-slate-500"}`}>
                            Số lượng: <span className="font-medium">{item.quantity}</span> •
                            <span className="ml-1">{item.price?.toLocaleString("vi-VN")} đ/món</span>
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          {getStatusBadge(item.orderItemStatus)}
                          <span className={`font-semibold text-sm mb-1 ${isCancelled ? "text-red-700" : "text-slate-800"}`}>
                            {item.totalPrice?.toLocaleString("vi-VN")} đ
                          </span>

                        </div>
                      </div>

                      {/* Cancellation reason */}
                      {isCancelled && item.reasonCancel && (
                        <div className="mt-2 mb-3 p-3 bg-red-50 rounded-md border border-red-100">
                          <span className="font-medium text-red-700">Lý do hủy:</span>
                          <span className="ml-2 text-red-600">{item.reasonCancel}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 bg-slate-50 p-3 rounded-md">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">Thời gian bắt đầu:</span>
                          <span className="text-sm font-medium text-slate-700">{formatTime(item.startTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">Bắt đầu phục vụ:</span>
                          <span className="text-sm font-medium text-slate-700">
                            {formatTime(item.startTimeServing)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">Bắt đầu chế biến:</span>
                          <span className="text-sm font-medium text-slate-700">
                            {formatTime(item.startTimeCooking)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">Hoàn thành:</span>
                          <span className="text-sm font-medium text-slate-700">{formatTime(item.endTime)}</span>
                        </div>
                      </div>

                      <div className="mt-2 bg-slate-100 p-2 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-slate-700 text-sm">Tổng thời gian:</span>
                          <span className="font-medium text-slate-800 text-sm">
                            {calculateDuration(item.startTime, item.endTime)}
                          </span>
                        </div>
                      </div>

                      {item.note && item.note !== "No Comment" && (
                        <div className="mt-3 p-3 bg-amber-50 rounded-md border border-amber-100">
                          <span className="font-medium text-amber-700">Ghi chú:</span>
                          <span className="ml-2 text-amber-600">{item.note}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>

        {orderDetail.additionalFees && orderDetail.additionalFees.length > 0 && (
          <div>

            <h3 className="font-medium text-sm flex items-center gap-1.5 text-slate-700">
              <PlusCircle className="h-4 w-4 text-slate-500" />
              Phí bổ sung
            </h3>
            <div className="space-y-2">
              {sortedFees.map((fee) => (
                <div
                  key={fee.id}
                  className="flex justify-between items-center  bg-white "
                >
                  <div>
                    <p className="font-medium text-sm text-slate-700">{fee.name}</p>
                    {fee.description && <p className="text-sm text-slate-500">{fee.description}</p>}
                  </div>
                  <p className="font-medium text-slate-800">{fee.value.toLocaleString("vi-VN")} đ</p>
                </div>
              ))}
            </div>

          </div>
        )}

        <div className="">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500">Tổng số món</p>
              <p className="font-medium text-slate-700">
                {totalQuantity} món ({orderDetail.orderItems?.length || 0} loại)
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Tổng tiền</p>
              <p className="text-base font-bold text-slate-800">
                {orderDetail.totalPrice ? orderDetail.totalPrice.toLocaleString("vi-VN") : "N/A"} đ
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
            Đóng
          </Button>
          <Button>In hóa đơn</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
