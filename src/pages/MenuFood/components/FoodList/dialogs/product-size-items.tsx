"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, HelpCircle, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Control, UseFieldArrayReturn } from "react-hook-form"
import { cn } from "@/utils/utils"
import { useEffect } from "react"

interface ProductSizeItemsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fieldArray: UseFieldArrayReturn<any, "sizeItems", "id">
}

export function ProductSizeItems({ control, fieldArray }: ProductSizeItemsProps) {
    const { fields, append, remove, replace } = fieldArray

    const addSizeItem = () => {
        append({ name: "", price: 0 })
    }

    const clearAllSizeItems = () => {
        replace([])
    }

    // Log whenever fields change to help debug
    useEffect(() => {
        console.log("Size fields updated:", fields)
    }, [fields])

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FormLabel className="text-base">Kích cỡ và giá (tùy chọn)</FormLabel>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[300px]">
                                <p>Thêm các kích cỡ khác nhau cho sản phẩm (ví dụ: S, M, L) và giá tương ứng.</p>
                                <p className="mt-1">Nếu sản phẩm không có kích cỡ, bạn có thể bỏ qua phần này.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="flex items-center gap-2">
                    {fields.length > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={clearAllSizeItems}
                            className="text-destructive hover:bg-destructive/10"
                            data-testid="clear-all-sizes"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Xóa tất cả
                        </Button>
                    )}
                    <Button type="button" variant="outline" size="sm" onClick={addSizeItem} data-testid="add-size-button">
                        <Plus className="h-4 w-4 mr-1" />
                        Thêm kích cỡ
                    </Button>
                </div>
            </div>

            <Card className="border border-input">
                <CardContent className="p-4 space-y-4">
                    {fields.length === 0 ? (
                        <div className="text-center py-6 border border-dashed rounded-md bg-muted/20">
                            <p className="text-sm text-muted-foreground">Chưa có kích cỡ nào. Nhấn "Thêm kích cỡ" để bắt đầu.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Header row for columns */}
                            <div className="grid grid-cols-[1fr_120px_40px] gap-3 px-1">
                                <div className="text-sm font-medium text-muted-foreground">Tên kích cỡ</div>
                                <div className="text-sm font-medium text-muted-foreground">Giá (VNĐ)</div>
                                <div></div>
                            </div>

                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="grid grid-cols-[1fr_120px_40px] gap-3 items-center"
                                    data-testid={`size-item-${index}`}
                                >
                                    <FormField
                                        control={control}
                                        name={`sizeItems.${index}.name`}
                                        render={({ field, fieldState }) => (
                                            <FormItem className="mb-0">
                                                <FormControl>
                                                    <Input
                                                        placeholder="Tên kích cỡ (VD: S, M, L)"
                                                        {...field}
                                                        className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive")}
                                                        data-testid={`size-name-${index}`}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs mt-1" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name={`sizeItems.${index}.price`}
                                        render={({ field, fieldState }) => (
                                            <FormItem className="mb-0">
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="Giá"
                                                        value={field.value === 0 ? "0" : field.value.toLocaleString("vi-VN")}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/[^0-9]/g, "")
                                                            field.onChange(value ? Number(value) : 0)
                                                        }}
                                                        className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive")}
                                                        data-testid={`size-price-${index}`}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs mt-1" />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => remove(index)}
                                        className="h-9 w-9 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                                        title="Xóa kích cỡ này"
                                        data-testid={`remove-size-${index}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Xóa kích cỡ</span>
                                    </Button>
                                </div>
                            ))}

                            {/* Add button at the bottom for convenience */}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addSizeItem}
                                className="w-full mt-2 border-dashed text-muted-foreground hover:text-foreground"
                                data-testid="add-size-bottom-button"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Thêm kích cỡ khác
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
