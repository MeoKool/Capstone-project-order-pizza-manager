import { CalendarClock, Clock } from 'lucide-react'

import type { OrderDetail } from "@/types/order"

interface OrderInfoSectionProps {
    orderDetail: OrderDetail
    formatCurrency: (amount: number) => string
}

export function OrderInfoSection({ orderDetail, }: OrderInfoSectionProps) {
    return (
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
    )
}
