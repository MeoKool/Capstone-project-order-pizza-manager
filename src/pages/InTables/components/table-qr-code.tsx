"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type TableResponse from "@/types/tables"

interface TableQRCodeProps {
    table: TableResponse
    open: boolean
    onOpenChange: (open: boolean) => void
}

const apiPublic = import.meta.env.VITE_PUBLIC_WEBSITE_URL

if (!apiPublic) {
    console.error("VITE_PUBLIC_WEBSITE_URL is not defined in .env")
}

export function TableQRCode({ table, open, onOpenChange }: TableQRCodeProps) {
    const [isPrinting, setIsPrinting] = useState(false)
    const qrCodeData = `${apiPublic}${table.id}/?tableCode=${table.code}`

    const handlePrint = () => {
        setIsPrinting(true)
        const printContent = document.getElementById("qr-code-print-area")
        const windowPrint = window.open("", "", "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0")

        if (printContent && windowPrint) {
            windowPrint.document.write(`
        <html>
          <head>
            <title>Mã QR cho ${table.code}</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 40px; }
              .container { max-width: 400px; margin: 0 auto; padding: 20px; border: 2px solid #f59e0b; border-radius: 12px; }
              .title { color: #92400e; font-size: 24px; margin-bottom: 8px; }
              .subtitle { color: #b45309; font-size: 16px; margin-bottom: 24px; }
              .qr-container { padding: 16px; border: 4px solid #fef3c7; border-radius: 8px; display: inline-block; background: white; }
              .table-info { margin-top: 20px; }
              .table-code { font-size: 20px; font-weight: bold; color: #92400e; margin: 8px 0; }
              .table-id { font-size: 14px; color: #d97706; }
              .footer { margin-top: 30px; font-size: 12px; color: #92400e; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="title">Mã QR cho ${table.code}</h1>
              <p class="subtitle">Quét mã QR này để xem thông tin chi tiết về bàn</p>
              <div class="qr-container">
                ${printContent.innerHTML}
              </div>
              <div class="table-info">
                <p class="table-code">${table.code}</p>
                <p class="table-id">ID: ${table.id}</p>
              </div>
              <p class="footer">In ngày: ${new Date().toLocaleDateString("vi-VN")}</p>
            </div>
          </body>
        </html>
      `)
            windowPrint.document.close()
            windowPrint.focus()
            windowPrint.print()
            windowPrint.close()
        }

        setIsPrinting(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] border-amber-200 overflow-hidden">
                <DialogHeader className="bg-gradient-to-r from-amber-50 to-orange-50 -mx-6 px-6 pt-6 pb-4 border-b border-amber-100">
                    <div className="flex items-center gap-2">
                        <DialogTitle className="text-amber-800 text-xl">Mã QR cho {table.code}</DialogTitle>
                        <Badge variant="outline" className="bg-white border-amber-300 text-amber-700">
                            {table.capacity} người
                        </Badge>
                    </div>
                    <DialogDescription className="text-amber-600">
                        Quét mã QR này để xem thông tin chi tiết về bàn
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-6 space-y-4">
                    <div className="p-4 bg-white rounded-xl border-4 border-amber-100">
                        <div id="qr-code-print-area">
                            <QRCodeSVG
                                value={qrCodeData}
                                size={200}
                                level="H"
                                includeMargin={true}
                                className="rounded-md"
                                bgColor="#FFFFFF"
                                fgColor="#000000"
                            />
                        </div>
                    </div>

                    <div className="text-center space-y-1">
                        <h3 className="text-lg font-semibold text-amber-800">{table.code}</h3>
                        <p className="text-sm text-amber-600">ID: {table.id}</p>
                    </div>

                    <div className="text-xs text-amber-500 text-center max-w-xs">
                        Mã QR này sẽ dẫn khách hàng đến trang thông tin chi tiết về bàn và cho phép họ xem thực đơn
                    </div>
                </div>

                <DialogFooter className="bg-amber-50/50 px-6 py-4 -mx-6 -mb-6 border-t border-amber-100">
                    <Button
                        onClick={handlePrint}
                        disabled={isPrinting}
                        className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto"
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        {isPrinting ? "Đang in..." : "In mã QR"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
