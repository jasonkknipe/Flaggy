import type { CompeteAttempt } from '../types/quiz'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isAttemptServerConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

async function rpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Attempt server is not configured')

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) throw new Error(`Attempt server request failed (${response.status})`)
  return (await response.json()) as T
}

export async function saveAttemptToServer(attempt: CompeteAttempt): Promise<void> {
  await rpc('save_compete_attempt', { p_attempt: attempt })
}

export async function fetchAttemptsFromServer(): Promise<CompeteAttempt[]> {
  const attempts = await rpc<CompeteAttempt[] | null>('list_compete_attempts', {})
  return attempts ?? []
}
