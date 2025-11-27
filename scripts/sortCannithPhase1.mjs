#!/usr/bin/env node
/**
 * Safe sorter for Cannith Crafting Phase 1 dataset.
 *
 * What it does:
 * - Loads src/data/cannithCrafting/cannithEnhancements.phase1.json
 * - Validates the structure (array of objects with a string "name")
 * - Performs a stable, case-insensitive sort by name
 * - Verifies that the multiset of items (content) is unchanged (no data loss)
 * - Dry-run by default: prints summary without writing
 * - Use --write to actually rewrite the file (pretty-printed, 2 spaces)
 */

import fs from 'node:fs'
import path from 'node:path'

const FILE = path.join('src', 'data', 'cannithCrafting', 'cannithEnhancements.phase1.json')

const args = new Set(process.argv.slice(2))
const WRITE = args.has('--write')

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`
  }
  if (isPlainObject(value)) {
    const keys = Object.keys(value).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
    return `{${keys.map((k) => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',')}}`
  }
  // primitives
  return JSON.stringify(value)
}

function readJson(file) {
  const text = fs.readFileSync(file, 'utf8')
  try {
    return JSON.parse(text)
  } catch (err) {
    // Use a specific error type for parse failures to aid diagnostics
    const e = new SyntaxError(`Failed to parse JSON: ${file}\n${err.message}`)
    e.cause = err
    throw e
  }
}

function validateArray(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('Top-level JSON is not an array')
  }
  arr.forEach((it, idx) => {
    if (!isPlainObject(it)) throw new TypeError(`Item at index ${idx} is not an object`)
    if (typeof it.name !== 'string' || !it.name) {
      throw new TypeError(
        `Item at index ${idx} has missing/invalid name: ${JSON.stringify(it && it.name)}`
      )
    }
  })
}

function makeMultiset(arr) {
  // Use a deterministic string of each element (sorted keys) to compare content irrespective of order
  const map = new Map()
  for (const el of arr) {
    const key = stableStringify(el)
    map.set(key, (map.get(key) || 0) + 1)
  }
  return map
}

function multisetEqual(a, b) {
  if (a.size !== b.size) return false
  for (const [k, v] of a) {
    if (b.get(k) !== v) return false
  }
  return true
}

function main() {
  const before = readJson(FILE)
  validateArray(before)

  const withIndex = before.map((item, index) => ({ index, item }))
  const sorted = [...withIndex].sort((A, B) => {
    const an = String(A.item.name)
    const bn = String(B.item.name)
    const cmp = an.localeCompare(bn, 'en', { sensitivity: 'base' })
    if (cmp !== 0) return cmp
    return A.index - B.index // stability
  })
  const after = sorted.map((x) => x.item)

  // Validate content unchanged
  const setBefore = makeMultiset(before)
  const setAfter = makeMultiset(after)
  const sameContent = multisetEqual(setBefore, setAfter)

  // Prefer positive condition branch for readability
  if (sameContent) {
    // Summaries
    const namesBefore = before.slice(0, 10).map((x) => x.name)
    const namesAfter = after.slice(0, 10).map((x) => x.name)

    console.log(`Validated ${before.length} items. Dry-run=${!WRITE}.`)
    if (namesBefore.join('|') !== namesAfter.join('|')) {
      console.log('First 10 before:', namesBefore.join(', '))
      console.log('First 10 after :', namesAfter.join(', '))
    } else {
      console.log('Order already alphabetical (first 10 unchanged).')
    }

    if (WRITE) {
      const text = JSON.stringify(after, null, 2) + '\n'
      fs.writeFileSync(FILE, text, 'utf8')
      console.log(`File rewritten: ${FILE}`)
    } else {
      console.log('No changes written. Run with --write to apply.')
    }
    return
  }

  console.error('ERROR: Content mismatch after sorting. Aborting without writing.')
  process.exitCode = 2
}

try {
  main()
} catch (err) {
  console.error(err.message)
  process.exitCode = 1
}
