import StatCards from "./Components/stat-cards"
import RevenueCharts from "./Components/revenue-charts"
import RecentOrders from "./Components/recent-orders"
import QuickAccess from "./Components/quick-access"
import TableStatus from "./Components/table-status"


const DashboradPage = () => {
    return (
        <div className="m-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">Tổng quan nhà hàng</h1>

            </div>

            <div className="grid gap-4">
                <StatCards />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <RevenueCharts />
                    <div className="lg:col-span-1">
                        <RecentOrders />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <TableStatus />
                    <div className="lg:col-span-2">
                        <QuickAccess />
                    </div>
                </div>
            </div></div>
    )
}

export default DashboradPage