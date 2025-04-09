import type { CategoryModel } from "./category"

// Update the Ingredient interface
export interface Ingredient {
    id: string
    name: string
    description: string | null
}

// Update the ProductDetailRecipe interface to use the Ingredient type
export interface ProductDetailRecipe {
    id: string
    productSizeId: string
    ingredientId: string
    ingredientName: string
    unit: string
    quantity: number
    ingredient: Ingredient[] | null
}

export interface ProductDetailSize {
    id: string
    name: string
    diameter: number
    description: string
    productId: string
    recipes: ProductDetailRecipe[]
}

export interface ProductDetailOptionItem {
    id: string
    name: string
    additionalPrice: number
}

export interface ProductDetailOption {
    id: string
    name: string
    SelectMany: boolean
    description: string
    optionItems: ProductDetailOptionItem[]
}

export interface ProductDetail {
    id: string
    name: string
    price: number
    image: string
    imageUrl: string | null
    imagePublicId: string | null
    description: string
    categoryId: string
    productType: string
    category: CategoryModel | null
    productSizes: ProductDetailSize[]
    options: ProductDetailOption[]
}

