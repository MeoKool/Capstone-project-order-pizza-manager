"use client"

import type React from "react"
import { MoreVertical, Edit, Trash2, ImagePlus, Eye } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import type { ProductModel } from "@/types/product"
import { useState } from "react"
import { ProductDetailDialog } from "./dialogs/ProductDetailDialog"

interface FoodCardProps {
    food: ProductModel
    getCategoryName: (categoryId: string) => string
    formatProductType: (type: string) => string
    handleEdit: (food: ProductModel) => void
    handleUploadImage: (food: ProductModel) => void
}

const FoodCard: React.FC<FoodCardProps> = ({
    food,
    getCategoryName,
    formatProductType,
    handleEdit,
    handleUploadImage,
}) => {
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [isImageHovered, setIsImageHovered] = useState(false)

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

    return (
        <>
            <Card className="h-full overflow-hidden group transition-all duration-200 hover:shadow-md">
                <div
                    className="w-full h-64 relative overflow-hidden cursor-pointer"
                    onClick={() => (food.imageUrl !== null ? setIsDetailOpen(true) : handleUploadImage(food))}
                    onMouseEnter={() => setIsImageHovered(true)}
                    onMouseLeave={() => setIsImageHovered(false)}
                >
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
                        <>
                            <img
                                src={getProductImageUrl(food) || "/placeholder.svg"}
                                alt={food.name}
                                className={`object-cover w-full h-full transition-transform duration-300 ${isImageHovered ? "scale-110" : "scale-100"}`}
                                onError={(e) => {
                                    ; (e.target as HTMLImageElement).src = "/placeholder.svg?height=256&width=256"
                                }}
                            />
                            <div
                                className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isImageHovered ? "opacity-100" : "opacity-0"}`}
                            >
                                <Button variant="secondary" size="sm" className="gap-2">
                                    <Eye className="h-4 w-4" />
                                    Xem chi tiết
                                </Button>
                            </div>
                        </>
                    )}
                    <Badge variant="secondary" className="absolute top-2 right-2 bg-white/90 text-black">
                        {formatProductType(food.productType)}
                    </Badge>
                </div>
                <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3
                                className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors"
                                onClick={() => (food.imageUrl !== null ? setIsDetailOpen(true) : handleUploadImage(food))}
                                style={{ cursor: "pointer" }}
                            >
                                {food.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1 h-10">
                                {food.description || "Không có mô tả"}
                            </p>
                            <Badge variant="outline" className="mt-2">
                                {getCategoryName(food.categoryId)}
                            </Badge>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Tùy chọn cho {food.name}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsDetailOpen(true)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Xem chi tiết
                                </DropdownMenuItem>
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
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Xóa
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <span className="font-semibold text-primary text-lg">{food.price.toLocaleString("vi-VN")} ₫</span>
                    {food.productSizes && food.productSizes.length > 0 && (
                        <Badge variant="secondary">{food.productSizes.length} kích cỡ</Badge>
                    )}
                </CardFooter>
            </Card>

            <ProductDetailDialog
                productId={isDetailOpen ? food.id : null}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />
        </>
    )
}

export default FoodCard

