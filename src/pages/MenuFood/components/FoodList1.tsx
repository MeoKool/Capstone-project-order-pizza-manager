"use client"

import type React from "react"
import { useState } from "react"
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

import useProducts from "@/hooks/useProducts"
import useCategories from "@/hooks/useCategories"
import type { ProductModel } from "@/types/product"
import { EditFoodDialog } from "./dialogs/edit-food-dialog"
import { AddFoodDialog } from "./dialogs/AddFoodDialog"
import { UploadImageDialog } from "./dialogs/UploadImageDialog"
import '@/pages/MenuFood/styles/food-list-animations.css'
// Update the SortOption type to include the correct sort options
type SortOption = "Price desc" | "Price asc" | "Name asc" | "Name desc" | "CreatedDate desc"

const FoodList1: React.FC = () => {
  const [editingFood, setEditingFood] = useState<ProductModel | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [uploadingImageFood, setUploadingImageFood] = useState<ProductModel | null>(null)
  const [isUploadImageDialogOpen, setIsUploadImageDialogOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Add a new state for search term
  const [searchTerm, setSearchTerm] = useState("")

  // Use the enhanced useProducts hook with client-side filtering
  const {
    products,
    loading,
    totalCount,
    currentPage,
    pageSize,
    sortBy,
    refreshProducts,
    goToPage,
    changePageSize,
    changeSortOrder,
    filterByCategory,
    categoryId,
    searchProducts,
    searchQuery,
    getSortLabel,
  } = useProducts()

  const { foodCategory } = useCategories()

  // Calculate pagination values
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(startIndex + products.length - 1, totalCount)

  const handleSortChange = (value: string) => {
    changeSortOrder(value as SortOption)
  }

  const handleCategorySelect = (selectedCategoryId: string) => {
    filterByCategory(selectedCategoryId === categoryId ? "" : selectedCategoryId)
    setIsFilterOpen(false)
  }

  const clearFilter = () => {
    filterByCategory("")
    setIsFilterOpen(false)
  }

  const getCategoryName = (categoryId: string) => {
    const category = foodCategory.find((cat) => cat.id === categoryId)
    return category ? category.name : "Không xác định"
  }

  const handleEdit = (food: ProductModel) => {
    setEditingFood(food)
    setIsEditDialogOpen(true)
  }

  const handleUploadImage = (food: ProductModel) => {
    setUploadingImageFood(food)
    setIsUploadImageDialogOpen(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateFood = (updatedFood: ProductModel) => {
    refreshProducts()
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

  // Add a function to handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)

    // For immediate search as you type (optional)
    // searchProducts(e.target.value)
  }

  // Add a function to handle search submission
  const handleSearch = () => {
    // Call the search function from useProducts hook
    searchProducts(searchTerm)
    // Close the filter popover if it's open
    setIsFilterOpen(false)
  }

  // Add a function to clear search
  const clearSearch = () => {
    setSearchTerm("")
    searchProducts("")
  }

  // Function to handle all filters clearing
  const clearAllFilters = () => {
    clearSearch()
    clearFilter()
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
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Lọc
                  {categoryId && (
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
                    {categoryId && (
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
                          {categoryId === category.id && <Check className="mr-2 h-4 w-4 text-primary" />}
                          <span className={categoryId === category.id ? "ml-2" : "ml-6"}>{category.name}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <div className="relative w-64">
              <Input
                placeholder="Tìm kiếm món ăn..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pr-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                  }
                }}
              />
              {searchTerm ? (
                <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={clearSearch}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Xóa tìm kiếm</span>
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Tìm kiếm</span>
                </Button>
              )}
            </div>

            <Select value={pageSize.toString()} onValueChange={(value) => changePageSize(Number.parseInt(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Hiển thị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8 món</SelectItem>
                <SelectItem value="12">12 món</SelectItem>
                <SelectItem value="16">16 món</SelectItem>
                <SelectItem value="24">24 món</SelectItem>
              </SelectContent>
            </Select>

            {/* Update the Select component for sorting to use the correct values and display */}
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <SelectValue placeholder="Sắp xếp">{getSortLabel(sortBy)}</SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Price desc">Giá: Cao đến thấp</SelectItem>
                <SelectItem value="Price asc">Giá: Thấp đến cao</SelectItem>
                <SelectItem value="Name asc">Tên: A-Z</SelectItem>
                <SelectItem value="Name desc">Tên: Z-A</SelectItem>
                <SelectItem value="CreatedDate desc">Mới nhất</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" onClick={refreshProducts} disabled={loading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </Button>

            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2 bg-green-800 px-2">
              <PlusCircle className="h-4 w-4" />
              Thêm món ăn
            </Button>
            <AddFoodDialog open={isAddDialogOpen} onOpenChange={handleAddFoodDialogClose} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(searchQuery || categoryId) && (
            <div className="flex items-center gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Tìm kiếm: {searchQuery}
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={clearSearch}>
                    <X className="h-3 w-3" />
                    <span className="sr-only">Xóa tìm kiếm</span>
                  </Button>
                </Badge>
              )}
              {categoryId && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Danh mục: {getCategoryName(categoryId)}
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={clearFilter}>
                    <X className="h-3 w-3" />
                    <span className="sr-only">Xóa bộ lọc</span>
                  </Button>
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Xóa tất cả bộ lọc
              </Button>
            </div>
          )}
          <Badge variant="outline" className="flex items-center gap-1">
            Sắp xếp: {getSortLabel(sortBy)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <div className="flex flex-col items-center gap-4">
                <RefreshCw className="h-12 w-12 text-primary animate-spin" />
                <p className="text-muted-foreground">Đang tải danh sách món ăn...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">
                {searchQuery
                  ? `Không tìm thấy món ăn nào có tên "${searchQuery}"`
                  : "Không tìm thấy món ăn nào phù hợp với bộ lọc"}
              </p>
              {(searchQuery || categoryId) && (
                <Button variant="link" onClick={clearAllFilters}>
                  Đặt lại tất cả bộ lọc
                </Button>
              )}
            </div>
          ) : (
            products.map((food) => (
              <Card key={food.id} className="h-full overflow-hidden">
                <div className="w-full h-64 relative">
                  {food.imageUrl === null ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 upload-container">
                      <Button
                        variant="ghost"
                        className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors upload-button"
                        onClick={() => handleUploadImage(food)}
                      >
                        <ImagePlus className="h-12 w-12 text-gray-400 bounce-animation" />
                        <span className="text-sm text-gray-500 upload-text">Thêm hình ảnh</span>
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
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(food)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        {food.imageUrl === null && (
                          <DropdownMenuItem onClick={() => handleUploadImage(food)}>
                            <ImagePlus className="h-4 w-4 mr-2" />
                            Thêm hình ảnh
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
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
        {!loading && totalCount > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Hiển thị {startIndex}-{Math.min(endIndex, totalCount)} của {totalCount} món ăn
              {searchQuery && ` phù hợp với "${searchQuery}"`}
              {categoryId && ` trong danh mục ${getCategoryName(categoryId)}`}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
                <span className="sr-only">Trang đầu</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Trang trước</span>
              </Button>

              <span className="text-sm">
                Trang <strong>{currentPage}</strong> / {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Trang sau</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
                <span className="sr-only">Trang cuối</span>
              </Button>
            </div>
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
      </CardContent>
    </Card>
  )
}

export default FoodList1

