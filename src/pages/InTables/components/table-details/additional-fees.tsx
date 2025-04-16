import type { AdditionalFee } from "@/types/order"

interface AdditionalFeesProps {
    fees: AdditionalFee[]
    formatCurrency: (amount: number) => string
}

export function AdditionalFees({ fees, formatCurrency }: AdditionalFeesProps) {
    if (!fees || fees.length === 0) return null
    const sortedFees = [...fees].sort((a, b) => a.name.localeCompare(b.name))
    return (
        <div className="mt-3 pt-2 border-t border-amber-100">
            <h4 className="font-medium text-amber-900 text-xs sm:text-sm mb-2">Phụ thu</h4>
            {sortedFees.map((fee) => (
                <div key={fee.id} className="flex justify-between text-xs sm:text-sm">
                    <span className="text-amber-700">{fee.name}</span>
                    <span className="font-medium text-amber-900">{formatCurrency(fee.value)}</span>
                </div>
            ))}
        </div>
    )
}
