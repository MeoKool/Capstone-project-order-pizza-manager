"use client"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Plus, Trash2, PlusCircle, MinusCircle, Search, HelpCircle } from "lucide-react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import useCategories from "@/hooks/useCategories"
import { formatCurrencyVND } from "@/utils/utils"
import useProducts from "@/hooks/useProducts"
import { ProductImageUpload } from "./product-image-upload"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AddComboDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

// Define the combo slot item schema
const comboSlotItemSchema = z.object({
    productId: z.string().min(1, "Vui lòng chọn sản phẩm"),
    extraPrice: z.number().gte(0, "Giá thêm không được âm"),
})

// Define the combo slot schema
const comboSlotSchema = z.object({
    slotName: z.string().min(1, "Tên nhóm không được để trống"),
    ComboSlotItems: z.array(comboSlotItemSchema).min(1, "Phải có ít nhất một sản phẩm trong nhóm"),
})

// Define the form schema with updated price validation
const formSchema = z.object({
    name: z.string().min(1, "Tên combo không được để trống"),
    price: z.number().gt(0, "Giá phải lớn hơn 0"), // Changed from min(1) to gt(0) for clearer validation
    description: z.string().optional(),
    categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
    ComboSlots: z.array(comboSlotSchema).min(1, "Phải có ít nhất một nhóm sản phẩm"),
})

