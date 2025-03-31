"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowUpDown, X, PlusCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import IngredientsService from "@/services/ingredients-serivce"
import type { Ingredients } from "@/types/ingredients"
import { CreateIngredientDialog } from "./dialogs/CreateIngredientDialog"
import { IngredientsTable } from "./tables/IngredientTable"
import { toast } from "sonner"
type SortOption = "newest" | "name-asc" | "name-desc"

function IngredientsPage() {
    const [ingredients, setIngredients] = useState<Ingredients[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const ingredientsService = IngredientsService.getInstance()

    // Sorting and filtering
    const [sortOption, setSortOption] = useState<SortOption>("newest")
    const [searchTerm, setSearchTerm] = useState("")
    const [displayedIngredients, setDisplayedIngredients] = useState<Ingredients[]>([])

    const fetchIngredients = async () => {
        setIsLoading(true)
        try {
            const response = await ingredientsService.getAllIngredients()
            if (response.success && response.result) {
                // Check if items is an array, if not convert it to an array
                const ingredientsData = Array.isArray(response.result.items) ? response.result.items : [response.result.items]

                setIngredients(ingredientsData)
                console.log("Fetched ingredients:", ingredientsData)
            } else {
                console.error("Failed to fetch ingredients:", response)
                toast.error("Không thể tải danh sách nguyên liệu")

            }
        } catch (error) {
            console.error("Error fetching ingredients:", error)
            toast.error("Không thể tải danh sách nguyên liệu")
        } finally {
            setIsLoading(false)
        }
    }

    // Apply filters and sorting whenever ingredients or sortOption changes
    useEffect(() => {
        let result = [...ingredients]

        // Apply search filter
        if (searchTerm) {
            result = result.filter(
                (ingredient) =>
                    (ingredient.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                    (ingredient.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
            )
        }

        // Apply sorting
        switch (sortOption) {
            case "newest":
                // Assuming ingredients are already sorted by newest first
                break
            case "name-asc":
                result.sort((a, b) => a.name.localeCompare(b.name))
                break
            case "name-desc":
                result.sort((a, b) => b.name.localeCompare(a.name))
                break
        }

        setDisplayedIngredients(result)
    }, [ingredients, searchTerm, sortOption])

    useEffect(() => {
        fetchIngredients()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleCreateIngredient = async (name: string, description: string) => {
        try {
            const response = await ingredientsService.createIngredient({
                name,
                description,
            })

            if (response.success) {
                toast.success("Đã thêm nguyên liệu thành công!")
                fetchIngredients()
                setIsAddDialogOpen(false)
            } else {
                console.error("Failed to create ingredient:", response)
                toast.error("Không thể thêm nguyên liệu")
            }
        } catch (error) {
            console.error("Error creating ingredient:", error)
            toast.error("Không thể thêm nguyên liệu")
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
        }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    const clearSearch = () => {
        setSearchTerm("")
    }

    return (
        <div className="mx-auto mt-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">

                    <div>
                        <CardTitle>Nguyên liệu</CardTitle>
                        <CardDescription className="mt-2">Quản lý thông tin về nguyên liệu của bạn.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mb-2">
                        <h1>Danh sách nguyên liệu</h1>
                        <div className="flex gap-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm nguyên liệu..."
                                    className="px-2 border rounded-md w-64 h-9"
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
                                <SelectTrigger className="w-[150px]">
                                    <div className="flex items-center gap-2">
                                        <ArrowUpDown className="h-4 w-4" />
                                        <SelectValue placeholder="Sắp xếp">{getSortLabel(sortOption)}</SelectValue>
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Mới nhất</SelectItem>
                                    <SelectItem value="name-asc">Tên: A-Z</SelectItem>
                                    <SelectItem value="name-desc">Tên: Z-A</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={fetchIngredients} disabled={isLoading}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                                Làm mới
                            </Button>
                            <Button onClick={() => setIsAddDialogOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Thêm Nguyên Liệu
                            </Button>
                        </div>
                    </div>
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

                    <IngredientsTable ingredients={displayedIngredients} isLoading={isLoading} />
                </CardContent>
            </Card>

            <CreateIngredientDialog
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onCreateIngredient={handleCreateIngredient}
            />
        </div>
    )
}

export default IngredientsPage

