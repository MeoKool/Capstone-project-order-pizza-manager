// import type React from "react"
// import { useState } from "react"
// import { Check, ChevronsUpDown } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Checkbox } from "@/components/ui/checkbox"
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
// } from "@/components/ui/dialog"
// import { FormLabel } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Textarea } from "@/components/ui/textarea"
// import TableResponse from "@/types/tables"
// import useZone from "@/hooks/useZone"
// import { ZoneResponse } from "@/types/zone"

// interface TableEditDialogProps {
//     table: TableResponse
//     open: boolean
//     onOpenChange: (open: boolean) => void
// }

// const locations = [
//     { label: "Tầng 1", value: "Tầng 1" },
//     { label: "Tầng 2", value: "Tầng 2" },
//     { label: "Sân thượng", value: "Sân thượng" },
//     { label: "Khu vực ngoài trời", value: "Khu vực ngoài trời" },
// ]

// export function TableEditDialog({ table, open, onOpenChange }: TableEditDialogProps) {
//     const [nameZone, setNameZone] = useState<string | null>()
//     const { zones_ } = useZone()



//     const [formData, setFormData] = useState({
//         name: table.name,
//         capacity: table.capacity,
//         location: table,
//         status: table.status,
//     })

//     const [openLocationCombobox, setOpenLocationCombobox] = useState(false)

//     const handleChange = (field: string, value: any) => {
//         setFormData((prev) => ({
//             ...prev,
//             [field]: value,
//         }))
//     }

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault()
//         // Xử lý lưu dữ liệu
//         console.log("Dữ liệu đã cập nhật:", formData)
//         onOpenChange(false)
//     }

//     return (
//         <Dialog open={open} onOpenChange={onOpenChange}>
//             <DialogContent className="sm:max-w-[500px]">
//                 <DialogHeader>
//                     <DialogTitle>Chỉnh sửa thông tin bàn</DialogTitle>
//                     <DialogDescription>Cập nhật thông tin chi tiết của bàn ăn</DialogDescription>
//                 </DialogHeader>

//                 <form onSubmit={handleSubmit} className="space-y-4 py-2">
//                     <div className="grid grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                             <FormLabel htmlFor="name">Tên bàn</FormLabel>
//                             <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
//                         </div>

//                         <div className="space-y-2">
//                             <FormLabel htmlFor="capacity">Sức chứa</FormLabel>
//                             <Input
//                                 id="capacity"
//                                 type="number"
//                                 min="1"
//                                 value={formData.capacity}
//                                 onChange={(e) => handleChange("capacity", Number.parseInt(e.target.value))}
//                             />
//                         </div>
//                     </div>

//                     <div className="space-y-2">
//                         <FormLabel>Vị trí</FormLabel>
//                         <Popover open={openLocationCombobox} onOpenChange={setOpenLocationCombobox}>
//                             <PopoverTrigger asChild>
//                                 <Button
//                                     variant="outline"
//                                     role="combobox"
//                                     aria-expanded={openLocationCombobox}
//                                     className="w-full justify-between"
//                                 >
//                                     {formData.location
//                                         ? locations.find((location) => location.value === formData.location)?.label
//                                         : "Chọn vị trí..."}
//                                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                                 </Button>
//                             </PopoverTrigger>
//                             <PopoverContent className="w-full p-0">
//                                 <Command>
//                                     <CommandInput placeholder="Tìm vị trí..." />
//                                     <CommandList>
//                                         <CommandEmpty>Không tìm thấy vị trí.</CommandEmpty>
//                                         <CommandGroup>
//                                             {locations.map((location) => (
//                                                 <CommandItem
//                                                     key={location.value}
//                                                     value={location.value}
//                                                     onSelect={(currentValue) => {
//                                                         handleChange("location", currentValue)
//                                                         setOpenLocationCombobox(false)
//                                                     }}
//                                                 >
//                                                     <Check
//                                                         className={cn(
//                                                             "mr-2 h-4 w-4",
//                                                             formData.location === location.value ? "opacity-100" : "opacity-0",
//                                                         )}
//                                                     />
//                                                     {location.label}
//                                                 </CommandItem>
//                                             ))}
//                                         </CommandGroup>
//                                     </CommandList>
//                                 </Command>
//                             </PopoverContent>
//                         </Popover>
//                     </div>

//                     <div className="space-y-2">
//                         <FormLabel>Trạng thái</FormLabel>
//                         <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
//                             <SelectTrigger>
//                                 <SelectValue placeholder="Chọn trạng thái" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="available">Trống</SelectItem>
//                                 <SelectItem value="occupied">Đang phục vụ</SelectItem>
//                                 <SelectItem value="reserved">Đã đặt trước</SelectItem>
//                                 <SelectItem value="maintenance">Bảo trì</SelectItem>
//                             </SelectContent>
//                         </Select>
//                     </div>

//                     {(formData.status === "occupied" || formData.status === "reserved") && (
//                         <div className="space-y-2">
//                             <FormLabel htmlFor="customer">Khách hàng</FormLabel>
//                             <Input
//                                 id="customer"
//                                 value={formData.customer}
//                                 onChange={(e) => handleChange("customer", e.target.value)}
//                                 placeholder="Tên khách hàng"
//                             />
//                         </div>
//                     )}

//                     {formData.status === "maintenance" && (
//                         <div className="space-y-2">
//                             <FormLabel htmlFor="note">Ghi chú bảo trì</FormLabel>
//                             <Textarea
//                                 id="note"
//                                 value={formData.note}
//                                 onChange={(e) => handleChange("note", e.target.value)}
//                                 placeholder="Mô tả vấn đề cần bảo trì"
//                             />
//                         </div>
//                     )}

//                     <div className="flex items-center space-x-2">
//                         <Checkbox
//                             id="isVip"
//                             checked={formData.isVip}
//                             onCheckedChange={(checked) => handleChange("isVip", checked)}
//                         />
//                         <label
//                             htmlFor="isVip"
//                             className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                         >
//                             Đánh dấu là bàn VIP
//                         </label>
//                     </div>

//                     <DialogFooter>
//                         <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//                             Hủy
//                         </Button>
//                         <Button type="submit">Lưu thay đổi</Button>
//                     </DialogFooter>
//                 </form>
//             </DialogContent>
//         </Dialog>
//     )
// }

