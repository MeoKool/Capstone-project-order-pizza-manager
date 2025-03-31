
import type React from "react"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

interface FileUploadProps {
  onFileChange: (file: File) => void
  value?: string
}

export default function FileUpload({ onFileChange, value }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreview(result)
        onFileChange(file)
      }
      reader.readAsDataURL(file)
    },
    [onFileChange],
  )

  const clearImage = useCallback(() => {
    setPreview(null)
  }, [])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="flex items-center gap-2 px-4 h-9 border rounded-md hover:bg-gray-50">
            <Upload className="w-4 h-4" />
            <span>Tải lên hình ảnh</span>
          </div>
          <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
        {preview && (


          <Button variant="outline" onClick={clearImage} type="button" >
            <X className="w-4 h-4 mr-1" />
            Xóa
          </Button>


        )}
      </div>

      {preview && (
        <div className="relative w-full h-40 mt-2 overflow-hidden border rounded-md">
          <img src={preview || "/placeholder.svg"} alt="Preview" className="object-cover w-full h-full" />
        </div>
      )}
    </div>
  )
}

