import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import SettingsService from '@/services/settings-service'

export interface ConfigItem {
  id: string
  configType: string
  key: string
  value: string
}

interface SettingsContextType {
  settings: ConfigItem[]
  loading: boolean
  error: string | null
  fetchSettings: () => Promise<void>
  updateSetting: (id: string, value: string) => Promise<void>
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
        setSettings(response.result.items)
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

  const updateSetting = async (id: string, value: string) => {
    try {
      const settingToUpdate = settings.find((setting) => setting.id === id)

      if (!settingToUpdate) {
        throw new Error('Setting not found')
      }

      const response = await settingsService.updateSetting(id, {
        id,
        configType: getConfigTypeAsNumber(settingToUpdate.configType),
        key: settingToUpdate.key,
        value
      })

      if (response.success) {
        // Update local state
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

  // Helper function to convert configType string to number
  const getConfigTypeAsNumber = (configType: string): number => {
    const configTypeMap: Record<string, number> = {
      MAXIMUM_REGISTER_SLOT: 0,
      VAT: 1
      // Add more mappings as needed
    }

    return configTypeMap[configType] || 0
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const value = {
    settings,
    loading,
    error,
    fetchSettings,
    updateSetting
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
