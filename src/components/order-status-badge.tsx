import { Badge } from "@/components/ui/badge"
import { PAYMENT_STATUS } from "@/types/order"

interface OrderStatusBadgeProps {
    status: string
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    switch (status) {
        case PAYMENT_STATUS.PAID:
            return (
                <Badge className="bg-emerald-100 hover:bg-emerald-300 border-emerald-500 text-xs px-1">
                    <div className="text-emerald-600 text-center w-[98px] py-0.4">Đã thanh toán</div>
                </Badge>
            )
        case PAYMENT_STATUS.CHECKOUT:
            return (
                <Badge className="bg-blue-100 hover:bg-blue-300 border-blue-500 text-xs px-1">
                    <div className="text-blue-600 text-center w-[98px] py-0.4">Đã checkout</div>
                </Badge>
            )
        case PAYMENT_STATUS.UNPAID:
            return (
                <Badge className="bg-amber-100 hover:bg-amber-300 border-amber-500 text-xs px-1">
                    <div className="text-amber-600 text-center w-[98px] py-0.4">Chưa thanh toán</div>
                </Badge>
            )
        case PAYMENT_STATUS.CANCELLED:
            return (
                <Badge className="bg-red-100 hover:bg-red-300 border-red-500 text-xs px-1">
                    <div className="text-red-600 text-center w-[98px] py-0.4">Đã hủy</div>
                </Badge>
            )
        default:
            return (
                <Badge className="bg-gray-100 hover:bg-gray-300 border-gray-500 text-xs px-1">
                    <div className="text-gray-600 text-center w-[98px] py-0.4">{status}</div>
                </Badge>
            )
    }
}
