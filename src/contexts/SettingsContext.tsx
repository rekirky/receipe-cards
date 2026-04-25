import { createContext, useContext, useEffect, useState } from 'react'
import type { AppSettings } from '../utils/settingsStorage'
import { loadSettings, saveSettings, categoryLabelsFromSettings } from '../utils/settingsStorage'
import { applyThemeToDom } from '../utils/colourShades'

interface SettingsCtx {
  settings: AppSettings
  categoryLabels: Record<string, string>
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>
}

const SettingsContext = createContext<SettingsCtx>({
  settings: loadSettings(),
  categoryLabels: {},
  updateSettings: async () => {},
})

export function useSettings() {
  return useContext(SettingsContext)
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // Initialise from localStorage cache so the theme applies immediately (no flash)
  const [settings, setSettings] = useState<AppSettings>(loadSettings)

  // Fetch authoritative settings from server on mount and keep cache warm
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((serverSettings: AppSettings) => {
        setSettings(serverSettings)
        saveSettings(serverSettings)
        applyThemeToDom(serverSettings.themeColour, serverSettings.bgColour)
      })
      .catch(() => {
        // Fall back to cached settings silently
      })
  }, [])

  async function updateSettings(patch: Partial<AppSettings>) {
    const next = { ...settings, ...patch }
    // Optimistic update — apply immediately so the UI feels instant
    setSettings(next)
    saveSettings(next)
    applyThemeToDom(next.themeColour, next.bgColour)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    })
  }

  const categoryLabels = categoryLabelsFromSettings(settings)

  return (
    <SettingsContext.Provider value={{ settings, categoryLabels, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}
