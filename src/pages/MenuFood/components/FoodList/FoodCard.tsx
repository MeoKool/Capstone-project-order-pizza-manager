import type React from "react"
import { MoreVertical, Edit, Trash2, ImagePlus } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ProductModel } from "@/types/product"

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
        <Card className="h-full overflow-hidden">
            <div className="w-full h-64 relative">
                {food.imageUrl === null ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 animate-fade-in">
                        <Button
                            variant="ghost"
                            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors group"
                            onClick={() => handleUploadImage(food)}
                        >
                            <ImagePlus className="h-12 w-12 text-gray-400 animate-bounce group-hover:animate-none group-hover:scale-125 transition-transform" />
                            <span className="text-sm text-gray-500 animate-pulse">Thêm hình ảnh</span>
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
    )
}

export default FoodCard

