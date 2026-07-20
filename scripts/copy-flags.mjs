#!/usr/bin/env node
/**
 * Copies flag-icons' 4:3 SVGs into public/flags/4x3 so FlagDisplay can use
 * plain <img src="..."> references (via import.meta.env.BASE_URL) instead
 * of bundler-specific dynamic-import-glob syntax, which is harder for me to
 * verify correctness of without a real Vite install to test against. Runs
 * automatically via the "postinstall" npm script, both locally and in CI —
 * see package.json.
 */
import { cp, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const source = path.join(root, '../node_modules/flag-icons/flags/4x3')
const dest = path.join(root, '../public/flags/4x3')

async function main() {
  await mkdir(dest, { recursive: true })
  await cp(source, dest, { recursive: true })
  console.log(`Copied flag SVGs to ${dest}`)
}

main().catch((err) => {
  // Don't fail the whole `npm install` over this — a fresh clone where
  // node_modules isn't fully in place yet shouldn't be a hard failure.
  console.warn(
    `Could not copy flag SVGs (${err.message}). Once "npm install" has ` +
      `finished, run "node scripts/copy-flags.mjs" again if flags are missing.`,
  )
})
