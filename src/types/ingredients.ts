export type Ingredients = {
    id: string
    name: string
    description: string
}

export type IngredientResult = {
    items: Ingredients[]
    totalCount: number
}
export type CreateIngredient = {
    name: string
    description: string
}