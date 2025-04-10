"use client"

import { useState, useEffect } from "react"
import { Loader2, Edit, Users, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import useZone from "@/hooks/useZone"
import api from "@/apis/axiosConfig"
import { toast } from "sonner"
import type TableResponse from "@/types/tables"

interface TableUpdateDialogProps {
    table: TableResponse | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onTableUpdated?: () => void
}

const apiUrl = import.meta.env.VITE_API_URL

const formSchema = z.object({
    code: z.string().min(1, "Mã bàn không được để trống"),
    capacity: z.number().min(1, "Số chỗ phải lớn hơn 0").max(20, "Số chỗ tối đa là 20"),
    zoneId: z.string().min(1, "Vui lòng chọn khu vực"),
})

type FormValues = z.infer<typeof formSchema>

export function TableUpdateDialog({ table, open, onOpenChange, onTableUpdated }: TableUpdateDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { zones_ } = useZone()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: "",
            capacity: 4,
            zoneId: "",
        },
    })

    // Update form values when table changes
    useEffect(() => {
        if (table) {
            form.reset({
                code: table.code,
                capacity: table.capacity,
                zoneId: table.zoneId,
            })
        }
    }, [table, form])

    const onSubmit = async (data: FormValues) => {
        if (!table) return

        setIsSubmitting(true)
        try {
            await api.put(`${apiUrl}/tables/${table.id}`, JSON.stringify(data), {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            toast.success("Cập nhật bàn thành công")
            console.log("Cập nhật bàn thành công")

            // Đóng dialog
            onOpenChange(false)

            // Gọi callback nếu có
            if (onTableUpdated) {
                onTableUpdated()
            }
        } catch (error) {
            toast.error("Lỗi khi cập nhật bàn")
            console.error("Lỗi khi cập nhật bàn:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-amber-200 p-0 overflow-hidden">
                <DialogHeader className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 pt-6 pb-4 border-b border-amber-100">
                    <DialogTitle className="text-amber-800 text-xl flex items-center gap-2">
                        <div className="bg-amber-600 p-1.5 rounded-md">
                            <Edit className="h-4 w-4 text-white" />
                        </div>
                        Cập nhật bàn {table?.code}
                    </DialogTitle>
                    <DialogDescription className="text-amber-600">Chỉnh sửa thông tin bàn hiện tại</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-amber-800">Mã bàn</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    placeholder="Ví dụ: A01, B02..."
                                                    {...field}
                                                    className="pl-9 border-amber-200 focus-visible:ring-amber-500"
                                                />
                                                <div className="absolute left-3 top-2.5 text-amber-500">
                                                    <MapPin className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="capacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-amber-800">Số chỗ</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="20"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                                                    className="pl-9 border-amber-200 focus-visible:ring-amber-500"
                                                />
                                                <div className="absolute left-3 top-2.5 text-amber-500">
                                                    <Users className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="zoneId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-amber-800">Khu vực</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="border-amber-200 focus:ring-amber-500">
                                                <SelectValue placeholder="Chọn khu vực" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="border-amber-200">
                                            {zones_.length === 0 ? (
                                                <SelectItem value="empty" disabled>
                                                    Không có khu vực nào
                                                </SelectItem>
                                            ) : (
                                                zones_.map((zone) => (
                                                    <SelectItem key={zone.id} value={zone.id}>
                                                        {zone.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-red-500 text-xs" />
                                </FormItem>
                            )}
                        />

                        {table?.status && (
                            <div className="bg-amber-50/30 p-4 rounded-lg border border-amber-100 text-sm text-amber-700">
                                <p>
                                    Trạng thái hiện tại:{" "}
                                    <span className="font-medium">
                                        {table.status === "Opening"
                                            ? "Đang mở"
                                            : table.status === "Closing"
                                                ? "Đã đóng"
                                                : table.status === "Reserved"
                                                    ? "Đặt trước"
                                                    : table.status === "Locked"
                                                        ? "Đã khóa"
                                                        : "Không xác định"}
                                    </span>
                                </p>
                                <p className="mt-1">ID: {table.id}</p>
                            </div>
                        )}
                    </form>
                </Form>

                <DialogFooter className="bg-amber-50/50 px-6 py-4 border-t border-amber-100">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-amber-200 text-amber-700 hover:bg-amber-50 flex-1 sm:flex-none"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-amber-600 hover:bg-amber-700 flex-1 sm:flex-none"
                            onClick={form.handleSubmit(onSubmit)}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Cập nhật"
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
