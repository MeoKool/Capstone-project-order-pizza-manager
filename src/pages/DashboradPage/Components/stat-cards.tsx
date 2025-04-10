import { DollarSign, ShoppingBag, Utensils, Users } from "lucide-react"
import StatCard from "./stat-card"

export default function StatCards() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
                title="Tổng doanh thu hôm nay"
                value="2,580,000₫"
                description="+15% so với hôm qua"
                icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
                trend="up"
            />
            <StatCard
                title="Đơn hàng đang phục vụ"
                value="12"
                description="4 đơn mới trong giờ qua"
                icon={<ShoppingBag className="h-4 w-4 text-blue-600" />}
                trend="up"
            />
            <StatCard
                title="Bàn đang sử dụng"
                value="8/20"
                description="40% công suất"
                icon={<Utensils className="h-4 w-4 text-amber-600" />}
                trend="neutral"
            />
            <StatCard
                title="Khách hàng hôm nay"
                value="48"
                description="+8 khách so với hôm qua"
                icon={<Users className="h-4 w-4 text-purple-600" />}
                trend="up"
            />
        </div>
    )
}
