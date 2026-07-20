import { useCallback, useEffect, useState } from 'react'

/**
 * Generic localStorage-backed state. Reads once on mount, writes on every
 * change. Tolerant of missing or corrupt stored data (falls back to the
 * default rather than throwing) — this is the app's only persistence layer,
 * so a bad JSON blob shouldn't be able to brick the app on load.
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage full or unavailable (private browsing, etc) — fail silently
      // rather than crash the app over a persistence write.
    }
  }, [key, value])

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
    setValue(defaultValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return [value, setValue, remove] as const
}
