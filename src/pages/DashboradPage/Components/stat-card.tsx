import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react"

interface StatCardProps {
    title: string
    value: string
    description: string
    icon: React.ReactNode
    trend?: "up" | "down" | "neutral"
    isLoading?: boolean
}

export default function StatCard({ title, value, description, icon, trend = "neutral" }: StatCardProps) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">{title}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <p className="text-lg font-bold">{value}</p>
                            {trend === "up" && <ArrowUp className="h-3 w-3 text-emerald-500" />}
                            {trend === "down" && <ArrowDown className="h-3 w-3 text-red-500" />}
                            {trend === "neutral" && <ArrowRight className="h-3 w-3 text-gray-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                    </div>
                    <div className="p-2 bg-slate-100 rounded-full">{icon}</div>
                </div>
            </CardContent>
        </Card>
    )
}
