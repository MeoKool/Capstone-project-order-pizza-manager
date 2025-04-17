"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, CircleX, CreditCard } from "lucide-react"
import { PaymentDialog } from "./payment-dialog"

interface OrderActionsProps {
    orderId: string
    status: string
    totalAmount: number
    onCheckOut: () => Promise<void>
    onCancelCheckout: () => Promise<void>
    isCheckingOut: boolean
    isCancelingCheckout: boolean
    onClose: () => void
    onPaymentComplete?: () => void
}

export function OrderActions({
    orderId,
    status,
    totalAmount,
    onCheckOut,
    onCancelCheckout,
    isCheckingOut,
    isCancelingCheckout,
    onClose,
    onPaymentComplete,
}: OrderActionsProps) {
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

    const handleOpenPayment = () => {
        // Close the parent dialog first
        onClose()
        // Then open the payment dialog
        setIsPaymentDialogOpen(true)
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 mt-2 sm:mt-0">
                {/* Checkout button only for Unpaid state */}
                {status === "Unpaid" && (
                    <Button
                        onClick={onCheckOut}
                        disabled={isCheckingOut}
                        className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm py-1 h-7 sm:h-9"
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
                )}

                {/* Payment and Cancel checkout buttons only for CheckedOut state */}
                {status === "CheckedOut" && (
                    <>
                        <Button
                            onClick={handleOpenPayment}
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm py-1 h-7 sm:h-9"
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Thanh toán
                        </Button>
                        <Button
                            onClick={onCancelCheckout}
                            disabled={isCancelingCheckout}
                            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm py-1 h-7 sm:h-9"
                        >
                            {isCancelingCheckout ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <CircleX className="mr-2 h-4 w-4" />
                                    Hủy Checkout
                                </>
                            )}
                        </Button>
                    </>
                )}

                {/* Close button for all states */}
                <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full sm:w-auto border-amber-200 text-amber-700 hover:bg-amber-50 text-xs sm:text-sm py-1 h-7 sm:h-9"
                >
                    Đóng
                </Button>
            </div>

            <PaymentDialog
                orderId={orderId}
                totalAmount={totalAmount}
                open={isPaymentDialogOpen}
                onOpenChange={setIsPaymentDialogOpen}
                onPaymentComplete={onPaymentComplete}
            />
        </>
    )
}
