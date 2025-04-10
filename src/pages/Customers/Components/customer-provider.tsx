import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Customer } from '@/types/customer'
import CustomerService from '@/services/customer-service'

interface CustomerContextType {
  customers: Customer[]
  totalCount: number
  loading: boolean
  error: string | null
  fetchCustomers: () => Promise<void>
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const customerService = CustomerService.getInstance()

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const response = await customerService.getAllCustomers()

      if (response.success) {
        setCustomers(response.result.items)
        setTotalCount(response.result.totalCount)
      } else {
        setError(response.message || 'Failed to fetch customer data')
      }
    } catch (err) {
      setError('An error occurred while fetching customer data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const value = {
    customers,
    totalCount,
    loading,
    error,
    fetchCustomers
  }

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
}

export function useCustomer() {
  const context = useContext(CustomerContext)
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider')
  }
  return context
}
