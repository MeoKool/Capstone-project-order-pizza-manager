// Định nghĩa các đơn vị đo lường
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

// Định nghĩa kiểu dữ liệu Recipe
export interface Recipe {
    id: string
    productSizeId: string
    ingredientId: string
    ingredientName: string
    unit: UnitType
    quantity: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ingredient: any | null
}

// Định nghĩa kiểu dữ liệu kết quả trả về từ API
export interface RecipesResult {
    items: Recipe[] | Recipe
    totalCount: number
}

// Định nghĩa kiểu dữ liệu để tạo mới Recipe
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

