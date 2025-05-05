import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import OptionService from '@/services/option-service'
import type { OPTIONITEM_STATUS } from '@/types/option'
import { AlertCircle, Check, Lock } from 'lucide-react'


interface UpdateOptionItemStatusDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    optionItemId: string
    currentStatus: OPTIONITEM_STATUS
    onSuccess?: () => void
    optionItemName: string
}

export function UpdateOptionItemStatusDialog({
    isOpen,
    onOpenChange,
    optionItemId,
    currentStatus,
    optionItemName,
    onSuccess
}: UpdateOptionItemStatusDialogProps) {
    const [selectedStatus, setSelectedStatus] = useState<OPTIONITEM_STATUS>(currentStatus)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Reset selected status when dialog opens with current status
    useEffect(() => {
        if (isOpen) {
            setSelectedStatus(currentStatus)
        }
    }, [isOpen, currentStatus])

    const handleUpdateStatus = async () => {
        if (!optionItemId && !optionItemName || selectedStatus === currentStatus) return

        setIsSubmitting(true)
        const formatOptionStatus = (status: OPTIONITEM_STATUS) => {
            switch (status) {
                case "Available":
                    return "Có sẵn"
                case "OutOfIngredient":
                    return "Hết nguyên liệu"
                case "Locked":
                    return "Khoá"
                default:
                    return "Unknown"
            }
        }

        const nameStatus = formatOptionStatus(selectedStatus)
        try {
            const optionService = OptionService.getInstance()
            const response = await optionService.updateStatusOptionItem(optionItemId, selectedStatus)

            if (response.success) {
                setSelectedStatus(selectedStatus)
                toast.success(`Cập nhật trạng thái "${nameStatus}" thành công cho lựa chọn: ${optionItemName}`)
                onOpenChange(false)
                if (onSuccess) {
                    onSuccess()
                }
            } else {
                toast.error(response.message || 'Không thể cập nhật trạng thái')
            }
        } catch (error) {
            console.error('Error updating option item status:', error)
            toast.error('Đã xảy ra lỗi khi cập nhật trạng thái')
        } finally {
            setIsSubmitting(false)
        }
    }
    const getStatusIcon = (status: OPTIONITEM_STATUS) => {
        switch (status) {
            case "Available":
                return <Check className="h-3 w-3 mr-1" />
            case "OutOfIngredient":
                return <AlertCircle className="h-3 w-3 mr-1" />
            case "Locked":
                return <Lock className="h-3 w-3 mr-1" />
            default:
                return <AlertCircle className="h-3 w-3 mr-1" />
        }
    }
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Cập nhật trạng thái cho: {optionItemName}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="status" className="text-right">
                            Trạng thái
                        </label>
                        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as OPTIONITEM_STATUS)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Available">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon("Available")}
                                        <span>Có sẵn</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="OutOfIngredient">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon("OutOfIngredient")}
                                        <span>Hết nguyên liệu</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="Locked">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon("Locked")}
                                        <span>Đã khóa</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button onClick={handleUpdateStatus} disabled={isSubmitting}>
                        {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 