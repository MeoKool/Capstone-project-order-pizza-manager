import ApiResponse, { get, post } from '@/apis/apiUtils'
import { ProductResponse, ProductsResult } from '@/types/product'

class ProductService {
  private static instance: ProductService

  private constructor() { }

  public static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService()
    }
    return ProductService.instance
  }
  public async getAllProducts(
    page = 1,
    pageSize = 20,
    sortBy = "CreatedDate%20desc",
  ): Promise<ApiResponse<ProductsResult>> {
    try {
      console.log(`Calling getAllProducts API - page: ${page}, pageSize: ${pageSize}, sortBy: ${sortBy}`)

      // Calculate skip count based on page and page size
      const skipCount = (page - 1) * pageSize
      const takeCount = pageSize

      // Use TakeCount, SkipCount and SortBy parameters
      const response = await get<ProductsResult>(
        `/products?TakeCount=${takeCount}&SkipCount=${skipCount}&SortBy=${encodeURIComponent(sortBy)}`,
      )

      console.log(`API response for page ${page}:`, response)
      return response
    } catch (error) {
      console.error(`Error fetching products (page ${page}):`, error)
      throw error
    }
  }

  /**
   * Get products with custom query parameters
   * @param params Object containing query parameters
   * @returns Promise with products result
   */
  public async getProductsWithParams(params: Record<string, string | number>): Promise<ApiResponse<ProductsResult>> {
    try {
      // Convert params object to URL query string
      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&")

      console.log(`Calling getProductsWithParams API with query: ${queryString}`)

      const response = await get<ProductsResult>(`/products?${queryString}`)

      console.log(`API response for custom query:`, response)
      return response
    } catch (error) {
      console.error(`Error fetching products with custom params:`, error)
      throw error
    }
  }

  /**
   * Get all products at once (up to a specified limit)
   * @param limit Maximum number of products to retrieve (default: 1000)
   * @param sortBy Sort field and direction (default: "CreatedDate desc")
   * @returns Promise with products result
   */
  public async getAllProductsAtOnce(limit = 1000, sortBy = "CreatedDate%20desc"): Promise<ApiResponse<ProductsResult>> {
    try {
      console.log(`Calling getAllProductsAtOnce API with limit: ${limit}, sortBy: ${sortBy}`)

      const response = await get<ProductsResult>(`/products?TakeCount=${limit}&SortBy=${encodeURIComponent(sortBy)}`)

      console.log(`API response for all products:`, response)
      return response
    } catch (error) {
      console.error(`Error fetching all products:`, error)
      throw error
    }
  }

  public async getProductById(id: string): Promise<ApiResponse<ProductsResult>> {
    try {
      return await get<ProductsResult>(`/products/${id}`)
    } catch (error) {
      console.error(`Error fetching product with id ${id}:`, error)
      throw error
    }
  }
  public async getProductsByCategory(categoryId: string): Promise<ApiResponse<ProductsResult>> {
    try {
      return await get<ProductsResult>(`/products?categoryId=${categoryId}`)
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId}:`, error)
      throw error
    }
  }

  public async createProduct(data: string): Promise<ProductResponse> {
    try {
      const formDataJson = JSON.parse(data)
      const response = await post<ProductResponse>(`/products`, formDataJson)
      console.log("Create product response:", response)
      return response.result
    } catch (error) {
      console.error(`Error creating new product:`, error)
      throw error
    }
  }

  /**
   * Upload product image
   * @param formData FormData containing productId and image file
   * @returns Promise with the upload result
   */
  public async uploadProductImage(productId: string, file: File): Promise<ProductResponse> {
    try {
      console.log("Uploading product image using PUT method")

      // Create FormData with the correct field names
      const formData = new FormData()
      formData.append("Id", productId) // Changed from 'productId' to 'Id'
      formData.append("file", file)

      // Log the FormData contents for debugging
      console.log("FormData contents:")
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1])
      }

      // Simple PUT request with FormData
      const response = await fetch("https://vietsac.id.vn/api/products/upload-image", {
        method: "PUT",
        body: formData,
      })

      // Parse JSON response
      const result = await response.json()
      console.log("Upload image response:", result)
      return result
    } catch (error) {
      console.error(`Error uploading product image:`, error)
      return {
        success: false,
        result: null,
        message: `Error uploading image: ${error instanceof Error ? error.message : String(error)}`,
        statusCode: 500,
      }
    }
  }
}

export default ProductService
