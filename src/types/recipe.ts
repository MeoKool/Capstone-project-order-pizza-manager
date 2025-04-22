
export enum UnitType {
    Milligram = "Milligram",
    Gram = "Gram",
    Kilogram = "Kilogram",
    Milliliter = "Milliliter",
    Liter = "Liter",
    Piece = "Piece",
    Teaspoon = "Teaspoon",
    Tablespoon = "Tablespoon",
}

export interface Recipe {
    id: string
    productId: string
    ingredientId: string
    ingredientName: string
    unit: UnitType
    quantity: number
    ingredient: Ingredient
}
export interface Ingredient {
    id: string
    name: string
    description: string | null
}

export interface RecipesResult {
    items: Recipe[] | Recipe
    totalCount: number
}






export interface CreateRecipe {
    productSizeId: string
    ingredientId: string
    ingredientName: string
    unit: UnitType
    quantity: number
}

// Định nghĩa kiểu dữ liệu để cập nhật Recipe
export interface UpdateRecipe {
    id: string
    productSizeId?: string
    ingredientId?: string
    unit?: UnitType
    quantity?: number
}

