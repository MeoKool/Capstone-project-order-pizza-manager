export type CreateProductSize = {
    name: string
    diameter: number
    description: string
    productId: string
}

export type ProductSize = {
    id: string
    name: string
    diameter: number
    description: string | null
    productId: string
    recipes: Recipe
}

export type Recipe = {
    productId: string
    ingredientId: string
    ingredientName: string
    unit: string
    quantity: number
    ingredient: string

}