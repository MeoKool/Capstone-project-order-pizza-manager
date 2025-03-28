import { useState } from "react"
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
import ProductService from "@/services/product-service"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, Plus, Trash2, PlusCircle, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from 'sonner'
interface AddFoodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ProductOptionItemModel {
  name: string
  additionalPrice: number
}

interface ProductOptionModel {
  name: string
  description: string
  productOptionItemModels: ProductOptionItemModel[]
}

interface ProductCreateRequest {
  name: string
  price: number
  description: string
  categoryId: string
  productType: string
  productOptionModels: ProductOptionModel[]
}

// Define the schema for option items
const optionItemSchema = z.object({
  name: z.string().min(1, "Tên lựa chọn không được để trống"),
  additionalPrice: z.number().min(0, "Giá phụ thu không được âm"),
})

// Define the schema for options
const optionSchema = z.object({
  name: z.string().min(1, "Tên tùy chọn không được để trống"),
  description: z.string().optional(),
  productOptionItemModels: z.array(optionItemSchema).min(1, "Phải có ít nhất một lựa chọn"),
})

// Define the main form schema
const formSchema = z.object({
  name: z.string().min(1, "Tên món ăn không được để trống"),
  price: z.number().min(1, "Giá phải lớn hơn 0"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  productType: z.string().default("0"),
  productOptionModels: z.array(optionSchema).optional(),
})

type FormValues = z.infer<typeof formSchema>

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
        <div className="text-center py-2 border border-dashed rounded-md">
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

export function AddFoodDialog({ open, onOpenChange }: AddFoodDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { foodCategory } = useCategories()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      categoryId: "",
      productType: "0",
      productOptionModels: [],
    },
  })

  // Use field array for managing product options at the top level
  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control: form.control,
    name: "productOptionModels",
  })

  const addNewOption = () => {
    appendOption({
      name: "",
      description: "",
      productOptionItemModels: [{ name: "", additionalPrice: 0 }],
    })
  }

  const resetForm = () => {
    form.reset()

  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)


    try {
      const requestData: ProductCreateRequest = {
        name: data.name,
        price: data.price,
        description: data.description || "",
        categoryId: data.categoryId,
        productType: data.productType,
        productOptionModels: (data.productOptionModels || []).map(option => ({
          ...option,
          description: option.description || ""
        })),
      }

      const productService = ProductService.getInstance()
      const response = await productService.createProduct(JSON.stringify(requestData))

      if (!response.success === false) {
        throw new Error(response.message || "Không thể tạo sản phẩm")
      }
      toast.success("Tạo sản phẩm thành công!")

      // Close dialog after success
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (err) {
      toast.error("Có lỗi xảy ra khi tạo sản phẩm")
      console.error("Error creating product:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm món ăn mới</DialogTitle>
          <DialogDescription>Vui lòng điền thông tin chi tiết về món ăn mới.</DialogDescription>
        </DialogHeader>


        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
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
                control={form.control}
                name="price"
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
                        <SelectItem value="ColdKitchen">ColdKitchen</SelectItem>
                        <SelectItem value="HotKitchen">HotKitchen</SelectItem>
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
                  Thêm tùy chọn
                </Button>
              </div>

              {optionFields.length === 0 && (
                <div className="text-center py-4 border border-dashed rounded-md">
                  <p className="text-muted-foreground">Chưa có tùy chọn nào. Nhấn "Thêm tùy chọn" để bắt đầu.</p>
                </div>
              )}

              <Accordion type="multiple" className="space-y-4">
                {optionFields.map((optionField, optionIndex) => (
                  <AccordionItem
                    key={optionField.id}
                    value={`option-${optionIndex}`}
                    className="border rounded-lg overflow-hidden"
                  >
                    <Card>
                      <CardHeader className="p-4 pb-0">
                        <div className="flex items-center justify-between">
                          <AccordionTrigger className="hover:no-underline py-0">
                            <CardTitle className="text-base">
                              {form.watch(`productOptionModels.${optionIndex}.name`) || `Tùy chọn ${optionIndex + 1}`}
                            </CardTitle>
                          </AccordionTrigger>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(optionIndex)}
                            className="text-destructive h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Xóa tùy chọn</span>
                          </Button>
                        </div>
                      </CardHeader>
                      <AccordionContent>
                        <CardContent className="p-4 pt-0">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`productOptionModels.${optionIndex}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tên tùy chọn</FormLabel>
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
                                      <Input placeholder="Mô tả tùy chọn" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

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

