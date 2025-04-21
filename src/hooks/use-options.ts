"use client"

import { useState, useEffect, useCallback } from "react"
import OptionService from "@/services/option-service"
import type { Option } from "@/types/option"
import { toast } from "sonner"

export function useOptions() {
    const [options, setOptions] = useState<Option[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchOptions = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const optionService = OptionService.getInstance()
            const response = await optionService.getAllOptions()

            if (response.success && response.result) {
                console.log("Options loaded successfully:", response.result)
                // Extract items and totalCount from the response
                const { items, totalCount } = response.result

                if (Array.isArray(items)) {
                    setOptions(items)
                    setTotalCount(totalCount)
                } else {
                    const errorMessage = "Dữ liệu tùy chọn không đúng định dạng"
                    console.error(errorMessage, response.result)
                    setOptions([])
                    setError(errorMessage)
                    toast.error(errorMessage)
                }
            } else {
                const errorMessage = "Không thể tải danh sách tùy chọn"
                console.error(errorMessage, response.message)
                setOptions([])
                setError(errorMessage)
                toast.error(errorMessage)
            }
        } catch (err) {
            const errorMessage = "Lỗi khi tải danh sách tùy chọn"
            console.error(errorMessage, err)
            setOptions([])
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Fetch options on initial mount
    useEffect(() => {
        fetchOptions()
    }, [fetchOptions])

    return {
        options,
        totalCount,
        isLoading,
        error,
        fetchOptions, // Expose the fetch function to allow manual refreshing
    }
}
