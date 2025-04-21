import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Control } from "react-hook-form"

interface Category {
    id: string
    name: string
}

interface ProductCategorySelectionProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<any>
    foodCategory: Category[]
}

export function ProductCategorySelection({ control, foodCategory }: ProductCategorySelectionProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={control}
                name="categoryId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Danh mục</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {foodCategory.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="productType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Loại sản phẩm</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn loại sản phẩm" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="HotKitchen">Bếp nóng</SelectItem>
                                <SelectItem value="ColdKitchen">Bếp lạnh</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}
