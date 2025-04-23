import { Badge } from "@/components/ui/badge"
import type { OrderItemDetail } from "@/types/order"
import { ShoppingBag } from "lucide-react"

interface OrderItemsListProps {
    orderItems: OrderItemDetail[]
    formatCurrency: (amount: number) => string
    orderStatus: string
}

export function OrderItemsList({ orderItems, formatCurrency, orderStatus }: OrderItemsListProps) {
    // Get order item status badge
    const getOrderItemStatusBadge = (status: string) => {
        switch (status) {
            case "Pending":
                return (
                    <Badge className="bg-amber-100 hover:bg-amber-300 border-amber-500 text-xs px-1">
                        <div className="text-amber-600 text-center w-[98px] py-0.4">Đang chờ</div>
                    </Badge>
                )
            case "Cancelled":
                return (
                    <Badge className="bg-red-100 hover:bg-red-300 border-red-500 text-xs px-1">
                        <div className="text-red-600 text-center w-[98px] py-0.4">Đã hủy</div>
                    </Badge>
                )
            case "Serving":
                return (
                    <Badge className="bg-blue-100 hover:bg-blue-300 border-blue-500 text-xs px-1">
                        <div className="text-blue-600 text-center w-[98px] py-0.4">Đang phục vụ</div>
                    </Badge>
                )
            case "Done":
                return (
                    <Badge className="bg-green-100 hover:bg-green-300 border-green-500 text-xs px-1">
                        <div className="text-green-600 text-center w-[98px] py-0.4">Hoàn thành</div>
                    </Badge>
                )
            case "Cooking":
                return (
                    <Badge className="bg-orange-100 hover:bg-orange-300 border-orange-500 text-xs px-1">
                        <div className="text-orange-600 text-center w-[98px] py-0.4">Đang nấu</div>
                    </Badge>
                )
            default:
                return null
        }
    }

    // Get status color classes
    const getStatusColorClasses = (status: string) => {
        switch (status) {
            case "Pending":
                return {
                    bg: "bg-amber-50",
                    border: "border-amber-300",
                    hover: "hover:bg-amber-300",
                    text: "text-amber-600",
                    badge: {
                        bg: "bg-amber-50",
                        text: "text-amber-600",
                        border: "border-amber-300",
                        hover: "hover:bg-amber-300",
                    },
                }
            case "Serving":
                return {
                    bg: "bg-blue-50",
                    border: "border-blue-300",
                    hover: "hover:bg-blue-300",
                    text: "text-blue-600",
                    badge: {
                        bg: "bg-blue-50",
                        hover: "hover:bg-blue-300",
                        text: "text-blue-600",
                        border: "border-blue-300",
                    },
                }
            case "Done":
                return {
                    bg: "bg-green-50",
                    border: "border-green-300",
                    hover: "hover:bg-green-300",
                    text: "text-green-600",
                    badge: {
                        bg: "bg-green-50",
                        text: "text-green-600",
                        border: "border-green-300",
                        hover: "hover:bg-green-300"
                    },
                }
            case "Cancelled":
                return {
                    bg: "bg-red-50",
                    border: "border-red-300",
                    hover: "hover:bg-red-300",
                    text: "text-red-600",
                    badge: {
                        bg: "bg-red-50",
                        text: "text-red-600",
                        border: "border-red-300",
                        hover: "hover:bg-red-300",
                    },
                }
            case "Cooking":
                return {
                    bg: "bg-gray-50",
                    border: "border-gray-300",
                    text: "text-gray-600",
                    badge: {
                        bg: "bg-gray-50",
                        text: "text-gray-600",
                        border: "border-gray-300",
                        hover: "hover:bg-gray-300",
                    },
                }
            default:
                return {
                    bg: "bg-gray-50",
                    border: "border-gray-300",
                    text: "text-gray-600",
                    badge: {
                        bg: "bg-gray-50",
                        text: "text-gray-600",
                        border: "border-gray-300",
                        hover: "hover:bg-gray-300",
                    },
                }
        }
    }

    // For CheckedOut orders, show a condensed view
    if (orderStatus === "CheckedOut" || orderStatus === "Paid") {
        // Calculate total items
        const totalItems = orderItems.reduce((total, item) => total + item.quantity, 0)

        // Group items by status
        const itemsByStatus = orderItems.reduce(
            (acc, item) => {
                if (!acc[item.orderItemStatus]) {
                    acc[item.orderItemStatus] = 0
                }
                acc[item.orderItemStatus] += item.quantity
                return acc
            },
            {} as Record<string, number>,
        )

        return (
            <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                        <ShoppingBag className="h-3.5 w-3.5 text-blue-600" />
                        <p className="text-sm font-medium text-blue-700">Tổng số món: {totalItems}</p>
                    </div>
                    <Badge className="bg-blue-100 hover:bg-blue-300 text-blue-700 border-blue-300">{orderItems.length} loại món</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                    {Object.entries(itemsByStatus).map(([status, count]) => {
                        const colorClasses = getStatusColorClasses(status)
                        return (
                            <div
                                key={status}
                                className={`flex items-center justify-between text-xs font-semibold p-1.5 px-3 rounded border ${colorClasses.hover} ${colorClasses.bg} ${colorClasses.border}`}
                            >
                                <span className={colorClasses.text}>
                                    {status === "Pending"
                                        ? "Đang chờ"
                                        : status === "Serving"
                                            ? "Đang phục vụ"
                                            : status === "Done"
                                                ? "Hoàn thành"
                                                : status === "Cancelled"
                                                    ? "Đã hủy"
                                                    : status === "Cooking"
                                                        ? "Đang nấu"
                                                        : status}
                                </span>
                                <Badge className={`${colorClasses.badge.bg} ${colorClasses.badge.text} ${colorClasses.badge.border} ${colorClasses.hover}`}>
                                    {count}
                                </Badge>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    // For other statuses, show the detailed view
    return (
        <div className="space-y-2">
            {orderItems.map((item) => (
                <div key={item.id} className="border border-amber-100 rounded-md p-2">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <p className="font-medium text-amber-900 text-xs sm:text-sm">{item.name}</p>
                            <p className="text-xs text-amber-700">
                                {item.quantity} x {formatCurrency(item.price)}
                            </p>
                            {item.note && <p className="text-xs italic text-amber-600 mt-1">Ghi chú: {item.note}</p>}

                            {/* Display order item options if any */}
                            {item.orderItemDetails && item.orderItemDetails.length > 0 && (
                                <div className="mt-1 pl-2 border-l-4 border-amber-100">
                                    {item.orderItemDetails.map((option) => (
                                        <p key={option.id} className="text-xs text-amber-600">
                                            + {option.name} (+{formatCurrency(option.additionalPrice)})
                                        </p>
                                    ))}

                                </div>
                            )}
                            {item.orderItemStatus === 'Cancelled' && (
                                <div className=' flex mt-2 p-2 bg-red-50 rounded-md border truncate border-red-100'>
                                    <h1 className='font-medium text-red-700 text-sm'>Lý do hủy:</h1>
                                    <h1 className='ml-2 text-red-700 text-sm'>{item.reasonCancel || 'Không có lý do'} </h1>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col justify-between min-h-[76px]">
                            <div>{getOrderItemStatusBadge(item.orderItemStatus)}</div>
                            <p className="font-medium text-amber-900 text-xs sm:text-sm text-right mt-auto">
                                {formatCurrency(item.totalPrice)}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
