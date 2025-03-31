import { useState, useEffect, useCallback, useMemo } from "react"
import type { ProductModel } from "@/types/product"
import ProductService from "@/services/product-service"

export function useProducts() {
    // Store all products fetched from API
    const [allProducts, setAllProducts] = useState<ProductModel[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [, setTotalCount] = useState(0)

    // Add pagination and sorting state
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(12)
    const [sortBy, setSortBy] = useState("CreatedDate desc")
    const [categoryId, setCategoryId] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [productALL, setProductALL] = useState<ProductModel[]>([]);

    // Fetch all products from the API
    const fetchAllProducts = useCallback(async () => {
        setLoading(true)
        try {
            const productService = ProductService.getInstance()

            // Fetch all products at once with a large limit
            const response = await productService.getAllProductsAtOnce(1000, sortBy)

            if (response.success && response.result) {
                // Check if items is an array, if not convert it to an array
                const productsData = Array.isArray(response.result.items) ? response.result.items : [response.result.items]
                setAllProducts(productsData)
                setTotalCount(response.result.totalCount)
                console.log(`Fetched ${productsData.length} products out of ${response.result.totalCount}`)
            } else {
                throw new Error(response.message || "Failed to fetch products")
            }
        } catch (err) {
            console.error("Error fetching products:", err)
            setError(err instanceof Error ? err : new Error("Unknown error"))
        } finally {
            setLoading(false)
        }
    }, [sortBy])
    const fetchProductALL = useCallback(async () => {
        try {
            const productService = ProductService.getInstance();
            const response = await productService.get1000ProductsSortedByCreatedDateDesc();

            if (response.success && response.result) {
                const productsData = Array.isArray(response.result.items)
                    ? response.result.items
                    : [response.result.items];
                setProductALL(productsData);
                console.log(`Fetched ${productsData.length} products (ALL)`);
            } else {
                throw new Error(response.message || "Failed to fetch all products");
            }
        } catch (error) {
            console.error("Error fetching productALL:", error);
        }
    }, []);
    // Initial fetch
    useEffect(() => {
        fetchAllProducts()
    }, [fetchAllProducts])
    // Gọi fetchProductALL khi mount để lấy toàn bộ sản phẩm
    useEffect(() => {
        fetchProductALL();
    }, [fetchProductALL]);

    // Helper function to sort products - MOVE THIS BEFORE filteredProducts
    const sortProducts = (products: ProductModel[], sortOption: string) => {
        const sorted = [...products]

        switch (sortOption) {
            case "Price desc":
                return sorted.sort((a, b) => b.price - a.price)
            case "Price asc":
                return sorted.sort((a, b) => a.price - b.price)
            case "Name asc":
                return sorted.sort((a, b) => a.name.localeCompare(b.name))
            case "Name desc":
                return sorted.sort((a, b) => b.name.localeCompare(a.name))
            case "CreatedDate desc":
                // Assuming products have a createdAt field, if not, this will need adjustment
                return sorted // Keep original order which should be by creation date
            default:
                return sorted
        }
    }

    // Apply filters and sorting to get displayed products
    const filteredProducts = useMemo(() => {
        let result = [...allProducts]

        // Apply category filter
        if (categoryId) {
            result = result.filter((product) => product.categoryId === categoryId)
        }

        // Apply search filter
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase()
            result = result.filter(
                (product) =>
                    product.name.toLowerCase().includes(searchLower) ||
                    (product.description && product.description.toLowerCase().includes(searchLower)),
            )
        }

        // Apply sorting
        result = sortProducts(result, sortBy)

        return result
    }, [allProducts, categoryId, searchQuery, sortBy])

    // Get paginated products for current page
    const products = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return filteredProducts.slice(start, start + pageSize)
    }, [filteredProducts, currentPage, pageSize])

    // Function to change page
    const goToPage = useCallback(
        (page: number) => {
            const maxPage = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
            setCurrentPage(Math.min(page, maxPage))
        },
        [filteredProducts.length, pageSize],
    )

    // Function to change page size
    const changePageSize = useCallback((size: number) => {
        setPageSize(size)
        setCurrentPage(1) // Reset to first page when changing page size
    }, [])

    // Function to change sort order
    const changeSortOrder = useCallback((sort: string) => {
        setSortBy(sort)
        setCurrentPage(1) // Reset to first page when changing sort
    }, [])

    // Function to filter by category
    const filterByCategory = useCallback((category: string) => {
        setCategoryId(category)
        setCurrentPage(1) // Reset to first page when changing category
    }, [])

    // Function to search products
    const searchProducts = useCallback((query: string) => {
        setSearchQuery(query)
        setCurrentPage(1) // Reset to first page when searching
    }, [])

    // Function to refresh products
    const refreshProducts = useCallback(() => {
        return fetchAllProducts()
    }, [fetchAllProducts])

    // Helper function to get sort label
    const getSortLabel = (option: string): string => {
        switch (option) {
            case "Price desc":
                return "Giá: Cao đến thấp"
            case "Price asc":
                return "Giá: Thấp đến cao"
            case "Name 0asc":
                return "Tên: A-Z"
            case "Name desc":
                return "Tên: Z-A"
            case "CreatedDate desc":
                return "Mới nhất"
            default:
                return option.includes("CategoryId") ? "Danh mục" : "Mới nhất"
        }
    }

    return {
        products,
        loading,
        productALL, // State lưu toàn bộ sản phẩm
        error,
        totalCount: filteredProducts.length, // Update total count to reflect filtered results
        currentPage,
        pageSize,
        sortBy,
        categoryId,
        searchQuery,
        goToPage,
        changePageSize,
        changeSortOrder,
        filterByCategory,
        searchProducts,
        refreshProducts,
        getSortLabel,
    }
}

export default useProducts

