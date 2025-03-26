import type ApiResponse from "@/apis/apiUtils"
import { get, post } from "@/apis/apiUtils"
import { CreateProductSize, ProductSize } from "@/types/product-sizes"

type ProductSizeResult = {
    items: ProductSize[] | ProductSize
    totalCount: number
}

export default class ProductSizeService {
    private static instance: ProductSizeService

    private constructor() { }

    public static getInstance(): ProductSizeService {
        if (!ProductSizeService.instance) {
            ProductSizeService.instance = new ProductSizeService()
        }
        return ProductSizeService.instance
    }

    /**
     * Get all product sizes
     * @returns Promise with all product sizes
     */
    public async getAllProductSizes(): Promise<ApiResponse<ProductSizeResult>> {
        try {
            console.log("Calling getAllProductSizes API")
            const response = await get<ProductSizeResult>(`/product-sizes?IncludeProperties=Recipes`)
            console.log("API response:", response)
            return response
        } catch (error) {
            console.error("Error fetching all product sizes:", error)
            throw error
        }
    }

    /**
     * Get product sizes by product ID
     * @param productId The ID of the product
     * @returns Promise with product sizes for the specified product
     */
    public async getProductSizesByProductId(productId: string): Promise<ApiResponse<ProductSizeResult>> {
        try {
            console.log(`Calling getProductSizesByProductId API for product ${productId}`)
            const response = await get<ProductSizeResult>(`/productsizes/get-productsizes-by-product?productId=${productId}`)
            console.log("API response:", response)
            return response
        } catch (error) {
            console.error(`Error fetching product sizes for product ${productId}:`, error)
            throw error
        }
    }

    /**
     * Get a product size by ID
     * @param id The ID of the product size
     * @returns Promise with the product size
     */
    public async getProductSizeById(id: string): Promise<ApiResponse<ProductSize>> {
        try {
            console.log(`Calling getProductSizeById API for ID ${id}`)
            const response = await get<ProductSize>(`/productsizes/${id}`)
            console.log("API response:", response)
            return response
        } catch (error) {
            console.error(`Error fetching product size with id ${id}:`, error)
            throw error
        }
    }

    /**
     * Create a new product size
     * @param data The product size data to create
     * @returns Promise with the creation result
     */
    public async createProductSize(data: CreateProductSize): Promise<ApiResponse<void>> {
        try {
            console.log("Creating product size with data:", data)
            const response = await post<void>(`/productsizes`, data)
            console.log("Create product size response:", response)
            return response
        } catch (error) {
            console.error(`Error creating new product size:`, error)
            throw error
        }
    }
}

