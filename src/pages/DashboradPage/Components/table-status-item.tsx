import { Button } from "@/components/ui/button"

interface TableStatusItemProps {
    number: string
    status: "available" | "occupied"
}

export default function TableStatusItem({ number, status }: TableStatusItemProps) {
    return (
        <Button
            variant={status === "available" ? "outline" : "default"}
            className={`h-12 w-full flex flex-col  justify-center  ${status === "available" ? "border-red-500 text-red-600 hover:bg-red-100" : "bg-green-500 hover:bg-green-600"
                }`}
        >
            <div>
                <div className="text-[10px]">{status === "available" ? "Trống" : "Đang dùng"}</div>
                <div className="font-bold text-xs ">{number}</div>
            </div>
        </Button>
    )
}
