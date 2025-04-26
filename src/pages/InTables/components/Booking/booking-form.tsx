"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format, isToday } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, Loader2, Users, Phone, User, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import BookingService from "@/services/booking-service"
import { BookingSuccessToast } from "./toast-booking"
import { cn } from "@/utils/utils"

const bookingFormSchema = z.object({
    customerName: z
        .string()
        .min(2, { message: "Tên khách hàng phải có ít nhất 2 ký tự" })
        .max(50, { message: "Tên khách hàng không được vượt quá 50 ký tự" }),
    phoneNumber: z
        .string()
        .min(10, { message: "Số điện thoại phải có ít nhất 10 số" })
        .max(15, { message: "Số điện thoại không được vượt quá 15 số" })
        .regex(/^[0-9]+$/, { message: "Số điện thoại chỉ được chứa các chữ số" }),
    bookingDate: z.date({
        required_error: "Vui lòng chọn ngày đặt bàn",
    }),
    bookingTime: z.string({
        required_error: "Vui lòng chọn giờ đặt bàn",
    }),
    numberOfPeople: z
        .number({
            required_error: "Vui lòng nhập số người",
            invalid_type_error: "Số người phải là số",
        })
        .min(1, { message: "Số người phải lớn hơn 0" }),
})

type BookingFormValues = z.infer<typeof bookingFormSchema>

// Tạo time slots với bước nhảy 15 phút
const generateTimeSlots = () => {
    const slots = []
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const formattedHour = hour.toString().padStart(2, "0")
            const formattedMinute = minute.toString().padStart(2, "0")
            slots.push(`${formattedHour}:${formattedMinute}`)
        }
    }
    return slots
}

interface BookingFormProps {
    onSuccess?: () => void
}

export function BookingForm({ onSuccess }: BookingFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
    const bookingService = BookingService.getInstance()

    // Tạo tất cả các time slots
    const allTimeSlots = generateTimeSlots()

    const defaultValues: Partial<BookingFormValues> = {
        customerName: "",
        phoneNumber: "",
        bookingDate: new Date(),
        bookingTime: "", // Không đặt giá trị mặc định, để người dùng tự chọn
        numberOfPeople: 2,
    }

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues,
    })

    // Lấy ngày đặt bàn hiện tại từ form
    const selectedDate = form.watch("bookingDate")

    // Cập nhật các time slots có sẵn dựa trên ngày đã chọn
    useEffect(() => {
        if (!selectedDate) return

        // Nếu ngày đã chọn là hôm nay, chỉ hiển thị các time slots trong tương lai
        if (isToday(selectedDate)) {
            const now = new Date()

            // Lọc các time slots để chỉ giữ lại các slots trong tương lai
            const futureTimeSlots = allTimeSlots.filter((timeSlot) => {
                const [hours, minutes] = timeSlot.split(":").map(Number)
                const slotTime = new Date(selectedDate)
                slotTime.setHours(hours, minutes, 0, 0)
                return slotTime > now
            })

            setAvailableTimeSlots(futureTimeSlots)

            // Không tự động chọn thời gian mặc định, để người dùng tự chọn
        } else {
            // Nếu ngày đã chọn không phải hôm nay, hiển thị tất cả các time slots
            setAvailableTimeSlots(allTimeSlots)

            // Không tự động chọn thời gian mặc định, để người dùng tự chọn
        }
    }, [selectedDate, allTimeSlots])

    const onSubmit = async (data: BookingFormValues) => {
        setIsSubmitting(true)
        try {
            // Combine date and time into a single ISO string
            const bookingDate = new Date(data.bookingDate)
            const [hours, minutes] = data.bookingTime.split(":").map(Number)


            // Lấy các thành phần ngày tháng
            const year = bookingDate.getFullYear()
            const month = bookingDate.getMonth()
            const day = bookingDate.getDate()

            const isoString = new Date(Date.UTC(year, month, day, hours, minutes, 0, 0)).toISOString()

            const bookingData = {
                customerName: data.customerName,
                phoneNumber: data.phoneNumber,
                bookingTime: isoString,
                numberOfPeople: data.numberOfPeople,
            }

            const response = await bookingService.createBooking(bookingData)

            if (response.success) {
                // Show success toast
                toast.custom(() => (
                    <BookingSuccessToast
                        name="Đặt bàn thành công!"
                        message={`Đã tạo đặt bàn cho ${data.customerName} vào lúc ${data.bookingTime} ngày ${format(data.bookingDate, "dd/MM/yyyy")}.`}
                    />
                ))

                // Reset form
                form.reset(defaultValues)

                // Call onSuccess callback if provided
                if (onSuccess) {
                    onSuccess()
                }
            } else {
                toast.error(response.message || "Không thể tạo đặt bàn. Vui lòng thử lại.")
            }
        } catch (error) {
            console.error("Error creating booking:", error)
            toast.error("Có lỗi xảy ra khi tạo đặt bàn. Vui lòng thử lại.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Tên khách hàng <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                                        <Input placeholder="Nhập tên khách hàng" className="pl-10" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Số điện thoại <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                                        <Input placeholder="Nhập số điện thoại" className="pl-10" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="bookingDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>
                                    Ngày đặt bàn <span className="text-red-500">*</span>
                                </FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                                                {field.value ? format(field.value, "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                            initialFocus
                                            locale={vi}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="bookingTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Giờ đặt bàn <span className="text-red-500">*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="pl-3">
                                            <Clock className="mr-2 h-4 w-4 text-blue-500" />
                                            <SelectValue placeholder="Chọn giờ đặt bàn">
                                                {field.value ? field.value : "Chọn giờ đặt bàn"}
                                            </SelectValue>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {availableTimeSlots.length > 0 ? (
                                            availableTimeSlots.map((time) => (
                                                <SelectItem key={time} value={time}>
                                                    {time}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-center text-sm text-muted-foreground">
                                                Không có khung giờ nào còn trống cho hôm nay. Vui lòng chọn ngày khác.
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                                {isToday(selectedDate) && availableTimeSlots.length === 0 && (
                                    <p className="text-xs text-red-500 mt-1">
                                        Không còn khung giờ nào cho hôm nay. Vui lòng chọn ngày khác.
                                    </p>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="numberOfPeople"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Số người <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                                        <Input
                                            type="number"
                                            placeholder="Nhập số người"
                                            className="pl-10"
                                            min="1"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                            value={field.value || ""}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={
                        isSubmitting || !form.getValues("bookingTime") || (isToday(selectedDate) && availableTimeSlots.length === 0)
                    }
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang xử lý...
                        </>
                    ) : (
                        "Tạo đặt bàn"
                    )}
                </Button>
            </form>
        </Form>
    )
}
