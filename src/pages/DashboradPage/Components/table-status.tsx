"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TableStatusItem from "./table-status-item"
import { toast } from "sonner"
import TableResponse from "@/types/tables"

// Define the TableService interface based on the provided information
interface TableService {
    getAllTables: () => Promise<{
        success: boolean
        result: {
            items: TableResponse[]
            totalCount: number
        }
    }>
}

export default function TableStatus() {
    const [tables, setTables] = useState<TableResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("all")

    // Reference to the TableService
    const tableServiceRef = useRef<TableService | null>(null)

    useEffect(() => {
        // Import the TableService dynamically to avoid issues with SSR
        import("@/services/table-service").then((module) => {
            tableServiceRef.current = module.default.getInstance()
            fetchTableData()
        })
    }, [])

    const fetchTableData = async () => {
        setIsLoading(true)
        try {
            if (!tableServiceRef.current) {
                console.error("TableService not initialized")
                return
            }

            const response = await tableServiceRef.current.getAllTables()

            if (response.success && Array.isArray(response.result.items)) {
                // Sort tables by code for consistent display
                const sortedTables = [...response.result.items].sort((a, b) => {
                    // Extract numeric part from code for proper numeric sorting
                    const numA = Number.parseInt(a.code.replace(/\D/g, "")) || 0
                    const numB = Number.parseInt(b.code.replace(/\D/g, "")) || 0
                    return numA - numB
                })

                setTables(sortedTables)
            } else {
                throw new Error("Invalid table data")
            }
        } catch (err) {
            console.error("Error fetching table data:", err)
            toast.error("Không thể tải dữ liệu bàn")
        } finally {
            setIsLoading(false)
        }
    }

    // Map table status from API to component status
    const mapTableStatus = (status: string): "available" | "occupied" => {
        return status === "Opening" ? "occupied" : "available"
    }

    // Filter tables based on active tab
    const getFilteredTables = () => {
        switch (activeTab) {
            case "available":
                return tables.filter((table) => table.status !== "Opening" && table.status !== "Reserved")
            case "occupied":
                return tables.filter((table) => table.status === "Opening" || table.status === "Reserved")
            default:
                return tables
        }
    }

    return (
        <Card className="lg:col-span-1">
            <CardHeader className="px-4 py-3 border-b">
                <CardTitle className="text-base">Trạng thái bàn</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <Tabs defaultValue="all" onValueChange={setActiveTab}>
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

                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            <TabsContent value="all" className="mt-3">
                                <div className="grid grid-cols-4 gap-2">
                                    {tables.map((table) => (
                                        <TableStatusItem key={table.id} number={table.code} status={mapTableStatus(table.status)} />
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="available" className="mt-3">
                                <div className="grid grid-cols-4 gap-2">
                                    {getFilteredTables().map((table) => (
                                        <TableStatusItem key={table.id} number={table.code} status="available" />
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="occupied" className="mt-3">
                                <div className="grid grid-cols-4 gap-2">
                                    {getFilteredTables().map((table) => (
                                        <TableStatusItem key={table.id} number={table.code} status="occupied" />
                                    ))}
                                </div>
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </CardContent>
        </Card>
    )
}
