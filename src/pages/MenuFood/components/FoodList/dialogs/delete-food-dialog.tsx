"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import type { ProductModel } from "@/types/product"
import ProductService from "@/services/product-service"

interface DeleteProductDialogProps {
  product: ProductModel
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeleteProductDialog({ product, open, onOpenChange, onSuccess }: DeleteProductDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const productService = ProductService.getInstance()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      console.log(product.id);

      const response = await productService.deleteProduct(product.id)

      if (response.result === null && response.success) {
        toast.success("Đã xóa sản phẩm thành công!")
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(response.message || "Không thể xóa sản phẩm")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Có lỗi xảy ra khi xóa sản phẩm")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Xác nhận xóa sản phẩm
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa sản phẩm <strong>"{product.name}"</strong>? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Việc xóa sản phẩm sẽ xóa tất cả thông tin liên quan đến sản phẩm này, bao gồm kích cỡ, công thức và tùy
            chọn.
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Hủy
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xóa"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

