// @vitest-environment jsdom

import LZString from 'lz-string'
import { afterEach, describe, expect, it } from 'vitest'
import { validateEssenceCraftingDataset } from './data.ts'
import { EQUIPMENT_SLOTS } from './equipment.ts'
import { LEGACY_V3_AUGMENT_NAMES, LEGACY_V3_EFFECT_NAMES } from './legacyPermalinkV3Data.ts'
import {
  buildEssenceCraftingPermalinkUrl,
  createEssenceCraftingPermalinkV4Payload,
  decodeEssenceCraftingPermalink,
  encodeEssenceCraftingPermalink,
  readEssenceCraftingPermalinkFromSearch,
  removeEssenceCraftingPermalinkFromCurrentUrl
} from './permalink.ts'
import { hydrateEssencePlan } from './plannerTransitions.ts'
import { createEssenceCraftingTestPayload } from './test-fixture.ts'

const createPermalinkData = () => {
  const payload = createEssenceCraftingTestPayload()
  payload.recipes.push(
    {
      id: 'recipe-legacy-prefix-bound',
      kind: 'enhancement-shard',
      sourceRecipeId: '777',
      binding: 'bound',
      craftingLevel: 10,
      requirements: [{ kind: 'ingredient', ingredientId: 'ingredient-essence', quantity: 1 }]
    },
    {
      id: 'recipe-legacy-prefix-unbound',
      kind: 'enhancement-shard',
      sourceRecipeId: '778',
      binding: 'unbound',
      craftingLevel: 20,
      requirements: [{ kind: 'ingredient', ingredientId: 'ingredient-essence', quantity: 2 }]
    }
  )
  payload.enhancements.push({
    id: 'enhancement-legacy-prefix',
    displayName: 'Legacy Prefix',
    minimumItemLevel: 1,
    placements: [{ position: 'prefix', itemCategoryIds: ['weapon'] }],
    effects: [{ id: 'effect-legacy-prefix', displayName: 'Legacy Prefix Effect' }],
    recipes: {
      boundRecipeId: 'recipe-legacy-prefix-bound',
      unboundRecipeId: 'recipe-legacy-prefix-unbound'
    }
  })
  payload.augments[0].displayName = 'Diamond of Charisma +1'
  return validateEssenceCraftingDataset(payload)
}

const createRepresentativePlan = () => {
  const data = createPermalinkData()
  const plan = hydrateEssencePlan(data, {
    masterMinimumLevel: 2,
    activeSlotIds: ['ring-1', 'main-hand', 'armor'],
    collapsedSlotIds: ['ring-1'],
    itemsBySlotId: {
      'main-hand': {
        prefixEnhancementId: 'enhancement-split-prefix',
        suffixEnhancementId: 'enhancement-level-two-suffix',
        extraEnhancementId: null,
        hasCannithMark: false,
        minimumLevelOverride: 2,
        augmentSlots: [
          {
            augmentSlotTypeId: 'red',
            augmentId: 'augment-red-charisma',
            selectedEffectNames: ['Charisma'],
            filterMode: 'and'
          }
        ]
      },
      armor: {
        prefixEnhancementId: null,
        suffixEnhancementId: 'enhancement-display-fixed',
        extraEnhancementId: null,
        hasCannithMark: false,
        minimumLevelOverride: null,
        augmentSlots: []
      },
      'ring-1': {
        prefixEnhancementId: null,
        suffixEnhancementId: 'enhancement-split-prefix',
        extraEnhancementId: 'enhancement-ring-extra',
        hasCannithMark: true,
        minimumLevelOverride: null,
        augmentSlots: []
      }
    }
  })
  return { data, plan }
}

const compress = (payload: unknown): string => LZString.compressToEncodedURIComponent(JSON.stringify(payload))

afterEach(() => {
  window.history.replaceState({}, '', '/')
})

