import ApiResponse, { get } from "@/apis/apiUtils"
import type { OptionResult } from "@/types/option"

export default class OptionService {
    private static instance: OptionService

    private constructor() { }

    public static getInstance(): OptionService {
        if (!OptionService.instance) {
            OptionService.instance = new OptionService()
        }
        return OptionService.instance
    }

    /**
     * Lấy toàn bộ danh sách options
     * @returns Promise<ApiResponse<Option[]>>
     */
    public async getAllOptions(): Promise<ApiResponse<OptionResult>> {
        try {
            console.log("Calling getAllOptions API...")
            const response = await get<OptionResult>(`/options?TakeCount=1000&SortBy=Name%20Desc&IncludeProperties=OptionItems`)
            return response
        } catch (error) {
            console.error("Error fetching options:", error)
            throw error
        }
    }
}
