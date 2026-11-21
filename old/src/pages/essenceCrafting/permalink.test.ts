import LZString from 'lz-string'
import { describe, expect, it } from 'vitest'
import { encodeEssencePermalink, tryDecodeEssencePermalink } from './permalink.ts'
import { ESSENCE_CRAFTING_TEST_DATA } from './testFixtures.ts'
import type { ItemState } from './types.ts'

const dataset = ESSENCE_CRAFTING_TEST_DATA

describe('Essence Crafting permalink v3', () => {
  it('round-trips enhancements by recipe ID', () => {
    const item: ItemState = {
      slotKey: 'necklace',
      prefix: null,
      suffix: 'False Life',
      extra: null,
      hasCannithMark: false,
      augmentSlots: [],
      minLevelOverride: 14
    }

    const encoded = encodeEssencePermalink(
      {
        items: { necklace: item },
        activeKeys: ['necklace'],
        collapsedKeys: ['necklace'],
        masterMinLevel: 1
      },
      dataset
    )
    const payload = JSON.parse(LZString.decompressFromEncodedURIComponent(encoded)) as {
      v: number
      i: number[][]
    }
    const falseLife = dataset.find((entry) => entry.name === 'False Life')

    expect(payload.v).toBe(3)
    expect(payload.i[0][4]).toBe(falseLife?.bound.recipeId)

    const decoded = tryDecodeEssencePermalink(encoded, dataset)
    expect(decoded.ok).toBe(true)
    if (decoded.ok) {
      expect(decoded.data.items.necklace.suffix).toBe('False Life')
      expect(decoded.data.items.necklace.minLevelOverride).toBe(14)
      expect(decoded.data.collapsedKeys).toEqual(['necklace'])
    }
  })

  it('rejects legacy v2 payloads', () => {
    const encoded = LZString.compressToEncodedURIComponent(JSON.stringify({ v: 2, ml: 1, a: [], c: [], i: [] }))

    expect(tryDecodeEssencePermalink(encoded, dataset)).toEqual({ ok: false })
  })
})
