import type { CategoryModel } from "./category"
import type { ProductOption } from "./product-option"

export interface ProductModel {
  id: string
  name: string
  price: number
  imageUrl: string | null
  imagePublicId: string | null
  description: string
  categoryId: string
  productType: string
  category: CategoryModel | null
  productOptions: ProductOption[]
  productRole: 'Child' | 'Master'
  childProducts: ChildProducts[]
}
export interface ChildProducts {
  id: string
  name: string
  price: number

}
export interface ProductsResult {
  items: ProductModel[]
  totalCount: number
}

export interface ProductFormData {
  name: string
  price: number
  image: File | null
  description: string
  categoryId: string
  productType: string
  optionIds: string
  sizes: string
}

export interface ComboProductFormData {
  name: string
  price: number
  image: string
  description: string
  categoryId: string
  productType: string
  comboProducts: string
}

export interface ProductResponse {
  success: boolean
  result: {
    id: string
  } | null
  message: string
  statusCode: number
}

