import { Layers } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TableMergeBadgeProps {
    tableMergeName: string | null
    tableMergeId: string | null
}

export function TableMergeBadge({ tableMergeName, tableMergeId }: TableMergeBadgeProps) {
    if (!tableMergeId) return null

    const displayName = tableMergeName || "Nhóm ghép bàn"

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        className="bg-purple-50 text-purple-700 border border-purple-200  p-1.5 sm:p-2.5 rounded-md flex items-center text-xs sm:text-sm py-0"
                    >
                        <Layers className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                        <span className="font-medium truncate">Bàn ghép: {displayName}</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="space-y-1 p-1">
                        <p className="text-xs font-medium">Thông tin ghép bàn:</p>
                        <p className="text-xs"> Tên bàn ghép: {displayName}</p>
                        <p className="text-xs text-muted-foreground">ID: {tableMergeId.substring(0, 8)}...</p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
