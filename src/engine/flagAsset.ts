/** Flags are copied into public/flags/4x3 by scripts/copy-flags.mjs (see its
 *  comment for why plain static assets were chosen over a bundler-specific
 *  import). import.meta.env is Vite-only — the `?? '/'` fallback just keeps
 *  this from throwing if it's ever evaluated outside a Vite runtime. */
export function flagSvgPath(iso2: string): string {
  const basePath = import.meta.env?.BASE_URL ?? '/'
  return `${basePath}flags/4x3/${iso2}.svg`
}
