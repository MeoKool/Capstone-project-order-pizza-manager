"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { ArrowLeft, Download, Printer, Loader2 } from "lucide-react"
import { useState } from "react"
import type { OrderDetail } from "@/types/order"

interface PaymentQRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  qrCodeData: string
  amount: number
  onBack: () => void
  onCancel: () => Promise<void>
  orderDetail?: OrderDetail // Add orderDetail as an optional prop
}

export function PaymentQRDialog({
  open,
  onOpenChange,
  qrCodeData,
  amount,
  onBack,
  onCancel,
  orderDetail,
}: PaymentQRDialogProps) {
  const [isCanceling, setIsCanceling] = useState(false)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  const handlePrint = () => {
    const printContent = document.getElementById("payment-qr-code-print-area")
    const windowPrint = window.open("", "", "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0")

    if (printContent && windowPrint) {
      if (orderDetail) {
        // Generate order items HTML
        const orderItemsHtml = orderDetail.orderItems
          .map(
            (item) => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #f3e8d0;">${item.name}</td>
              <td style="padding: 8px; border-bottom: 1px solid #f3e8d0; text-align: center;">${item.quantity}</td>
              <td style="padding: 8px; border-bottom: 1px solid #f3e8d0; text-align: right;">${new Intl.NumberFormat("vi-VN").format(item.price)} đ</td>
              <td style="padding: 8px; border-bottom: 1px solid #f3e8d0; text-align: right;">${new Intl.NumberFormat("vi-VN").format(item.totalPrice)} đ</td>
            </tr>
          `,
          )
          .join("")

        // Generate additional fees HTML
        const additionalFeesHtml =
          orderDetail.additionalFees && orderDetail.additionalFees.length > 0
            ? orderDetail.additionalFees
              .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
              .map(
                (fee) => `
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: left; font-style: italic;">${fee.name}</td>
                  <td style="padding: 8px; text-align: right;">${new Intl.NumberFormat("vi-VN").format(fee.value)} đ</td>
                </tr>
              `,
              )
              .join("")
            : ""

        // Generate vouchers HTML
        const vouchersHtml =
          orderDetail.orderVouchers && orderDetail.orderVouchers.length > 0
            ? orderDetail.orderVouchers
              .map((orderVoucher) => {
                const voucher = orderVoucher.voucher
                const discountText =
                  voucher.discountType === "Percentage"
                    ? `${voucher.discountValue}%`
                    : `${new Intl.NumberFormat("vi-VN").format(voucher.discountValue)} đ`

                return `
                    <tr>
                      <td colspan="3" style="padding: 8px; text-align: left; font-style: italic;">Voucher: ${voucher.code}</td>
                      <td style="padding: 8px; text-align: right;">-${discountText}</td>
                    </tr>
                  `
              })
              .join("")
            : ""

        // Print full bill with order details
        windowPrint.document.write(`
          <html>
            <head>
              <title>Hóa đơn thanh toán</title>
              <style>
                body { 
                  font-family: system-ui, -apple-system, sans-serif; 
                  text-align: center; 
                  padding: 20px;
                  max-width: 80mm;
                  margin: 0 auto;
                  font-size: 12px;
                }
                .container { 
                  width: 100%; 
                  margin: 0 auto; 
                  padding: 10px 0; 
                  border-top: 1px dashed #ccc;
                  border-bottom: 1px dashed #ccc;
                }
                .header { 
                  margin-bottom: 20px; 
                  padding-bottom: 10px; 
                  border-bottom: 1px solid #f3e8d0;
                }
                .title { 
                  color: #92400e; 
                  font-size: 18px; 
                  margin-bottom: 5px; 
                  font-weight: bold;
                }
                .subtitle { 
                  color: #b45309; 
                  font-size: 14px; 
                  margin-bottom: 5px;
                }
                .info {
                  margin: 10px 0;
                  text-align: left;
                  font-size: 12px;
                }
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 5px;
                }
                .info-label {
                  font-weight: bold;
                  color: #92400e;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 15px 0;
                  font-size: 12px;
                }
                th {
                  padding: 8px;
                  text-align: left;
                  border-bottom: 2px solid #f3e8d0;
                  font-weight: bold;
                  color: #92400e;
                }
                .total-row {
                  font-weight: bold;
                  border-top: 2px solid #f3e8d0;
                }
                .qr-container { 
                  padding: 10px; 
                  border: 2px solid #fef3c7; 
                  border-radius: 8px; 
                  display: inline-block; 
                  background: white;
                  margin: 15px 0;
                }
                .amount { 
                  margin: 10px 0; 
                  font-size: 16px; 
                  font-weight: bold; 
                  color: #92400e;
                }
                .footer { 
                  margin-top: 20px; 
                  font-size: 11px; 
                  color: #92400e;
                  border-top: 1px dashed #ccc;
                  padding-top: 10px;
                }
                .thank-you {
                  margin-top: 15px;
                  font-style: italic;
                  font-size: 13px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 class="title">Nhà hàng ABC</h1>
                  <p class="subtitle">Hóa đơn thanh toán</p>
                  <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</p>
                  <p>SĐT: 0123 456 789</p>
                </div>
                
                <div class="info">
                  
                  <div class="info-row">
                    <span class="info-label">Bàn:</span>
                    <span>${orderDetail.tableCode}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Thời gian:</span>
                    <span>${new Date().toLocaleString("vi-VN")}</span>
                  </div>
                </div>
                
                <table>
                  <thead>
                    <tr>
                      <th style="text-align: left;">Món</th>
                      <th style="text-align: center;">SL</th>
                      <th style="text-align: right;">Đơn giá</th>
                      <th style="text-align: right;">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orderItemsHtml}
                    
                    <!-- Tạm tính -->
                    <tr>
                      <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Tạm tính:</td>
                      <td style="padding: 8px; text-align: right; font-weight: bold;">${new Intl.NumberFormat("vi-VN").format(orderDetail.totalOrderItemPrice)} đ</td>
                    </tr>
                    
                    <!-- Additional fees -->
                    ${additionalFeesHtml}
                    
                    <!-- Vouchers -->
                    ${vouchersHtml}
                    
                    <!-- Total -->
                    <tr class="total-row">
                      <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Tổng cộng:</td>
                      <td style="padding: 8px; text-align: right; font-weight: bold;">${new Intl.NumberFormat("vi-VN").format(orderDetail.totalPrice)} đ</td>
                    </tr>
                  </tbody>
                </table>
                
                <div class="amount">
                  <p>Số tiền thanh toán: ${formatCurrency(amount)}</p>
                </div>
                
                <p>Quét mã QR để thanh toán</p>
                <div class="qr-container">
                  ${printContent.innerHTML}
                </div>
                
                <p class="thank-you">Cảm ơn quý khách đã sử dụng dịch vụ!</p>
                
                <div class="footer">
                  <p>In ngày: ${new Date().toLocaleDateString("vi-VN")}</p>
                </div>
              </div>
            </body>
          </html>
        `)
      } else {
        // Fallback for when orderDetail is not available - print only QR code
        windowPrint.document.write(`
          <html>
            <head>
              <title>Mã QR Thanh toán</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 40px; }
                .container { max-width: 400px; margin: 0 auto; padding: 20px; border: 2px solid #f59e0b; border-radius: 12px; }
                .title { color: #92400e; font-size: 24px; margin-bottom: 8px; }
                .subtitle { color: #b45309; font-size: 16px; margin-bottom: 24px; }
                .qr-container { padding: 16px; border: 4px solid #fef3c7; border-radius: 8px; display: inline-block; background: white; }
                .amount { margin-top: 20px; font-size: 20px; font-weight: bold; color: #92400e; }
                .footer { margin-top: 30px; font-size: 12px; color: #92400e; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1 class="title">Mã QR Thanh toán</h1>
                <p class="subtitle">Quét mã QR này để thanh toán đơn hàng</p>
                <div class="qr-container">
                  ${printContent.innerHTML}
                </div>
                <div class="amount">
                  <p>Số tiền: ${formatCurrency(amount)}</p>
                </div>
                <p class="footer">In ngày: ${new Date().toLocaleDateString("vi-VN")}</p>
              </div>
            </body>
          </html>
        `)
      }

      windowPrint.document.close()
      windowPrint.focus()
      windowPrint.print()
      windowPrint.close()
    }
  }

  const handleDownload = () => {
    const svg = document.getElementById("payment-qr-code-svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL("image/png")

      // Download the PNG file
      const downloadLink = document.createElement("a")
      downloadLink.download = `payment-qr-code-${new Date().getTime()}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  const handleBackWithCancel = async () => {
    setIsCanceling(true)
    try {
      await onCancel()
    } finally {
      setIsCanceling(false)
      onBack()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
          <DialogTitle className="text-xl font-bold text-amber-800 flex items-center gap-2">
            Mã QR Thanh toán
          </DialogTitle>
          <p className="text-amber-600 text-sm">Quét mã QR này để thanh toán đơn hàng</p>
        </DialogHeader>

        <div className="p-6 flex flex-col items-center">
          <div className="text-center mb-4">
            <p className="text-sm text-slate-600">Số tiền thanh toán</p>
            <p className="text-2xl font-bold text-amber-800">{formatCurrency(amount)}</p>
          </div>

          <div className="p-4 bg-white rounded-xl border-4 border-amber-100 mb-4">
            <div id="payment-qr-code-print-area">
              <QRCodeSVG
                id="payment-qr-code-svg"
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

          <p className="text-sm text-center text-amber-600 mb-4">
            Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã QR và thanh toán
          </p>

          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              <Download className="mr-2 h-4 w-4" />
              Tải xuống
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              <Printer className="mr-2 h-4 w-4" />
              {orderDetail ? "In hóa đơn" : "In mã QR"}
            </Button>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-amber-50 border-t border-amber-100">
          <Button
            variant="outline"
            onClick={handleBackWithCancel}
            disabled={isCanceling}
            className="w-full border-amber-200 text-amber-700 hover:bg-amber-100"
          >
            {isCanceling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang hủy...
              </>
            ) : (
              <>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Hủy thanh toán QR
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
