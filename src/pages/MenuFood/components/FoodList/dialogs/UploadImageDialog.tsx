"use client"

import type React from "react"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, Upload } from "lucide-react"
import { toast } from "sonner"
import type { ProductModel } from "@/types/product"
import ProductService from "@/services/product-service"
import { formatCurrencyVND } from "@/utils/utils"

interface UploadImageDialogProps {
    product: ProductModel
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UploadImageDialog({ product, open, onOpenChange }: UploadImageDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Clear the input value to ensure onChange fires even if the same file is selected again
        e.target.value = ""

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if (!validTypes.includes(file.type)) {
            setError("Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WEBP)")
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Kích thước file không được vượt quá 5MB")
            return
        }

        setSelectedFile(file)
        setError(null)

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Vui lòng chọn một hình ảnh")
            return
        }

        setIsUploading(true)
        setError(null)

        try {
            const productService = ProductService.getInstance()
            const response = await productService.uploadProductImage(product.id, selectedFile)

            if (!response.success) {
                throw new Error(response.message || "Không thể tải lên hình ảnh")
            }

            // Show success toast
            toast.success("Đã tải lên hình ảnh thành công!", {
                description: `Hình ảnh cho món "${product.name}" đã được cập nhật.`,
            })

            // Close dialog after success
            handleClose()
        } catch (err) {
            console.error("Error uploading image:", err)
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải lên hình ảnh")
        } finally {
            setIsUploading(false)
        }
    }

    const handleClose = () => {
        setSelectedFile(null)
        setPreviewUrl(null)
        setError(null)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Thêm hình ảnh cho món ăn</DialogTitle>
                    <DialogDescription>Tải lên hình ảnh cho món "{product.name}"</DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Lỗi</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4 py-4">
                    <div className="flex flex-col items-center gap-4">
                        <div
                            className="w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden"
                            onDragOver={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                            }}
                            onDrop={(e) => {
                                e.preventDefault()
                                e.stopPropagation()

                                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                    const file = e.dataTransfer.files[0]

                                    // Validate file type
                                    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
                                    if (!validTypes.includes(file.type)) {
                                        setError("Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WEBP)")
                                        return
                                    }

                                    // Validate file size (max 5MB)
                                    if (file.size > 5 * 1024 * 1024) {
                                        setError("Kích thước file không được vượt quá 5MB")
                                        return
                                    }

                                    setSelectedFile(file)
                                    setError(null)

                                    // Create preview
                                    const reader = new FileReader()
                                    reader.onloadend = () => {
                                        setPreviewUrl(reader.result as string)
                                    }
                                    reader.readAsDataURL(file)
                                }
                            }}
                        >
                            {previewUrl ? (
                                <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-center p-6">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">Kéo thả hình ảnh vào đây hoặc nhấn để chọn</p>
                                    <p className="mt-1 text-xs text-gray-400">PNG, JPG, GIF, WEBP tối đa 5MB</p>
                                </div>
                            )}
                        </div>

                        <label className="w-full">
                            <Button
                                variant="outline"
                                className="w-full"
                                disabled={isUploading}
                                onClick={() => document.getElementById("image-upload-input")?.click()}
                            >
                                Chọn hình ảnh
                            </Button>
                            <input
                                id="image-upload-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />
                        </label>
                    </div>

                    <div className="mt-4">
                        <h3 className="text-sm font-medium mb-2">Thông tin món:</h3>
                        <div className="text-sm space-y-1">
                            <p>
                                <span className="font-medium">Tên món:</span> {product.name}
                            </p>
                            <p>
                                <span className="font-medium">Giá:</span> {formatCurrencyVND(product.price)}
                            </p>
                            <p>
                                <span className="font-medium">Mô tả:</span> {product.description}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClose} disabled={isUploading}>
                        Hủy
                    </Button>
                    <Button type="button" onClick={handleUpload} disabled={!selectedFile || isUploading}>
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang tải lên...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Tải lên
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

