"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import useProducts from "@/hooks/useProducts"
import useCategories from "@/hooks/useCategories"
import type { ProductModel } from "@/types/product"
import { EditFoodDialog } from "../dialogs/edit-food-dialog"
import { AddFoodDialog } from "../dialogs/AddFoodDialog"
import { UploadImageDialog } from "../dialogs/UploadImageDialog"

// Import the new components
import SearchFilterBar from "./SearchFilterBar"
import ActiveFilters from "./ActiveFilters"
import FoodCard from "./FoodCard"
import PaginationControls from "./PaginationControls"
import LoadingSpinner from "./LoadingSpinner"
import EmptyState from "./EmptyState"

// Update the SortOption type to include the correct sort options
type SortOption = "CreatedDate%20desc" | "Price desc" | "Price asc" | "Name asc" | "Name desc"

const FoodList: React.FC = () => {
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
        const newCategoryId = selectedCategoryId === categoryId ? "" : selectedCategoryId

        // Apply the category filter
        filterByCategory(newCategoryId)

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
                {/* Search and Filter Bar */}
                <SearchFilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    handleSearch={handleSearch}
                    clearSearch={clearSearch}
                    pageSize={pageSize}
                    changePageSize={changePageSize}
                    sortBy={sortBy}
                    handleSortChange={handleSortChange}
                    refreshProducts={refreshProducts}
                    loading={loading}
                    setIsAddDialogOpen={setIsAddDialogOpen}
                    foodCategory={foodCategory}
                    categoryId={categoryId}
                    handleCategorySelect={handleCategorySelect}
                    clearFilter={clearFilter}
                    isFilterOpen={isFilterOpen}
                    setIsFilterOpen={setIsFilterOpen}
                    getSortLabel={getSortLabel}
                />

                {/* Active Filters */}
                <ActiveFilters
                    searchQuery={searchQuery}
                    categoryId={categoryId}
                    sortBy={sortBy}
                    getCategoryName={getCategoryName}
                    clearSearch={clearSearch}
                    clearFilter={clearFilter}
                    clearAllFilters={clearAllFilters}
                    getSortLabel={getSortLabel}
                />

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? (
                        <LoadingSpinner />
                    ) : products.length === 0 ? (
                        <EmptyState
                            searchQuery={searchQuery}
                            hasFilters={!!searchQuery || !!categoryId}
                            clearAllFilters={clearAllFilters}
                        />
                    ) : (
                        products.map((food) => (
                            <FoodCard
                                key={food.id}
                                food={food}
                                getCategoryName={getCategoryName}
                                formatProductType={formatProductType}
                                handleEdit={handleEdit}
                                handleUploadImage={handleUploadImage}
                            />
                        ))
                    )}
                </div>

                {/* Pagination Controls */}
                {!loading && totalCount > 0 && (
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        totalCount={totalCount}
                        goToPage={goToPage}
                        searchQuery={searchQuery}
                        categoryId={categoryId}
                        getCategoryName={getCategoryName}
                    />
                )}

                {/* Dialogs */}
                {editingFood && (
                    <EditFoodDialog
                        food={editingFood}
                        open={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                        onSave={updateFood}
                    />
                )}

                <AddFoodDialog open={isAddDialogOpen} onOpenChange={handleAddFoodDialogClose} />

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

export default FoodList

