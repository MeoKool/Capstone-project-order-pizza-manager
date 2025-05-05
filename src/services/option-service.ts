import ApiResponse, { get, put } from "@/apis/apiUtils"
import type { OPTIONITEM_STATUS, OptionResult } from "@/types/option"

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
    public async updateStatusOptionItem(id: string, optionItemStatus: OPTIONITEM_STATUS): Promise<ApiResponse<void>> {
        try {
            const req = {
                id,
                optionItemStatus
            }
            return await put<void>(`/option-items/update-status/${id}`, req)
        } catch (error) {
            console.log(`error update option item status with id ${id}`, error);
            throw error

        }
    }
}
