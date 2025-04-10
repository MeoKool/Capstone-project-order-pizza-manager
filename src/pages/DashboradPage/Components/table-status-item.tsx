import { Button } from "@/components/ui/button"

interface TableStatusItemProps {
    number: string
    status: "available" | "occupied"
}

export default function TableStatusItem({ number, status }: TableStatusItemProps) {
    return (
        <Button
            variant={status === "available" ? "outline" : "default"}
            className={`h-12 w-full flex flex-col items-center justify-center p-0 ${status === "available" ? "border-green-500 text-green-600 hover:bg-green-50" : "bg-amber-500 hover:bg-amber-600"
                }`}
        >
            <span className="text-[10px]">{status === "available" ? "Trống" : "Đang dùng"}</span>
            <span className="font-bold text-xs">{number}</span>
        </Button>
    )
}
