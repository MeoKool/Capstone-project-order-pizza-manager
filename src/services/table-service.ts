import ApiResponse, { get, put } from '@/apis/apiUtils'
import TableResponse from '@/types/tables'
import TableDataModels, { TableResult } from '@/types/tables'

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
      return await get<TableResult>(`/tables?TakeCount=1000&SortBy=code&IncludeProperties=CurrentReservation.TableAssignReservations%2CTableMerge`)
    } catch (error) {
      console.error('Error fetching all tables:', error)
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
  public async putOpenTable(id: string): Promise<ApiResponse<TableResult>> {
    try {
      return await put(`/tables/open-table/${id}`)
    } catch (error) {
      console.error(`Error opening table with id ${id}:`, error)
      throw error
    }
  }

  public async putCloseTable(id: string): Promise<ApiResponse<void>> {
    try {
      return await put<void>(`/tables/close-table/${id}`)
    } catch (error) {
      console.log(`Error close table id : ${id}`, error)
      throw error
    }
  }

  public async putLockTable(id: string, note: string): Promise<ApiResponse<void>> {
    try {
      const req = {
        id,
        note
      }
      return await put<void>(`/tables/lock-table/${id}`, req)
    } catch (error) {
      console.log(`err lock table ${id}`, error)
      throw error
    }
  }

  public async checkStatusTable(id: string): Promise<ApiResponse<TableResponse>> {
    try {
      return await get<TableDataModels>(`/tables/${id}`)
    } catch (error) {
      console.error(`Error fetching table with status ${id}:`, error)
      throw error
    }
  }
  public async getAllTableMerge(code: string): Promise<ApiResponse<TableResult>> {
    try {
      return await get<TableResult>(`/tables/table-merge`)
    } catch (error) {
      console.error(`Error fetching table-merge with code ${code}:`, error)
      throw error
    }
  }

  public async mergeTable(tableIds: string[], groupName: string): Promise<ApiResponse<void>> {
    try {
      const req = {
        tableIds,
        groupName
      }
      return await put<void>(`/tables/merge-table`, req)
    } catch (error) {
      console.error(`Error adding table merge with id ${tableIds}:`, error)
      throw error
    }
  }
  public async unMergeTable(tableId: string): Promise<ApiResponse<void>> {
    try {
      const table = await this.getTableById(tableId)
      if (table.success && table.result && table.result.tableMergeId) {
        return await put<void>(`/tables/cancel-merge-table/${table.result.tableMergeId}`)
      } else {
        throw new Error("Table merge ID not found")
      }
    } catch (error) {
      console.error(`Error unmerging table with id ${tableId}:`, error)
      throw error
    }
  }
}
