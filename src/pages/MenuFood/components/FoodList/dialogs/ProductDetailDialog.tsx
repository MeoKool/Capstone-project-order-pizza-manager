import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Info,
    Package,
    ListFilter,
    Tag,
    Check,
    FileText,
    DollarSign,
    Utensils,
    LayoutGrid,
    Link,
    CookingPot,
    CheckCheckIcon,
    AlertCircle,
    Layers,
} from "lucide-react"
import type { ProductModel } from "@/types/product"
import type { ProductOption } from "@/types/product-option"
import useCategories from "@/hooks/useCategories"
import ProductService from "@/services/product-service"
import { formatCurrencyVND } from "@/utils/utils"
import { formatProductType } from "@/utils/product-formatters"
import { formatProductStatus } from "@/utils/product-formatters"
import type { ProductStatus } from "@/types/product"
import { ProductStatusBadge } from "../../product/ProductStatusBadge"
import { ProductStatusSelect } from "../../product/ProductStatusSelect"
import { RecipeTable } from "../../product/RecipeTable"

interface ProductDetailDialogProps {
    productId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ProductDetailDialog({ productId, open, onOpenChange }: ProductDetailDialogProps) {
    const [product, setProduct] = useState<ProductModel | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { foodCategory } = useCategories()
    const productService = ProductService.getInstance()

    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!productId || !open) return

            setLoading(true)
            setError(null)

