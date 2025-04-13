import { Outlet, Link, useLocation } from 'react-router-dom'
import { SidebarProvider } from './context/SidebarContext'
import { SidebarItem } from './sidebarItem'
import Sidebar from './sidebar'
import {
  LayoutDashboard,
  Table,
  ClipboardList,
  Utensils,
  Users,
  UserCircle,
  Tag,
  BarChart,
  MoreHorizontal,
  Settings,
  CalendarCheck,
  Store,
  Map
} from 'lucide-react'
import Header from './header'

const DashboardLayout = () => {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const getHeaderTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'tổng quan'
      case '/in-tables':
        return 'bàn ăn'
      case '/kitchens':
        return 'khu bếp'
      case '/orders':
        return 'đơn hàng'
      case '/menuFood':
        return 'thực đơn'
      case '/customers':
        return 'khách hàng'
      case '/zones-staff':
        return 'khu vực nhân viên'
      case '/workshops':
        return 'workshop'
      case '/staffs':
        return 'nhân viên'
      case '/settings':
        return 'cài đặt'
      case '/schedule':
        return 'lịch làm việc'
      case '/promotion':
        return 'khuyến mãi'
      case '/reports':
        return 'báo cáo'
      case '/more':
        return 'More'
      default:
        return 'Dashboard'
    }
  }

  return (
    <SidebarProvider>
      <div className='flex h-screen '>
        <Sidebar>
          <Link to='/'>
            <SidebarItem icon={<LayoutDashboard size={20} />} text='Tổng quan' active={isActive('/')} />
          </Link>
          <Link to='/in-tables'>
            <SidebarItem icon={<Table size={20} />} text='Bàn ăn' active={isActive('/in-tables')} />
          </Link>
          <Link to='/zones-staff'>
            <SidebarItem icon={<Map size={20} />} text='Khu vực nhân viên' active={isActive('/zones-staff')} />
          </Link>
          <Link to='/orders'>
            <SidebarItem icon={<ClipboardList size={20} />} text='Đơn hàng' active={isActive('/orders')} />
          </Link>
          <Link to='/menuFood'>
            <SidebarItem icon={<Utensils size={20} />} text='Thực đơn' active={isActive('/menuFood')} />
          </Link>
          <Link to='/customers'>
            <SidebarItem icon={<Users size={20} />} text='Khách hàng' active={isActive('/customers')} />
          </Link>
          <Link to='/schedule'>
            <SidebarItem icon={<CalendarCheck size={20} />} text='Lịch làm việc' active={isActive('/schedule')} />
          </Link>
          <Link to='/workshops'>
            <SidebarItem icon={<Store size={20} />} text='Workshop' active={isActive('/workshops')} />
          </Link>
          <Link to='/staffs'>
            <SidebarItem icon={<UserCircle size={20} />} text='Nhân viên' active={isActive('/staffs')} />
          </Link>
          <Link to='/promotion'>
            <SidebarItem icon={<Tag size={20} />} text='Khuyến mãi' active={isActive('/promotion')} />
          </Link>
          <Link to='/settings'>
            <SidebarItem icon={<Settings size={20} />} text='Cài đặt' active={isActive('/settings')} />
          </Link>
          <hr />
          <Link to='/reports'>
            <SidebarItem icon={<BarChart size={20} />} text='Báo cáo' active={isActive('/reports')} />
          </Link>
          <Link to='/more'>
            <SidebarItem icon={<MoreHorizontal size={20} />} text='More' active={isActive('/more')} />
          </Link>
        </Sidebar>
        <div className='flex flex-col flex-1 relative overflow-hidden  '>
          <Header title={getHeaderTitle()} />
          <main className='flex-1 overflow-y-auto max-h-screen bg-gradient-to-b from-white to-orange-50'>
            {' '}
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default DashboardLayout
