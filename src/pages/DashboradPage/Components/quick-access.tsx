import type React from "react"
import { CreditCard, Menu, UserCircle, Users, ShoppingBag, Utensils, Calendar, Coffee } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function QuickAccess() {
    return (
        <Card className="h-full">
            <CardHeader className="px-4 py-3 border-b">
                <CardTitle className="text-base">Truy cập nhanh</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-4 gap-3">
                    <QuickAccessItem icon={<Menu className="h-4 w-4" />} label="Thực đơn" />
                    <QuickAccessItem icon={<Utensils className="h-4 w-4" />} label="Bàn ăn" />
                    <QuickAccessItem icon={<ShoppingBag className="h-4 w-4" />} label="Đơn hàng" />
                    <QuickAccessItem icon={<Users className="h-4 w-4" />} label="Khách hàng" />
                    <QuickAccessItem icon={<Calendar className="h-4 w-4" />} label="Lịch làm việc" />
                    <QuickAccessItem icon={<Coffee className="h-4 w-4" />} label="Workshop" />
                    <QuickAccessItem icon={<UserCircle className="h-4 w-4" />} label="Nhân viên" />
                    <QuickAccessItem icon={<CreditCard className="h-4 w-4" />} label="Báo cáo" />
                </div>
            </CardContent>
        </Card>
    )
}

function QuickAccessItem({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex flex-col items-center justify-center bg-white border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="p-2 bg-slate-100 rounded-full mb-2">{icon}</div>
            <span className="text-xs text-center">{label}</span>
        </div>
    )
}
