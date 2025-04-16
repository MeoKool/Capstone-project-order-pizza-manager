import { useState } from "react"
import { Ticket, Tag, AlertCircle, X, CheckCircle } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from 'lucide-react'
import type { OrderVoucher } from "@/types/voucher"

interface VoucherSectionProps {
    orderVouchers: OrderVoucher[]
    onApplyVoucher: (code: string) => Promise<void>
    onRemoveVoucher: (id: string) => Promise<void>
    formatCurrency: (amount: number) => string
    isApplyingVoucher: boolean
    voucherError: string | null
}

export function VoucherSection({
    orderVouchers,
    onApplyVoucher,
    onRemoveVoucher,
    formatCurrency,
    isApplyingVoucher,
    voucherError,
}: VoucherSectionProps) {
    const [voucherCode, setVoucherCode] = useState("")

    const handleClearVoucherInput = () => {
        setVoucherCode("")
    }

    const handleApplyVoucher = () => {
        if (!voucherCode.trim()) return
        onApplyVoucher(voucherCode)
    }

    return (
        <div className="mt-3 pt-2 border-t border-amber-100">
            {/* Applied Vouchers */}
            {orderVouchers.length > 0 && (
                <div className="mb-3">
                    <div className="flex items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-1">
                            <Ticket className="h-4 w-4 text-amber-600" />
                            <h4 className="font-medium text-amber-900 text-xs sm:text-sm">
                                Mã giảm giá đã áp dụng
                            </h4>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {orderVouchers.map((orderVoucher) => (
                            <div
                                key={orderVoucher.id}
                                className="bg-green-50 border border-green-200 rounded-md p-2 flex justify-between items-center"
                            >
                                <div className="flex items-center gap-1">
                                    <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                    <p className="text-xs sm:text-sm font-medium text-green-700">
                                        {orderVoucher.voucher.code}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-green-100 text-green-700 text-xs">
                                        {orderVoucher.voucher.discountType === "Percentage"
                                            ? `${orderVoucher.voucher.discountValue}%`
                                            : formatCurrency(orderVoucher.voucher.discountValue)}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 rounded-full"
                                        onClick={() => onRemoveVoucher(orderVoucher.id)}
                                    >
                                        <X className="h-3 w-3 text-green-600" />
                                        <span className="sr-only">Xóa mã giảm giá</span>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Voucher input */}
            <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-1">
                    <Ticket className="h-4 w-4 text-amber-600" />
                    <h4 className="font-medium text-amber-900 text-xs sm:text-sm">Mã giảm giá</h4>
                </div>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        placeholder="Nhập mã voucher"
                        className="pl-8 border-amber-200 focus-visible:ring-amber-500 text-xs sm:text-sm py-1 h-8 sm:h-9"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                handleApplyVoucher()
                            }
                        }}
                    />
                    <div className="absolute left-2.5 top-2">
                        <Tag className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    {voucherCode && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-6 w-6 p-0 rounded-full"
                            onClick={handleClearVoucherInput}
                        >
                            <X className="h-3 w-3 text-amber-500" />
                            <span className="sr-only">Xóa</span>
                        </Button>
                    )}
                </div>
                <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm py-1 h-8 sm:h-9"
                    onClick={handleApplyVoucher}
                    disabled={isApplyingVoucher || !voucherCode.trim()}
                >
                    {isApplyingVoucher ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Áp mã"}
                </Button>
            </div>

            {voucherError && (
                <div className="mt-2 flex items-start gap-1.5 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <p>{voucherError}</p>
                </div>
            )}
        </div>
    )
}
