import { createContext, useContext, useState } from 'react'
import type { AppSettings } from '../utils/settingsStorage'
import { loadSettings, saveSettings, categoryLabelsFromSettings } from '../utils/settingsStorage'
import { applyThemeToDom } from '../utils/colourShades'

interface SettingsCtx {
  settings: AppSettings
  categoryLabels: Record<string, string>
  updateSettings: (patch: Partial<AppSettings>) => void
}

const SettingsContext = createContext<SettingsCtx>({
  settings: loadSettings(),
  categoryLabels: {},
  updateSettings: () => {},
})

export function useSettings() {
  return useContext(SettingsContext)
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings)

  function updateSettings(patch: Partial<AppSettings>) {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      applyThemeToDom(next.themeColour, next.bgColour)
      return next
    })
  }

  const categoryLabels = categoryLabelsFromSettings(settings)

  return (
    <SettingsContext.Provider value={{ settings, categoryLabels, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}
