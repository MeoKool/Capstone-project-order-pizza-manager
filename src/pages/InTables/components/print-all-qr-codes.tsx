// "use client"

// import { useState, useRef } from "react"
// import { QRCodeSVG } from "qrcode.react"
// import { Printer } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination"
// import TableResponse from "@/types/tables"

// interface PrintAllQRCodesProps {
//   tables: TableResponse[]
// }

// const ITEMS_PER_PAGE = 6

// export function PrintAllQRCodes({ tables }: PrintAllQRCodesProps) {
//   const [open, setOpen] = useState(false)
//   const [isPrinting, setIsPrinting] = useState(false)
//   const [currentPage, setCurrentPage] = useState(1)
//   const printContentRef = useRef<HTMLDivElement>(null)

//   const totalPages = Math.ceil(tables.length / ITEMS_PER_PAGE)
//   const paginatedTables = tables.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

//   const handlePrint = () => {
//     setIsPrinting(true)
//     const printWindow = window.open("", "_blank")

//     if (printWindow && printContentRef.current) {
//       printWindow.document.write(`
//         <html>
//           <head>
//             <title>Print QR Codes</title>
//             <style>
//               body { font-family: Arial, sans-serif; }
//               .print-page { page-break-after: always; }
//               .qr-code-container { display: inline-block; width: 33.33%; padding: 10px; box-sizing: border-box; text-align: center; }
//               .qr-code-container p { margin: 5px 0; }
//               @media print {
//                 .print-page { height: 100vh; display: flex; flex-wrap: wrap; align-content: flex-start; }
//               }
//             </style>
//           </head>
//           <body>
//       `)

//       for (let i = 0; i < totalPages; i++) {
//         const pageContent = printContentRef.current.cloneNode(true) as HTMLElement
//         pageContent.classList.add("print-page")
//         printWindow.document.body.appendChild(pageContent)
//       }

//       printWindow.document.write("</body></html>")
//       printWindow.document.close()
//       printWindow.focus()

//       printWindow.onafterprint = () => {
//         printWindow.close()
//         setIsPrinting(false)
//       }

//       printWindow.print()
//     } else {
//       setIsPrinting(false)
//     }
//   }

//   return (
//     <>
//       <Button onClick={() => setOpen(true)} variant="outline">
//         <Printer className="mr-2 h-4 w-4" />
//         In tất cả mã QR
//       </Button>

//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="sm:max-w-[600px]">
//           <DialogHeader>
//             <DialogTitle>In tất cả mã QR</DialogTitle>
//             <DialogDescription>
//               Xem trước và in mã QR cho tất cả các bàn. Trang {currentPage} / {totalPages}
//             </DialogDescription>
//           </DialogHeader>
//           <div className="max-h-[400px] overflow-y-auto" ref={printContentRef}>
//             <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
//               {paginatedTables.map((table) => {
//                 const qrCodeData = JSON.stringify({
//                   id: table.id,
//                   name: table.name,
//                   capacity: table.capacity,
//                   location: table.location,
//                 })
//                 return (
//                   <div key={table.id} className="qr-code-container">
//                     <QRCodeSVG value={qrCodeData} size={150} level="M" includeMargin={true} />
//                     <p className="mt-2 font-semibold">{table.name}</p>
//                     <p className="text-sm text-muted-foreground">ID: {table.id}</p>
//                   </div>
//                 )
//               })}
//             </div>
//           </div>
//           <Pagination>
//             <PaginationContent>
//               <PaginationItem>
//                 <PaginationPrevious
//                   onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                   disabled={currentPage === 1}
//                 />
//               </PaginationItem>
//               {[...Array(totalPages)].map((_, index) => (
//                 <PaginationItem key={index}>
//                   <PaginationLink onClick={() => setCurrentPage(index + 1)} isActive={currentPage === index + 1}>
//                     {index + 1}
//                   </PaginationLink>
//                 </PaginationItem>
//               ))}
//               <PaginationItem>
//                 <PaginationNext
//                   onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//                   disabled={currentPage === totalPages}
//                 />
//               </PaginationItem>
//             </PaginationContent>
//           </Pagination>
//           <DialogFooter>
//             <Button onClick={handlePrint} disabled={isPrinting}>
//               <Printer className="mr-2 h-4 w-4" />
//               {isPrinting ? "Đang in..." : "In tất cả mã QR"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }

