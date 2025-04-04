import { ChevronLeft, Menu, Pizza } from 'lucide-react'
import type { ReactNode } from 'react'
import { useSidebar } from './context/SidebarContext'
import '@/css/custom-scrollbar.css'
interface SidebarProps {
  children: ReactNode
}

export default function Sidebar({ children }: SidebarProps) {
  const { expanded, toggleSidebar } = useSidebar()

  return (
    <aside className='h-screen flex flex-col'>
      <nav className='flex flex-col bg-gradient-to-b from-white to-orange-50 border-r shadow-sm h-full transition-all duration-300'>
        <div
          className={`h-16 flex items-center border-b border-orange-100 ${expanded ? `justify-between p-4` : `justify-center p-4`}`}
        >
          <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'w-44' : 'w-0'}`}>
            {expanded && (
              <div className='flex items-center gap-2'>
                <Pizza className='text-red-500' size={25} />
                <h1 className='text-base font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent'>
                  Quản lý nhà hàng
                </h1>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className={`rounded-full transition-all duration-100 ${
              expanded ? `hover:bg-orange-100 p-2 text-red-500` : `bg-red-500 hover:bg-red-600 text-white p-2`
            }`}
          >
            {expanded ? <ChevronLeft /> : <Menu />}
          </button>
        </div>

        <div className='flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar mt-4'>
          <ul className='space-y-2'>{children}</ul>
        </div>
      </nav>
    </aside>
  )
}
