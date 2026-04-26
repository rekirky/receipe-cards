import { createContext, useContext, useEffect, useState } from 'react'
import type { AppSettings, ServerSettings, DeviceSettings } from '../utils/settingsStorage'
import {
  DEFAULT_SETTINGS,
  DEFAULT_SERVER_SETTINGS,
  loadDeviceSettings,
  saveDeviceSettings,
  categoryLabelsFromSettings,
} from '../utils/settingsStorage'
import { applyThemeToDom } from '../utils/colourShades'

const SERVER_KEYS = new Set<keyof AppSettings>(['logoBase64', 'logoLinkUrl', 'categories', 'pdfIncludeImages'])

function pickServer(s: AppSettings): ServerSettings {
  return { logoBase64: s.logoBase64, logoLinkUrl: s.logoLinkUrl, categories: s.categories, pdfIncludeImages: s.pdfIncludeImages }
}

function pickDevice(s: AppSettings): DeviceSettings {
  return { themeColour: s.themeColour, bgColour: s.bgColour, printerFriendly: s.printerFriendly }
}

interface SettingsCtx {
  settings: AppSettings
  categoryLabels: Record<string, string>
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>
}

const SettingsContext = createContext<SettingsCtx>({
  settings: DEFAULT_SETTINGS,
  categoryLabels: {},
  updateSettings: async () => {},
})

export function useSettings() {
  return useContext(SettingsContext)
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => ({
    ...DEFAULT_SERVER_SETTINGS,
    ...loadDeviceSettings(),
  }))

  // Fetch server settings on mount and merge with local device prefs
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((serverSettings: ServerSettings) => {
        setSettings((prev) => ({ ...prev, ...serverSettings }))
      })
      .catch(() => {
        // Keep defaults silently
      })
  }, [])

  async function updateSettings(patch: Partial<AppSettings>) {
    const next = { ...settings, ...patch }
    setSettings(next)

    const hasServerChange = Object.keys(patch).some((k) => SERVER_KEYS.has(k as keyof AppSettings))
    const hasDeviceChange = Object.keys(patch).some((k) => !SERVER_KEYS.has(k as keyof AppSettings))

    if (hasDeviceChange) {
      const device = pickDevice(next)
      saveDeviceSettings(device)
      applyThemeToDom(next.themeColour, next.bgColour)
    }

    if (hasServerChange) {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pickServer(next)),
      })
    }
  }

  const categoryLabels = categoryLabelsFromSettings(settings)

  return (
    <SettingsContext.Provider value={{ settings, categoryLabels, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}
