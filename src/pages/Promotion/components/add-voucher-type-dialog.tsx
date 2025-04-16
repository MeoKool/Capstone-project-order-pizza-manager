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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/utils/utils'

interface AddVoucherTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formSchema = z
  .object({
    batchCode: z.string().min(3, 'Mã lô phải có ít nhất 3 ký tự'),
    description: z.string().min(5, 'Mô tả phải có ít nhất 5 ký tự'),
    startDate: z.date({
      required_error: 'Vui lòng chọn ngày bắt đầu'
    }),
    endDate: z.date({
      required_error: 'Vui lòng chọn ngày kết thúc'
    }),
    totalQuantity: z.coerce.number().min(1, 'Số lượng phải lớn hơn 0'),
    discountValue: z.coerce.number().min(1, 'Giá trị giảm giá phải lớn hơn 0'),
    discountType: z.enum(['Percentage', 'Direct'])
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['endDate']
  })

type FormValues = z.infer<typeof formSchema>

export function AddVoucherTypeDialog({ open, onOpenChange }: AddVoucherTypeDialogProps) {
  const { addVoucherType } = useVoucher()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batchCode: '',
      description: '',
      totalQuantity: 1,
      discountValue: 10,
      discountType: 'Percentage'
    }
  })

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      await addVoucherType({
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString()
      })
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to add voucher type:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[550px] rounded-xl shadow-lg border-0'>
        <DialogHeader className='pb-4 mb-4 border-b'>
          <DialogTitle className='text-xl font-bold'>Thêm loại voucher mới</DialogTitle>
          <DialogDescription className='text-muted-foreground mt-1'>
            Điền thông tin chi tiết để thêm loại voucher mới vào hệ thống.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='batchCode'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='font-medium'>Mã lô</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Nhập mã lo'
                        {...field}
                        className='border-input focus:ring-2 focus:ring-offset-1 focus:ring-primary/20'
                      />
                    </FormControl>
                    <FormMessage className='text-xs font-medium text-destructive' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='discountType'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='font-medium'>Loại giảm giá</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn loại giảm giá' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='Percentage'>Phần trăm (%)</SelectItem>
                        <SelectItem value='Direct'>Trực tiếp (VNĐ)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className='text-xs font-medium text-destructive' />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem className='space-y-1.5'>
                  <FormLabel className='font-medium'>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Nhập mô tả cho loại voucher'
                      {...field}
                      className='border-input focus:ring-2 focus:ring-offset-1 focus:ring-primary/20 min-h-[80px]'
                    />
                  </FormControl>
                  <FormMessage className='text-xs font-medium text-destructive' />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='startDate'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='font-medium'>Ngày bắt đầu</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
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
              <FormField
                control={form.control}
                name='endDate'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='font-medium'>Ngày kết thúc</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
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
                          disabled={(date) =>
                            date < new Date() || (form.getValues('startDate') && date <= form.getValues('startDate'))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className='text-xs font-medium text-destructive' />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='totalQuantity'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='font-medium'>Số lượng</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        placeholder='Nhập số lượng'
                        {...field}
                        className='border-input focus:ring-2 focus:ring-offset-1 focus:ring-primary/20'
                      />
                    </FormControl>
                    <FormMessage className='text-xs font-medium text-destructive' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='discountValue'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='font-medium'>
                      Giá trị {form.watch('discountType') === 'Percentage' ? '(%)' : '(VNĐ)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        max={form.watch('discountType') === 'Percentage' ? 100 : undefined}
                        placeholder='Nhập giá trị'
                        {...field}
                        className='border-input focus:ring-2 focus:ring-offset-1 focus:ring-primary/20'
                      />
                    </FormControl>
                    <FormMessage className='text-xs font-medium text-destructive' />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className='mt-6 gap-2'>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type='submit' disabled={isSubmitting} variant='green'>
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Đang thêm...
                  </>
                ) : (
                  'Thêm loại voucher'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
