import { useAuth } from '@/hooks/useAuth'
import type React from 'react'

import { Navigate, useLocation } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className='flex items-center justify-center h-screen'>Loading...</div>
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the location they were trying to go to for later
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  // If authenticated, render the children
  return <>{children}</>
}