describe('Essence Crafting permalink v4', () => {
  it('round-trips multiple items, a split prefix, Mark state, collapse state, and augments', () => {
    const { data, plan } = createRepresentativePlan()

    const decoded = decodeEssenceCraftingPermalink(data, encodeEssenceCraftingPermalink(data, plan))

    expect(decoded).toEqual({ ok: true, version: 4, plan })
  })

  it('stores stable domain IDs and no display-name or full-record indexes', () => {
    const { data, plan } = createRepresentativePlan()

    const payload = createEssenceCraftingPermalinkV4Payload(data, plan)
    const json = JSON.stringify(payload)

    expect(payload.v).toBe(4)
    expect(payload.i[0][0]).toBe('main-hand')
    expect(payload.i[0][3]).toBe('enhancement-split-prefix')
    expect(payload.i[0][6][0]).toEqual(['red', 'augment-red-charisma', 1, ['effect-charisma']])
    expect(json).not.toContain('Split Prefix Test')
    expect(json).not.toContain('Diamond of Charisma +1')
    expect(json).not.toContain('Charisma')
  })

  it('encodes deterministically from canonical stable-ID ordering', () => {
    const { data, plan } = createRepresentativePlan()
    const reorderedPlan = {
      ...plan,
      activeSlotIds: [...plan.activeSlotIds].reverse(),
      collapsedSlotIds: [...plan.collapsedSlotIds].reverse(),
      itemsBySlotId: {
        'ring-1': plan.itemsBySlotId['ring-1'],
        armor: plan.itemsBySlotId.armor,
        'main-hand': plan.itemsBySlotId['main-hand']
      }
    }

    expect(encodeEssenceCraftingPermalink(data, reorderedPlan)).toBe(encodeEssenceCraftingPermalink(data, plan))
  })

  it('drops unknown current IDs through transition hydration', () => {
    const data = createPermalinkData()
    const encoded = compress({
      v: 4,
      ml: 2,
      c: ['main-hand', 'unknown-slot'],
      i: [
        [
          'main-hand',
          2,
          0,
          'unknown-enhancement',
          '',
          '',
          [
            ['red', 'unknown-augment', 0, ['unknown-effect']],
            ['unknown-slot-type', '', 0]
          ]
        ],
        ['unknown-slot', 0, 0, '', '', '', []]
      ]
    })

    const decoded = decodeEssenceCraftingPermalink(data, encoded)

    expect(decoded.ok).toBe(true)
    if (!decoded.ok) return
    expect(decoded.plan.activeSlotIds).toEqual(['main-hand'])
    expect(decoded.plan.collapsedSlotIds).toEqual(['main-hand'])
    expect(decoded.plan.itemsBySlotId['main-hand']).toMatchObject({
      prefixEnhancementId: null,
      augmentSlots: [
        {
          augmentSlotTypeId: 'red',
          augmentId: null,
          selectedEffectNames: []
        }
      ]
    })
  })

  it('rejects unsupported versions and malformed payloads', () => {
    const data = createPermalinkData()

    expect(decodeEssenceCraftingPermalink(data, compress({ v: 5, ml: 2, c: [], i: [] }))).toEqual({
      ok: false,
      reason: 'unsupported-version'
    })
    expect(decodeEssenceCraftingPermalink(data, 'not-a-compressed-payload')).toEqual({
      ok: false,
      reason: 'malformed-payload'
    })
    expect(decodeEssenceCraftingPermalink(data, compress({ v: 4, ml: 2, c: 'wrong', i: [] }))).toEqual({
      ok: false,
      reason: 'malformed-payload'
    })
  })

  it('keeps a realistic all-slot plan within a reasonable URL length', () => {
    const { data, plan } = createRepresentativePlan()
    const allSlotPlan = hydrateEssencePlan(data, {
      ...plan,
      activeSlotIds: EQUIPMENT_SLOTS.map(({ id }) => id),
      itemsBySlotId: Object.fromEntries(
        EQUIPMENT_SLOTS.map(({ id }) => [
          id,
          plan.itemsBySlotId[id] ?? {
            prefixEnhancementId: null,
            suffixEnhancementId: null,
            extraEnhancementId: null,
            hasCannithMark: false,
            minimumLevelOverride: null,
            augmentSlots: []
          }
        ])
      )
    })

    const url = buildEssenceCraftingPermalinkUrl(
      encodeEssenceCraftingPermalink(data, allSlotPlan),
      'https://yourddo.com/current-page'
    )

    expect(url.length).toBeLessThan(2_000)
  })
})

