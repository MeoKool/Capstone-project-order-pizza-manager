import type React from "react"
import { RefreshCw } from "lucide-react"

const LoadingSpinner: React.FC = () => {
    return (
        <div className="col-span-full flex justify-center items-center py-44">
            <div className="flex flex-col items-center gap-4">
                <RefreshCw className="h-12 w-12 text-primary animate-spin" />
                <p className="text-muted-foreground">Đang tải danh sách món ăn...</p>
            </div>
        </div>
    )
}

export default LoadingSpinner

