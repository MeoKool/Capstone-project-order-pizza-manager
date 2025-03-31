import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Ingredients } from "@/types/ingredients"

interface IngredientsTableProps {
    ingredients: Ingredients[]
    isLoading: boolean
}

export function IngredientsTable({ ingredients, isLoading }: IngredientsTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tên (Name)</TableHead>
                        <TableHead>Mô tả (Description)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        Array(5)
                            .fill(0)
                            .map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Skeleton className="h-5 w-12" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-full" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))
                    ) : ingredients.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                Không có nguyên liệu nào. Hãy thêm nguyên liệu mới.
                            </TableCell>
                        </TableRow>
                    ) : (
                        ingredients.map((ingredient) => (
                            <TableRow key={ingredient.id}>
                                <TableCell >{ingredient.name}</TableCell>
                                <TableCell>{ingredient.description}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

