'use client'

import TableService from '@/services/table-service'
import type TableResponse from '@/types/tables'
import { useCallback, useEffect, useState, useRef } from 'react'

const useTable = () => {
  const [tables, setTables] = useState<TableResponse[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Use useRef to maintain a stable reference to the service
  const tableServiceRef = useRef(TableService.getInstance())

  // Fetch all tables with empty dependency array to prevent recreating on each render
  const fetchAllTables = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await tableServiceRef.current.getAllTables()
      if (response.success && response.result.items) {
        setTables(response.result.items)
      } else {
        setTables([])
      }
    } catch (error) {
      setError('Failed to fetch all tables')
      console.error('Error fetching tables:', error)
    } finally {
      setLoading(false)
    }
  }, []) // Empty dependency array since tableServiceRef is stable

  // Only run once on component mount
  useEffect(() => {
    fetchAllTables()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array to run only once

  return { tables, loading, error, fetchAllTables }
}

export default useTable
