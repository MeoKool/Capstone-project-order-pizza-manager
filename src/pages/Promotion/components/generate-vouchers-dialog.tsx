'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { useVoucher } from './voucher-provider'
import type { VoucherType } from '@/types/voucher'

interface GenerateVouchersDialogProps {
  voucherType: VoucherType
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formSchema = z.object({
  quantity: z.coerce.number().min(1, 'Số lượng phải lớn hơn 0').max(100, 'Số lượng tối đa là 100')
})

type FormValues = z.infer<typeof formSchema>

export function GenerateVouchersDialog({ voucherType, open, onOpenChange }: GenerateVouchersDialogProps) {
  const { createBulkVouchers } = useVoucher()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 10
    }
  })

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      await createBulkVouchers(voucherType.id, data.quantity)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to generate vouchers:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[450px] rounded-xl shadow-lg border-0'>
        <DialogHeader className='pb-4 mb-4 border-b'>
          <DialogTitle className='text-xl font-bold'>Tạo voucher từ loại</DialogTitle>
          <DialogDescription className='text-muted-foreground mt-1'>
            Tạo voucher từ loại <span className='font-medium'>{voucherType.batchCode}</span>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='quantity'
              render={({ field }) => (
                <FormItem className='space-y-1.5'>
                  <FormLabel className='font-medium'>Số lượng voucher cần tạo</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={1}
                      max={100}
                      placeholder='Nhập số lượng'
                      {...field}
                      className='border-input focus:ring-2 focus:ring-offset-1 focus:ring-primary/20'
                    />
                  </FormControl>
                  <FormMessage className='text-xs font-medium text-destructive' />
                </FormItem>
              )}
            />

            <DialogFooter className='mt-6 gap-2'>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type='submit' disabled={isSubmitting} variant='green'>
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Đang tạo...
                  </>
                ) : (
                  'Tạo voucher'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
