"use client"

import type React from "react"
import { UserCircle, Users, Utensils, Map, Table, ClipboardList, CalendarCheck, Store, Tag, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export default function QuickAccess() {
  const navigate = useNavigate()

  // Define routes for each quick access item
  const routes = {
    menu: "/menuFood",
    tables: "/in-tables",
    orders: "/orders",
    reviews: "/feedbacks",
    zones: "/zones-staff",
    schedule: "/schedule",
    workshops: "/workshops",
    staff: "/staffs",
    settings: "/settings",
    promotion: "/promotion"
  }

  // Handle navigation
  const handleNavigation = (route: string) => {
    navigate(route)
  }

  return (
    <Card className="h-full">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-base">Truy cập nhanh</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-3">
          <QuickAccessItem
            icon={<Table className="h-4 w-4" />}
            label="Bàn ăn"
            onClick={() => handleNavigation(routes.tables)}
          />
          <QuickAccessItem
            icon={<Map className="h-4 w-4" />}
            label="Khu vực nhân viên"
            onClick={() => handleNavigation(routes.zones)}
          />
          <QuickAccessItem
            icon={<ClipboardList className="h-4 w-4" />}
            label="Đơn hàng"
            onClick={() => handleNavigation(routes.orders)}
          />
          <QuickAccessItem
            icon={<Utensils className="h-4 w-4" />}
            label="Thực đơn"
            onClick={() => handleNavigation(routes.menu)}
          />
          <QuickAccessItem
            icon={<Users className="h-4 w-4" />}
            label="Đánh giá"
            onClick={() => handleNavigation(routes.reviews)}
          />
          <QuickAccessItem
            icon={<CalendarCheck className="h-4 w-4" />}
            label="Lịch làm việc"
            onClick={() => handleNavigation(routes.schedule)}
          />
          <QuickAccessItem
            icon={<Store className="h-4 w-4" />}
            label="Workshop"
            onClick={() => handleNavigation(routes.workshops)}
          />
          <QuickAccessItem
            icon={<UserCircle className="h-4 w-4" />}
            label="Nhân viên"
            onClick={() => handleNavigation(routes.staff)}
          />
          <QuickAccessItem
            icon={<Tag className="h-4 w-4" />}
            label="Khuyến mãi"
            onClick={() => handleNavigation(routes.promotion)}
          />
          <QuickAccessItem
            icon={<Settings className="h-4 w-4" />}
            label="Cài đặt "
            onClick={() => handleNavigation(routes.settings)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

interface QuickAccessItemProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

function QuickAccessItem({ icon, label, onClick }: QuickAccessItemProps) {
  return (
    <div
      className="flex flex-col items-center justify-center bg-white border rounded-md p-3 hover:border-green-400 hover:bg-green-200 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="p-2 bg-gray-100 rounded-full mb-2">{icon}</div>
      <span className="text-xs text-center">{label}</span>
    </div>
  )
}
