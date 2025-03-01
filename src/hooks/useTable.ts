import TableService from "@/services/table-service"
import TableResponse from "@/types/tables"
import { useCallback, useEffect, useState } from "react"

const useTable = () => {
    const [tables, setTables] = useState<TableResponse[]>([])

    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)



    const productService = TableService.getInstance()


    // get all tables
    const fetchAllTables = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await productService.getAllTables()
            if (response.success && response.result.items) {
                setTables(response.result.items)

            } else {
                setTables([])
            }
        } catch (error) {
            setError("Faild to fetch all tables")
        } finally {
            setLoading(false)
        }
    }, [])
    useEffect(() => {
        fetchAllTables()
    }, [fetchAllTables])
    // const fetchTableById = useCallback(async () => {


    //     setLoading(true)
    //     setError(null)
    //     try {
    //         const tableService = TableService.getInstance()
    //         const response = await tableService.getTableById(`${tableId}`)
    //         if (response.success && response.result) {
    //             setTable([response.result])
    //             setTableId_gbId(response.result.id)
    //             setCurrentOrderId(response.result.currentOrderId)
    //         } else {
    //             setTable([])
    //             setCurrentOrderId(null)
    //             setError(response.message || "No table data found")
    //         }
    //     } catch (err) {
    //         setError("Failed to fetch table")
    //         console.error(err)
    //     } finally {
    //         setLoading(false)
    //     }
    // }, [tableId])

    // useEffect(() => {
    //     fetchTableById()
    // }, [fetchTableById])

    return { tables, loading, error }
}

export default useTable

