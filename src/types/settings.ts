import type { SessionLength } from './quiz'

/**
 * There's no persisted "settings" for animation or motion - per your call,
 * those are dropped as user-facing controls entirely; the app just builds
 * good animations and quietly respects the OS-level prefers-reduced-motion
 * media query under the hood, with no in-app toggle to wire up.
 *
 * What's left here are small remembered conveniences (not locks - the Mode
 * Options screen always lets you change them before starting) plus the
 * destructive actions Settings exposes as buttons rather than data:
 * Reset statistics, Reset learning history, Clear cache.
 */
export interface SettingsStore {
  lastCallingCodeGuessChoice: boolean
  lastCapitalGuessChoice: boolean
  lastSessionLength: SessionLength
}

export const DEFAULT_SETTINGS: SettingsStore = {
  lastCallingCodeGuessChoice: true,
  lastCapitalGuessChoice: false,
  lastSessionLength: 50,
}
