// Update the import to include different icons
import { AlertCircle, Check, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface OptionItemStatusBadgeProps {
    status: string
    className?: string
}

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case "Available":
            return "active"
        case "OutOfIngredient":
            return "outof"
        case "Locked":
            return "lock"
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
export function OptionItemStatusBadge({ status, className = "" }: OptionItemStatusBadgeProps) {
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
        <Badge variant={getStatusBadgeVariant(status)} className={`flex justify-center items-center gap-1 h-7 ${className}`}>
            {getStatusIcon()}
            {formatProductStatus(status)}
        </Badge>
    )
}
