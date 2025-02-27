import { CategoryModel } from "./category";
import { ProductOption } from "./product-option";

export interface ProductModel {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    categoryId: string;
    productType: number;
    category: CategoryModel
    productOptions: ProductOption[]
}


export interface ProductsResult {
    items: ProductModel[]
    totalCount: number
}