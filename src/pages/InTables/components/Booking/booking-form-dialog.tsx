import type React from "react"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format, isToday } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, Loader2, Users, Phone, User, CalendarPlus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
        .max(10, { message: "Số điện thoại phải có đúng 10 số" })
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

interface BookingFormDialogProps {
    onSuccess?: () => void
    trigger?: React.ReactNode
}

// Hàm kiểm tra thời gian có trong tương lai không
const isTimeInFuture = (timeString: string, dateValue: Date): boolean => {
    if (!timeString || !dateValue) return false

    const [hours, minutes] = timeString.split(":").map(Number)
    const selectedDateTime = new Date(dateValue)
    selectedDateTime.setHours(hours, minutes, 0, 0)

    return selectedDateTime > new Date()
}

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

// Component TimeInput tích hợp
interface InlineTimeInputProps {
    value: string
    onChange: (value: string) => void
    selectedDate?: Date
    label?: string
}

function InlineTimeInput({ value, onChange, selectedDate, label }: InlineTimeInputProps) {
    // Sử dụng ref để theo dõi xem người dùng đã chọn thời gian chưa
    const userSelectedRef = useRef(false)

    // Sử dụng state nội bộ để lưu trữ giá trị đã chọn
    const [internalValue, setInternalValue] = useState(value)

    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    // Tạo tất cả các time slots
    const allTimeSlots = useMemo(() => generateTimeSlots(), [])

    // Filter time slots based on current time (for today)
    const getValidTimeSlots = useCallback(() => {
        // If not today or no date selected, return all slots
        if (!selectedDate || !isToday(selectedDate)) {
            return allTimeSlots
        }

        // For today, only return future time slots
        return allTimeSlots.filter((slot) => {
            const [slotHour, slotMinute] = slot.split(":").map(Number)

            // If hour is greater than current hour, it's valid
            if (slotHour > currentHour) return true

            // If same hour, check if minute is greater than current minute
            if (slotHour === currentHour) {
                // Round up current minute to next 15-min increment
                const currentMinuteRoundedUp = Math.ceil(currentMinute / 15) * 15
                return slotMinute >= currentMinuteRoundedUp
            }

            return false
        })
    }, [selectedDate, currentHour, currentMinute, allTimeSlots])

    // All valid time slots
    const validTimeSlots = useMemo(() => getValidTimeSlots(), [getValidTimeSlots])

    // Chỉ đặt giá trị mặc định khi component được tạo lần đầu và chưa có giá trị
    useEffect(() => {
        // Nếu đã có giá trị ban đầu, đánh dấu là người dùng đã chọn
        if (value) {
            userSelectedRef.current = true
            setInternalValue(value)
        }
        // Chỉ đặt giá trị mặc định nếu người dùng chưa chọn thời gian
        else if (!userSelectedRef.current && validTimeSlots.length > 0 && !internalValue) {
            const defaultTime = validTimeSlots[0]
            setInternalValue(defaultTime)
            onChange(defaultTime)
        }
    }, [])

    // Xử lý khi người dùng chọn thời gian
    const handleTimeChange = (newTime: string) => {
        // Đánh dấu rằng người dùng đã chọn thời gian
        userSelectedRef.current = true

        // Cập nhật giá trị nội bộ
        setInternalValue(newTime)

        // Cập nhật giá trị form
        onChange(newTime)
    }

    return (
        <div className="space-y-2">
            {label && <Label className="text-sm font-medium">{label}</Label>}
            <Select value={internalValue} onValueChange={handleTimeChange}>
                <SelectTrigger className="w-full">
                    <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-blue-500" />
                        <SelectValue placeholder="Chọn giờ đặt bàn" />
                    </div>
                </SelectTrigger>
                <SelectContent side="bottom" className="h-60">
                    {validTimeSlots.length > 0 ? (
                        validTimeSlots.map((timeSlot) => (
                            <SelectItem key={timeSlot} value={timeSlot} className="text-sm">
                                {timeSlot}
                            </SelectItem>
                        ))
                    ) : (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                            Không có khung giờ nào còn trống cho hôm nay. Vui lòng chọn ngày khác.
                        </div>
                    )}
                </SelectContent>
            </Select>
            {internalValue && <div className="mt-1 text-sm text-blue-600">Thời gian đã chọn: {internalValue}</div>}
        </div>
    )
}

