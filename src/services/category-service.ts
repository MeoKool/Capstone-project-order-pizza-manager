import ApiResponse, { get } from "@/apis/apiUtils"
import type { CategoriesResult } from "@/types/category"

class CategoryService {
    private static instance: CategoryService

    private constructor() { }

    public static getInstance(): CategoryService {
        if (!CategoryService.instance) {
            CategoryService.instance = new CategoryService()
        }
        return CategoryService.instance
    }

    public async getAllCategories(): Promise<ApiResponse<CategoriesResult>> {
        try {
            return await get<CategoriesResult>(`/categories`)
        } catch (error) {
            console.error("Error fetching all categories:", error)
            throw error
        }
    }

    public async getCategoryById(id: string): Promise<ApiResponse<CategoriesResult>> {
        try {
            return await get<CategoriesResult>(`/?CategoryId=${id}`)
        } catch (error) {
            console.error(`Error fetching category with id ${id}:`, error)
            throw error
        }
    }
}

export default CategoryService

