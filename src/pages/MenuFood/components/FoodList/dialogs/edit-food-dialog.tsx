import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useCategories from "@/hooks/useCategories"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, Plus, Trash2, PlusCircle, X, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import FileUpload from "@/components/uploadImage"
import { toast } from "sonner"
import type { ProductModel } from "@/types/product"
import ProductService from "@/services/product-service"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

interface EditFoodDialogProps {
  food: ProductModel
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

// Define the form schema with nested option groups
const formSchema = z.object({
  Name: z.string().min(1, "Tên món ăn không được để trống"),
  Price: z.number().min(1, "Giá phải lớn hơn 0"),
  Description: z.string().optional(),
  CategoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  ProductType: z.enum(["HotKitchen", "ColdKitchen"]).default("HotKitchen"),
  productOptionModels: z
    .array(
      z.object({
        name: z.string().min(1, "Tên nhóm tùy chọn không được để trống"),
        description: z.string().optional(),
        SelectMany: z.boolean().default(false), // Add the SelectMany field
        productOptionItemModels: z
          .array(
            z.object({
              name: z.string().min(1, "Tên lựa chọn không được để trống"),
              additionalPrice: z.number().min(0, "Giá phụ thu không được âm"),
            }),
          )
          .min(1, "Phải có ít nhất một lựa chọn"),
      }),
    )
    .optional(),
})

// Separate component for option items to avoid hook rules violations
function OptionItemFields({
  control,
  nestIndex,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any
  nestIndex: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any
}) {
  const { fields, remove, append } = useFieldArray({
    control,
    name: `productOptionModels.${nestIndex}.productOptionItemModels`,
  })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Các lựa chọn</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: "", additionalPrice: 0 })}
          className="h-7 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Thêm lựa chọn
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-2 border border-dashed ">
          <p className="text-xs text-muted-foreground">Chưa có lựa chọn nào</p>
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => {
            return (
              <div key={field.id} className="flex items-center gap-2">
                <FormField
                  control={control}
                  name={`productOptionModels.${nestIndex}.productOptionItemModels.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Tên lựa chọn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`productOptionModels.${nestIndex}.productOptionItemModels.${index}.additionalPrice`}
                  render={({ field }) => (
                    <FormItem className="w-32">
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Giá thêm"
                          value={field.value === 0 ? "" : field.value.toLocaleString("vi-VN")}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "")
                            field.onChange(value ? Number(value) : 0)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-destructive h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Xóa lựa chọn</span>
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function EditFoodDialog({ food, open, onOpenChange, onSave }: EditFoodDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { foodCategory } = useCategories()
  const productService = ProductService.getInstance()

  // Update the transformOptionsToProductOptionModels function to include SelectMany
  const transformOptionsToProductOptionModels = () => {
    if (!food.productOptions || food.productOptions.length === 0) return []

    return food.productOptions.map((option) => ({
      name: option.option.name,
      description: option.option.description || "",
      SelectMany: option.option.selectMany || false, // Include SelectMany with default false
      productOptionItemModels: option.option.optionItems.map((item) => ({
        name: item.name,
        additionalPrice: item.additionalPrice,
      })),
    }))
  }

  // Update the form default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Name: food.name,
      Price: food.price,
      Description: food.description,
      CategoryId: food.categoryId,
      ProductType: food.productType as "HotKitchen" | "ColdKitchen",
      productOptionModels: transformOptionsToProductOptionModels(),
    },
  })

  // Update form values when food changes
  useEffect(() => {
    if (food) {
      form.reset({
        Name: food.name,
        Price: food.price,
        Description: food.description,
        CategoryId: food.categoryId,
        ProductType: food.productType as "HotKitchen" | "ColdKitchen",
        productOptionModels: transformOptionsToProductOptionModels(),
      })
    }
  }, [food, form])

  // Update the useFieldArray to use the new structure for option groups
  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control: form.control,
    name: "productOptionModels",
  })

  // Update the addNewOption function to include SelectMany field
  const addNewOption = () => {
    appendOption({
      name: "",
      description: "",
      SelectMany: false, // Default value for SelectMany
      productOptionItemModels: [{ name: "", additionalPrice: 0 }],
    })
  }

  const resetForm = () => {
    form.reset()
    setSelectedFile(null)
    setError(null)
    setSuccess(false)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  // Update the onSubmit function to match the new structure
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      // Create FormData object
      const formData = new FormData()

      // Add all product fields individually to FormData
      formData.append("Id", food.id)
      formData.append("Name", data.Name)
      formData.append("Price", data.Price.toString())
      formData.append("Description", data.Description || "")
      formData.append("CategoryId", data.CategoryId)
      formData.append("ProductType", data.ProductType)

      // Add ProductOptionModels as a JSON string
      // Always send empty string as the value for ProductOptionModels if there are no options
      formData.append("ProductOptionModels", "")

      // If there are options, then override with the actual options
      if (data.productOptionModels && data.productOptionModels.length > 0) {
        // Make sure all required fields are filled
        const validOptions = data.productOptionModels.filter(
          (option) =>
            option.name &&
            option.productOptionItemModels &&
            option.productOptionItemModels.length > 0 &&
            option.productOptionItemModels.every((item) => item.name),
        )

        if (validOptions.length > 0) {
          formData.set("ProductOptionModels", JSON.stringify(validOptions))
        }
      }

      // Add the file if one is selected
      if (selectedFile) {
        formData.append("file", selectedFile)
      }

      // Log the form data for debugging
      console.log("Form data being sent:")
      for (const pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1])
      }

      // Send the FormData directly
      const response = await productService.updateProduct(food.id, formData)

      if (response.success) {
        toast.success("Cập nhật món ăn thành công!")
        setSuccess(true)

        // Call onSave callback
        onSave()

        // Close dialog after success
        setTimeout(() => {
          handleClose()
        }, 1500)
      } else {
        toast.error("Cập nhật món ăn thất bại!")
        throw new Error(response.message || "Không thể cập nhật sản phẩm")
      }
    } catch (err) {
      console.error("Error updating product:", err)
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi cập nhật sản phẩm")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto scrollbar-hide ">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa món ăn</DialogTitle>
          <DialogDescription>Cập nhật thông tin chi tiết về món ăn.</DialogDescription>
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
            <AlertDescription>Đã cập nhật sản phẩm thành công!</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="Name"
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
                control={form.control}
                name="Price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá (VNĐ)</FormLabel>
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
              control={form.control}
              name="Description"
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

            {/* Add file upload component */}
            <div className="space-y-2">
              <FormLabel>Hình ảnh sản phẩm</FormLabel>
              <div className="flex items-center gap-4">
                {food.imageUrl && (
                  <div className="w-20 h-20 border rounded overflow-hidden flex-shrink-0">
                    <img
                      src={food.imageUrl || "/placeholder.svg"}
                      alt={food.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        ; (e.target as HTMLImageElement).src = "/placeholder.svg?height=80&width=80"
                      }}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <FileUpload
                    onFileChange={(file) => setSelectedFile(file)}
                    value={selectedFile ? URL.createObjectURL(selectedFile) : undefined}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="CategoryId"
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
                control={form.control}
                name="ProductType"
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

            {/* Product Options Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Tùy chọn sản phẩm</h3>
                <Button
                  type="button"
                  onClick={addNewOption}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  Thêm nhóm tùy chọn
                </Button>
              </div>

              {optionFields.length === 0 && (
                <div className="text-center py-4 border border-dashed rounded-md">
                  <p className="text-muted-foreground">
                    Chưa có nhóm tùy chọn nào. Nhấn "Thêm nhóm tùy chọn" để bắt đầu.
                  </p>
                </div>
              )}

              <Accordion type="multiple" className="space-y-4">
                {optionFields.map((optionField, optionIndex) => (
                  <AccordionItem key={optionField.id} value={`option-${optionIndex}`} className=" overflow-hidden">
                    <Card>
                      <CardHeader className="p-4 ">
                        <div className="flex items-center justify-between">
                          <AccordionTrigger className="hover:no-underline py-0">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">
                                {form.watch(`productOptionModels.${optionIndex}.name`) || `Tùy chọn ${optionIndex + 1}`}
                              </CardTitle>
                              {form.watch(`productOptionModels.${optionIndex}.SelectMany`) && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-50 text-green-700 border-green-200"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Chọn nhiều
                                </Badge>
                              )}
                            </div>
                          </AccordionTrigger>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(optionIndex)}
                            className="text-destructive h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Xóa nhóm tùy chọn</span>
                          </Button>
                        </div>
                      </CardHeader>
                      <AccordionContent>
                        <CardContent className="p-4 ">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`productOptionModels.${optionIndex}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tên nhóm tùy chọn</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Ví dụ: Kích cỡ, Đường, Đá..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`productOptionModels.${optionIndex}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Mô tả (tùy chọn)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Mô tả nhóm tùy chọn" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Improved SelectMany UI */}
                            <FormField
                              control={form.control}
                              name={`productOptionModels.${optionIndex}.SelectMany`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Cho phép chọn nhiều</FormLabel>
                                    <div className="text-sm text-muted-foreground">
                                      Khi bật, khách hàng có thể chọn nhiều tùy chọn cùng lúc trong nhóm này
                                    </div>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} aria-readonly />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            {/* Use the separate component for option items */}
                            <OptionItemFields control={form.control} nestIndex={optionIndex} register={form.register} />
                          </div>
                        </CardContent>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
