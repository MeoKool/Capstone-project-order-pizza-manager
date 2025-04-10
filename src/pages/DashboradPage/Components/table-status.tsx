

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TableStatusItem from "./table-status-item"


export default function TableStatus() {
    return (
        <Card className="lg:col-span-1">
            <CardHeader className="px-4 py-3 border-b">
                <CardTitle className="text-base">Trạng thái bàn</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <Tabs defaultValue="all">
                    <TabsList className="grid w-full grid-cols-3 h-8">
                        <TabsTrigger value="all" className="text-xs">
                            Tất cả
                        </TabsTrigger>
                        <TabsTrigger value="available" className="text-xs">
                            Trống
                        </TabsTrigger>
                        <TabsTrigger value="occupied" className="text-xs">
                            Đang dùng
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="mt-3">
                        <div className="grid grid-cols-4 gap-2">
                            <TableStatusItem number="01" status="occupied" />
                            <TableStatusItem number="02" status="available" />
                            <TableStatusItem number="03" status="available" />
                            <TableStatusItem number="04" status="occupied" />
                            <TableStatusItem number="05" status="occupied" />
                            <TableStatusItem number="06" status="available" />
                            <TableStatusItem number="07" status="available" />
                            <TableStatusItem number="08" status="occupied" />
                            <TableStatusItem number="09" status="occupied" />
                            <TableStatusItem number="10" status="available" />
                            <TableStatusItem number="11" status="occupied" />
                            <TableStatusItem number="12" status="available" />
                        </div>
                    </TabsContent>
                    <TabsContent value="available" className="mt-3">
                        <div className="grid grid-cols-4 gap-2">
                            <TableStatusItem number="02" status="available" />
                            <TableStatusItem number="03" status="available" />
                            <TableStatusItem number="06" status="available" />
                            <TableStatusItem number="07" status="available" />
                            <TableStatusItem number="10" status="available" />
                            <TableStatusItem number="12" status="available" />
                        </div>
                    </TabsContent>
                    <TabsContent value="occupied" className="mt-3">
                        <div className="grid grid-cols-4 gap-2">
                            <TableStatusItem number="01" status="occupied" />
                            <TableStatusItem number="04" status="occupied" />
                            <TableStatusItem number="05" status="occupied" />
                            <TableStatusItem number="08" status="occupied" />
                            <TableStatusItem number="09" status="occupied" />
                            <TableStatusItem number="11" status="occupied" />
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
