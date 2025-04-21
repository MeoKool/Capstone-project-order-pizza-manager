import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface FormFooterProps {
    isSubmitting: boolean
    onCancel: () => void
}

export function FormFooter({ isSubmitting, onCancel }: FormFooterProps) {
    return (
        <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                    </>
                ) : (
                    "Lưu"
                )}
            </Button>
        </DialogFooter>
    )
}
