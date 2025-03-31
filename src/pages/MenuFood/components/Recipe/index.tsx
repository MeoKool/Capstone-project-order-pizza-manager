"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PlusCircle, ArrowUpDown, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

import type { Recipe, UnitType } from "@/types/recipe"
import { RecipesTable } from "./RecipesTable"
import RecipeService from "@/services/recipe-service"
import { ViewRecipeDialog } from "./dialogs/ViewRecipeDialog"
import ProductSizeService from "@/services/productsize-service"
import IngredientsService from "@/services/ingredients-serivce"
import { CreateRecipeDialog } from "./dialogs/CreateRecipeDialog"

type SortOption = "newest" | "ingredient-asc" | "ingredient-desc" | "quantity-asc" | "quantity-desc"

function RecipesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const recipeService = RecipeService.getInstance()

    // Add state for viewing recipe
    const [viewingRecipeId, setViewingRecipeId] = useState<string | null>(null)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

    // Sorting and filtering
    const [sortOption, setSortOption] = useState<SortOption>("newest")
    const [searchTerm, setSearchTerm] = useState("")
    const [filterProductSizeId, setFilterProductSizeId] = useState<string | null>(null)
    const [displayedRecipes, setDisplayedRecipes] = useState<Recipe[]>([])

    // Thêm state để quản lý dialog và dữ liệu cần thiết
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [productSizes, setProductSizes] = useState<Array<{ id: string; name: string }>>([])
    const [ingredients, setIngredients] = useState<Array<{ id: string; name: string }>>([])
    const [, setIsLoadingRelatedData] = useState(false)


    const fetchRecipes = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await recipeService.getAllRecipes()
            if (response.success && response.result) {
                // Check if items is an array, if not convert it to an array
                const recipesData = Array.isArray(response.result.items) ? response.result.items : [response.result.items]

                setRecipes(recipesData)
                console.log("Fetched recipes:", recipesData)
            } else {
                console.error("Failed to fetch recipes:", response)
                setError("Không thể tải danh sách công thức")
            }
        } catch (error) {
            console.error("Error fetching recipes:", error)
            setError("Không thể tải danh sách công thức")
        } finally {
            setIsLoading(false)
        }
    }
    // Thêm hàm để tải dữ liệu productSizes và ingredients
    const fetchRelatedData = async () => {
        setIsLoadingRelatedData(true)
        try {
            // Fetch product sizes
            const productSizeService = ProductSizeService.getInstance()
            const productSizesResponse = await productSizeService.get1000ProductSizesSortedByCreatedDateDesc()
            if (productSizesResponse.success && productSizesResponse.result) {
                const productSizesData = Array.isArray(productSizesResponse.result.items)
                    ? productSizesResponse.result.items
                    : [productSizesResponse.result.items]

                setProductSizes(
                    productSizesData.map((productSize) => ({
                        id: productSize.id,
                        name: productSize.name,
                    })),
                )
            }

            // Fetch ingredients
            const ingredientsService = IngredientsService.getInstance()
            const ingredientsResponse = await ingredientsService.getAllIngredients()
            if (ingredientsResponse.success && ingredientsResponse.result) {
                const ingredientsData = ingredientsResponse.result.items
                    ? ingredientsResponse.result.items
                    : [ingredientsResponse.result.items]

                setIngredients(
                    ingredientsData.map((ingredient) => ({
                        id: ingredient.id,
                        name: ingredient.name,
                    })),
                )
            }
        } catch (error) {
            console.error("Error fetching related data:", error)
        } finally {
            setIsLoadingRelatedData(false)
        }
    }

    // Thêm hàm để mở dialog tạo công thức mới
    const handleOpenCreateDialog = async () => {
        // Tải dữ liệu cần thiết trước khi mở dialog
        await fetchRelatedData()
        setIsCreateDialogOpen(true)
    }

    // Thêm hàm xử lý khi tạo công thức mới
    const handleCreateRecipe = async (data: {
        productSizeId: string
        ingredientId: string
        unit: UnitType
        ingredientName: string
        quantity: number
    }) => {
        try {
            const response = await recipeService.createRecipe(data)
            console.log(data);

            if (response.success) {
                alert("Đã thêm công thức mới thành công")
                fetchRecipes() // Tải lại danh sách công thức
                setIsCreateDialogOpen(false)
            } else {
                console.error("Failed to create recipe:", response)
                alert(response.message || "Không thể tạo công thức mới")
            }
        } catch (error) {
            console.error("Error creating recipe:", error)
            alert("Không thể tạo công thức mới")
        }
    }
    // Apply filters and sorting whenever recipes, sortOption, or filters change
    useEffect(() => {
        let result = [...recipes]

        // Apply product size ID filter
        if (filterProductSizeId) {
            result = result.filter((recipe) => recipe.productSizeId === filterProductSizeId)
        }

        // Apply search filter
        if (searchTerm) {
            result = result.filter((recipe) =>
                (recipe.ingredientName?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
            )
        }

        // Apply sorting
        switch (sortOption) {
            case "newest":
                // Assuming recipes are already sorted by newest first
                break
            case "ingredient-asc":
                result.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName))
                break
            case "ingredient-desc":
                result.sort((a, b) => b.ingredientName.localeCompare(a.ingredientName))
                break
            case "quantity-asc":
                result.sort((a, b) => a.quantity - b.quantity)
                break
            case "quantity-desc":
                result.sort((a, b) => b.quantity - a.quantity)
                break
        }

        setDisplayedRecipes(result)
    }, [recipes, searchTerm, sortOption, filterProductSizeId])

    useEffect(() => {
        fetchRecipes()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getSortLabel = (option: SortOption): string => {
        switch (option) {
            case "newest":
                return "Mới nhất"
            case "ingredient-asc":
                return "Nguyên liệu: A-Z"
            case "ingredient-desc":
                return "Nguyên liệu: Z-A"
            case "quantity-asc":
                return "Số lượng: Tăng dần"
            case "quantity-desc":
                return "Số lượng: Giảm dần"
        }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    const clearSearch = () => {
        setSearchTerm("")
    }

    const clearFilters = () => {
        setSearchTerm("")
        setFilterProductSizeId(null)
        setSortOption("newest")
    }

    const handleViewRecipe = (recipe: Recipe) => {
        console.log("View recipe:", recipe)
        setViewingRecipeId(recipe.id)
        setIsViewDialogOpen(true)
    }

    const handleEditRecipe = (recipe: Recipe) => {
        console.log("Edit recipe:", recipe)
        // Implement edit recipe functionality
    }

    const handleDeleteRecipe = (recipe: Recipe) => {
        console.log("Delete recipe:", recipe)
        // Implement delete recipe functionality
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-2">
                        <CardTitle >Công thức của sản phẩm</CardTitle>
                        <CardDescription>Quản lý thông tin về công thức sản phẩm.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm nguyên liệu..."
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
                                <SelectItem value="ingredient-asc">Nguyên liệu: A-Z</SelectItem>
                                <SelectItem value="ingredient-desc">Nguyên liệu: Z-A</SelectItem>
                                <SelectItem value="quantity-asc">Số lượng: Tăng dần</SelectItem>
                                <SelectItem value="quantity-desc">Số lượng: Giảm dần</SelectItem>
                            </SelectContent>
                        </Select>


                        <Button variant="green" onClick={handleOpenCreateDialog}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Thêm công thức
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className={`${searchTerm || filterProductSizeId || sortOption ? 'h-9 mb-2' : 'h-9'}`}>
                        {(searchTerm || filterProductSizeId || sortOption !== "newest") && (
                            <div className="flex items-center gap-2 mb-4">
                                {searchTerm && (
                                    <Badge variant="secondary" className="flex items-center gap-1 h-7">
                                        Tìm kiếm: {searchTerm}
                                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={clearSearch}>
                                            <X className="h-3 w-3" />
                                            <span className="sr-only">Xóa tìm kiếm</span>
                                        </Button>
                                    </Badge>
                                )}

                                {filterProductSizeId && (
                                    <Badge variant="secondary" className="flex items-center gap-1 h-7">
                                        Kích cỡ sản phẩm: {filterProductSizeId.substring(0, 8)}...
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 ml-1"
                                            onClick={() => setFilterProductSizeId(null)}
                                        >
                                            <X className="h-3 w-3" />
                                            <span className="sr-only">Xóa bộ lọc</span>
                                        </Button>
                                    </Badge>
                                )}

                                {sortOption !== "newest" && (
                                    <Badge variant="outline" className="flex items-center gap-1 h-7">
                                        Sắp xếp: {getSortLabel(sortOption)}
                                    </Badge>
                                )}

                                <Button variant="outline" size="sm" onClick={clearFilters}>
                                    Xóa tất cả bộ lọc
                                </Button>
                            </div>
                        )}
                    </div>
                    <RecipesTable
                        recipes={displayedRecipes}
                        isLoading={isLoading}
                        onView={handleViewRecipe}
                        onEdit={handleEditRecipe}
                        onDelete={handleDeleteRecipe}
                    />

                </CardContent>
            </Card>
            <CreateRecipeDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onCreateRecipe={handleCreateRecipe}
                productSizes={productSizes}
                ingredients={ingredients}
            />
            <ViewRecipeDialog recipeId={viewingRecipeId} open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} />
        </>
    )
}

export default RecipesPage

