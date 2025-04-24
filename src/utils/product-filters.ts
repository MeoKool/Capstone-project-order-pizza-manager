import type { ProductModel } from "@/types/product"

/**
 * Filters products based on product role, status, and child products
 *
 * Rules:
 * 1. For Master products with status "Available" and with child products:
 *    - Show ONLY the child products (not the master)
 *    - Child products inherit the "Available" status from the master
 * 2. For Master products with status "Available" and without child products:
 *    - Show the master product itself
 * 3. For Master products without status "Available":
 *    - Don't show them or their child products
 * 4. For non-master products:
 *    - Don't show them at all
 *
 * @param products Array of products to filter
 * @param searchQuery Optional search query to filter by name
 * @returns Filtered array of products
 */
export function getFilteredProducts(products: ProductModel[], searchQuery = ""): ProductModel[] {
    if (!products || !Array.isArray(products)) {
        return []
    }

    let result: ProductModel[] = []

    for (const product of products) {
        // Only process master products with status "Available"
        if (product.productRole === "Master" && product.productStatus === "Available") {
            // If master has child products, add ONLY the child products (not the master)
            if (product.childProducts && product.childProducts.length > 0) {
                // Find full child product objects from the original products array
                const childProductIds = product.childProducts.map((child) => child.id)
                const fullChildProducts = products.filter((p) => childProductIds.includes(p.id))

                // Add child products to result (they inherit Available status from master)
                if (fullChildProducts.length > 0) {
                    result = [...result, ...fullChildProducts]
                }
            } else {
                // For master products without child products, add the master product itself
                result.push(product)
            }
        }
        // Non-master products are NOT included
        // Master products without "Available" status are NOT included
    }

    // Apply search filter if provided
    if (searchQuery && searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim()
        return result.filter((product) => product.name.toLowerCase().includes(query))
    }

    return result
}

/**
 * Alternative implementation that returns a flattened list of products
 * following the same rules as getFilteredProducts
 */
export function getAllFilteredProducts(products: ProductModel[], searchQuery = ""): ProductModel[] {
    if (!products || !Array.isArray(products)) {
        return []
    }

    // Create a map to track which products we've already included
    const includedProductIds = new Set<string>()
    const result: ProductModel[] = []

    // Process each product
    for (const product of products) {
        // Only process master products with status "Available"
        if (product.productRole === "Master" && product.productStatus === "Available") {
            // If master has child products, add ONLY the child products (not the master)
            if (product.childProducts && product.childProducts.length > 0) {
                const childProductIds = product.childProducts.map((child) => child.id)
                const fullChildProducts = products.filter((p) => childProductIds.includes(p.id))

                // Add child products if not already included (they inherit Available status from master)
                for (const childProduct of fullChildProducts) {
                    if (!includedProductIds.has(childProduct.id)) {
                        result.push(childProduct)
                        includedProductIds.add(childProduct.id)
                    }
                }
            }
            // For master products without child products, add the master product itself
            else if (!includedProductIds.has(product.id)) {
                result.push(product)
                includedProductIds.add(product.id)
            }
        }
        // Non-master products are NOT included
        // Master products without "Available" status are NOT included
    }

    // Apply search filter if provided
    if (searchQuery && searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim()
        return result.filter((product) => product.name.toLowerCase().includes(query))
    }

    return result
}
