'use client'

import { useState } from 'react'
import { VoucherProvider } from './components/voucher-provider'
import { VoucherHeader } from './components/voucher-header'
import { VoucherTypeTable } from './components/voucher-type-table'
import { VoucherTable } from './components/voucher-table'
import { AddVoucherTypeDialog } from './components/add-voucher-type-dialog'
import { AddVoucherDialog } from './components/add-voucher-dialog'
import { EditVoucherTypeDialog } from './components/edit-voucher-type-dialog'
import { DeleteVoucherTypeDialog } from './components/delete-voucher-type-dialog'
import { DeleteVoucherDialog } from './components/delete-voucher-dialog'
import { GenerateVouchersDialog } from './components/generate-vouchers-dialog'
import { Voucher, VoucherType } from '@/types/voucher'

export default function VoucherPage() {
  const [activeTab, setActiveTab] = useState<string>('types')
  const [isAddVoucherTypeDialogOpen, setIsAddVoucherTypeDialogOpen] = useState(false)
  const [isAddVoucherDialogOpen, setIsAddVoucherDialogOpen] = useState(false)

  const [editingVoucherType, setEditingVoucherType] = useState<VoucherType | null>(null)
  const [isEditVoucherTypeDialogOpen, setIsEditVoucherTypeDialogOpen] = useState(false)

  const [deletingVoucherType, setDeletingVoucherType] = useState<VoucherType | null>(null)
  const [isDeleteVoucherTypeDialogOpen, setIsDeleteVoucherTypeDialogOpen] = useState(false)

  const [deletingVoucher, setDeletingVoucher] = useState<Voucher | null>(null)
  const [isDeleteVoucherDialogOpen, setIsDeleteVoucherDialogOpen] = useState(false)

  const [generatingVoucherType, setGeneratingVoucherType] = useState<VoucherType | null>(null)
  const [isGenerateVouchersDialogOpen, setIsGenerateVouchersDialogOpen] = useState(false)

  return (
    <VoucherProvider>
      <div className='h-full flex flex-col'>
        <div className='flex-1 p-6'>
          <VoucherHeader
            onAddVoucherType={() => setIsAddVoucherTypeDialogOpen(true)}
            onAddVoucher={() => setIsAddVoucherDialogOpen(true)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {activeTab === 'types' ? (
            <VoucherTypeTable
              onEdit={(voucherType) => {
                console.log('Editing voucher type:', voucherType)
                setEditingVoucherType(voucherType)
                setIsEditVoucherTypeDialogOpen(true)
              }}
              onDelete={(voucherType) => {
                console.log('Deleting voucher type:', voucherType)
                setDeletingVoucherType(voucherType)
                setIsDeleteVoucherTypeDialogOpen(true)
              }}
              onGenerateVouchers={(voucherType) => {
                console.log('Generating vouchers for type:', voucherType)
                setGeneratingVoucherType(voucherType)
                setIsGenerateVouchersDialogOpen(true)
              }}
            />
          ) : (
            <VoucherTable
              onDelete={(voucher) => {
                setDeletingVoucher(voucher)
                setIsDeleteVoucherDialogOpen(true)
              }}
            />
          )}

          <AddVoucherTypeDialog open={isAddVoucherTypeDialogOpen} onOpenChange={setIsAddVoucherTypeDialogOpen} />

          <AddVoucherDialog open={isAddVoucherDialogOpen} onOpenChange={setIsAddVoucherDialogOpen} />

          {editingVoucherType && (
            <EditVoucherTypeDialog
              voucherType={editingVoucherType}
              open={isEditVoucherTypeDialogOpen}
              onOpenChange={setIsEditVoucherTypeDialogOpen}
            />
          )}

          {deletingVoucherType && (
            <DeleteVoucherTypeDialog
              voucherType={deletingVoucherType}
              open={isDeleteVoucherTypeDialogOpen}
              onOpenChange={setIsDeleteVoucherTypeDialogOpen}
            />
          )}

          {deletingVoucher && (
            <DeleteVoucherDialog
              voucher={deletingVoucher}
              open={isDeleteVoucherDialogOpen}
              onOpenChange={setIsDeleteVoucherDialogOpen}
            />
          )}

          {generatingVoucherType && (
            <GenerateVouchersDialog
              voucherType={generatingVoucherType}
              open={isGenerateVouchersDialogOpen}
              onOpenChange={setIsGenerateVouchersDialogOpen}
            />
          )}
        </div>
      </div>
    </VoucherProvider>
  )
}
