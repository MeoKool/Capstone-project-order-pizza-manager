import { JSX } from "react";
import { CheckCircle2, Clock, AlertCircle, Ban } from "lucide-react";

// Optional: Enum nếu bạn muốn type-safe hơn
export enum PAYMENT_STATUS {
    PAID = "Paid",
    CHECKOUT = "Checkout",
    UNPAID = "Unpaid",
    CANCELLED = "Cancelled"
}

export const getStatusOrderBadge = (status: string): JSX.Element => {
    switch (status) {
        case PAYMENT_STATUS.PAID:
            return (
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-600 border-transparent">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Đã thanh toán
                </div>
            );
        case PAYMENT_STATUS.CHECKOUT:
            return (
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 border-transparent">
                    <Clock className="mr-1 h-3.5 w-3.5" />
                    Đã checkout
                </div>
            );
        case PAYMENT_STATUS.UNPAID:
            return (
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-600 border-transparent">
                    <AlertCircle className="mr-1 h-3.5 w-3.5" />
                    Chưa thanh toán
                </div>
            );
        case PAYMENT_STATUS.CANCELLED:
            return (
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-50 text-red-600 border-transparent">
                    <Ban className="mr-1 h-3.5 w-3.5" />
                    Đã hủy
                </div>
            );
        default:
            return (
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                    {status}
                </div>
            );
    }
};
