import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

interface HeaderProps {
  title: string
}

// const Header: React.FC<HeaderProps> = ({ height = '64px', className = '', title = 'Dashboard' }) => {
//     return (
//         <header
//             style={{ height }}
//             className={`w-full bg-white border-b border-gray-200 flex items-center justify-between px-4 ${className}`}
//         >
//             <h1 className="text-xl font-semibold">Manager {title}</h1>
//             <div className="flex items-center space-x-4">
//                 <div className="relative">
//                     <input
//                         type="text"
//                         placeholder="Search..."
//                         className="pl-8 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                     />
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                 </div>
//                 <button className="p-2 rounded-full hover:bg-gray-100">
//                     <Bell size={20} />
//                 </button>
//                 <button className="p-2 rounded-full hover:bg-gray-100">
//                     <User size={20} />
//                 </button>
//             </div>
//         </header>
//     );
// };

const Header = ({ title }: HeaderProps) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showDialog, setShowDialog] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const confirmLogout = () => {
    setShowDialog(false)
    handleLogout()
  }

  return (
    <header className='bg-white  p-4 flex justify-between items-center h-16 border-b-[0.5px] border-solid border-gray-100 '>
      <h1 className='text-xl font-semibold'>Quản lý {title}</h1>
      <div className='flex items-center gap-4'>
        {user && (
          <div className='flex items-center gap-2'>
            <User size={18} className='text-gray-500' />
            <span className='font-medium'>{user.fullName}</span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowDialog(true)}
              className='ml-2 text-red-500 hover:text-red-600 hover:bg-red-50'
            >
              <LogOut size={16} className='mr-1' />
              Đăng xuất
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Xác nhận đăng xuất</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn đăng xuất không?</DialogDescription>
          </DialogHeader>
          <DialogFooter className='flex justify-end gap-2 mt-4'>
            <Button variant='outline' onClick={() => setShowDialog(false)}>
              Hủy
            </Button>
            <Button variant='destructive' onClick={confirmLogout}>
              Đăng xuất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}

export default Header
