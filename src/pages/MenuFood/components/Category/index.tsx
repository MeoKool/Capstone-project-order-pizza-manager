"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowUpDown, X, PlusCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

import type { CategoryModel } from "@/types/category"
import { CategoryTable } from "./CategoryTable"
import useCategories from "@/hooks/useCategories"
import { EditCategoryDialog } from "./dialogs/EditCategoryDialog"
import { DeleteCategoryDialog } from "./dialogs/DeleteCategoryDialog"
import CategoryService from "@/services/category-service"
import { CreateCategoryDialog } from "./dialogs/CreateCategoryDialog"
import { toast } from "sonner"


type SortOption = "CreatedDate desc" | "Name asc" | "Name desc"

function CategoryPage() {
    // Use the updated hook with sorting capabilities
    const { foodCategory, loading, error, sortBy, changeSortOrder, getSortLabel, refreshCategories } = useCategories()

    // State for dialogs
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<CategoryModel | null>(null)

    // Filtering state
    const [searchTerm, setSearchTerm] = useState("")
    const [displayedCategories, setDisplayedCategories] = useState<CategoryModel[]>([])

    // Apply search filter whenever categories or searchTerm changes
    useEffect(() => {
        let result = [...foodCategory]

        // Apply search filter
        if (searchTerm) {
            result = result.filter(
                (category) =>
                    (category.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                    (category.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
            )
        }

        setDisplayedCategories(result)
    }, [foodCategory, searchTerm])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    const clearSearch = () => {
        setSearchTerm("")
    }

    // Category CRUD operations
    const handleCreateCategory = async (data: { name: string; description: string }) => {
        try {
            const categoryService = CategoryService.getInstance()
            const response = await categoryService.createCategory(data)

            if (response.success) {
                toast.success("Thêm loại danh mục thành công!")
                refreshCategories()
                setIsAddDialogOpen(false)
                return Promise.resolve()
            } else {
                console.error("Failed to create category:", response)
                return Promise.reject(new Error(response.message || "Không thể tạo danh mục"))
            }
        } catch (error) {
            toast.error("Thêm loại danh mục thất bại!")
            console.error("Error creating category:", error)
            return Promise.reject(error)
        }
    }

    const handleEditCategory = async (data: { name: string; description: string }) => {
        if (!selectedCategory) return Promise.reject(new Error("No category selected"))

        try {
            const categoryService = CategoryService.getInstance()
            const response = await categoryService.updateCategory(selectedCategory.id, data)

            if (response.success) {
                toast.success("Chỉnh sửa danh mục thành công")
                refreshCategories()
                setIsEditDialogOpen(false)
                return Promise.resolve()
            } else {
                console.error("Failed to update category:", response)
                return Promise.reject(new Error(response.message || "Không thể cập nhật danh mục"))
            }
        } catch (error) {
            toast.error("Chỉnh sửa danh mục thất bại!")
            console.error("Error updating category:", error)
            return Promise.reject(error)
        }
    }

    const handleDeleteCategory = async () => {
        if (!selectedCategory) return Promise.reject(new Error("No category selected"))

        try {
            const categoryService = CategoryService.getInstance()
            const response = await categoryService.deleteCategory(selectedCategory.id)

            if (response.success) {
                refreshCategories()
                setIsDeleteDialogOpen(false)
                return Promise.resolve()
            } else {
                console.error("Failed to delete category:", response)
                return Promise.reject(new Error(response.message || "Không thể xóa danh mục"))
            }
        } catch (error) {
            console.error("Error deleting category:", error)
            return Promise.reject(error)
        }
    }

    return (

        <Card className="mt-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-2">
                    <CardTitle>Loại món</CardTitle>
                    <CardDescription>Quản lý các loại món ăn .</CardDescription>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Tìm kiếm danh mục..."
                            className="w-64"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        {searchTerm && (
                            <button className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={clearSearch}>
                                <X className="h-4 w-4 text-gray-500" />
                            </button>
                        )}
                    </div>

                    <Select value={sortBy} onValueChange={(value: SortOption) => changeSortOrder(value)}>
                        <SelectTrigger className="w-[150px]">
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="h-4 w-4" />
                                <SelectValue placeholder="Sắp xếp">{getSortLabel(sortBy)}</SelectValue>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CreatedDate desc">Mới nhất</SelectItem>
                            <SelectItem value="Name asc">Tên: A-Z</SelectItem>
                            <SelectItem value="Name desc">Tên: Z-A</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="green" onClick={() => setIsAddDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Thêm danh mục
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="w-full">
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {searchTerm && (
                    <div className="flex items-center gap-2 mb-4">
                        <Badge variant="secondary" className="flex items-center gap-1">
                            Tìm kiếm: {searchTerm}
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={clearSearch}>
                                <X className="h-3 w-3" />
                                <span className="sr-only">Xóa tìm kiếm</span>
                            </Button>
                        </Badge>
                    </div>
                )}

                <CategoryTable
                    categories={displayedCategories}
                    isLoading={loading}
                    onEdit={(category) => {
                        setSelectedCategory(category)
                        setIsEditDialogOpen(true)
                    }}
                    onDelete={(category) => {
                        setSelectedCategory(category)
                        setIsDeleteDialogOpen(true)
                    }}
                />


                {/* Create Category Dialog */}
                <CreateCategoryDialog
                    isOpen={isAddDialogOpen}
                    onClose={() => setIsAddDialogOpen(false)}
                    onCreateCategory={handleCreateCategory}
                />

                {/* Edit Category Dialog */}
                {selectedCategory && (
                    <EditCategoryDialog
                        category={selectedCategory}
                        open={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                        onSave={handleEditCategory}
                    />
                )}

                {/* Delete Category Dialog */}
                {selectedCategory && (
                    <DeleteCategoryDialog
                        category={selectedCategory}
                        open={isDeleteDialogOpen}
                        onOpenChange={setIsDeleteDialogOpen}
                        onConfirm={handleDeleteCategory}
                    />
                )}
            </CardContent>
        </Card>



    )
}

export default CategoryPage

