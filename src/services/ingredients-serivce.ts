import type ApiResponse from "@/apis/apiUtils"
import { get, post, } from "@/apis/apiUtils"
import { CreateIngredient, IngredientResult, Ingredients } from "@/types/ingredients"

export default class IngredientsService {
    private static instance: IngredientsService
    private constructor() { }
    public static getInstance(): IngredientsService {
        if (!IngredientsService.instance) {
            IngredientsService.instance = new IngredientsService()
        }
        return IngredientsService.instance
    }

    public async getAllIngredients(): Promise<ApiResponse<IngredientResult>> {
        try {
            return await get<IngredientResult>(`/ingredients?TakeCount=1000&SortBy=CreatedDate%20desc`)
        } catch (error) {
            console.error("Error fetching all ingredients:", error)
            throw error
        }
    }

    public async getIngredientById(id: string): Promise<ApiResponse<Ingredients>> {
        try {
            return await get<Ingredients>(`/ingredients/${id}`)
        } catch (error) {
            console.error(`Error fetching ingredient with id ${id}:`, error)
            throw error
        }
    }

    public async createIngredient(data: Partial<CreateIngredient>): Promise<ApiResponse<void>> {
        try {
            return await post<void>(`/ingredients`, data)
        } catch (error) {
            console.error(`Error creating new ingredient:`, error)
            throw error
        }
    }





}

