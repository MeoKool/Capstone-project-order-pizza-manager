import ApiResponse, { get } from "@/apis/apiUtils"
import TableDataModels, { TableResult } from "@/types/tables"

class TableService {
    private static instance: TableService
    private constructor() { }
    public static getInstance(): TableService {
        if (!TableService.instance) {
            TableService.instance = new TableService()
        }
        return TableService.instance
    }


    public async getAllTables(): Promise<ApiResponse<TableResult>> {
        try {
            return await get<TableResult>(`/tables`)
        } catch (error) {
            console.error("Error fetching all tables:", error)
            throw error
        }
    }
    public async getTableById(id: string): Promise<ApiResponse<TableDataModels>> {
        try {
            return await get<TableDataModels>(`/tables/${id}`)
        } catch (error) {
            console.error(`Error fetching table with id ${id}:`, error)
            throw error
        }
    }

    public async checkStatusTable(id: string): Promise<ApiResponse<TableDataModels>> {
        try {
            return await get<TableDataModels>(`/tables/${id}`)
        } catch (error) {
            console.error(`Error fetching table with status ${id}:`, error)
            throw error
        }
    }

}

export default TableService