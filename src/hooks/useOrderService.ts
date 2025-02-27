"use client"

import { useState, useCallback, useEffect } from "react"
import type { CreateOrderResponse, AddFoodResponse, Order, } from "@/types/order"
import type ApiResponse from "@/apis/apiUtils"
import OrderService from "@/services/order-service"
import useTable from "./useTable"

export function useOrderService() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [order, setOrder] = useState<Order[]>([])
    const { currentOrderId_ } = useTable()

    const createOrder = useCallback(async (tableIdJson: string): Promise<ApiResponse<CreateOrderResponse> | null> => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await OrderService.getInstance().createOrder(tableIdJson)
            return response
        } catch (err) {
            setError("Error creating order")
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    const addFoodToOrder = useCallback(async (orderDataJson: string): Promise<ApiResponse<AddFoodResponse> | null> => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await OrderService.getInstance().addFoodToOrder(orderDataJson)
            return response
        } catch (err) {
            setError("Error add Food to Order")
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])



    const fetchOrderById = useCallback(async () => {

        if (!currentOrderId_) {
            setIsLoading(true)
            setError(null)
            return
        }
        try {
            const response = await OrderService.getInstance().getOrderById(`${currentOrderId_}`)
            if (response.success && response.result) {
                setOrder([response.result])
            } else {
                setOrder([])
            }

        } catch (err) {
            setError("error get orderById")
            return null
        } finally {
            setIsLoading(false)
        }
    }, [currentOrderId_])




    useEffect(() => {
        fetchOrderById()
    }, [fetchOrderById])



    return {
        fetchOrderById,
        order,
        createOrder,
        addFoodToOrder,
        isLoading,
        error,
    }
}

