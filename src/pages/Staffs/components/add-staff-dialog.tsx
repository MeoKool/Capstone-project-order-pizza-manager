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
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useStaff } from './staff-provider'
import { StaffType } from '@/types/staff'
import { toast } from 'sonner'

interface AddStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ in hoa')
    .regex(/[@$!%*?&#]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'),
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số').regex(/^0/, 'Số điện thoại phải bắt đầu bằng số 0'),
  staffType: z.nativeEnum(StaffType),
  status: z.enum(['FullTime', 'PartTime'])
})

type FormValues = z.infer<typeof formSchema>

export function AddStaffDialog({ open, onOpenChange }: AddStaffDialogProps) {
  const { addStaff } = useStaff()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      fullName: '',
      email: '',
      phone: '',
      staffType: StaffType.Staff,
      status: 'FullTime'
    }
  })

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      console.log('Submitting data:', data)

      await addStaff(data)
      toast.success('Tạo thành công')
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error('Tạo thất bại')
      console.error('Failed to add staff:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px] rounded-xl shadow-lg border-0'>
        <DialogHeader className='pb-4 mb-4 border-b'>
          <DialogTitle className='text-xl font-bold'>Thêm nhân viên mới</DialogTitle>
          <DialogDescription className='text-muted-foreground mt-1'>
            Điền thông tin chi tiết để thêm nhân viên mới vào hệ thống.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='font-medium'>Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Nhập tên đăng nhập'
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
                name='password'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='font-medium'>Mật khẩu</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder='Nhập mật khẩu'
                          {...field}
                          value={field.value || 'Dev123@123a'}
                          className='pr-10 border-input focus:ring-2 focus:ring-offset-1 focus:ring-primary/20'
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground transition-colors'
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                          <span className='sr-only'>{showPassword ? 'Hide password' : 'Show password'}</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className='text-xs font-medium text-destructive' />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem className='space-y-1.5'>
                  <FormLabel className='font-medium'>Họ và tên</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Nhập họ và tên'
                      {...field}
                      className='border-input focus:ring-2 focus:ring-offset-1 focus:ring-primary/20'
                    />
                  </FormControl>
                  <FormMessage className='text-xs font-medium text-destructive' />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='font-medium'>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='example@email.com'
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
                name='phone'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='font-medium'>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='0123456789'
                        {...field}
                        className='border-input focus:ring-2 focus:ring-offset-1 focus:ring-primary/20'
                      />
                    </FormControl>
                    <FormMessage className='text-xs font-medium text-destructive' />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='staffType'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='font-medium'>Loại nhân viên</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn loại nhân viên' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='Staff'>Nhân viên</SelectItem>
                        <SelectItem value='Manager'>Quản lý</SelectItem>
                        <SelectItem value='Cheff'>Đầu bếp</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className='text-xs font-medium text-destructive' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='font-medium'>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn trạng thái' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='FullTime'>Toàn thời gian</SelectItem>
                        <SelectItem value='PartTime'>Bán thời gian</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className='text-xs font-medium text-destructive' />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className='mt-6 gap-2'>
              <Button type='button' variant='destructive' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type='submit' disabled={isSubmitting} variant='green'>
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Đang thêm...
                  </>
                ) : (
                  'Thêm nhân viên'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
