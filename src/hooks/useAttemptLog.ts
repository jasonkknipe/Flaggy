import { useCallback, useEffect, useState } from 'react'
import type { CompeteAttempt } from '../types/quiz'
import { fetchAttemptsFromServer, isAttemptServerConfigured, saveAttemptToServer } from '../services/attemptLog'
import { useLocalStorage } from './useLocalStorage'

const ATTEMPTS_KEY = 'flag-trainer:compete-attempts'

function mergeAttempts(local: CompeteAttempt[], remote: CompeteAttempt[]): CompeteAttempt[] {
  const merged = new Map(local.map((attempt) => [attempt.id, attempt]))
  for (const attempt of remote) merged.set(attempt.id, attempt)
  return [...merged.values()].sort((a, b) => b.endedAt - a.endedAt)
}

export function useAttemptLog() {
  const [attempts, setAttempts] = useLocalStorage<CompeteAttempt[]>(ATTEMPTS_KEY, [])
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!isAttemptServerConfigured) return
    setIsLoading(true)
    try {
      const remote = await fetchAttemptsFromServer()
      setAttempts((local) => mergeAttempts(local, remote))
    } catch {
      // The local copy remains available when offline or while the server is
      // being configured. The next refresh reconciles it.
    } finally {
      setIsLoading(false)
    }
  }, [setAttempts])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const recordAttempt = useCallback(
    (attempt: CompeteAttempt) => {
      setAttempts((current) => mergeAttempts(current, [attempt]))
      if (isAttemptServerConfigured) void saveAttemptToServer(attempt).catch(() => undefined)
    },
    [setAttempts],
  )

  return { attempts, recordAttempt, refresh, isLoading, isServerConfigured: isAttemptServerConfigured }
}
