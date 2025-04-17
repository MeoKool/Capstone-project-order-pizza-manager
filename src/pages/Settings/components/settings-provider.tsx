import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import SettingsService from '@/services/settings-service'

// Định nghĩa kiểu cho từng item trong settings
export interface ConfigItem {
  id: string
  configType: string
  key: string
  value: string
  unit?: string
}

// Kiểu dữ liệu cho phần result của API getAllSettings

interface SettingsContextType {
  settings: ConfigItem[]
  loading: boolean
  error: string | null
  fetchSettings: () => Promise<void>
  updateSetting: (id: string, value: string) => Promise<void>
  getConfigTypeAsNumber: (configType: string) => number
  getSettingValue: (configType: string) => string
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ConfigItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const settingsService = SettingsService.getInstance()

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await settingsService.getAllSettings()
      if (response.success) {
        // Fix the inconsistency between key and configType by using configType as the standard
        const processedSettings = response.result.items.map((item: { configType: any }) => ({
          ...item,
          key: item.configType // Force key to match configType
        }))

        setSettings(processedSettings)
      } else {
        setError(response.message || 'Failed to fetch settings')
      }
    } catch (err) {
      setError('An error occurred while fetching settings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get setting value by configType
  const getSettingValue = (configType: string): string => {
    const setting = settings.find((s) => s.configType === configType)
    return setting ? setting.value : ''
  }

  // Phương thức cập nhật setting theo API mới
  const updateSetting = async (id: string, value: string) => {
    try {
      const settingToUpdate = settings.find((setting) => setting.id === id)
      if (!settingToUpdate) {
        throw new Error('Setting not found')
      }

      const response = await settingsService.updateSetting(id, {
        id,
        configType: getConfigTypeAsNumber(settingToUpdate.configType),
        key: settingToUpdate.configType, // Always use configType as key
        value
      })

      if (response.success) {
        // Update the setting in local state
        setSettings((prev) => prev.map((setting) => (setting.id === id ? { ...setting, value } : setting)))
        return
      } else {
        setError(response.message || 'Failed to update setting')
        throw new Error(response.message)
      }
    } catch (err) {
      setError('An error occurred while updating setting')
      console.error(err)
      throw err
    }
  }

  // Hàm chuyển đổi configType từ string sang number theo mapping định nghĩa
  const getConfigTypeAsNumber = (configType: string): number => {
    const configTypeMap: Record<string, number> = {
      MAXIMUM_REGISTER_SLOT: 0,
      MAXIMUM_REGISTER_PER_STAFF: 1,
      VAT: 2,
      SWAP_WORKING_SLOT_CUTOFF_DAY: 3,
      REGISTRATION_CUTOFF_DAY: 4,
      REGISTRATION_WEEK_LIMIT: 5
      // Add more mappings as needed
    }
    return configTypeMap[configType] ?? 0 // Use nullish coalescing for safety
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const value = {
    settings,
    loading,
    error,
    fetchSettings,
    updateSetting,
    getConfigTypeAsNumber,
    getSettingValue
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
