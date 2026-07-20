import { useLocalStorage } from './useLocalStorage'
import { DEFAULT_SETTINGS, type SettingsStore } from '../types/settings'

const KEY = 'flag-trainer:settings'

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<SettingsStore>(KEY, DEFAULT_SETTINGS)
  return { settings, setSettings }
}
