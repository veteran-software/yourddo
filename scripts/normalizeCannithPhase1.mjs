#!/usr/bin/env node
/**
 * Normalizes prefix/suffix/extra fields in Cannith Phase 1 dataset to arrays of strings.
 *
 * Behavior:
 * - For each entry, converts fields {prefix, suffix, extra} as follows:
 *   - undefined/null -> []
 *   - string -> split by ',', trim, filter empty -> string[]
 *   - array -> String() + trim each, filter empty -> string[]
 *   - any other type -> [] (with a warning)
 * - Dry-run by default. Pass --write to rewrite the JSON file in-place (pretty-printed).
 * - Validates top-level JSON and each item has a string name.
 */

import fs from 'node:fs'
import path from 'node:path'

const FILE = path.join('src', 'data', 'cannithCrafting', 'cannithEnhancements.phase1.json')
const args = new Set(process.argv.slice(2))
const WRITE = args.has('--write')

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function readJson(file) {
  const text = fs.readFileSync(file, 'utf8')
  try {
    return JSON.parse(text)
  } catch (err) {
    throw new Error(`Failed to parse JSON: ${file}\n${err.message}`)
  }
}

function validateArray(arr) {
  if (!Array.isArray(arr)) throw new Error('Top-level JSON is not an array')
  arr.forEach((it, idx) => {
    if (!isPlainObject(it)) throw new Error(`Item at index ${idx} is not an object`)
    if (typeof it.name !== 'string' || !it.name) {
      throw new Error(`Item at index ${idx} has missing/invalid name: ${JSON.stringify(it && it.name)}`)
    }
  })
}

function toArrayOfStrings(value, field, idx, warn) {
  if (value == null) return []
  if (Array.isArray(value)) return value.map((s) => String(s).trim()).filter(Boolean)
  if (typeof value === 'string')
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  warn(`Entry #${idx} (${field}) had unsupported type ${typeof value}; normalized to []`)
  return []
}

function main() {
  const before = readJson(FILE)
  validateArray(before)
  const warnings = []

  const after = before.map((it, idx) => {
    const out = { ...it }
    out.prefix = toArrayOfStrings(it.prefix, 'prefix', idx, (m) => warnings.push(m))
    out.suffix = toArrayOfStrings(it.suffix, 'suffix', idx, (m) => warnings.push(m))
    out.extra = toArrayOfStrings(it.extra, 'extra', idx, (m) => warnings.push(m))
    return out
  })

  // Print summary
  const changedCount = before.reduce((n, it, i) => {
    const fields = ['prefix', 'suffix', 'extra']
    return (
      n +
      fields.reduce((m, f) => {
        const a = (after[i][f] ?? [])
        const b = before[i][f]
        const eq = Array.isArray(b)
          ? Array.isArray(a) && a.length === b.length && a.every((v, j) => v === String(b[j]).trim())
          : typeof b === 'string'
          ? a.join(',') === b.split(',').map((s) => s.trim()).filter(Boolean).join(',')
          : (b == null && Array.isArray(a) && a.length === 0)
        return m + (eq ? 0 : 1)
      }, 0)
    )
  }, 0)

  console.log(`Normalized ${after.length} items. Field changes applied: ${changedCount}. Dry-run=${!WRITE}.`)
  if (warnings.length) {
    console.warn(`Warnings: ${warnings.length}`)
    warnings.slice(0, 10).forEach((w) => console.warn(' -', w))
    if (warnings.length > 10) console.warn(` ... and ${warnings.length - 10} more.`)
  }

  if (WRITE) {
    const text = JSON.stringify(after, null, 2) + '\n'
    fs.writeFileSync(FILE, text, 'utf8')
    console.log(`File rewritten: ${FILE}`)
  } else {
    console.log('No changes written. Run with --write to apply.')
  }
}

try {
  main()
} catch (err) {
  console.error(err.message)
  process.exitCode = 1
}
