import ApiResponse, { get } from "@/apis/apiUtils"
import TableResponse from "@/types/tables"
import TableDataModels, { TableResult } from "@/types/tables"

export default class TableService {
    private static instance: TableService
    private constructor() { }
    public static getInstance(): TableService {
        if (!TableService.instance) {
            TableService.instance = new TableService()
        }
        return TableService.instance
    }

    //done 
    public async getAllTables(): Promise<ApiResponse<TableResult>> {
        try {
            return await get<TableResult>(`/tables`)
        } catch (error) {
            console.error("Error fetching all tables:", error)
            throw error
        }
    }

    //done 
    public async getTableById(id: string): Promise<ApiResponse<TableResponse>> {
        try {
            return await get<TableDataModels>(`/tables/${id}`)
        } catch (error) {
            console.error(`Error fetching table with id ${id}:`, error)
            throw error
        }
    }
    //post table 
    //





    public async checkStatusTable(id: string): Promise<ApiResponse<TableResponse>> {
        try {
            return await get<TableDataModels>(`/tables/${id}`)
        } catch (error) {
            console.error(`Error fetching table with status ${id}:`, error)
            throw error
        }
    }

}
