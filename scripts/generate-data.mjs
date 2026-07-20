#!/usr/bin/env node
/**
 * Fetches mledoze/countries (ODbL license - credit it if you redistribute
 * the resulting data file, see README) and writes src/data/countries.json in
 * this app's schema, curated down to your specific 198 entries.
 *
 * Needs real network access - run this on your machine or in CI (the
 * deploy workflow already calls it before building). It was NOT run inside
 * the sandbox that built the rest of this project, since that environment
 * has no network access; the schema below is built from the live
 * mledoze/countries README, not from memory, but the actual output has not
 * been executed or spot-checked end to end. Run it once and sanity-check
 * the result (see the console warnings below) before you rely on it.
 *
 * Usage: node scripts/generate-data.mjs
 */

import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const SOURCE_URL = 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json'
const OUTPUT_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/data/countries.json')

// Your 198 = 193 UN members + these five, which aren't UN members so the
// independent+unMember filter below won't pick them up on its own:
//   VAT  Holy See / Vatican City - independent, but a UN observer, not a member
//   PSE  Palestine - UN observer, not a member
//   TWN  Taiwan
//   XKX  Kosovo - has NO official ISO 3166-1 code; XKX/XK is the unofficial
//        code most datasets (this one, if present) use as a de facto standard.
//        If it's missing from the source, you'll need to hand-add it - see
//        the warning this script prints below.
//   ESH  Western Sahara
const EXTRA_ISO3 = ['VAT', 'PSE', 'TWN', 'XKX', 'ESH']

// mledoze/countries doesn't include population at all (confirmed against its
// README's field list). Fill this in from a source of your choice - World
// Bank, UN data, etc - before shipping. It's info-card-only, never used for
// scoring, so it's low-stakes, but 0 will look broken if left unfilled.
// Key by cca3 (alpha-3 ISO code).
const POPULATION_OVERRIDES = {
  // AUS: 26700000,
  // USA: 335000000,
}

function stripAccents(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// Single canonical name per country: common English name, accents
// normalized. No aliases - "USA" is never a second valid entry alongside
// "United States", so whichever form mledoze's name.common gives us for a
// given country IS the one and only accepted spelling.
function canonicalName(entry) {
  return stripAccents(entry.name.common)
}

function toAppSchema(entry) {
  return {
    iso2: entry.cca2.toLowerCase(),
    name: canonicalName(entry),
    // "Just use top level" -> take mledoze's precomputed callingCodes[0]
    // rather than reconstructing from idd.root/suffixes ourselves. Falls
    // back to root+first suffix if callingCodes is ever absent.
    callingCode: entry.callingCodes?.[0] ?? `${entry.idd?.root ?? ''}${entry.idd?.suffixes?.[0] ?? ''}`,
    capitals: (entry.capital ?? []).map(stripAccents),
    currency: Object.values(entry.currencies ?? {})[0]?.name ?? '',
    languages: Object.values(entry.languages ?? {}),
    continent: entry.region,
    population: POPULATION_OVERRIDES[entry.cca3] ?? 0,
  }
}

async function main() {
  const res = await fetch(SOURCE_URL)
  if (!res.ok) throw new Error(`Failed to fetch ${SOURCE_URL}: ${res.status}`)
  const raw = await res.json()

  const unMembers = raw.filter((entry) => entry.independent && entry.unMember)
  const extras = raw.filter((entry) => EXTRA_ISO3.includes(entry.cca3))

  const missing = EXTRA_ISO3.filter((code) => !extras.some((e) => e.cca3 === code))
  if (missing.length > 0) {
    console.warn(
      `Could not find ${missing.join(', ')} in the source data by cca3 code. ` +
        `Check https://github.com/mledoze/countries/blob/master/countries.json ` +
        `for how they're represented (Kosovo especially may use a different code, ` +
        `or be absent entirely, given it has no official ISO assignment) and adjust ` +
        `EXTRA_ISO3 or add the entry by hand.`,
    )
  }

  const byIso3 = new Map()
  for (const entry of [...unMembers, ...extras]) {
    byIso3.set(entry.cca3, entry) // de-dupe defensively, shouldn't overlap
  }

  const countries = [...byIso3.values()].map(toAppSchema).sort((a, b) => a.name.localeCompare(b.name))

  console.log(`Built ${countries.length} entries (expecting 198).`)
  if (countries.length !== 198) {
    console.warn(
      `Got ${countries.length}, not 198 - check the unMember filter and the ` +
        `EXTRA_ISO3 list by hand before shipping this data.`,
    )
  }

  const unpopulated = countries.filter((c) => c.population === 0).length
  if (unpopulated > 0) {
    console.warn(`${unpopulated} countries have population 0 - fill in POPULATION_OVERRIDES above.`)
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(countries, null, 2))
  console.log(`Wrote ${OUTPUT_PATH}`)
}

main().catch((err) => {
  if (err?.cause?.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' || err?.cause?.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
    console.error(
      `\nCould not verify the HTTPS certificate for ${SOURCE_URL}.\n` +
        `This usually means you're on a network that inspects HTTPS traffic (common on managed/work laptops) -\n` +
        `Windows and your browser already trust that certificate, Node doesn't check the Windows certificate\n` +
        `store by default. Export your network's root certificate (certmgr.msc > Trusted Root Certification\n` +
        `Authorities > Certificates > Export as Base-64 X.509 .cer), then:\n` +
        `  $env:NODE_EXTRA_CA_CERTS = "C:\\path\\to\\that.cer"   (PowerShell)\n` +
        `  export NODE_EXTRA_CA_CERTS=/path/to/that.cer         (macOS/Linux)\n` +
        `and run this again.\n`,
    )
    process.exit(1)
  }
  console.error(err)
  process.exit(1)
})
