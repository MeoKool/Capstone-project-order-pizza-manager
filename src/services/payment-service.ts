import ApiResponse, { post } from "@/apis/apiUtils"

/**
 * Service for handling payment-related operations
 */
class PaymentService {
    private static instance: PaymentService

    private constructor() { }

    /**
     * Get the singleton instance of PaymentService
     * @returns PaymentService instance
     */
    public static getInstance(): PaymentService {
        if (!PaymentService.instance) {
            PaymentService.instance = new PaymentService()
        }
        return PaymentService.instance
    }

    /**
     * Create a payment QR code for an order
     * @param orderId The ID of the order
     * @returns Promise with the API response
     */
    public async createPaymentQRCode(orderId: string): Promise<ApiResponse<void>> {
        try {
            return await post<void>(`/payments/create-payment-qrcode/${orderId}`, { orderId })
        } catch (error) {
            console.error(`Error creating payment QR code for order ${orderId}:`, error)
            throw error
        }
    }

    /**
     * Cancel a payment QR code for an order
     * @param orderId The ID of the order
     * @returns Promise with the API response
     */
    public async cancelPaymentQRCode(orderId: string): Promise<ApiResponse<void>> {
        try {
            return await post<void>(`/payments/cancel-payment-qrcode/${orderId}`, { orderId })
        } catch (error) {
            console.error(`Error canceling payment QR code for order ${orderId}:`, error)
            throw error
        }
    }

    /**
     * Mark an order as paid by cash
     * @param orderId The ID of the order
     * @returns Promise with the API response
     */
    public async payOrderByCash(orderId: string): Promise<ApiResponse<void>> {
        try {
            return await post<void>(`/payments/pay-order-by-cash/${orderId}`, { orderId })
        } catch (error) {
            console.error(`Error paying order ${orderId} by cash:`, error)
            throw error
        }
    }
}

export default PaymentService
