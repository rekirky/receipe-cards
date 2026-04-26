import { applyThemeToDom } from './colourShades'
import { CATEGORY_LABELS } from '../data/recipes'

export interface CategoryDef {
  id: string
  label: string
}

// Stored server-side — shared across all devices
export interface ServerSettings {
  logoBase64: string | null
  logoLinkUrl: string
  categories: CategoryDef[]
}

// Stored in localStorage — per device
export interface DeviceSettings {
  themeColour: string
  bgColour: string
  printerFriendly: boolean
}

export interface AppSettings extends ServerSettings, DeviceSettings {}

export const DEFAULT_SERVER_SETTINGS: ServerSettings = {
  logoBase64: null,
  logoLinkUrl: '',
  categories: Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ id, label })),
}

export const DEFAULT_DEVICE_SETTINGS: DeviceSettings = {
  themeColour: '#ea580c',
  bgColour: '#1c1917',
  printerFriendly: false,
}

export const DEFAULT_SETTINGS: AppSettings = {
  ...DEFAULT_SERVER_SETTINGS,
  ...DEFAULT_DEVICE_SETTINGS,
}

const DEVICE_KEY = 'rcards-device-v1'

export function loadDeviceSettings(): DeviceSettings {
  try {
    const raw = localStorage.getItem(DEVICE_KEY)
    if (!raw) return DEFAULT_DEVICE_SETTINGS
    return { ...DEFAULT_DEVICE_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_DEVICE_SETTINGS
  }
}

export function saveDeviceSettings(s: DeviceSettings): void {
  localStorage.setItem(DEVICE_KEY, JSON.stringify(s))
}

// Called synchronously before React mounts to avoid theme flash
export function applyStoredSettings(): void {
  const d = loadDeviceSettings()
  applyThemeToDom(d.themeColour, d.bgColour)
}

export function categoryLabelsFromSettings(settings: AppSettings): Record<string, string> {
  return Object.fromEntries(settings.categories.map((c) => [c.id, c.label]))
}
