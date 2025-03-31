"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Info, Utensils } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"

import type { ProductSize } from "@/types/product-sizes"
import ProductService from "@/services/product-service"
import ProductSizeService from "@/services/productsize-service"

interface ViewProductSizeDialogProps {
    productSizeId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ViewProductSizeDialog({ productSizeId, open, onOpenChange }: ViewProductSizeDialogProps) {
    const [productSize, setProductSize] = useState<ProductSize | null>(null)
    const [productName, setProductName] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchProductSizeDetails = async () => {
            if (!productSizeId || !open) return

            setIsLoading(true)
            setError(null)

            try {
                const productSizeService = ProductSizeService.getInstance()
                const response = await productSizeService.getProductSizeWithRecipes(productSizeId)

                if (response.success && response.result) {
                    setProductSize(response.result)

                    // Fetch product name
                    try {
                        const productService = ProductService.getInstance()
                        const productResponse = await productService.getProductById(response.result.productId)
                        if (productResponse.success && productResponse.result) {
                            setProductName(productResponse.result.name)
                        } else {
                            setProductName(`Sản phẩm #${response.result.productId}`)
                        }
                    } catch (error) {
                        console.error("Error fetching product name:", error)
                        setProductName(`Sản phẩm #${response.result.productId}`)
                    }
                } else {
                    throw new Error(response.message || "Không thể tải thông tin kích cỡ sản phẩm")
                }
            } catch (error) {
                console.error("Error fetching product size details:", error)
                setError(error instanceof Error ? error.message : "Có lỗi xảy ra khi tải thông tin")
            } finally {
                setIsLoading(false)
            }
        }

        fetchProductSizeDetails()
    }, [productSizeId, open])

    const handleClose = () => {
        onOpenChange(false)
        // Reset state when dialog closes
        setTimeout(() => {
            if (!open) {
                setProductSize(null)
                setProductName("")
                setError(null)
            }
        }, 300)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Chi tiết kích cỡ sản phẩm
                    </DialogTitle>
                    <DialogDescription>Thông tin chi tiết về kích cỡ sản phẩm và các công thức liên quan.</DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {isLoading ? (
                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2">Đang tải thông tin...</span>
                        </div>
                    </div>
                ) : productSize ? (
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Tên kích cỡ</h3>
                                <p className="font-medium">{productSize.name}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Đường kính</h3>
                                <p className="font-medium">{productSize.diameter} cm</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Sản phẩm</h3>
                                <p className="font-medium">{productName}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Mô tả</h3>
                                <p className="font-medium">{productSize.description || "Không có mô tả"}</p>
                            </div>
                        </div>



                        <Separator />

                        <div>
                            <h3 className="text-base font-medium flex items-center mb-3">
                                <Utensils className="h-4 w-4 mr-2" />
                                Công thức
                            </h3>

                            {!productSize.recipes || (Array.isArray(productSize.recipes) && productSize.recipes.length === 0) ? (
                                <Card>
                                    <CardContent className="p-6 text-center text-muted-foreground">
                                        Không có công thức nào cho kích cỡ sản phẩm này.
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Danh sách nguyên liệu</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Nguyên liệu</TableHead>
                                                    <TableHead className="w-[100px]">Số lượng</TableHead>
                                                    <TableHead className="w-[100px]">Đơn vị</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {Array.isArray(productSize.recipes) ? (
                                                    productSize.recipes.map((recipe, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{recipe.ingredientName || recipe.ingredient}</TableCell>
                                                            <TableCell>{recipe.quantity}</TableCell>
                                                            <TableCell>{recipe.unit}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell>
                                                            {productSize.recipes.ingredientName || productSize.recipes.ingredient}
                                                        </TableCell>
                                                        <TableCell>{productSize.recipes.quantity}</TableCell>
                                                        <TableCell>{productSize.recipes.unit}</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                ) : null}

                <DialogFooter>
                    <Button onClick={handleClose}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

