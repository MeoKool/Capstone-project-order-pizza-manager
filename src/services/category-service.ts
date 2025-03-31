import type ApiResponse from "@/apis/apiUtils"
import { get, post, put, del } from "@/apis/apiUtils"
import type { CategoryModel, CategoriesResult } from "@/types/category"

export default class CategoryService {
    private static instance: CategoryService

    private constructor() { }

    public static getInstance(): CategoryService {
        if (!CategoryService.instance) {
            CategoryService.instance = new CategoryService()
        }
        return CategoryService.instance
    }

    /**
     * Get all categories with sorting options
     * @param sortBy Optional sorting parameter: "CreatedDate desc" (newest), "Name asc" (A-Z), or "Name desc" (Z-A)
     * @returns Promise with all categories sorted according to the parameter
     */
    public async getAllCategories(sortBy = "CreatedDate desc"): Promise<ApiResponse<CategoriesResult>> {
        try {
            // Encode the sortBy parameter for URL
            const encodedSortBy = encodeURIComponent(sortBy)
            const url = `/categories?SortBy=${encodedSortBy}`
            const response = await get<CategoriesResult>(url)
            return response
        } catch (error) {
            console.error("Error fetching all categories:", error)
            throw error
        }
    }

    /**
     * Create a new category
     * @param data The category data to create
     * @returns Promise with the creation result
     */
    public async createCategory(data: Omit<CategoryModel, "id">): Promise<ApiResponse<void>> {
        try {
            const response = await post<void>(`/categories`, data)
            console.log("Create category response:", response)
            return response
        } catch (error) {
            console.error(`Error creating new category:`, error)
            throw error
        }
    }

    /**
     * Update an existing category
     * @param id The ID of the category to update
     * @param data The updated category data
     * @returns Promise with the update result
     */
    public async updateCategory(id: string, data: Partial<CategoryModel>): Promise<ApiResponse<void>> {
        try {
            const response = await put<void>(`/categories/${id}`, data)
            console.log("Update category response:", response)
            return response
        } catch (error) {
            console.error(`Error updating category ${id}:`, error)
            throw error
        }
    }

    /**
     * Delete a category
     * @param id The ID of the category to delete
     * @returns Promise with the deletion result
     */
    public async deleteCategory(id: string): Promise<ApiResponse<void>> {
        try {
            const response = await del<void>(`/categories/${id}`)
            return response
        } catch (error) {
            console.error(`Error deleting category ${id}:`, error)
            throw error
        }
    }
}