            try {
                // Use the service method instead of direct fetch
                const response = await productService.getProductById(productId)
                console.log(response)

                if (response.success && response.result) {
                    setProduct(response.result)
                } else {
                    throw new Error(response.message || "Không thể tải thông tin sản phẩm")
                }
            } catch (err) {
                console.error("Error fetching product details:", err)
                setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải thông tin sản phẩm")
            } finally {
                setLoading(false)
            }
        }

        fetchProductDetails()
    }, [productId, open, productService])

    // Function to handle status change
    const handleStatusChange = (newStatus: ProductStatus) => {
        if (product) {
            setProduct({
                ...product,
                productStatus: newStatus,
            })
        }
    }

    // Function to get product image URL or placeholder
    const getProductImageUrl = (product: ProductModel) => {
        if (product.imageUrl) {
            return product.imageUrl
        } else {
            return "/placeholder.svg?height=256&width=256"
        }
    }

    // Function to get category name
    const getCategoryName = (categoryId: string) => {
        if (product?.category) {
            return product.category.name
        }
        const category = foodCategory.find((cat) => cat.id === categoryId)
        return category ? category.name : "Không xác định"
    }

    // Function to render product options
    const renderProductOptions = () => {
        if (
            !product ||
            !product.productOptions ||
            !Array.isArray(product.productOptions) ||
            product.productOptions.length === 0
        ) {
            return (
                <div className="text-center py-6 min-h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">Sản phẩm này không có tùy chọn nào</p>
                </div>
            )
        }

        return (
            <div className="space-y-4">
                {product.productOptions.map((productOption: ProductOption) => (
                    <Card key={productOption.id}>
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-base mb-1">{productOption.option.name}</CardTitle>
                                    {productOption.option.selectMany && (
                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                            <Check className="h-3 w-3 mr-1" />
                                            Chọn nhiều
                                        </Badge>
                                    )}
                                </div>
                                <Badge variant="outline">{productOption.option.optionItems?.length || 0} lựa chọn</Badge>
                            </div>
                            {productOption.option.description && (
                                <CardDescription>{productOption.option.description}</CardDescription>
                            )}
                            {productOption.option.selectMany && !productOption.option.description && (
                                <CardDescription>Khách hàng có thể chọn nhiều tùy chọn cùng lúc trong nhóm này</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            {productOption.option.optionItems &&
                                Array.isArray(productOption.option.optionItems) &&
                                productOption.option.optionItems.length > 0 ? (
                                <div className="space-y-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tên</TableHead>
                                                <TableHead className="text-right">Giá thêm</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {productOption.option.optionItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{item.name}</TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {item.additionalPrice > 0 ? (
                                                            <span className="text-primary">+{item.additionalPrice.toLocaleString("vi-VN")} ₫</span>
                                                        ) : (
                                                            <span className="font-medium">+0 đ</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Không có lựa chọn nào</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    // Function to render child products
    const renderChildProducts = () => {
        if (
            !product ||
            !product.childProducts ||
            !Array.isArray(product.childProducts) ||
            product.childProducts.length === 0
        ) {
            return (
                <div className="text-center py-6 min-h-[100px] flex items-center justify-center">
                    <p className="text-muted-foreground">Sản phẩm này không có sản phẩm con nào</p>
                </div>
            )
        }

        return (
            <div className="space-y-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên sản phẩm</TableHead>
                            <TableHead className="text-right">Giá</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {product.childProducts.map((childProduct) => (
                            <TableRow key={childProduct.id}>
                                <TableCell>{childProduct.name}</TableCell>
                                <TableCell className="text-right font-medium">
                                    {childProduct.price > 0 ? (
                                        <span className="text-primary">+{childProduct.price.toLocaleString("vi-VN")} ₫</span>
                                    ) : (
                                        <span className="font-medium">+0 đ</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    // Function to render combo slots
    const renderComboSlots = () => {
        if (
            !product ||
            !product.productComboSlots ||
            !Array.isArray(product.productComboSlots) ||
            product.productComboSlots.length === 0
        ) {
            return (
                <div className="text-center py-6 min-h-[100px] flex items-center justify-center">
                    <p className="text-muted-foreground">Combo này không có nhóm sản phẩm nào</p>
                </div>
            )
        }

        return (
            <div className="space-y-6">
                {product.productComboSlots.map((slot) => (
                    <Card key={slot.id} className="overflow-hidden">
                        <CardHeader className="bg-gray-50 p-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Layers className="h-4 w-4 text-primary" />
                                {slot.slotName}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tên sản phẩm</TableHead>
                                        <TableHead className="text-right">Giá</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {slot.productComboSlotItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.product.name}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                <span className="text-primary">{formatCurrencyVND(item.product.price)}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    // Render combo product details
    const renderComboProductDetails = () => {
        if (!product) return null

        return (
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Fixed Product Info Section */}
                <div className="flex flex-col md:flex-row gap-6 pb-4">
                    {/* Product Image */}
                    <div className="w-full md:w-1/3">
                        <div className="relative aspect-square overflow-hidden rounded-md border">
                            <img
                                src={getProductImageUrl(product) || "/placeholder.svg"}
                                alt={product.name}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                    ; (e.target as HTMLImageElement).src = "/placeholder.svg?height=256&width=256"
                                }}
                            />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="w-full md:w-2/3 space-y-4">
                        <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-bold">{product.name}</h2>
                            <div className="flex gap-2">
                                <Badge variant="secondary" className="text-sm">
                                    Combo
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="flex items-center gap-1 h-7">
                                <ListFilter className="h-3 w-3" />
                                {getCategoryName(product.categoryId)}
                            </Badge>

                            <Badge variant="secondary" className="text-primary font-semibold h-7">
                                {formatCurrencyVND(product.price)}
                            </Badge>

                            <Badge variant="outline" className="flex items-center gap-1 h-7">
                                <Layers className="h-3 w-3 mr-1" />
                                Combo
                            </Badge>

                            {product.productStatus && <ProductStatusBadge status={product.productStatus} />}
                        </div>

                        {/* Status update buttons */}
                        {productId && product.productStatus && (
                            <ProductStatusSelect
                                productId={productId}
                                currentStatus={product.productStatus}
                                onStatusChange={handleStatusChange}
                            />
                        )}

                        <Separator />

                        <div>
                            <h3 className="text-sm font-medium mb-1">Mô tả:</h3>
                            <p className="text-sm text-muted-foreground">{product.description || "Không có mô tả"}</p>
                        </div>
                    </div>
                </div>

                <Separator className="my-2" />

                {/* Scrollable Tabs Section */}
                <div className="flex-1 overflow-hidden flex flex-col min-h-[300px]">
                    <Tabs defaultValue="details" className="w-full flex-1 flex flex-col">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="details" className="flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Thông tin combo
                            </TabsTrigger>
                            <TabsTrigger value="slots" className="flex items-center gap-2">
                                <Layers className="h-4 w-4" />
                                Nhóm sản phẩm
                            </TabsTrigger>
                        </TabsList>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-hidden">
                            <div className="h-full max-h-[calc(90vh-350px)] min-h-[300px] overflow-y-auto scrollbar-hide">
                                {/* Details Tab */}
                                <TabsContent value="details" className="mt-4 max-h-[327px] pb-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Thông tin combo</CardTitle>
                                            <CardDescription className="pb-1">Chi tiết về combo này</CardDescription>
                                            <Separator />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                {/* Thông tin cơ bản */}
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                                                        <Info className="h-4 w-4 text-primary" />
                                                        Thông tin cơ bản
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                                <Tag className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Tên combo</p>
                                                                <p className="font-medium">{product.name}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                                <DollarSign className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Giá bán</p>
                                                                <p className="font-medium text-primary">{formatCurrencyVND(product.price)}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                                <Layers className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Loại sản phẩm</p>
                                                                <p className="font-medium">Combo</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                                <ListFilter className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Danh mục</p>
                                                                <p className="font-medium">{getCategoryName(product.categoryId)}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                                <AlertCircle className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Trạng thái</p>
                                                                <p className="font-medium">
                                                                    {product.productStatus && formatProductStatus(product.productStatus)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                                <Package className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Số nhóm sản phẩm</p>
                                                                <p className="font-medium">{product.productComboSlots?.length || 0}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Thông tin chi tiết */}
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                                                        <LayoutGrid className="h-4 w-4 text-primary" />
                                                        Thông tin chi tiết
                                                    </h3>

                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div className="bg-white p-4 rounded-md shadow-sm flex flex-col items-center text-center">
                                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                                                <Layers className="h-5 w-5" />
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mb-1">Nhóm sản phẩm</p>
                                                            <p className="text-xl font-bold">{product.productComboSlots?.length || 0}</p>
                                                        </div>

                                                        <div className="bg-white p-4 rounded-md shadow-sm flex flex-col items-center text-center">
                                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                                                <Package className="h-5 w-5" />
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mb-1">Tổng sản phẩm</p>
                                                            <p className="text-xl font-bold">
                                                                {product.productComboSlots?.reduce(
                                                                    (total, slot) => total + (slot.productComboSlotItems?.length || 0),
                                                                    0,
                                                                ) || 0}
                                                            </p>
                                                        </div>

                                                        <div className="bg-white p-4 rounded-md shadow-sm flex flex-col items-center text-center">
                                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                                                <ListFilter className="h-5 w-5" />
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mb-1">Danh mục</p>
                                                            <p className="text-sm font-medium truncate w-full">
                                                                {getCategoryName(product.categoryId)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Mô tả sản phẩm */}
                                                {product.description && (
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-primary" />
                                                            Mô tả combo
                                                        </h3>
                                                        <div className="bg-white p-4 rounded-md shadow-sm">
                                                            <p className="text-sm">{product.description}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Slots Tab */}
                                <TabsContent value="slots" className="mt-4 max-h-[327px] pb-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Nhóm sản phẩm trong combo</CardTitle>
                                            <CardDescription className="pb-1">Các sản phẩm được nhóm trong combo này</CardDescription>
                                            <Separator />
                                        </CardHeader>
                                        <CardContent>{renderComboSlots()}</CardContent>
                                    </Card>
                                </TabsContent>
                            </div>
                        </div>
                    </Tabs>
                </div>

                <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Chi tiết sản phẩm
                    </DialogTitle>
                    <DialogDescription />
                </DialogHeader>

                {loading ? (
                    <div className="space-y-4 flex-1">
                        <div className="flex flex-col md:flex-row gap-4">
                            <Skeleton className="h-64 w-full md:w-1/3 rounded-md" />
                            <div className="w-full md:w-2/3 space-y-4">
                                <Skeleton className="h-8 w-3/4" />
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        </div>
                        <Skeleton className="h-40 w-full" />
                    </div>
                ) : error ? (
                    <div className="p-4 text-center flex-1 flex flex-col items-center justify-center min-h-[300px]">
                        <p className="text-destructive">{error}</p>
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-4">
                            Đóng
                        </Button>
                    </div>
                ) : product ? (
                    product.productRole === "Combo" ? (
                        renderComboProductDetails()
                    ) : (
                        <div className="flex flex-col flex-1 overflow-hidden">
                            {/* Fixed Product Info Section */}
                            <div className="flex flex-col md:flex-row gap-6 pb-4">
                                {/* Product Image */}
                                <div className="w-full md:w-1/3">
                                    <div className="relative aspect-square overflow-hidden rounded-md border">
                                        <img
                                            src={getProductImageUrl(product) || "/placeholder.svg"}
                                            alt={product.name}
                                            className="object-cover w-full h-full"
                                            onError={(e) => {
                                                ; (e.target as HTMLImageElement).src = "/placeholder.svg?height=256&width=256"
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="w-full md:w-2/3 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <h2 className="text-2xl font-bold">{product.name}</h2>
                                        <div className="flex gap-2">
                                            <Badge variant="secondary" className="text-sm">
                                                {formatProductType(product.productType)}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="secondary" className="flex items-center gap-1 h-7">
                                            <ListFilter className="h-3 w-3" />
                                            {getCategoryName(product.categoryId)}
                                        </Badge>

                                        <Badge variant="secondary" className="text-primary font-semibold h-7">
                                            {formatCurrencyVND(product.price)}
                                        </Badge>
                                        {product.productRole && (
                                            <Badge
                                                variant={product.productRole === "Master" ? "secondary" : "outline"}
                                                className="flex items-center gap-1 h-7"
                                            >
                                                <CheckCheckIcon className="h-3 w-3 mr-1" />
                                                {product.productRole === "Master" ? "Sản phẩm chính" : "Sản phẩm con"}
                                            </Badge>
                                        )}
                                        {product.productStatus && <ProductStatusBadge status={product.productStatus} />}
                                    </div>

                                    {/* Status update buttons */}
                                    {productId && product.productStatus && (
                                        <ProductStatusSelect
                                            productId={productId}
                                            currentStatus={product.productStatus}
                                            onStatusChange={handleStatusChange}
                                        />
                                    )}

                                    <Separator />

                                    <div>
                                        <h3 className="text-sm font-medium mb-1">Mô tả:</h3>
                                        <p className="text-sm text-muted-foreground">{product.description || "Không có mô tả"}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-2" />

                            {/* Scrollable Tabs Section */}
                            <div className="flex-1 overflow-hidden flex flex-col min-h-[300px]">
                                <Tabs defaultValue="details" className="w-full flex-1 flex flex-col">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="details" className="flex items-center gap-2">
                                            <Info className="h-4 w-4" />
                                            Thông tin sản phẩm
                                        </TabsTrigger>
                                        <TabsTrigger value="options" className="flex items-center gap-2">
                                            <Tag className="h-4 w-4" />
                                            Tùy chọn
                                        </TabsTrigger>
                                        <TabsTrigger value="recipes" className="flex items-center gap-2">
                                            <CookingPot className="h-4 w-4" />
                                            Công thức
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Scrollable Content Area */}
                                    <div className="flex-1 overflow-hidden">
                                        <div className="h-full max-h-[calc(90vh-350px)] min-h-[300px] overflow-y-auto scrollbar-hide">
                                            {/* Options Tab */}
                                            <TabsContent value="options" className="mt-4 max-h-[327px] pb-2">
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>Tùy chọn sản phẩm</CardTitle>
                                                        <CardDescription className="pb-1">Các tùy chọn có thể thêm vào sản phẩm</CardDescription>
                                                        <Separator />
                                                    </CardHeader>
                                                    <CardContent>{renderProductOptions()}</CardContent>
                                                </Card>
                                            </TabsContent>

                                            {/* Details Tab */}
                                            <TabsContent value="details" className="mt-4 max-h-[327px] pb-2">
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>Thông tin sản phẩm</CardTitle>
                                                        <CardDescription className="pb-1">Chi tiết về món ăn này</CardDescription>
                                                        <Separator />
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-6">
                                                            {/* Thông tin cơ bản */}
                                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                                                                    <Info className="h-4 w-4 text-primary" />
                                                                    Thông tin cơ bản
                                                                </h3>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
                                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                                            <Tag className="h-4 w-4" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">Tên sản phẩm</p>
                                                                            <p className="font-medium">{product.name}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
                                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                                            <DollarSign className="h-4 w-4" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">Giá bán</p>
                                                                            <p className="font-medium text-primary">{formatCurrencyVND(product.price)}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
                                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                                            <Utensils className="h-4 w-4" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">Loại sản phẩm</p>
                                                                            <p className="font-medium">{formatProductType(product.productType)}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
                                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                                            <ListFilter className="h-4 w-4" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">Danh mục</p>
                                                                            <p className="font-medium">{getCategoryName(product.categoryId)}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
                                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                                            <Link className="h-4 w-4" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">Vai trò sản phẩm</p>
                                                                            <p className="font-medium">
                                                                                {product.productRole === "Master" ? "Sản phẩm chính" : "Sản phẩm con"}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
                                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                                            <AlertCircle className="h-4 w-4" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">Trạng thái</p>
                                                                            <p className="font-medium">
                                                                                {product.productStatus && formatProductStatus(product.productStatus)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Thông tin chi tiết */}
                                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                                                                    <LayoutGrid className="h-4 w-4 text-primary" />
                                                                    Thông tin chi tiết
                                                                </h3>

                                                                <div className="grid grid-cols-3 gap-4">
                                                                    {product.productRole === "Master" && (
                                                                        <div className="bg-white p-4 rounded-md shadow-sm flex flex-col items-center text-center">
                                                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                                                                <Package className="h-5 w-5" />
                                                                            </div>
                                                                            <p className="text-xs text-muted-foreground mb-1">Sản phẩm con</p>
                                                                            <p className="text-xl font-bold">{product.childProducts?.length || 0}</p>
                                                                        </div>
                                                                    )}

                                                                    <div className="bg-white p-4 rounded-md shadow-sm flex flex-col items-center text-center">
                                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                                                            <Tag className="h-5 w-5" />
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground mb-1">Tùy chọn</p>
                                                                        <p className="text-xl font-bold">{product.productOptions?.length || 0}</p>
                                                                    </div>

                                                                    <div className="bg-white p-4 rounded-md shadow-sm flex flex-col items-center text-center">
                                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                                                            <CookingPot className="h-5 w-5" />
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground mb-1">Khu vực bếp</p>
                                                                        <p className="text-sm font-medium truncate w-full">
                                                                            {formatProductType(product.productType)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Child Products Section - Added to the details tab */}
                                                            {product.productRole === "Master" &&
                                                                product.childProducts &&
                                                                product.childProducts.length > 0 && (
                                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                                        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                                                                            <Package className="h-4 w-4 text-primary" />
                                                                            Sản phẩm con
                                                                        </h3>
                                                                        <div className="bg-white p-4 rounded-md shadow-sm">{renderChildProducts()}</div>
                                                                    </div>
                                                                )}

                                                            {/* Mô tả sản phẩm */}
                                                            {product.description && (
                                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                                                                        <FileText className="h-4 w-4 text-primary" />
                                                                        Mô tả sản phẩm
                                                                    </h3>
                                                                    <div className="bg-white p-4 rounded-md shadow-sm">
                                                                        <p className="text-sm">{product.description}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>
                                            <TabsContent value="recipes" className="mt-4 max-h-[327px] pb-2">
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>Công thức chế biến</CardTitle>
                                                        <CardDescription className="pb-1">Nguyên liệu và định lượng cho món ăn này</CardDescription>
                                                        <Separator />
                                                    </CardHeader>
                                                    <CardContent>{product.recipes && <RecipeTable recipes={product.recipes} />}</CardContent>
                                                </Card>
                                            </TabsContent>
                                        </div>
                                    </div>
                                </Tabs>
                            </div>

                            <div className="flex justify-end mt-4">
                                <Button variant="outline" onClick={() => onOpenChange(false)}>
                                    Đóng
                                </Button>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="p-4 text-center flex-1 flex flex-col items-center justify-center min-h-[300px]">
                        <p className="text-muted-foreground">Không tìm thấy thông tin sản phẩm</p>
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-4">
                            Đóng
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