describe('legacy Essence Crafting permalink v3', () => {
  it('decodes representative v3 recipe, slot, augment, mode, and effect indexes to current IDs', () => {
    const data = createPermalinkData()
    const encoded = compress({
      v: 3,
      ml: 2,
      a: [0, 13],
      c: [13],
      i: [
        [0, 2, 0, 777, 0, 0, [[1, 54, 1, [31]]]],
        [13, 0, 0, 0, 0, 0, []]
      ]
    })

    const decoded = decodeEssenceCraftingPermalink(data, encoded)

    expect(decoded.ok).toBe(true)
    if (!decoded.ok) return
    expect(decoded.version).toBe(3)
    expect(decoded.plan.activeSlotIds).toEqual(['main-hand', 'ring-1'])
    expect(decoded.plan.collapsedSlotIds).toEqual(['ring-1'])
    expect(decoded.plan.itemsBySlotId['main-hand']).toMatchObject({
      minimumLevelOverride: 2,
      prefixEnhancementId: 'enhancement-legacy-prefix',
      augmentSlots: [
        {
          augmentSlotTypeId: 'red',
          augmentId: 'augment-red-charisma',
          selectedEffectNames: ['Charisma'],
          filterMode: 'and'
        }
      ]
    })
  })

  it('uses frozen indexes that do not depend on current dataset sorting', () => {
    expect(LEGACY_V3_AUGMENT_NAMES[53]).toBe('Diamond of Charisma +1')
    expect(LEGACY_V3_EFFECT_NAMES[31]).toBe('Charisma')

    const data = createPermalinkData()
    const decoded = decodeEssenceCraftingPermalink(
      data,
      compress({ v: 3, ml: 2, a: [0], c: [], i: [[0, 2, 0, 0, 0, 0, [[1, 54, 0]]]] })
    )

    expect(decoded.ok && decoded.plan.itemsBySlotId['main-hand']?.augmentSlots[0]?.augmentId).toBe(
      'augment-red-charisma'
    )
  })

  it('safely drops removed legacy enhancements and augments', () => {
    const data = createPermalinkData()
    const decoded = decodeEssenceCraftingPermalink(
      data,
      compress({ v: 3, ml: 2, a: [0], c: [], i: [[0, 2, 0, 999, 0, 0, [[1, 415, 0]]]] })
    )

    expect(decoded.ok).toBe(true)
    if (!decoded.ok) return
    expect(decoded.plan.itemsBySlotId['main-hand']).toMatchObject({
      prefixEnhancementId: null,
      augmentSlots: [{ augmentId: null }]
    })
  })
})

describe('Essence Crafting permalink URL behavior', () => {
  it('reads cc from normal search and generates the stable target path', () => {
    expect(readEssenceCraftingPermalinkFromSearch('?view=compact&cc=encoded-value')).toBe('encoded-value')
    expect(buildEssenceCraftingPermalinkUrl('encoded-value', 'https://yourddo.com/other?view=compact')).toBe(
      'https://yourddo.com/essence-crafting?cc=encoded-value'
    )
  })

  it('removes only cc with replace semantics and preserves unrelated query parameters', () => {
    window.history.replaceState({}, '', '/essence-crafting?view=compact&cc=encoded-value&theme=dark#details')
    const replaceState = window.history.replaceState.bind(window.history)
    let replacements = 0
    window.history.replaceState = (...args) => {
      replacements += 1
      replaceState(...args)
    }

    expect(removeEssenceCraftingPermalinkFromCurrentUrl()).toBe(true)

    expect(replacements).toBe(1)
    expect(window.location.pathname).toBe('/essence-crafting')
    expect(window.location.search).toBe('?view=compact&theme=dark')
    expect(window.location.hash).toBe('#details')
    window.history.replaceState = replaceState
  })
})
