import { FormLabel } from "@/components/ui/form"
import FileUpload from "@/components/uploadImage"

interface ProductImageUploadProps {
    selectedFile: File | null
    onFileChange: (file: File) => void
}

export function ProductImageUpload({ selectedFile, onFileChange }: ProductImageUploadProps) {
    return (
        <div className="space-y-2">
            <FormLabel>Hình ảnh sản phẩm</FormLabel>
            <FileUpload
                onFileChange={onFileChange}
                value={selectedFile ? URL.createObjectURL(selectedFile) : undefined}
            />
            {selectedFile && (
                <p className="text-sm text-muted-foreground">
                    Đã chọn: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </p>
            )}
        </div>
    )
}
