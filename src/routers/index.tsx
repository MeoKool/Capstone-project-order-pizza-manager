import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import WorkshopsPage from '@/pages/Workshops/WorkshopsPage'
import WorkshopDetail from '@/pages/Workshops/components/WorkshopDetail'
import WorkshopForm from '@/pages/Workshops/components/WorkshopForm'
// import DashboardComponent from "./DashboardComponent";

// Lazy load the components
const DashboardLayout = lazy(() => import('@/components/dashboard-layout'))
const Dashboard = lazy(() => import('@/pages/DashboradPage/DashboradPage'))
const InTables = lazy(() => import('@/pages/InTables/InTables'))
const Kitchens = lazy(() => import('@/pages/Kitchens/Kitchens'))
const Orders = lazy(() => import('@/pages/Orders/Orders'))
const MenuFood = lazy(() => import('@/pages/MenuFood/MenuFood'))
const Customers = lazy(() => import('@/pages/Customers/Customers'))
const Staffs = lazy(() => import('@/pages/Staffs/Staffs'))
const Promotion = lazy(() => import('@/pages/Promotion/Promotion'))
const Reports = lazy(() => import('@/pages/Reports/Reports'))
const More = lazy(() => import('@/pages/More/More'))

// Loading component
const Loading = () => <div>Loading...</div>

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <Dashboard />
          </Suspense>
        )
      },
      {
        path: 'in-tables',
        element: (
          <Suspense fallback={<Loading />}>
            <InTables />
          </Suspense>
        )
      },
      {
        path: 'kitchens',
        element: (
          <Suspense fallback={<Loading />}>
            <Kitchens />
          </Suspense>
        )
      },
      {
        path: 'orders',
        element: (
          <Suspense fallback={<Loading />}>
            <Orders />
          </Suspense>
        )
      },
      {
        path: 'menuFood',
        element: (
          <Suspense fallback={<Loading />}>
            <MenuFood />
          </Suspense>
        )
      },
      {
        path: 'customers',
        element: (
          <Suspense fallback={<Loading />}>
            <Customers />
          </Suspense>
        )
      },
      {
        path: 'staffs',
        element: (
          <Suspense fallback={<Loading />}>
            <Staffs />
          </Suspense>
        )
      },
      {
        path: 'promotion',
        element: (
          <Suspense fallback={<Loading />}>
            <Promotion />
          </Suspense>
        )
      },
      {
        path: 'workshops',
        element: (
          <Suspense fallback={<Loading />}>
            <WorkshopsPage />
          </Suspense>
        )
      },
      {
        path: 'workshops/:id',
        element: (
          <Suspense fallback={<Loading />}>
            <WorkshopDetail />
          </Suspense>
        )
      },
      {
        path: '/workshops/create',
        element: (
          <Suspense fallback={<Loading />}>
            <WorkshopForm />
          </Suspense>
        )
      },
      {
        path: '/workshops/edit/:id',
        element: (
          <Suspense fallback={<Loading />}>
            <WorkshopForm isEditing={true} />
          </Suspense>
        )
      },
      {
        path: 'reports',
        element: (
          <Suspense fallback={<Loading />}>
            <Reports />
          </Suspense>
        )
      },
      {
        path: 'more',
        element: (
          <Suspense fallback={<Loading />}>
            <More />
          </Suspense>
        )
      }
    ]
  }
])
