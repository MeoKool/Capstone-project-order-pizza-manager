import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AlertTriangle } from 'lucide-react'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className='min-h-screen w-full flex items-center justify-center p-4 overflow-hidden relative'>
      {/* Background with parallax effect */}
      <div className='fixed inset-0 z-0'>
        <div className="absolute inset-0 bg-[url('/pizza-bg-premium.jpg')] bg-cover bg-center bg-fixed"></div>
        <div className='absolute inset-0 bg-gradient-to-br from-amber-950/80 via-red-950/80 to-black/90'></div>
      </div>

      <div className='relative z-10 max-w-md w-full'>
        <div className='relative'>
          {/* Glowing effect behind card */}
          <div className='absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-500 rounded-2xl blur-lg opacity-70'></div>

          <div className='relative w-full overflow-hidden backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border-0 rounded-xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] p-8'>
            <div className='flex flex-col items-center text-center space-y-6'>
              <div className='relative'>
                <div className='absolute inset-0 bg-gradient-to-r from-red-600 to-amber-500 rounded-full blur opacity-80'></div>
                <div className='relative bg-gradient-to-br from-red-600 to-amber-500 p-3 rounded-full shadow-lg'>
                  <AlertTriangle className='h-10 w-10 text-white drop-shadow-md' />
                </div>
              </div>

              <h1 className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-100 drop-shadow-md'>
                Không có quyền truy cập
              </h1>

              <p className='text-amber-100/80 text-base'>
                Bạn không có quyền truy cập vào trang này. Chỉ người quản lý mới được phép truy cập.
              </p>

              <div className='pt-4 w-full'>
                <div className='relative group'>
                  <div className='absolute -inset-0.5 bg-gradient-to-r from-red-600 to-amber-500 rounded-md blur opacity-75 group-hover:opacity-100 transition duration-300'></div>
                  <Button
                    onClick={handleLogout}
                    className='relative w-full h-12 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 transition-all duration-300 text-white font-medium shadow-lg border-0 rounded-md'
                  >
                    Đăng xuất
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
