"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import type { Option } from "@/types/option"
import useCategories from "@/hooks/useCategories"
import { useOptions } from "@/hooks/use-options"

// Import our new components
import { ProductBasicInfo } from "./product-basic-info"
import { ProductImageUpload } from "./product-image-upload"
import { ProductCategorySelection } from "./product-category-selection"
import { ProductSizeItems } from "./product-size-items"
import { ProductOptionsSelection } from "./product-options-selection"
import { FormFooter } from "./form-footer"

interface AddFoodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Define the size item schema
const sizeItemSchema = z.object({
  name: z.string().min(1, "Tên kích cỡ không được để trống"),
  price: z.number().gte(0, "Giá không được âm"),
})

// Define the form schema to match ProductFormData with updated sizes field
const formSchema = z.object({
  name: z.string().min(1, "Tên món ăn không được để trống"),
  price: z.number().min(1, "Giá phải lớn hơn 0"),
  // Remove image from form schema as it will be handled separately
  description: z.string().optional(),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  productType: z.string().min(1, "Vui lòng chọn loại sản phẩm"),
  optionIds: z.array(z.string()).optional(), // Array of strings
  sizes: z.string().optional(), // Will store JSON string of size items
  sizeItems: z.array(sizeItemSchema).optional(), // For form handling
})

export function AddFoodDialog({ open, onOpenChange }: AddFoodDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([])
  const { foodCategory } = useCategories()

  // Use our custom hook for options
  const { options, totalCount, isLoading: isLoadingOptions, fetchOptions } = useOptions()

  // Initialize the form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      categoryId: "",
      productType: "HotKitchen",
      optionIds: [],
      sizes: "",
      sizeItems: [{ name: "", price: 0 }], // Start with one empty size item
    },
  })

  // Setup field array for dynamic size items
  const sizeFieldArray = useFieldArray({
    control: form.control,
    name: "sizeItems",
  })

  // Fetch options when dialog opens
  useEffect(() => {
    if (open) {
      fetchOptions()
    }
  }, [open, fetchOptions])

  // Update form value when selectedOptions changes - now storing array of IDs
  useEffect(() => {
    if (selectedOptions.length > 0) {
      // Store array of option IDs
      const optionIdsArray = selectedOptions.map((option) => option.id)
      form.setValue("optionIds", optionIdsArray)
    } else {
      form.setValue("optionIds", [])
    }
  }, [selectedOptions, form])

  // Update sizes JSON string when sizeItems change
  useEffect(() => {
    const sizeItems = form.watch("sizeItems")
    if (sizeItems && sizeItems.length > 0) {
      // Include all items, even if name is empty - we'll validate on submit
      form.setValue("sizes", JSON.stringify(sizeItems))

      // Log for debugging
      console.log("Size items updated:", sizeItems)
      console.log("JSON string:", JSON.stringify(sizeItems))
    } else {
      form.setValue("sizes", "")
    }
  }, [form.watch("sizeItems"), form])

  const resetForm = () => {
    form.reset({
      name: "",
      price: 0,
      description: "",
      categoryId: "",
      productType: "HotKitchen",
      optionIds: [],
      sizes: "",
      sizeItems: [{ name: "", price: 0 }], // Reset to one empty size item
    })
    setSelectedFile(null)
    setSelectedOptions([])
    setError(null)
    setSuccess(false)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  // Handle selecting an option
  const handleSelectOption = (option: Option) => {
    setSelectedOptions((prev) => {
      // Check if option is already selected
      const isSelected = prev.some((item) => item.id === option.id)

      if (isSelected) {
        // Remove option if already selected
        return prev.filter((item) => item.id !== option.id)
      } else {
        // Add option if not selected
        return [...prev, option]
      }
    })
  }

  // Handle removing an option
  const handleRemoveOption = (optionId: string) => {
    setSelectedOptions((prev) => prev.filter((option) => option.id !== optionId))
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      // Ensure all size items are included
      const allSizeItems = data.sizeItems || []
      const sizeItemsJson = JSON.stringify(allSizeItems)
      console.log("Submitting size items:", allSizeItems)
      console.log("Size items JSON:", sizeItemsJson)

      // Create FormData object
      const formData = new FormData()

      // Add all product fields individually to FormData
      formData.append("name", data.name)
      formData.append("price", data.price.toString())
      formData.append("description", data.description || "")
      formData.append("categoryId", data.categoryId)
      formData.append("productType", data.productType)

      // Add each option ID separately with the same field name
      if (data.optionIds && data.optionIds.length > 0) {
        data.optionIds.forEach((id) => {
          formData.append("OptionIds", id)
        })
      }

      formData.append("sizes", sizeItemsJson)

      // Add the file if one is selected - use "file" as the field name
      if (selectedFile) {
        formData.append("file", selectedFile)
      }

      // Log the form data for debugging
      console.log("Form data being sent:")
      for (const pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1])
      }

      // Send the FormData directly
      const response = await fetch("https://vietsac.id.vn/api/products", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error("Thêm món ăn thất bại!")
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Không thể tạo sản phẩm")
      }

      toast.success("Thêm món ăn thành công!")
      setSuccess(true)

      // Close dialog after success
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (err) {
      console.error("Error creating product:", err)
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo sản phẩm")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle>Thêm món ăn mới</DialogTitle>
          <DialogDescription>Vui lòng điền thông tin chi tiết về món ăn mới.</DialogDescription>
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
            <AlertDescription>Đã tạo sản phẩm mới thành công!</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Basic product information */}
            <ProductBasicInfo control={form.control} />

            {/* Image upload */}
            <ProductImageUpload selectedFile={selectedFile} onFileChange={(file) => setSelectedFile(file)} />

            {/* Category and product type selection */}
            <ProductCategorySelection control={form.control} foodCategory={foodCategory} />

            {/* Size items */}
            <ProductSizeItems control={form.control} fieldArray={sizeFieldArray} />

            {/* Options selection */}
            <ProductOptionsSelection
              control={form.control}
              options={options}
              selectedOptions={selectedOptions}
              totalCount={totalCount}
              isLoadingOptions={isLoadingOptions}
              fetchOptions={fetchOptions}
              onSelectOption={handleSelectOption}
              onRemoveOption={handleRemoveOption}
            />

            {/* Form footer */}
            <FormFooter isSubmitting={isSubmitting} onCancel={handleClose} />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
