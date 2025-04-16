import { Users, MapPin, Clock } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import type TableResponse from "@/types/tables"
import { getZoneName } from "@/utils/zone-utils"

interface TableInfoCardProps {
    table: TableResponse
    zones: { id: string; name: string }[]
}

export function TableInfoCard({ table, zones }: TableInfoCardProps) {
    return (
        <Card className="border-amber-100">
            <CardContent className="p-3 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-900 text-xs sm:text-sm">Sức chứa</p>
                            <p className="text-xs sm:text-sm text-amber-700">{table.capacity} người</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-900 text-xs sm:text-sm">Khu vực</p>
                            <p className="text-xs sm:text-sm text-amber-700">Khu vực {getZoneName(table.zoneId, zones)}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-900 text-xs sm:text-sm">Cập nhật lần cuối</p>
                            <p className="text-xs sm:text-sm text-amber-700">{new Date().toLocaleString("vi-VN")}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
