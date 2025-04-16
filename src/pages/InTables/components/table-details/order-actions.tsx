import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, CircleX } from 'lucide-react'

interface OrderActionsProps {
    status: string
    onCheckOut: () => Promise<void>
    onCancelCheckout: () => Promise<void>
    isCheckingOut: boolean
    isCancelingCheckout: boolean
    onClose: () => void
}

export function OrderActions({
    status,
    onCheckOut,
    onCancelCheckout,
    isCheckingOut,
    isCancelingCheckout,
    onClose,
}: OrderActionsProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 mt-2 sm:mt-0">
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

            {status === "CheckedOut" && (
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
            )}
            <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto border-amber-200 text-amber-700 hover:bg-amber-50 text-xs sm:text-sm py-1 h-7 sm:h-9"
            >
                Đóng
            </Button>
        </div>
    )
}
