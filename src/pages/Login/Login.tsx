import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Pizza } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/utils'

const loginSchema = z.object({
  username: z.string().min(1, 'Tên đăng nhập không được để trống'),
  password: z.string().min(1, 'Mật khẩu không được để trống')
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      await login(data.username, data.password)
      toast.success('Đăng nhập thành công!')
      navigate(from, { replace: true })
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen w-full flex items-center justify-center p-4 overflow-hidden relative'>
      {/* Background with parallax effect */}
      <div className='fixed inset-0 z-0'>
        <div className="absolute inset-0 bg-[url('/pizza-bg-premium.jpg')] bg-cover bg-center bg-fixed"></div>
        <div className='absolute inset-0 bg-gradient-to-br from-amber-950/80 via-red-950/80 to-black/90'></div>

        {/* Animated pizza elements */}
        <div className='absolute top-[10%] left-[5%] w-24 h-24 rounded-full bg-amber-500/20 blur-xl animate-float-slow'></div>
        <div className='absolute top-[30%] right-[10%] w-32 h-32 rounded-full bg-red-600/20 blur-xl animate-float-medium'></div>
        <div className='absolute bottom-[15%] left-[15%] w-40 h-40 rounded-full bg-amber-600/20 blur-xl animate-float-fast'></div>

        {/* Animated light rays */}
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-[30vh] bg-gradient-to-b from-amber-500/20 to-transparent blur-3xl transform -rotate-12 origin-top'></div>
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-[20vh] bg-gradient-to-b from-red-600/20 to-transparent blur-3xl transform rotate-12 origin-top'></div>
      </div>

      <div
        className={cn(
          'container relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 max-w-7xl mx-auto transition-all duration-1000',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        {/* Left side branding */}
        <div className='w-full lg:w-1/2 text-center lg:text-left mb-6 lg:mb-0 lg:pr-8'>
          <div className='mb-8 flex justify-center lg:justify-start'>
            <div className='relative'>
              <div className='absolute inset-0 bg-gradient-to-r from-red-600 to-amber-500 rounded-full blur-lg transform scale-110 animate-pulse-slow'></div>
              <div className='relative bg-gradient-to-br from-red-600 to-amber-500 p-4 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.5)] flex items-center justify-center'>
                <Pizza className='h-12 w-12 text-white drop-shadow-md' />
              </div>
            </div>
          </div>

          <h1
            className={cn(
              'text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300 mb-6 drop-shadow-lg transition-all duration-1000 delay-300',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Pizza <span className='text-amber-400'>Manager</span>
          </h1>

          <p
            className={cn(
              'text-xl md:text-2xl text-amber-100/90 max-w-xl mb-8 transition-all duration-1000 delay-500',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Hệ thống liên kết phục vụ trong nhà hàng Pizza
          </p>

          <div
            className={cn(
              'hidden lg:flex space-x-8 transition-all duration-1000 delay-700',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          ></div>
        </div>

        {/* Right side login form */}
        <div
          className={cn(
            'w-full lg:w-1/2 max-w-md transition-all duration-1000 delay-300',
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className='relative'>
            {/* Glowing effect behind card */}
            <div className='absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-500 rounded-2xl blur-lg opacity-70'></div>

            <Card className='relative w-full overflow-hidden backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border-0 rounded-xl shadow-[0_10px_50px_rgba(0,0,0,0.8)]'>
              {/* Decorative elements */}
              <div className='absolute top-0 right-0 w-40 h-40 -mt-20 -mr-20 bg-amber-500 rounded-full opacity-20 blur-2xl'></div>
              <div className='absolute bottom-0 left-0 w-40 h-40 -mb-20 -ml-20 bg-red-600 rounded-full opacity-20 blur-2xl'></div>
              <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-red-600/5 to-amber-500/5 rounded-full blur-2xl'></div>

              {/* Card content with glass effect */}
              <div className='absolute inset-0 bg-gradient-to-br from-white/10 to-transparent z-0 backdrop-blur-sm rounded-xl'></div>

              <CardHeader className='space-y-2 pb-6 pt-8 relative z-10 border-b border-white/10'>
                <div className='flex justify-center mb-3'>
                  <div className='relative group'>
                    <div className='absolute inset-0 bg-gradient-to-br from-red-600 to-amber-500 rounded-full blur opacity-80 group-hover:opacity-100 transition-opacity duration-300'></div>
                    <div className='relative bg-gradient-to-br from-red-600 to-amber-500 p-3 rounded-full shadow-lg transform group-hover:scale-105 transition-transform duration-300'>
                      <Pizza className='h-8 w-8 text-white drop-shadow-md' />
                    </div>
                  </div>
                </div>
                <CardTitle className='text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-100 drop-shadow-md'>
                  Đăng Nhập
                </CardTitle>
                <CardDescription className='text-center text-amber-100/80 text-base'>
                  Truy cập hệ thống quản lý Pizza
                </CardDescription>
                <CardDescription className='text-center font-bold text-black text-base'>
                  Tài khoản test: manager, Mật khẩu: Abc@12345
                </CardDescription>
              </CardHeader>

              <CardContent className='pt-8 pb-6 relative z-10'>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                    <FormField
                      control={form.control}
                      name='username'
                      render={({ field }) => (
                        <FormItem className='space-y-2'>
                          <FormLabel className='text-sm font-medium text-amber-100'>Tên đăng nhập</FormLabel>
                          <FormControl>
                            <div className='relative group'>
                              <div className='absolute -inset-0.5 bg-gradient-to-r from-red-600/40 to-amber-500/40 rounded-md blur opacity-75 group-hover:opacity-100 transition duration-300'></div>
                              <Input
                                placeholder='Nhập tên đăng nhập'
                                className='relative h-12 bg-black/20 border-white/20 focus-visible:ring-amber-500/70 focus-visible:ring-offset-0 focus-visible:border-amber-500/70 text-white placeholder:text-amber-100/50 rounded-md'
                                {...field}
                                disabled={isLoading}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className='text-xs text-amber-200/90' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='password'
                      render={({ field }) => (
                        <FormItem className='space-y-2'>
                          <FormLabel className='text-sm font-medium text-amber-100'>Mật khẩu</FormLabel>
                          <FormControl>
                            <div className='relative group'>
                              <div className='absolute -inset-0.5 bg-gradient-to-r from-red-600/40 to-amber-500/40 rounded-md blur opacity-75 group-hover:opacity-100 transition duration-300'></div>
                              <div className='relative'>
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder='Nhập mật khẩu'
                                  className='h-12 bg-black/20 border-white/20 focus-visible:ring-amber-500/70 focus-visible:ring-offset-0 focus-visible:border-amber-500/70 text-white placeholder:text-amber-100/50 pr-10 rounded-md'
                                  {...field}
                                  disabled={isLoading}
                                />
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='sm'
                                  className='absolute right-0 top-1/2 -translate-y-1/2 h-full px-3 text-amber-100/70 hover:text-white hover:bg-transparent'
                                  onClick={() => setShowPassword(!showPassword)}
                                  disabled={isLoading}
                                >
                                  {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                                  <span className='sr-only'>{showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</span>
                                </Button>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage className='text-xs text-amber-200/90' />
                        </FormItem>
                      )}
                    />

                    <div className='pt-2'>
                      <div className='relative group'>
                        <div className='absolute -inset-0.5 bg-gradient-to-r from-red-600 to-amber-500 rounded-md blur opacity-75 group-hover:opacity-100 transition duration-300'></div>
                        <Button
                          type='submit'
                          className='relative w-full h-12 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 transition-all duration-300 text-white font-medium shadow-lg border-0 rounded-md'
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                              Đang đăng nhập...
                            </>
                          ) : (
                            'Đăng nhập'
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>

              <CardFooter className='flex justify-center py-4 border-t border-white/10 relative z-10'>
                <p className='text-sm text-amber-100/80 font-medium'>
                  © Hệ thống liên kết phục vụ trong nhà hàng Pizza
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
