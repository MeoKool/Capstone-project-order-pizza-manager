export interface OrderItem {
    productId: string
    optionItemIds: string[] | null
    quantity: number
    note: string
}

export interface AddFoodToOrderRequest {
    orderId: string;
    orderItems: OrderItem[];
}
export interface Order {
    id: string;
    tableCode: string;
    totalPrice: number;
    orderCode: string;
    startTime: string;
    endTime: string | null;
    status: string;
    tableId: string;
    table: any;
}

// Response
export interface CreateOrderResponse {
    success: boolean;
    result: OrderIdResponse;
    message: string;
    statusCode: number;
}
export interface OrderIdResponse {
    id: string;
}
export interface AddFoodResponse {
    success: boolean
    result: null
    message: string
    statusCode: number
}
export const PAYMENT_STATUS = {
    PAID: "Paid",
    CHECKOUT: "CheckedOut",
    UNPAID: "Unpaid",
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];