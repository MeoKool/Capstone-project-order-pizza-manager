"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
    MoreVertical,
    Edit,
    Trash2,
    Filter,
    ArrowUpDown,
    Check,
    X,
    PlusCircle,
    RefreshCw,
    ImagePlus,
    Eye,
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

import useProducts from "@/hooks/useProducts"
import useCategories from "@/hooks/useCategories"
import type { ProductModel } from "@/types/product"

import PaginationControls from "./PaginationControls"
import { EditFoodDialog } from "./dialogs/edit-food-dialog"
import { UploadImageDialog } from "./dialogs/UploadImageDialog"
import { ProductDetailDialog } from "./dialogs/ProductDetailDialog"
import { AddFoodDialog } from "./dialogs/AddFoodDialog"

// Thay đổi định nghĩa SortOption
type SortOption = "Price desc" | "Price asc" | "Name asc" | "Name desc" | "CreatedDate desc"

const FoodList: React.FC = () => {
    const [editingFood, setEditingFood] = useState<ProductModel | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [uploadingImageFood, setUploadingImageFood] = useState<ProductModel | null>(null)
    const [isUploadImageDialogOpen, setIsUploadImageDialogOpen] = useState(false)
    const { products, loading, refreshProducts } = useProducts()

    const { foodCategory, } = useCategories()

    const [selectedCategory, setSelectedCategory] = useState<string>("")
    // Cập nhật giá trị mặc định của sortOption
    const [sortOption, setSortOption] = useState<SortOption>("CreatedDate desc")
    const [displayedProducts, setDisplayedProducts] = useState<ProductModel[]>([])
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState<string>("")

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(12)
    const [totalPages, setTotalPages] = useState(1)

    const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

    // Apply filters and sorting whenever products, selectedCategory, or sortOption changes
    useEffect(() => {
        let result = [...products]

        // Apply category filter
        if (selectedCategory) {
            result = result.filter((product) => product.categoryId === selectedCategory)
        }

        // Apply search filter if there's a search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(
                (product) => product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query),
            )
        }

        // Cập nhật logic sắp xếp trong useEffect
        // Apply sorting
        switch (sortOption) {
            case "CreatedDate desc":
                // Assuming products are already sorted by newest first
                break
            case "Price asc":
                result.sort((a, b) => a.price - b.price)
                break
            case "Price desc":
                result.sort((a, b) => b.price - a.price)
                break
            case "Name asc":
                result.sort((a, b) => a.name.localeCompare(b.name))
                break
            case "Name desc":
                result.sort((a, b) => b.name.localeCompare(a.name))
                break
        }

        setDisplayedProducts(result)

        // Calculate total pages
        setTotalPages(Math.max(1, Math.ceil(result.length / itemsPerPage)))

        // Reset to first page when filters change
        setCurrentPage(1)
    }, [products, selectedCategory, sortOption, itemsPerPage, searchQuery])

    // Get current page items
    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return displayedProducts.slice(startIndex, endIndex)
    }

    // Pagination controls
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    // Handle items per page change
    const handleItemsPerPageChange = (value: string) => {
        const newItemsPerPage = Number.parseInt(value)
        setItemsPerPage(newItemsPerPage)
        // Reset to first page when changing items per page
        setCurrentPage(1)
    }

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId === selectedCategory ? "" : categoryId)
        setIsFilterOpen(false)
    }

    const clearFilter = () => {
        setSelectedCategory("")
        setIsFilterOpen(false)
    }

    const getCategoryName = (categoryId: string) => {
        const category = foodCategory.find((cat) => cat.id === categoryId)
        return category ? category.name : "Không xác định"
    }

    // Cập nhật hàm getSortLabel
    const getSortLabel = (option: SortOption): string => {
        switch (option) {
            case "CreatedDate desc":
                return "Mới nhất"
            case "Price asc":
                return "Giá: Thấp đến cao"
            case "Price desc":
                return "Giá: Cao đến thấp"
            case "Name asc":
                return "Tên: A-Z"
            case "Name desc":
                return "Tên: Z-A"
        }
    }

    const handleEdit = (food: ProductModel) => {
        setEditingFood(food)
        setIsEditDialogOpen(true)
    }

    const handleUploadImage = (food: ProductModel) => {
        setUploadingImageFood(food)
        setIsUploadImageDialogOpen(true)
    }

    const updateFood = (updatedFood: ProductModel) => {
        setDisplayedProducts((prevProducts) =>
            prevProducts.map((food) => (food.id === updatedFood.id ? updatedFood : food)),
        )
        setIsEditDialogOpen(false)
        setEditingFood(null)
    }

    const handleAddFoodDialogClose = (open: boolean) => {
        setIsAddDialogOpen(open)
        if (!open) {
            // Refresh products when dialog is closed
            refreshProducts()
        }
    }

    const handleUploadImageDialogClose = (open: boolean) => {
        setIsUploadImageDialogOpen(open)
        if (!open) {
            // Refresh products when dialog is closed
            refreshProducts()
            setUploadingImageFood(null)
        }
    }

    // Function to get product image URL or placeholder
    const getProductImageUrl = (product: ProductModel) => {
        if (product.imageUrl) {
            return product.imageUrl
        } else if (product.image && product.image.startsWith("data:image")) {
            return product.image
        } else {
            return "/placeholder.svg?height=256&width=256"
        }
    }

    // Function to format product type
    const formatProductType = (type: string) => {
        switch (type) {
            case "ColdKitchen":
                return "Bếp lạnh"
            case "HotKitchen":
                return "Bếp nóng"
            default:
                return type
        }
    }

    // Calculate pagination values
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, displayedProducts.length)
    const currentItems = getCurrentPageItems()

    const handleViewProductDetails = (productId: string) => {
        setSelectedProductId(productId)
        setIsDetailDialogOpen(true)
    }

    // Handle search input
    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const clearSearch = () => {
        setSearchQuery("")
    }

    return (
        <Card className="mt-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Thực đơn</CardTitle>
                    <CardDescription>Quản lý thông tin về Thực đơn của bạn.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Danh sách món ăn</h2>
                    <div className="flex items-center gap-3">
                        {/* Search input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm món ăn..."
                                className="px-3 py-2 border rounded-md w-64"
                                value={searchQuery}
                                onChange={handleSearchInput}
                            />
                            {searchQuery && (
                                <button className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={clearSearch}>
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            )}
                        </div>

                        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    Lọc
                                    {selectedCategory && (
                                        <Badge variant="secondary" className="ml-1 rounded-sm px-1">
                                            1
                                        </Badge>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0" align="end">
                                <div className="p-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">Danh mục</h4>
                                        {selectedCategory && (
                                            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={clearFilter}>
                                                <X className="h-4 w-4" />
                                                <span className="sr-only">Xóa bộ lọc</span>
                                            </Button>
                                        )}
                                    </div>
                                    <Separator className="my-2" />
                                </div>
                                <ScrollArea className="h-[300px] px-3">
                                    <div className="space-y-2">
                                        {foodCategory.map((category) => (
                                            <Button
                                                key={category.id}
                                                variant="ghost"
                                                className="w-full justify-start font-normal"
                                                onClick={() => handleCategorySelect(category.id)}
                                            >
                                                <div className="flex items-center">
                                                    {selectedCategory === category.id && <Check className="mr-2 h-4 w-4 text-primary" />}
                                                    <span className={selectedCategory === category.id ? "ml-2" : "ml-6"}>{category.name}</span>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </PopoverContent>
                        </Popover>

                        <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                            <SelectTrigger className="w-[180px]">
                                <div className="flex items-center gap-2">
                                    <ArrowUpDown className="h-4 w-4" />
                                    <SelectValue placeholder="Sắp xếp">{getSortLabel(sortOption)}</SelectValue>
                                </div>
                            </SelectTrigger>
                            {/* Cập nhật các giá trị trong SelectContent */}
                            <SelectContent>
                                <SelectItem value="CreatedDate desc">Mới nhất</SelectItem>
                                <SelectItem value="Price asc">Giá: Thấp đến cao</SelectItem>
                                <SelectItem value="Price desc">Giá: Cao đến thấp</SelectItem>
                                <SelectItem value="Name asc">Tên: A-Z</SelectItem>
                                <SelectItem value="Name desc">Tên: Z-A</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" onClick={refreshProducts} disabled={loading} className="gap-2">
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                            Làm mới
                        </Button>

                        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2 bg-green-500 px-2">
                            <PlusCircle className="h-4 w-4" />
                            Thêm món ăn
                        </Button>
                        <AddFoodDialog open={isAddDialogOpen} onOpenChange={handleAddFoodDialogClose} />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {selectedCategory && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            Danh mục: {getCategoryName(selectedCategory)}
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={clearFilter}>
                                <X className="h-3 w-3" />
                                <span className="sr-only">Xóa bộ lọc</span>
                            </Button>
                        </Badge>
                    )}

                    {searchQuery && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            Tìm kiếm: {searchQuery}
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={clearSearch}>
                                <X className="h-3 w-3" />
                                <span className="sr-only">Xóa tìm kiếm</span>
                            </Button>
                        </Badge>
                    )}

                    <Badge variant="outline" className="flex items-center gap-1">
                        Sắp xếp: {getSortLabel(sortOption)}
                    </Badge>

                    {/* Cập nhật điều kiện kiểm tra sortOption mặc định */}
                    {(selectedCategory || sortOption !== "CreatedDate desc" || searchQuery) && (
                        <Button
                            variant="default"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => {
                                setSelectedCategory("")
                                setSortOption("CreatedDate desc")
                                setSearchQuery("")
                            }}
                        >
                            Đặt lại
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? (
                        Array.from({ length: itemsPerPage }).map((_, index) => (
                            <Card key={index} className="h-full animate-pulse">
                                <div className="w-full h-40 bg-gray-300"></div>
                                <CardContent className="p-4">
                                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-300 rounded"></div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                                </CardFooter>
                            </Card>
                        ))
                    ) : displayedProducts.length === 0 ? (
                        <div className="col-span-full text-center py-10">
                            <p className="text-muted-foreground">Không tìm thấy món ăn nào phù hợp với bộ lọc</p>
                            {/* Cập nhật nút đặt lại bộ lọc */}
                            <Button
                                variant="link"
                                onClick={() => {
                                    setSelectedCategory("")
                                    setSortOption("CreatedDate desc")
                                    setSearchQuery("")
                                }}
                            >
                                Đặt lại tất cả bộ lọc
                            </Button>
                        </div>
                    ) : (
                        currentItems.map((food) => (
                            <Card
                                key={food.id}
                                className="h-full overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => (food.imageUrl !== null ? handleViewProductDetails(food.id) : handleUploadImage(food))}
                            >
                                <div className="w-full h-64 relative">
                                    {food.imageUrl === null ? (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <Button
                                                variant="ghost"
                                                className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleUploadImage(food)
                                                }}
                                            >
                                                <ImagePlus className="h-12 w-12 text-gray-400 animate-pulse" />
                                                <span className="text-sm text-gray-500">Thêm hình ảnh</span>
                                            </Button>
                                        </div>
                                    ) : (
                                        <img
                                            src={getProductImageUrl(food) || "/placeholder.svg"}
                                            alt={food.name}
                                            className="object-cover w-full h-full"
                                            onError={(e) => {
                                                // If image fails to load, replace with placeholder
                                                ; (e.target as HTMLImageElement).src = "/placeholder.svg?height=256&width=256"
                                            }}
                                        />
                                    )}
                                    <Badge variant="secondary" className="absolute top-2 right-2 bg-white/80 text-black">
                                        {formatProductType(food.productType)}
                                    </Badge>
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg">{food.name}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{food.description}</p>
                                            <Badge variant="outline" className="mt-2">
                                                {getCategoryName(food.categoryId)}
                                            </Badge>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleViewProductDetails(food.id)
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Xem chi tiết
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleEdit(food)
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Chỉnh sửa
                                                </DropdownMenuItem>
                                                {food.imageUrl === null && (
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleUploadImage(food)
                                                        }}
                                                    >
                                                        <ImagePlus className="h-4 w-4 mr-2" />
                                                        Thêm hình ảnh
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                                    <span className="font-semibold text-primary">{food.price.toLocaleString("vi-VN")} ₫</span>
                                    {food.productSizes && food.productSizes.length > 0 && (
                                        <Badge variant="secondary">{food.productSizes.length} kích cỡ</Badge>
                                    )}
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>

                {/* Pagination Controls */}
                {!loading && displayedProducts.length > 0 && (
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-end space-x-2">
                            <span className="text-sm font-medium">Hiển thị:</span>
                            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue placeholder={itemsPerPage.toString()} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="8">8</SelectItem>
                                    <SelectItem value="12">12</SelectItem>
                                    <SelectItem value="16">16</SelectItem>
                                    <SelectItem value="24">24</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            startIndex={startIndex}
                            endIndex={endIndex}
                            totalCount={displayedProducts.length}
                            goToPage={goToPage}
                            searchQuery={searchQuery}
                            categoryId={selectedCategory}
                            getCategoryName={getCategoryName}
                        />
                    </div>
                )}

                {editingFood && (
                    <EditFoodDialog
                        food={editingFood}
                        open={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                        onSave={updateFood}
                    />
                )}

                {uploadingImageFood && (
                    <UploadImageDialog
                        product={uploadingImageFood}
                        open={isUploadImageDialogOpen}
                        onOpenChange={handleUploadImageDialogClose}
                    />
                )}

                <ProductDetailDialog
                    productId={selectedProductId}
                    open={isDetailDialogOpen}
                    onOpenChange={setIsDetailDialogOpen}
                />
            </CardContent>
        </Card>
    )
}

export default FoodList

