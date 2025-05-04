"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import ZoneService from "@/services/zone-service"
import type { ZoneResponse, TYPEZONES } from "@/types/zone"

interface EditZoneDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onZoneUpdated: () => void
    zone: ZoneResponse
}

export function EditZoneDialog({ open, onOpenChange, onZoneUpdated, zone }: EditZoneDialogProps) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [type, setType] = useState<TYPEZONES>("DininingArea")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState({
        name: "",
        description: "",
        type: "",
    })

    // Load zone data when dialog opens
    useEffect(() => {
        if (open && zone) {
            setName(zone.name)
            setDescription(zone.description)
            setType(zone.type)
            setErrors({
                name: "",
                description: "",
                type: "",
            })
        }
    }, [open, zone])

    const validateForm = () => {
        const newErrors = {
            name: "",
            description: "",
            type: "",
        }
        let isValid = true

        if (!name.trim()) {
            newErrors.name = "Tên khu vực không được để trống"
            isValid = false
        }

        if (!description.trim()) {
            newErrors.description = "Mô tả không được để trống"
            isValid = false
        }

        if (!type) {
            newErrors.type = "Vui lòng chọn loại khu vực"
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            // Use the zone service instead of direct axios call
            const zoneService = ZoneService.getInstance()
            const updateData = {
                id: zone.id,
                name,
                description,
                type,
            }

            const response = await zoneService.updateZone(zone.id, updateData)

            if (response.success) {
                toast.success("Cập nhật khu vực thành công")
                onZoneUpdated()
            } else {
                toast.error(response.message || "Không thể cập nhật khu vực")
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật khu vực:", error)
            toast.error("Không thể cập nhật khu vực")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-amber-200">
                <DialogHeader>
                    <DialogTitle className="text-amber-800">Chỉnh sửa khu vực</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-amber-800">
                            Tên khu vực
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập tên khu vực"
                            className={`border-amber-200 focus-visible:ring-amber-500 ${errors.name ? "border-red-500" : ""}`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-amber-800">
                            Mô tả
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Nhập mô tả khu vực"
                            className={`border-amber-200 focus-visible:ring-amber-500 min-h-[100px] ${errors.description ? "border-red-500" : ""
                                }`}
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type" className="text-amber-800">
                            Loại khu vực
                        </Label>
                        <Select value={type} onValueChange={(value) => setType(value as TYPEZONES)}>
                            <SelectTrigger
                                id="type"
                                className={`border-amber-200 focus:ring-amber-500 ${errors.type ? "border-red-500" : ""}`}
                            >
                                <SelectValue placeholder="Chọn loại khu vực" />
                            </SelectTrigger>
                            <SelectContent className="border-amber-200">
                                <SelectItem value="DininingArea">Khu vực ăn uống</SelectItem>
                                <SelectItem value="KitchenArea">Khu vực bếp</SelectItem>
                                <SelectItem value="WorkshopArea">Khu vực workshop</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                    </div>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-amber-200 text-amber-800 hover:bg-amber-50"
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={isSubmitting}>
                            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
