import type { CategoryModel } from "./category"
import type { ProductOption } from "./product-option"
import { ProductSize } from "./product-sizes"

export interface ProductModel {
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
  productSizes: ProductSize[]
  options: ProductOption[]
}

export interface ProductsResult {
  items: ProductModel[]
  totalCount: number
}

export interface ProductFormData {
  name: string
  price: number
  description: string
  categoryId: string
  productType?: string
  image?: string
}

export interface ProductResponse {
  success: boolean
  result: {
    id: string
  } | null
  message: string
  statusCode: number
}

