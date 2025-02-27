import OptionItem from "./option"

export interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    image?: string
    selectedOptions: OptionItem[]
    uniqueId: string
}