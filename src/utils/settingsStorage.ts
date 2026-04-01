import { applyThemeToDom } from './colourShades'
import { CATEGORY_LABELS } from '../data/recipes'

export interface CategoryDef {
  id: string
  label: string
}

export interface AppSettings {
  themeColour: string
  bgColour: string
  logoBase64: string | null
  categories: CategoryDef[]
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeColour: '#ea580c',
  bgColour: '#1c1917',
  logoBase64: null,
  categories: Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ id, label })),
}

const KEY = 'rcards-settings-v1'

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings))
}

export function resetSettings(): void {
  localStorage.removeItem(KEY)
}

// Called before React mounts to avoid flash of unstyled theme
export function applyStoredSettings(): void {
  const s = loadSettings()
  applyThemeToDom(s.themeColour, s.bgColour)
}

export function categoryLabelsFromSettings(settings: AppSettings): Record<string, string> {
  return Object.fromEntries(settings.categories.map((c) => [c.id, c.label]))
}
