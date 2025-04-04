import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Staff } from '@/types/staff'
import StaffService, { type CreateStaffDto, type UpdateStaffDto } from '@/services/staff-service'

interface StaffContextType {
  staff: Staff[]
  totalCount: number
  loading: boolean
  error: string | null
  fetchStaff: () => Promise<void>
  addStaff: (staff: CreateStaffDto) => Promise<void>
  updateStaff: (id: string, staff: UpdateStaffDto) => Promise<void>
  deleteStaff: (id: string) => Promise<void>
}

const StaffContext = createContext<StaffContextType | undefined>(undefined)

export function StaffProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<Staff[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const staffService = StaffService.getInstance()

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const response = await staffService.getAllStaff()

      if (response.success) {
        setStaff(response.result.items)
        setTotalCount(response.result.totalCount)
      } else {
        setError(response.message || 'Failed to fetch staff data')
      }
    } catch (err) {
      setError('An error occurred while fetching staff data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addStaff = async (newStaff: CreateStaffDto) => {
    try {
      const response = await staffService.createStaff(newStaff)

      if (response.success) {
        // Refresh the staff list after adding
        await fetchStaff()
      } else {
        setError(response.message || 'Failed to add staff')
        throw new Error(response.message)
      }
    } catch (err) {
      setError('An error occurred while adding staff')
      console.error(err)
      throw err
    }
  }

  const updateStaff = async (id: string, updatedStaff: UpdateStaffDto) => {
    try {
      const response = await staffService.updateStaff(id, updatedStaff)

      if (response.success) {
        // Update the local state to reflect changes
        setStaff((prev) => prev.map((staff) => (staff.id === id ? { ...staff, ...updatedStaff } : staff)))
      } else {
        setError(response.message || 'Failed to update staff')
        throw new Error(response.message)
      }
    } catch (err) {
      setError('An error occurred while updating staff')
      console.error(err)
      throw err
    }
  }

  const deleteStaff = async (id: string) => {
    try {
      const response = await staffService.deleteStaff([id])

      if (response.success) {
        // Remove the deleted staff from the local state
        setStaff((prev) => prev.filter((staff) => staff.id !== id))
        setTotalCount((prev) => prev - 1)
      } else {
        setError(response.message || 'Failed to delete staff')
        throw new Error(response.message)
      }
    } catch (err) {
      setError('An error occurred while deleting staff')
      console.error(err)
      throw err
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const value = {
    staff,
    totalCount,
    loading,
    error,
    fetchStaff,
    addStaff,
    updateStaff,
    deleteStaff
  }

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>
}

export function useStaff() {
  const context = useContext(StaffContext)
  if (context === undefined) {
    throw new Error('useStaff must be used within a StaffProvider')
  }
  return context
}
