"use client"

import type React from "react"
import { Filter, ArrowUpDown, X, PlusCircle, Search, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import type { CategoryModel } from "@/types/category"

interface SearchFilterBarProps {
    searchTerm: string
    setSearchTerm: (term: string) => void
    handleSearch: () => void
    clearSearch: () => void
    pageSize: number
    changePageSize: (size: number) => void
    sortBy: string
    handleSortChange: (value: string) => void
    refreshProducts: () => void
    loading: boolean
    setIsAddDialogOpen: (open: boolean) => void
    foodCategory: CategoryModel[]
    categoryId: string
    handleCategorySelect: (categoryId: string) => void
    clearFilter: () => void
    isFilterOpen: boolean
    setIsFilterOpen: (open: boolean) => void
    getSortLabel: (option: string) => string
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
    searchTerm,
    setSearchTerm,
    handleSearch,
    clearSearch,
    pageSize,
    changePageSize,
    sortBy,
    handleSortChange,

    setIsAddDialogOpen,
    foodCategory,
    categoryId,
    handleCategorySelect,
    clearFilter,
    isFilterOpen,
    setIsFilterOpen,
    getSortLabel,
}) => {
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    return (
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Danh sách món ăn</h2>
            <div className="flex items-center gap-3">
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
                <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Lọc
                            {categoryId && (
                                <Badge variant="secondary" className="ml-1 rounded-sm p-1 px-2">
                                    1
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0" align="end">
                        <div className="p-3 mx-2">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-lg">Danh mục</h4>
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
                                        <div className="flex items-center justify-between w-full">
                                            <h1 className={categoryId === category.id ? "ml-2" : "ml-2"}>{category.name}</h1>
                                            <div>{categoryId === category.id && <Check className="mr-2 h-4 w-4 text-primary" />}</div>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </PopoverContent>
                </Popover>



                <Select value={pageSize.toString()} onValueChange={(value) => changePageSize(Number.parseInt(value))}>
                    <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Hiển thị" />
                    </SelectTrigger>
                    <SelectContent className="w-[130px]">
                        <SelectItem value="8">8 món</SelectItem>
                        <SelectItem value="12">12 món</SelectItem>
                        <SelectItem value="16">16 món</SelectItem>
                        <SelectItem value="24">24 món</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[180px]">
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="h-4 w-4" />
                            <SelectValue>{getSortLabel(sortBy)}</SelectValue>
                        </div>
                    </SelectTrigger>
                    <SelectContent className="w-[200px] mr-20">
                        <SelectItem value="CreatedDate desc">Mới nhất</SelectItem>
                        <SelectItem value="Price desc">Giá: Cao đến thấp</SelectItem>
                        <SelectItem value="Price asc">Giá: Thấp đến cao</SelectItem>
                        <SelectItem value="Name asc">Tên: A-Z</SelectItem>
                        <SelectItem value="Name desc">Tên: Z-A</SelectItem>
                    </SelectContent>
                </Select>


                <Button onClick={() => setIsAddDialogOpen(true)} variant="green" >
                    <PlusCircle className="h-4 w-4" />
                    Thêm món ăn
                </Button>
            </div>
        </div>
    )
}

export default SearchFilterBar

