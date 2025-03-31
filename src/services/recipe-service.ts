import type ApiResponse from "@/apis/apiUtils"
import { get, post, put, del } from "@/apis/apiUtils"
import type { Recipe, RecipesResult, CreateRecipe, UpdateRecipe } from "@/types/recipe"

export default class RecipeService {
    private static instance: RecipeService

    private constructor() { }

    public static getInstance(): RecipeService {
        if (!RecipeService.instance) {
            RecipeService.instance = new RecipeService()
        }
        return RecipeService.instance
    }

    /**
     * Get all recipes with pagination and sorting
     * @param takeCount Number of items to take (default: 100)
     * @param sortBy Sorting option (default: "CreatedDate desc")
     * @returns Promise with recipes result
     */
    public async getAllRecipes(takeCount = 100, sortBy = "CreatedDate desc"): Promise<ApiResponse<RecipesResult>> {
        try {
            console.log(`Calling getAllRecipes API with takeCount: ${takeCount}, sortBy: ${sortBy}`)

            // Encode parameters for URL
            const encodedSortBy = encodeURIComponent(sortBy)

            const url = `/recipes?TakeCount=${takeCount}&SortBy=${encodedSortBy}`
            const response = await get<RecipesResult>(url)

            console.log("API response:", response)
            return response
        } catch (error) {
            console.error(`Error fetching recipes:`, error)
            throw error
        }
    }

    /**
     * Get recipes with specific sorting
     * @param sortField Field to sort by: "Unit", "Name", or "CreatedDate"
     * @param sortDirection Sort direction: "asc" or "desc"
     * @param takeCount Number of items to take (default: 100)
     * @returns Promise with recipes result
     */
    public async getRecipesWithSorting(
        sortField: "Unit" | "Name" | "CreatedDate",
        sortDirection: "asc" | "desc" = "desc",
        takeCount = 100,
    ): Promise<ApiResponse<RecipesResult>> {
        const sortBy = `${sortField} ${sortDirection}`
        return this.getAllRecipes(takeCount, sortBy)
    }

    /**
     * Get recipes by product size ID
     * @param productSizeId The ID of the product size
     * @returns Promise with recipes for the specified product size
     */
    public async getRecipesByProductSizeId(productSizeId: string): Promise<ApiResponse<RecipesResult>> {
        try {
            console.log(`Calling getRecipesByProductSizeId API for product size ${productSizeId}`)
            const response = await get<RecipesResult>(`/recipes/by-product-size/${productSizeId}`)
            console.log("API response:", response)
            return response
        } catch (error) {
            console.error(`Error fetching recipes for product size ${productSizeId}:`, error)
            throw error
        }
    }

    /**
     * Get a recipe by ID
     * @param id The ID of the recipe
     * @returns Promise with the recipe
     */
    public async getRecipeById(id: string): Promise<ApiResponse<Recipe>> {
        try {
            console.log(`Calling getRecipeById API for ID ${id}`)
            const response = await get<Recipe>(`/recipes/${id}`)
            console.log("API response:", response)
            return response
        } catch (error) {
            console.error(`Error fetching recipe with id ${id}:`, error)
            throw error
        }
    }

    /**
     * Create a new recipe
     * @param data The recipe data to create
     * @returns Promise with the creation result
     */
    public async createRecipe(data: CreateRecipe): Promise<ApiResponse<void>> {
        try {
            console.log("Creating recipe with data:", data)
            const response = await post<void>(`/recipes`, data)
            console.log("Create recipe response:", response)
            return response
        } catch (error) {
            console.error(`Error creating new recipe:`, error)
            throw error
        }
    }

    /**
     * Update an existing recipe
     * @param id The ID of the recipe to update
     * @param data The updated recipe data
     * @returns Promise with the update result
     */
    public async updateRecipe(id: string, data: Partial<UpdateRecipe>): Promise<ApiResponse<void>> {
        try {
            console.log(`Updating recipe ${id} with data:`, data)
            const response = await put<void>(`/recipes/${id}`, data)
            console.log("Update recipe response:", response)
            return response
        } catch (error) {
            console.error(`Error updating recipe ${id}:`, error)
            throw error
        }
    }

    /**
     * Delete a recipe
     * @param id The ID of the recipe to delete
     * @returns Promise with the deletion result
     */
    public async deleteRecipe(id: string): Promise<ApiResponse<void>> {
        try {
            console.log(`Deleting recipe ${id}`)
            const response = await del<void>(`/recipes/${id}`)
            console.log("Delete recipe response:", response)
            return response
        } catch (error) {
            console.error(`Error deleting recipe ${id}:`, error)
            throw error
        }
    }
}

