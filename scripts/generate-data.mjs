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
import { gunzipSync } from 'node:zlib'

const SOURCE_URL = 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json'
const POPULATION_SOURCE_URL =
  'https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/CSV_FILES/WPP2024_Demographic_Indicators_Medium.csv.gz'
const OUTPUT_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/data/countries.json')

// Your 198 = 193 UN members + these five, which aren't UN members so the
// independent+unMember filter below won't pick them up on its own:
//   VAT  Holy See / Vatican City - independent, but a UN observer, not a member
//   PSE  Palestine - UN observer, not a member
//   TWN  Taiwan
//   UNK  Kosovo - has NO official ISO 3166-1 code. mledoze identifies it as
//        UNK/XK, while the UN population CSV uses XKX/XK.
//   ESH  Western Sahara
const EXTRA_ISO3 = ['VAT', 'PSE', 'TWN', 'UNK', 'ESH']

/** WPP's 2024 mid-year figures are in thousands. This is deliberately a
 * fixed, official CSV revision rather than a live API, so builds need no
 * credential and the app remains reproducible even as newer estimates arrive.
 */
const POPULATION_YEAR = '2024'

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

function toAppSchema(entry, populationsByIso2) {
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
    population: populationsByIso2.get(entry.cca2) ?? 0,
  }
}

/** CSV rows can contain quoted location names, so use a minimal proper parser
 * rather than splitting on commas. Only three fields are needed, but they sit
 * after the Location column in some rows. */
function parseCsvLine(line) {
  const values = []
  let value = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (char === ',' && !quoted) {
      values.push(value)
      value = ''
    } else {
      value += char
    }
  }
  values.push(value)
  return values
}

async function fetchPopulations() {
  const res = await fetch(POPULATION_SOURCE_URL)
  if (!res.ok) throw new Error(`Failed to fetch UN population CSV: ${res.status}`)

  const csv = gunzipSync(Buffer.from(await res.arrayBuffer())).toString('utf8')
  const [header, ...rows] = csv.split(/\r?\n/)
  const columns = parseCsvLine(header.replace(/^\uFEFF/, ''))
  const iso2Index = columns.indexOf('ISO2_code')
  const timeIndex = columns.indexOf('Time')
  const populationIndex = columns.indexOf('TPopulation1July')
  if (iso2Index < 0 || timeIndex < 0 || populationIndex < 0) throw new Error('UN population CSV has an unexpected schema')

  const populations = new Map()
  for (const row of rows) {
    if (!row) continue
    const values = parseCsvLine(row)
    if (values[timeIndex] !== POPULATION_YEAR || !values[iso2Index]) continue
    const populationInThousands = Number(values[populationIndex])
    if (Number.isFinite(populationInThousands) && populationInThousands > 0) {
      populations.set(values[iso2Index].toUpperCase(), Math.round(populationInThousands * 1_000))
    }
  }
  return populations
}

async function main() {
  const [countryResponse, populationsByIso2] = await Promise.all([fetch(SOURCE_URL), fetchPopulations()])
  if (!countryResponse.ok) throw new Error(`Failed to fetch ${SOURCE_URL}: ${countryResponse.status}`)
  const raw = await countryResponse.json()

  const unMembers = raw.filter((entry) => entry.independent && entry.unMember)
  const extras = raw.filter((entry) => EXTRA_ISO3.includes(entry.cca3))

  const missing = EXTRA_ISO3.filter((code) => !extras.some((e) => e.cca3 === code))
  if (missing.length > 0) {
    console.warn(
      `Could not find ${missing.join(', ')} in the source data by cca3 code. ` +
        `Check https://github.com/mledoze/countries/blob/master/countries.json ` +
        `for how they're represented (Kosovo especially may use a different code, ` +
        `or be absent entirely, given it has no official ISO assignment) and adjust EXTRA_ISO3.`,
    )
  }

  const byIso3 = new Map()
  for (const entry of [...unMembers, ...extras]) {
    byIso3.set(entry.cca3, entry) // de-dupe defensively, shouldn't overlap
  }

  const countries = [...byIso3.values()].map((entry) => toAppSchema(entry, populationsByIso2)).sort((a, b) => a.name.localeCompare(b.name))

  console.log(`Built ${countries.length} entries (expecting 198).`)
  if (countries.length !== 198) {
    console.warn(
      `Got ${countries.length}, not 198 - check the unMember filter and the ` +
        `EXTRA_ISO3 list by hand before shipping this data.`,
    )
  }

  const unpopulated = countries.filter((c) => c.population === 0).length
  if (unpopulated > 0) {
    console.warn(`${unpopulated} countries have population 0 - check their ISO2 mapping in the UN WPP 2024 CSV.`)
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
