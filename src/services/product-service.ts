import ApiResponse, { del, get, } from '@/apis/apiUtils'
import { ProductModel, ProductResponse, ProductsResult } from '@/types/product'

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

      // Calculate skip count based on page and page size
      const skipCount = (page - 1) * pageSize
      const takeCount = pageSize

      // Use TakeCount, SkipCount and SortBy parameters
      const response = await get<ProductsResult>(
        `/products?TakeCount=${takeCount}&SkipCount=${skipCount}&SortBy=${encodeURIComponent(sortBy)}`,
      )

      return response
    } catch (error) {
      console.error(`Error fetching products (page ${page}):`, error)
      throw error
    }
  }

  /**
   * Get all products at once (up to a specified limit)
   * @param limit Maximum number of products to retrieve (default: 1000)
   * @param sortBy Sort field and direction (default: "CreatedDate desc")
   * @returns Promise with products result
   */
  public async getAllProductsAtOnce(limit = 1000, sortBy = "CreatedDate desc"): Promise<ApiResponse<ProductsResult>> {
    try {

      const response = await get<ProductsResult>(`/products?TakeCount=${limit}&SortBy=${encodeURIComponent(sortBy)}`)

      return response
    } catch (error) {
      console.error(`Error fetching all products:`, error)
      throw error
    }
  }
  public async get1000ProductsSortedByCreatedDateDesc(): Promise<ApiResponse<ProductsResult>> {
    try {
      // Sử dụng TakeCount=1000 và SortBy="CreatedDate desc" (sau khi encode)
      const response = await get<ProductsResult>(
        `/products?TakeCount=1000&SortBy=${encodeURIComponent("CreatedDate desc")}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching 1000 products sorted by CreatedDate desc:", error);
      throw error;
    }
  }
  public async getProductById(id: string): Promise<ApiResponse<ProductModel>> {
    try {
      return await get<ProductModel>(`products/${id}?includeProperties=Category%2CProductOptions.Option.OptionItems%2CChildProducts`)
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

  public async createProductWithImage(formData: FormData): Promise<ProductResponse> {
    try {

      const response = await fetch("https://vietsac.id.vn/api/products", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Create product with image response:", result)
      return result
    } catch (error) {
      console.error(`Error creating new product with image:`, error)
      return {
        success: false,
        result: null,
        message: `Error creating product: ${error instanceof Error ? error.message : String(error)}`,
        statusCode: 500,
      }
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
  /**
 * Update an existing product
 * @param id The ID of the product to update
 * @param formData FormData containing the updated product data
 * @returns Promise with the update result
 */
  public async updateProduct(id: string, formData: FormData): Promise<ProductResponse> {
    try {
      console.log(`Updating product ${id} with form data`)

      // Log the form data for debugging
      console.log("Form data being sent:")
      for (const pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1])
      }

      const response = await fetch(`https://vietsac.id.vn/api/products/${id}`, {
        method: "PUT",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Update product response:", result)
      return result
    } catch (error) {
      console.error(`Error updating product ${id}:`, error)
      return {
        success: false,
        result: null,
        message: `Error updating product: ${error instanceof Error ? error.message : String(error)}`,
        statusCode: 500,
      }
    }
  }

  /**
   * Delete a product
   * @param id The ID of the product to delete
   * @returns Promise with the deletion result
   */
  public async deleteProduct(id: string): Promise<ApiResponse<unknown>> {
    try {
      console.log(`Deleting product ${id}`)

      const response = await del<void>(`/products/${id}?isHardDeleted=false`)
      console.log("Delete product response:", response)
      return response
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error)
      return {
        success: false,
        result: null,
        message: `Error deleting product: ${error instanceof Error ? error.message : String(error)}`,
        statusCode: 500,
      }
    }
  }
}

export default ProductService
