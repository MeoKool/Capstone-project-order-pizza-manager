import type React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface QuickAccessCardProps {
    title: string
    description: string
    icon: React.ReactNode
}

export default function QuickAccessCard({ title, description, icon }: QuickAccessCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="p-2 bg-slate-100 rounded-full mb-2">{icon}</div>
                <h3 className="text-sm font-medium">{title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
        </Card>
    )
}
