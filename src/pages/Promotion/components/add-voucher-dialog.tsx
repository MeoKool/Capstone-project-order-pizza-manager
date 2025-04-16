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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { useVoucher } from './voucher-provider'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/utils/utils'

interface AddVoucherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const singleVoucherSchema = z.object({
  code: z.string().min(3, 'Mã voucher phải có ít nhất 3 ký tự'),
  voucherTypeId: z.string().min(1, 'Vui lòng chọn loại voucher'),
  discountType: z.coerce.number().min(0).max(1),
  expiryDate: z.date({
    required_error: 'Vui lòng chọn ngày hết hạn'
  })
})

const bulkVoucherSchema = z.object({
  voucherTypeId: z.string().min(1, 'Vui lòng chọn loại voucher'),
  quantity: z.coerce.number().min(1, 'Số lượng phải lớn hơn 0').max(100, 'Số lượng tối đa là 100')
})

type SingleVoucherFormValues = z.infer<typeof singleVoucherSchema>
type BulkVoucherFormValues = z.infer<typeof bulkVoucherSchema>

export function AddVoucherDialog({ open, onOpenChange }: AddVoucherDialogProps) {
  const { voucherTypes, addVoucher, createBulkVouchers } = useVoucher()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('single')

  const singleForm = useForm<SingleVoucherFormValues>({
    resolver: zodResolver(singleVoucherSchema),
    defaultValues: {
      code: '',
      voucherTypeId: '',
      discountType: 0,
      expiryDate: undefined
    }
  })

  const bulkForm = useForm<BulkVoucherFormValues>({
    resolver: zodResolver(bulkVoucherSchema),
    defaultValues: {
      voucherTypeId: '',
      quantity: 10
    }
  })

  const onSubmitSingle = async (data: SingleVoucherFormValues) => {
    setIsSubmitting(true)
    try {
      await addVoucher({
        ...data,
        expiryDate: data.expiryDate.toISOString()
      })
      singleForm.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to add voucher:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmitBulk = async (data: BulkVoucherFormValues) => {
    setIsSubmitting(true)
    try {
      await createBulkVouchers(data.voucherTypeId, data.quantity)
      bulkForm.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to create bulk vouchers:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVoucherTypeChange = (value: string, formType: 'single' | 'bulk') => {
    if (formType === 'single') {
      const selectedType = voucherTypes.find((type) => type.id === value)
      if (selectedType) {
        singleForm.setValue('discountType', selectedType.discountType === 'Percentage' ? 0 : 1)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[550px] rounded-xl shadow-lg border-0'>
        <DialogHeader className='pb-4 mb-4 border-b'>
          <DialogTitle className='text-xl font-bold'>Tạo voucher</DialogTitle>
          <DialogDescription className='text-muted-foreground mt-1'>
            Tạo voucher đơn lẻ hoặc hàng loạt từ loại voucher đã có.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-2 mb-6'>
            <TabsTrigger
              value='single'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              Tạo đơn lẻ
            </TabsTrigger>
            <TabsTrigger
              value='bulk'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              Tạo hàng loạt
            </TabsTrigger>
          </TabsList>

          <TabsContent value='single'>
            <Form {...singleForm}>
              <form onSubmit={singleForm.handleSubmit(onSubmitSingle)} className='space-y-6'>
                <FormField
                  control={singleForm.control}
                  name='code'
                  render={({ field }) => (
                    <FormItem className='space-y-1.5'>
                      <FormLabel className='font-medium'>Mã voucher</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Nhập mã voucher'
                          {...field}
                          className='border-input focus:ring-2 focus:ring-offset-1 focus:ring-primary/20'
                        />
                      </FormControl>
                      <FormMessage className='text-xs font-medium text-destructive' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={singleForm.control}
                  name='voucherTypeId'
                  render={({ field }) => (
                    <FormItem className='space-y-1.5'>
                      <FormLabel className='font-medium'>Loại voucher</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          handleVoucherTypeChange(value, 'single')
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn loại voucher' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {voucherTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.batchCode} - {type.description.substring(0, 30)}
                              {type.description.length > 30 ? '...' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className='text-xs font-medium text-destructive' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={singleForm.control}
                  name='expiryDate'
                  render={({ field }) => (
                    <FormItem className='space-y-1.5'>
                      <FormLabel className='font-medium'>Ngày hết hạn</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'PPP', { locale: vi }) : <span>Chọn ngày</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
          </TabsContent>

          <TabsContent value='bulk'>
            <Form {...bulkForm}>
              <form onSubmit={bulkForm.handleSubmit(onSubmitBulk)} className='space-y-6'>
                <FormField
                  control={bulkForm.control}
                  name='voucherTypeId'
                  render={({ field }) => (
                    <FormItem className='space-y-1.5'>
                      <FormLabel className='font-medium'>Loại voucher</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          handleVoucherTypeChange(value, 'bulk')
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn loại voucher' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {voucherTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.batchCode} - {type.description.substring(0, 30)}
                              {type.description.length > 30 ? '...' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className='text-xs font-medium text-destructive' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bulkForm.control}
                  name='quantity'
                  render={({ field }) => (
                    <FormItem className='space-y-1.5'>
                      <FormLabel className='font-medium'>Số lượng voucher</FormLabel>
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
                      'Tạo voucher hàng loạt'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