export function AddComboDialog({ open, onOpenChange }: AddComboDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [searchQueries, setSearchQueries] = useState<Record<string, string>>({})

    // Get categories and products
    const { foodCategory } = useCategories()
    const { productALL } = useProducts()

    // Initialize the form with default values
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            price: 0,
            description: "",
            categoryId: "",
            ComboSlots: [
                {
                    slotName: "",
                    ComboSlotItems: [{ productId: "", extraPrice: 0 }],
                },
            ],
        },
    })

    // Setup field array for combo slots
    const comboSlotsArray = useFieldArray({
        control: form.control,
        name: "ComboSlots",
    })

    // Handle file selection
    const handleFileChange = (file: File) => {
        setSelectedFile(file)
    }

    // Reset form and state
    const resetForm = () => {
        form.reset({
            name: "",
            price: 0,
            description: "",
            categoryId: "",
            ComboSlots: [
                {
                    slotName: "",
                    ComboSlotItems: [{ productId: "", extraPrice: 0 }],
                },
            ],
        })
        setSelectedFile(null)
        setError(null)
        setSuccess(false)
        setSearchQueries({})
    }

    // Handle dialog close - exactly like add-food-dialog.tsx
    const handleClose = () => {
        resetForm()
        onOpenChange(false)
    }

    // Clean up resources when component unmounts
    useEffect(() => {
        return () => {
            // Any cleanup needed
        }
    }, [])

    // Handle search query change for a specific slot and item
    const handleSearchChange = (slotIndex: number, itemIndex: number, query: string) => {
        setSearchQueries((prev) => ({
            ...prev,
            [`${slotIndex}-${itemIndex}`]: query,
        }))
    }

    // Get filtered products for a specific slot and item
    const getFilteredProducts = (slotIndex: number, itemIndex: number) => {
        const query = searchQueries[`${slotIndex}-${itemIndex}`] || ""

        if (!query.trim() || !productALL) {
            return (productALL || []).filter((product) => product.productRole === "Child" && product.productStatus === "Available" || product.productRole === "Master")
        }

        return productALL.filter(
            (product) =>
                product.productRole === "Child" && product.productStatus === "Available" || product.productRole === "Master" &&
                product.name.toLowerCase().includes(query.toLowerCase())
        )
    }

    // Handle form submission
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsSubmitting(true)
        setError(null)
        setSuccess(false)

        try {
            // Create FormData object
            const formData = new FormData()

            // Add basic fields
            formData.append("name", data.name)
            formData.append("price", data.price.toString())
            formData.append("description", data.description || "")
            formData.append("categoryId", data.categoryId)

            // Add file if selected
            if (selectedFile) {
                formData.append("file", selectedFile)
            }

            // Add combo slots as JSON string
            formData.append("ComboSlots", JSON.stringify(data.ComboSlots))

            // Log the form data for debugging
            console.log("Form data being sent:")
            for (const pair of formData.entries()) {
                console.log(pair[0] + ": " + pair[1])
            }

            // Send the FormData
            const response = await fetch("https://vietsac.id.vn/api/products/create-product-with-combo", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                toast.error("Thêm combo thất bại!")
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (!result.success) {
                throw new Error(result.message || "Không thể tạo combo")
            }

            toast.success("Thêm combo thành công!")
            setSuccess(true)

            // Close dialog after success
            setTimeout(() => {
                handleClose()
            }, 1500)
        } catch (err) {
            console.error("Error creating combo:", err)
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo combo")
        } finally {
            setIsSubmitting(false)
        }
    }



    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto scrollbar-hide">
                <DialogHeader>
                    <DialogTitle>Tạo Combo Mới</DialogTitle>
                    <DialogDescription>Tạo combo với nhiều sản phẩm khác nhau.</DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Lỗi</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="mb-4 border-green-500 text-green-500">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Thành công</AlertTitle>
                        <AlertDescription>Đã tạo combo mới thành công!</AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic combo information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tên Combo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập tên combo" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Price field with formatted text input */}
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Giá combo (VND)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                value={field.value === 0 ? "" : field.value.toLocaleString("vi-VN")}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, "")
                                                    field.onChange(value ? Number(value) : 0)
                                                }}
                                                placeholder="Nhập giá combo"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Image upload using ProductImageUpload component */}
                        <ProductImageUpload selectedFile={selectedFile} onFileChange={handleFileChange} />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mô tả</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Nhập mô tả về combo" className="resize-none h-20" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Category selection */}
                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Danh mục</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                        {/* Combo Slots */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <FormLabel className="text-base">Nhóm sản phẩm trong Combo</FormLabel>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        comboSlotsArray.append({
                                            slotName: "",
                                            ComboSlotItems: [{ productId: "", extraPrice: 0 }],
                                        })
                                    }
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm nhóm
                                </Button>
                            </div>

                            {comboSlotsArray.fields.map((slot, slotIndex) => (
                                <Card key={slot.id} className="relative">
                                    {comboSlotsArray.fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 h-8 w-8"
                                            onClick={() => comboSlotsArray.remove(slotIndex)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}

                                    <CardHeader className="pb-2">
                                        <FormField
                                            control={form.control}
                                            name={`ComboSlots.${slotIndex}.slotName`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tên nhóm</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ví dụ: Pizza, Đồ uống, Món phụ" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <FormLabel className="text-sm">Sản phẩm trong nhóm</FormLabel>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right" className="max-w-[300px]">
                                                            <p>Chọn sản phẩm và thêm giá phụ thu (nếu có).</p>
                                                            <p className="mt-1">Giá thêm là phụ phí cộng thêm vào giá gốc của sản phẩm.</p>
                                                            <p className="mt-1">Để giá thêm là 0 nếu không có phụ phí.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>

                                            {/* Add slot item button */}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const items = form.getValues(`ComboSlots.${slotIndex}.ComboSlotItems`) || []
                                                    form.setValue(`ComboSlots.${slotIndex}.ComboSlotItems`, [
                                                        ...items,
                                                        { productId: "", extraPrice: 0 },
                                                    ])
                                                }}
                                            >
                                                <PlusCircle className="h-4 w-4 mr-2" />
                                                Thêm sản phẩm
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Render slot items */}
                                            {form.watch(`ComboSlots.${slotIndex}.ComboSlotItems`)?.map((_, itemIndex) => (
                                                <div key={itemIndex} className="flex items-start gap-2 p-3 border rounded-md bg-gray-50">
                                                    <div className="flex-1 grid grid-cols-3 md:grid-cols-2 gap-3">
                                                        {/* Product selection */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`ComboSlots.${slotIndex}.ComboSlotItems.${itemIndex}.productId`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-xs">Sản phẩm</FormLabel>
                                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Chọn sản phẩm" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="w-[400px]">
                                                                            <div className="p-2 sticky top-0 bg-white z-10 border-b">
                                                                                <div className="relative">
                                                                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                                    <input
                                                                                        type="text"
                                                                                        placeholder="Tìm kiếm sản phẩm..."
                                                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                                                        value={searchQueries[`${slotIndex}-${itemIndex}`] || ""}
                                                                                        onChange={(e) => handleSearchChange(slotIndex, itemIndex, e.target.value)}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <ScrollArea className="h-[200px]">
                                                                                {getFilteredProducts(slotIndex, itemIndex).map((product) => (
                                                                                    <SelectItem key={product.id} value={product.id}>
                                                                                        <div className="flex justify-between items-center w-full">
                                                                                            <span>{product.name}</span>
                                                                                            <Badge variant="outline" className="ml-2">
                                                                                                {formatCurrencyVND(product.price)}
                                                                                            </Badge>
                                                                                        </div>
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </ScrollArea>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* Extra price - Using formatted text input */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`ComboSlots.${slotIndex}.ComboSlotItems.${itemIndex}.extraPrice`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-xs">Giá thêm (VND)</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="text"
                                                                            inputMode="numeric"
                                                                            value={
                                                                                field.value === 0
                                                                                    ? "0"
                                                                                    : field.value
                                                                                        ? field.value.toLocaleString("vi-VN")
                                                                                        : ""
                                                                            }
                                                                            onChange={(e) => {
                                                                                const value = e.target.value.replace(/[^0-9]/g, "")
                                                                                field.onChange(value !== "" ? Number(value) : 0)
                                                                            }}
                                                                            placeholder="Nhập giá"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Remove slot item button */}
                                                    {form.watch(`ComboSlots.${slotIndex}.ComboSlotItems`).length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="mt-6"
                                                            onClick={() => {
                                                                const items = form.getValues(`ComboSlots.${slotIndex}.ComboSlotItems`) || []
                                                                form.setValue(
                                                                    `ComboSlots.${slotIndex}.ComboSlotItems`,
                                                                    items.filter((_, i) => i !== itemIndex),
                                                                )
                                                            }}
                                                        >
                                                            <MinusCircle className="h-5 w-5 text-red-500" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Form actions */}
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Đang xử lý..." : "Tạo Combo"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
