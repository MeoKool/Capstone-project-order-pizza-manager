"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import TableResponse from "@/types/tables"

interface TableQRCodeProps {
    table: TableResponse
    open: boolean
    onOpenChange: (open: boolean) => void
}

const apiPublic = import.meta.env.VITE_PUBLIC_WEBSITE_URL;

if (!apiPublic) {
    console.error("VITE_PUBLIC_WEBSITE_URL is not defined in .env");
}
export function TableQRCode({ table, open, onOpenChange }: TableQRCodeProps) {
    const [isPrinting, setIsPrinting] = useState(false)

    const qrCodeData = `${apiPublic}/${table.id}`

    const handlePrint = () => {
        setIsPrinting(true)
        const printContent = document.getElementById("qr-code-print-area")
        const windowPrint = window.open("", "", "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0")

        if (printContent && windowPrint) {
            windowPrint.document.write(printContent.innerHTML)
            windowPrint.document.close()
            windowPrint.focus()
            windowPrint.print()
            windowPrint.close()
        }

        setIsPrinting(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Mã QR cho {table.code}</DialogTitle>
                    <DialogDescription>Quét mã QR này để xem thông tin chi tiết về bàn.</DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-4" id="qr-code-print-area">
                    <div className="text-center">
                        <QRCodeSVG value={qrCodeData} size={200} level="H" includeMargin={true} />
                        <p className="mt-2 font-semibold">{table.code}</p>
                        <p className="text-sm text-muted-foreground">ID: {table.id}</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handlePrint} disabled={isPrinting}>
                        <Printer className="mr-2 h-4 w-4" />
                        {isPrinting ? "Đang in..." : "In mã QR"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

