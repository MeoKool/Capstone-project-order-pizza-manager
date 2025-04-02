import type ApiResponse from '@/apis/apiUtils'
import { get } from '@/apis/apiUtils'
import axios from 'axios'

export interface ConfigItem {
  id: string
  configType: string
  key: string
  value: string
}

// Dạng trả về của API khi lấy danh sách cấu hình
export interface GetSettingsResult {
  items: any
  result: {
    items: ConfigItem[]
    totalCount: number
  }
  success: boolean
  message: string
  statusCode: number
}

// Dạng trả về của API khi update cấu hình
export interface ConfigResult {
  result: {
    id: string
  }
  success: boolean
  message: string
  statusCode: number
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

  public async getAllSettings(): Promise<ApiResponse<GetSettingsResult>> {
    try {
      return await get<GetSettingsResult>('/configs')
    } catch (error) {
      console.error('Error fetching settings:', error)
      throw error
    }
  }

  public async updateSetting(id: string, data: UpdateConfigDto): Promise<ApiResponse<ConfigResult>> {
    try {
      // Chuyển đổi value sang number nếu có thể
      const numericValue = !isNaN(Number(data.value)) ? Number(data.value) : data.value

      // Tạo form data
      const formData = new FormData()
      formData.append('Id', id)
      formData.append('Value', numericValue.toString())

      // Gọi API cập nhật với axios
      const response = await axios.put('https://vietsac.id.vn/api/configs/update-value', formData, {
        headers: {
          // Axios tự động set header Content-Type với boundary
          'Content-Type': 'multipart/form-data'
        }
      })

      return {
        success: true,
        result: response.data,
        message: 'Item updated successfully',
        statusCode: response.status
      }
    } catch (error) {
      console.error(`Error updating setting with id ${id}:`, error)

      // Nếu có phản hồi lỗi từ axios, trả về trực tiếp dữ liệu lỗi từ BE
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data
      }
      throw error
    }
  }
}

export default SettingsService
