import { MoreVertical, ChevronLeft, Menu } from 'lucide-react'
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
      <nav className=' flex flex-col bg-white border-r shadow-sm h-full'>
        <div
          className={`h-16  flex items-center justify-center border-b  ${expanded ? `justify-between p-4` : `justify-center`}`}
        >
          <div className={`overflow-hidden transition-all ${expanded ? 'w-44' : 'w-0'}`}>
            <h1 className='text-lg font-semibold'>Pizza Management</h1>
          </div>
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg bg-gray-100 hover:bg-gray-200 ? ${expanded ? `ml-3 hover:bg-gray-200` : `bg-gray-300 p-3`} `}
          >
            {expanded ? <ChevronLeft /> : <Menu />}
          </button>
        </div>

        <div className='flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar'>
          <ul>{children}</ul>
        </div>

        <div className='border-t flex p-3'>
          <img
            src='https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true'
            alt=''
            className='w-10 h-10 rounded-md'
          />
          <div
            className={`flex justify-between items-center overflow-hidden transition-all ${expanded ? 'w-48 ml-3' : 'w-0'}`}
          >
            <div className='leading-4'>
              <h4 className='font-semibold'>John Doe</h4>
              <span className='text-xs text-gray-600'>johndoe@gmail.com</span>
            </div>
            <MoreVertical size={20} />
          </div>
        </div>
      </nav>
    </aside>
  )
}
