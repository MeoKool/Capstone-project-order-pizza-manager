import { MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function RecentOrders() {
    return (
        <Card className="h-full">
            <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-base">Đơn hàng gần đây</CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-xs">Hôm nay</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">Tuần này</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">Tháng này</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-xs font-medium p-2">Mã</TableHead>
                            <TableHead className="text-xs font-medium p-2">Bàn</TableHead>
                            <TableHead className="text-xs font-medium p-2">Trạng thái</TableHead>
                            <TableHead className="text-xs font-medium p-2 text-right">Giá trị</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="hover:bg-gray-50">
                            <TableCell className="text-xs p-2 font-medium">#1234</TableCell>
                            <TableCell className="text-xs p-2">Bàn 05</TableCell>
                            <TableCell className="text-xs p-2">
                                <Badge className="bg-amber-500 text-[10px] font-normal py-0 px-1.5">Đang phục vụ</Badge>
                            </TableCell>
                            <TableCell className="text-xs p-2 text-right">450,000₫</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                            <TableCell className="text-xs p-2 font-medium">#1233</TableCell>
                            <TableCell className="text-xs p-2">Bàn 12</TableCell>
                            <TableCell className="text-xs p-2">
                                <Badge className="bg-green-500 text-[10px] font-normal py-0 px-1.5">Hoàn thành</Badge>
                            </TableCell>
                            <TableCell className="text-xs p-2 text-right">680,000₫</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                            <TableCell className="text-xs p-2 font-medium">#1232</TableCell>
                            <TableCell className="text-xs p-2">Bàn 08</TableCell>
                            <TableCell className="text-xs p-2">
                                <Badge className="bg-green-500 text-[10px] font-normal py-0 px-1.5">Hoàn thành</Badge>
                            </TableCell>
                            <TableCell className="text-xs p-2 text-right">320,000₫</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                            <TableCell className="text-xs p-2 font-medium">#1231</TableCell>
                            <TableCell className="text-xs p-2">Bàn 03</TableCell>
                            <TableCell className="text-xs p-2">
                                <Badge className="bg-green-500 text-[10px] font-normal py-0 px-1.5">Hoàn thành</Badge>
                            </TableCell>
                            <TableCell className="text-xs p-2 text-right">520,000₫</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                            <TableCell className="text-xs p-2 font-medium">#1230</TableCell>
                            <TableCell className="text-xs p-2">Bàn 10</TableCell>
                            <TableCell className="text-xs p-2">
                                <Badge className="bg-green-500 text-[10px] font-normal py-0 px-1.5">Hoàn thành</Badge>
                            </TableCell>
                            <TableCell className="text-xs p-2 text-right">610,000₫</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                            <TableCell className="text-xs p-2 font-medium">#1229</TableCell>
                            <TableCell className="text-xs p-2">Bàn 07</TableCell>
                            <TableCell className="text-xs p-2">
                                <Badge className="bg-green-500 text-[10px] font-normal py-0 px-1.5">Hoàn thành</Badge>
                            </TableCell>
                            <TableCell className="text-xs p-2 text-right">480,000₫</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <div className="p-2 border-t text-center">
                    <Button variant="ghost" size="sm" className="text-xs h-7 w-full">
                        Xem tất cả đơn hàng
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
