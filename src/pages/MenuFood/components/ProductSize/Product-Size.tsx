"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PlusCircle, ArrowUpDown, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import type { ProductSize } from "@/types/product-sizes"
import { CreateProductSizeDialog } from "./dialogs/CreateProductSizeDialog"
import { ProductSizeTable } from "./ProductSizeTable"
import { useProducts } from "@/hooks/useProducts"
import ProductSizeService from "@/services/productsize-service"

type SortOption = "newest" | "name-asc" | "name-desc" | "diameter-asc" | "diameter-desc"

function ProductSizePage() {
    const [productSizes, setProductSizes] = useState<ProductSize[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const productSizeService = ProductSizeService.getInstance()
    const { loading: productsLoading } = useProducts()

    // Sorting and filtering
    const [sortOption, setSortOption] = useState<SortOption>("newest")
    const [searchTerm, setSearchTerm] = useState("")
    // Thay đổi state filterProductId thành filterProduct với thông tin đầy đủ hơn
    const [filterProduct, setFilterProduct] = useState<{ id: string; name: string } | null>(null)
    const [displayedProductSizes, setDisplayedProductSizes] = useState<ProductSize[]>([])

    const fetchProductSizes = async () => {
        setIsLoading(true)
        try {
            const response = await productSizeService.getAllProductSizes()
            if (response.success && response.result) {
                // Check if items is an array, if not convert it to an array
                const productSizesData = Array.isArray(response.result.items) ? response.result.items : [response.result.items]

                setProductSizes(productSizesData)
                console.log("Fetched product sizes:", productSizesData)
            } else {
                console.error("Failed to fetch product sizes:", response)
                alert("Không thể tải danh sách kích cỡ sản phẩm")
            }
        } catch (error) {
            console.error("Error fetching product sizes:", error)
            alert("Không thể tải danh sách kích cỡ sản phẩm")
        } finally {
            setIsLoading(false)
        }
    }

    // Apply filters and sorting whenever productSizes, sortOption, or filters change
    useEffect(() => {
        let result = [...productSizes]

        // Apply product ID filter
        if (filterProduct) {
            result = result.filter((size) => size.productId === filterProduct.id)
        }

        // Apply search filter
        if (searchTerm) {
            result = result.filter(
                (size) =>
                    (size.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                    (size.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
            )
        }

        // Apply sorting
        switch (sortOption) {
            case "newest":
                // Assuming product sizes are already sorted by newest first
                break
            case "name-asc":
                result.sort((a, b) => a.name.localeCompare(b.name))
                break
            case "name-desc":
                result.sort((a, b) => b.name.localeCompare(a.name))
                break
            case "diameter-asc":
                result.sort((a, b) => a.diameter - b.diameter)
                break
            case "diameter-desc":
                result.sort((a, b) => b.diameter - a.diameter)
                break
        }

        setDisplayedProductSizes(result)
    }, [productSizes, searchTerm, sortOption, filterProduct])

    useEffect(() => {
        fetchProductSizes()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleCreateProductSize = async (data: {
        name: string
        diameter: number
        description: string
        productId: string
    }) => {
        try {
            const response = await productSizeService.createProductSize({
                name: data.name,
                diameter: data.diameter,
                description: data.description,
                productId: data.productId,
            })

            if (response.success) {
                alert("Đã thêm kích cỡ sản phẩm mới")
                fetchProductSizes()
                setIsAddDialogOpen(false)
            } else {
                console.error("Failed to create product size:", response)
                alert(response.message || "Không thể thêm kích cỡ sản phẩm")
            }
        } catch (error) {
            console.error("Error creating product size:", error)
            alert("Không thể thêm kích cỡ sản phẩm")
        }
    }

    const getSortLabel = (option: SortOption): string => {
        switch (option) {
            case "newest":
                return "Mới nhất"
            case "name-asc":
                return "Tên: A-Z"
            case "name-desc":
                return "Tên: Z-A"
            case "diameter-asc":
                return "Đường kính: Tăng dần"
            case "diameter-desc":
                return "Đường kính: Giảm dần"
        }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    const clearSearch = () => {
        setSearchTerm("")
    }

    // Thay đổi hàm clearFilters để reset filterProduct
    const clearFilters = () => {
        setSearchTerm("")
        setFilterProduct(null)
        setSortOption("newest")
    }

    // Function to get product name by ID

    // Thêm hàm để xử lý khi chọn lọc theo sản phẩm
    const handleFilterByProduct = (productId: string, productName: string) => {
        setFilterProduct({ id: productId, name: productName })
    }

    return (
        <div className="">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-2">
                        <CardTitle >Kích cỡ sản phẩm</CardTitle>
                        <CardDescription>Quản lý thông tin về kích cỡ sản phẩm.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm kích cỡ..."
                                className="px-3 py-2 h-9 border rounded-md w-64"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            {searchTerm && (
                                <button className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={clearSearch}>
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            )}
                        </div>


                        <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                            <SelectTrigger className="w-[180px]">
                                <div className="flex items-center gap-2">
                                    <ArrowUpDown className="h-4 w-4" />
                                    <SelectValue placeholder="Sắp xếp">{getSortLabel(sortOption)}</SelectValue>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Mới nhất</SelectItem>
                                <SelectItem value="name-asc">Tên: A-Z</SelectItem>
                                <SelectItem value="name-desc">Tên: Z-A</SelectItem>
                                <SelectItem value="diameter-asc">Đường kính: Tăng dần</SelectItem>
                                <SelectItem value="diameter-desc">Đường kính: Giảm dần</SelectItem>
                            </SelectContent>
                        </Select>


                        <Button variant="green" onClick={() => setIsAddDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Thêm kích cỡ
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className={`${searchTerm || filterProduct || sortOption ? 'h-9 mb-2' : 'h-9'}`}>
                        {(searchTerm || filterProduct || sortOption !== "newest") && (
                            <div className="flex items-center gap-2 ">
                                {searchTerm && (
                                    <Badge variant="secondary" className="flex items-center gap-1 h-9">
                                        Tìm kiếm: {searchTerm}
                                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={clearSearch}>
                                            <X className="h-3 w-3" />
                                            <span className="sr-only">Xóa tìm kiếm</span>
                                        </Button>
                                    </Badge>
                                )}
                                {filterProduct && (
                                    <Badge variant="secondary" className="flex items-center gap-1 h-9">
                                        Sản phẩm: {filterProduct.name}
                                        <Button variant="ghost" size="sm" className=" w-4 p-0 ml-1 h-9" onClick={() => setFilterProduct(null)}>
                                            <X className="h-3 w-3" />
                                            <span className="sr-only">Xóa bộ lọc</span>
                                        </Button>
                                    </Badge>
                                )}
                                {sortOption !== "newest" && (
                                    <Badge variant="outline" className="flex items-center gap-1 h-9">
                                        Sắp xếp: {getSortLabel(sortOption)}
                                    </Badge>
                                )}
                                <Button variant="outline" className="h-9" size="sm" onClick={clearFilters}>
                                    Xóa tất cả bộ lọc
                                </Button>
                            </div>
                        )}
                    </div>

                    <ProductSizeTable
                        productSizes={displayedProductSizes}
                        isLoading={isLoading || productsLoading}
                        onFilterByProduct={handleFilterByProduct}
                    />
                </CardContent>
            </Card>

            <CreateProductSizeDialog
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onCreateProductSize={handleCreateProductSize}
            />
        </div>
    )
}

export default ProductSizePage

