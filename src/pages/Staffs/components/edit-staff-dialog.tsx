import { useState, useEffect } from 'react'
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
import { StaffType, type Staff } from '@/types/staff'

interface EditStaffDialogProps {
  staff: Staff
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/,
      'Mật khẩu phải có ít nhất 8 ký tự, bao gồm 1 chữ in hoa, 1 chữ thường và 1 ký tự đặc biệt'
    )
    .or(z.literal('')),
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số'),
  staffType: z.nativeEnum(StaffType),
  status: z.enum(['FullTime', 'PartTime'])
})

type FormValues = z.infer<typeof formSchema>

export function EditStaffDialog({ staff, open, onOpenChange }: EditStaffDialogProps) {
  const { updateStaff } = useStaff()
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

  // Update form when staff changes
  useEffect(() => {
    form.reset({
      username: staff.username,
      password: '',
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone,
      staffType: staff.staffType,
      status: staff.status
    })
  }, [staff, form])

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      const { password, ...rest } = data
      const updatePayload = password ? { ...rest, password } : rest

      await updateStaff(staff.id, updatePayload)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update staff:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px] rounded-xl shadow-lg border-0'>
        <DialogHeader className='pb-4 mb-4 border-b'>
          <DialogTitle className='text-xl font-bold'>Chỉnh sửa thông tin nhân viên</DialogTitle>
          <DialogDescription className='text-muted-foreground mt-1'>
            Cập nhật thông tin chi tiết của nhân viên.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem className='space-y-1.5'>
                  <FormLabel className='font-medium'>Tên đăng nhập</FormLabel>
                  <FormControl>
                    <Input placeholder='Nhập tên đăng nhập' {...field} disabled className='bg-gray-50 border-input' />
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
                  <FormLabel className='font-medium'>Mật khẩu (để trống nếu không thay đổi)</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Nhập mật khẩu mới'
                        {...field}
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
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs font-medium text-destructive' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem className='space-y-1.5'>
                  <FormLabel className='font-medium'>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder='Nhập họ và tên' {...field} />
                  </FormControl>
                  <FormMessage className='text-xs font-medium text-destructive' />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='font-medium'>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='example@email.com' {...field} disabled className='bg-gray-50 border-input' />
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
                      <Input placeholder='0123456789' {...field} disabled className='bg-gray-50 border-input' />
                    </FormControl>
                    <FormMessage className='text-xs font-medium text-destructive' />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='staffType'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='font-medium'>Loại nhân viên</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
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
                    <Select value={field.value} onValueChange={field.onChange}>
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
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className='border-gray-300 hover:bg-gray-50'
              >
                Hủy
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 transition-opacity'
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Đang cập nhật...
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