export function BookingFormDialog({ onSuccess, trigger }: BookingFormDialogProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const bookingService = BookingService.getInstance()

    const defaultValues = useMemo<Partial<BookingFormValues>>(
        () => ({
            customerName: "",
            phoneNumber: "",
            bookingDate: new Date(),
            bookingTime: "",
            numberOfPeople: 2,
        }),
        [],
    )

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues,
    })

    // Reset form khi dialog đóng
    useEffect(() => {
        if (!open) {
            form.reset(defaultValues)
        }
    }, [open, form, defaultValues])

    // Lấy ngày đặt bàn hiện tại từ form
    const selectedDate = form.watch("bookingDate")

    const onSubmit = async (data: BookingFormValues) => {
        setIsSubmitting(true)
        try {
            // Tạo chuỗi ISO từ ngày và giờ đã chọn mà không bị ảnh hưởng bởi múi giờ
            const bookingDate = new Date(data.bookingDate)
            const [hours, minutes] = data.bookingTime.split(":").map(Number)

            // Lấy các thành phần ngày tháng
            const year = bookingDate.getFullYear()
            const month = bookingDate.getMonth()
            const day = bookingDate.getDate()

            // Tạo chuỗi ISO với định dạng YYYY-MM-DDTHH:MM:SS.sssZ
            // Sử dụng UTC để tránh việc JavaScript tự động điều chỉnh múi giờ
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
                BookingSuccessToast({
                    message: `Đã tạo đặt bàn cho khách hàng ${data.customerName} vào lúc ${data.bookingTime} ngày ${format(data.bookingDate, "dd/MM/yyyy")}. `,
                })

                // Đóng dialog
                setOpen(false)

                // Reset form
                form.reset(defaultValues)

                // Call onSuccess callback if provided to reload BookingTable
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        Đặt bàn mới
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <CalendarPlus className="h-5 w-5 text-blue-500" />
                        <span>Tạo đặt bàn mới</span>
                    </DialogTitle>
                    <DialogDescription className="text-sm">Điền thông tin để tạo đặt bàn mới cho khách hàng.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="customerName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">
                                            Tên khách hàng <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                                                <Input placeholder="Nhập tên khách hàng" className="pl-10 text-sm" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">
                                            Số điện thoại <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                                                <Input
                                                    placeholder="Nhập số điện thoại"
                                                    className="pl-10 text-sm"
                                                    {...field}
                                                    maxLength={10}
                                                    onKeyPress={(e) => {
                                                        if (!/[0-9]/.test(e.key)) {
                                                            e.preventDefault()
                                                        }
                                                    }}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/[^0-9]/g, '')
                                                        field.onChange(value)
                                                    }}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bookingDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col mt-1">
                                        <FormLabel className="text-sm font-medium">
                                            Ngày đặt bàn <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "pl-3 text-left font-normal text-sm",
                                                            !field.value && "text-muted-foreground",
                                                        )}
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
                                        <FormMessage className="text-xs" />
                                        <div className="mb-2">

                                            <FormField

                                                control={form.control}
                                                name="numberOfPeople"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-medium mb-20">
                                                            Số người <span className="text-red-500">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Users className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Nhập số người"
                                                                    className="pl-10 text-sm"
                                                                    min="1"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                                    value={field.value || ""}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bookingTime"
                                render={({ field }) => (
                                    <FormItem>

                                        <FormControl>
                                            <InlineTimeInput
                                                value={field.value}
                                                onChange={field.onChange}
                                                selectedDate={selectedDate}
                                                label="Giờ đặt bàn"
                                            />
                                        </FormControl>
                                        {isToday(selectedDate) && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Chỉ có thể chọn thời gian trong tương lai cho ngày hôm nay.
                                            </p>
                                        )}
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />



                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="mt-2 sm:mt-0 text-sm">
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 mt-2 sm:mt-0 text-sm"
                                disabled={
                                    isSubmitting ||
                                    !form.getValues("bookingTime") ||
                                    (isToday(selectedDate) && !isTimeInFuture(form.getValues("bookingTime"), selectedDate))
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
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
