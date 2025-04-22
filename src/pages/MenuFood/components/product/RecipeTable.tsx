import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Recipe } from "@/types/recipe"
import { formatUnitType } from "@/utils/recipe-formatters"

interface RecipeTableProps {
    recipes: Recipe[]
}

export function RecipeTable({ recipes }: RecipeTableProps) {
    if (!recipes || recipes.length === 0) {
        return (
            <div className="text-center py-6 min-h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">Sản phẩm này không có công thức nào</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nguyên liệu</TableHead>
                        <TableHead>Số lượng</TableHead>
                        <TableHead>Đơn vị</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recipes.map((recipe: Recipe) => (
                        <TableRow key={recipe.id}>
                            <TableCell className="font-medium">{recipe.ingredientName}</TableCell>
                            <TableCell>{recipe.quantity}</TableCell>
                            <TableCell>{formatUnitType(recipe.unit)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
