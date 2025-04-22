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
import { Loader2, Info, Utensils, Box } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

import type { Recipe } from "@/types/recipe"
import RecipeService from "@/services/recipe-service"
import ProductSizeService from "@/services/productsize-service"
import IngredientsService from "@/services/ingredients-serivce"
import { UnitType } from "@/types/recipe"

interface ViewRecipeDialogProps {
    recipeId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
}
const unitTypeMapping: Record<string, string> = {
    [UnitType.Milligram]: "Miligram",
    [UnitType.Gram]: "Gram",
    [UnitType.Kilogram]: "Kilogram",
    [UnitType.Milliliter]: "Mililít",
    [UnitType.Liter]: "Lít",
    [UnitType.Piece]: "Cái/Miếng",
    [UnitType.Teaspoon]: "Thìa cà phê",
    [UnitType.Tablespoon]: "Thìa canh",
}

export function ViewRecipeDialog({ recipeId, open, onOpenChange }: ViewRecipeDialogProps) {
    const [recipe, setRecipe] = useState<Recipe | null>(null)
    const [productSizeDetails, setProductSizeDetails] = useState<{
        id: string
        name: string
        diameter: number
        description: string | null
        productId: string
    } | null>(null)
    const [ingredientDetails, setIngredientDetails] = useState<{ name: string; description: string } | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRecipeDetails = async () => {
            if (!recipeId || !open) return

            setIsLoading(true)
            setError(null)

            try {
                const recipeService = RecipeService.getInstance()
                const response = await recipeService.getRecipeById(recipeId)

                if (response.success && response.result) {
                    setRecipe(response.result)

                    // Fetch product size details
                    try {
                        const productSizeService = ProductSizeService.getInstance()
                        const productSizeResponse = await productSizeService.getProductSizeById(response.result.id)
                        if (productSizeResponse.success && productSizeResponse.result) {
                            const productSize = productSizeResponse.result
                            setProductSizeDetails({
                                id: productSize.id,
                                name: productSize.name,
                                diameter: productSize.diameter,
                                description: productSize.description,
                                productId: productSize.productId,
                            })
                        }
                    } catch (error) {
                        console.error("Error fetching product size details:", error)
                    }

                    // Fetch ingredient details if not already included
                    if (!response.result.ingredient) {
                        try {
                            const ingredientsService = IngredientsService.getInstance()
                            const ingredientResponse = await ingredientsService.getIngredientById(response.result.ingredientId)
                            if (ingredientResponse.success && ingredientResponse.result) {
                                setIngredientDetails({
                                    name: ingredientResponse.result.name,
                                    description: ingredientResponse.result.description,
                                })
                            }
                        } catch (error) {
                            console.error("Error fetching ingredient details:", error)
                        }
                    }
                } else {
                    throw new Error(response.message || "Không thể tải thông tin công thức")
                }
            } catch (error) {
                console.error("Error fetching recipe details:", error)
                setError(error instanceof Error ? error.message : "Có lỗi xảy ra khi tải thông tin")
            } finally {
                setIsLoading(false)
            }
        }

        fetchRecipeDetails()
    }, [recipeId, open])

    const handleClose = () => {
        onOpenChange(false)
        // Reset state when dialog closes
        setTimeout(() => {
            if (!open) {
                setRecipe(null)
                setProductSizeDetails(null)
                setIngredientDetails(null)
                setError(null)
            }
        }, 300)
    }

    // Format unit for display
    const formatUnit = (unit: string): string => {


        return unitTypeMapping[unit] || unit
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Chi tiết công thức
                    </DialogTitle>
                    <DialogDescription>Thông tin chi tiết về công thức và nguyên liệu liên quan.</DialogDescription>
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
                ) : recipe ? (
                    <div className="space-y-6 py-4">
                        {productSizeDetails && (
                            <div>
                                <h3 className="text-base font-medium flex items-center mb-3">
                                    <Box className="h-4 w-4 mr-2" />
                                    Thông tin kích cỡ sản phẩm
                                </h3>

                                <Card>
                                    <CardContent className="p-4 space-y-4">


                                        <div className="grid grid-cols-2 gap-6">

                                            <div>
                                                <h4 className="font-medium">{productSizeDetails.name}</h4>
                                                {productSizeDetails.description && (
                                                    <p className="text-sm text-muted-foreground mt-1">{productSizeDetails.description}</p>
                                                )}
                                            </div><div>
                                                <h4 className="font-medium  ">Đường kính</h4>
                                                <p className="text-sm  text-muted-foreground mt-1">{productSizeDetails.diameter} cm</p>
                                            </div>

                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        <Separator />

                        <div>
                            <h3 className="text-base font-medium flex items-center mb-3">
                                <Utensils className="h-4 w-4 mr-2" />
                                Thông tin nguyên liệu
                            </h3>

                            <Card>
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium">{recipe.ingredientName || ingredientDetails?.name}</h4>
                                            {ingredientDetails?.description && (
                                                <p className="text-sm text-muted-foreground mt-1">{ingredientDetails.description}</p>
                                            )}
                                        </div>

                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-4">

                                        <div>
                                            <h3 className="text-sm font-medium  mb-1">Đơn vị đầy đủ</h3>
                                            <p className="text-sm">{recipe.unit}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground mb-1">Số lượng / Đơn vị</p>
                                            <div className=" flex items-center justify-end  gap-2 h-6 mt-3">
                                                <span className="text-lg font-bold">{recipe.quantity}</span>
                                                <Badge variant="outline" className="h-7">{formatUnit(recipe.unit)}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            <p>Công thức này xác định số lượng nguyên liệu cần thiết cho kích cỡ sản phẩm cụ thể.</p>
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

