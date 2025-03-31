import type ApiResponse from '@/apis/apiUtils'
import { get, put } from '@/apis/apiUtils'

export interface ConfigItem {
  id: string
  configType: string
  key: string
  value: string
}

export interface ConfigResult {
  items: ConfigItem[]
  totalCount: number
}

export interface UpdateConfigDto {
  id: string
  configType: number
  key: string
  value: string
}

class SettingsService {
  private static instance: SettingsService

  private constructor() {}

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService()
    }
    return SettingsService.instance
  }

  /**
   * Get all settings
   */
  public async getAllSettings(): Promise<ApiResponse<ConfigResult>> {
    try {
      return await get<ConfigResult>('/configs')
    } catch (error) {
      console.error('Error fetching settings:', error)
      throw error
    }
  }

  /**
   * Update a setting
   */
  public async updateSetting(id: string, data: UpdateConfigDto): Promise<ApiResponse<ConfigItem>> {
    try {
      return await put<ConfigItem>(`/configs/${id}`, data)
    } catch (error) {
      console.error(`Error updating setting with id ${id}:`, error)
      throw error
    }
  }
}

export default SettingsService
