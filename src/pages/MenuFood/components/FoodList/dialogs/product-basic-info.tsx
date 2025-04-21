import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Control } from "react-hook-form"

interface ProductBasicInfoProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<any>
}

export function ProductBasicInfo({ control }: ProductBasicInfoProps) {
    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên món ăn</FormLabel>
                            <FormControl>
                                <Input placeholder="Nhập tên món ăn" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Giá cơ bản (VNĐ)</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    value={field.value === 0 ? "" : field.value.toLocaleString("vi-VN")}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, "")
                                        field.onChange(value ? Number(value) : 0)
                                    }}
                                    placeholder="Nhập giá"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Nhập mô tả món ăn" rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    )
}
