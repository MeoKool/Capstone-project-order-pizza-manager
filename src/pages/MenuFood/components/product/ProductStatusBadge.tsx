// Update the import to include different icons
import { AlertCircle, Check, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ProductStatusBadgeProps {
    status: string
    className?: string
}

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case "Available":
            return "default"
        case "OutOfIngredient":
            return "destructive"
        case "Locked":
            return "secondary"
        default:
            return "destructive"
    }
}

const formatProductStatus = (status: string) => {
    switch (status) {
        case "Available":
            return "Có sẵn"
        case "OutOfIngredient":
            return "Hết nguyên liệu"
        case "Locked":
            return "Khoá"
        default:
            return "Unknown"
    }
}

// Update the component to use different icons based on status
export function ProductStatusBadge({ status, className = "" }: ProductStatusBadgeProps) {
    const getStatusIcon = () => {
        switch (status) {
            case "Available":
                return <Check className="h-3 w-3 mr-1" />
            case "OutOfIngredient":
                return <AlertCircle className="h-3 w-3 mr-1" />
            case "Locked":
                return <Lock className="h-3 w-3 mr-1" />
            default:
                return <AlertCircle className="h-3 w-3 mr-1" />
        }
    }

    return (
        <Badge variant={getStatusBadgeVariant(status)} className={`flex items-center gap-1 h-7 ${className}`}>
            {getStatusIcon()}
            {formatProductStatus(status)}
        </Badge>
    )
}
