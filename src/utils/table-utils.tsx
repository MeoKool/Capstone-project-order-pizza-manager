import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Coffee } from "lucide-react";

export const getStatusBadge = (status: string) => {
    switch (status) {
        case "Opening":
            return <Badge className="px-2 bg-green-500 hover:bg-green-600">Bàn có khách</Badge>;
        case "Closing":
            return <Badge className="px-2 bg-red-500 hover:bg-red-600">Bàn đang đóng</Badge>;
        case "Booked":
            return <Badge className="px-2 bg-blue-500 hover:bg-blue-600">Đã đặt trước</Badge>;
        case "Locked":
            return <Badge className="px-2 bg-yellow-500 hover:bg-yellow-600">Đang bảo trì</Badge>;
        default:
            return <Badge variant="outline">Không xác định</Badge>;
    }
};
export const getStatusIcon = (status: string) => {
    switch (status) {
        case "Opening":
            return <Coffee className="h-4 w-4 text-green-500" />
        case "Closed":
            return <AlertTriangle className="h-4 w-4 text-red-500" />
        case "Booked":
            return <Calendar className="h-4 w-4 text-blue-500" />
        case "Locked":
            return <AlertTriangle className="h-4 w-4 text-yellow-500" />
        default:
            return null
    }
}