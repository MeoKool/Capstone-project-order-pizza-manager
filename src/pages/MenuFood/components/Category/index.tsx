
import type React from "react"
import { useState, useEffect } from "react"
import { ArrowUpDown, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

import type { CategoryModel } from "@/types/category"
import useCategories from "@/hooks/useCategories"
import { CategoryTable } from "../tables/CategoryTable"

type SortOption = "newest" | "name-asc" | "name-desc"

function CategoryPage() {
    // Use the updated hook
    const { foodCategory, loading, error } = useCategories()

    // Sorting and filtering
    const [sortOption, setSortOption] = useState<SortOption>("newest")
    const [searchTerm, setSearchTerm] = useState("")
    const [displayedCategories, setDisplayedCategories] = useState<CategoryModel[]>([])

    // Apply filters and sorting whenever categories, sortOption, or searchTerm changes
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

        // Apply sorting
        switch (sortOption) {
            case "newest":
                // Assuming categories are already sorted by newest first
                break
            case "name-asc":
                result.sort((a, b) => a.name.localeCompare(b.name))
                break
            case "name-desc":
                result.sort((a, b) => b.name.localeCompare(a.name))
                break
        }

        setDisplayedCategories(result)
    }, [foodCategory, searchTerm, sortOption])

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
        <div className="mx-auto py-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl">Danh mục (Categories)</CardTitle>
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


                        {/* Chức năng thêm danh mục sẽ được thêm sau */}
                    </div>
                </CardHeader>
                <CardContent>
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
                        onEdit={() => { }} // Sẽ được thực hiện sau
                        onDelete={() => { }} // Sẽ được thực hiện sau
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default CategoryPage

