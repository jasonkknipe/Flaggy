import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { SessionConfig, SessionState } from '../types/quiz'
import { createSession as engineCreateSession } from '../engine/sessionEngine'

const KEY = 'flag-trainer:session'

export function useSession() {
  const [session, setSession, clearSession] = useLocalStorage<SessionState | null>(KEY, null)

  const startSession = useCallback(
    (config: SessionConfig, allIso2: string[]) => {
      const created = engineCreateSession(config, allIso2)
      setSession(created)
      return created
    },
    [setSession],
  )

  return { session, setSession, startSession, clearSession }
}
