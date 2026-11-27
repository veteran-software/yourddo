import LZString from 'lz-string'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadScopedAugmentCatalog } from '../gearPlanner/itemCatalog'
import { loadDatasetFile } from '../../shared/data/loadDataset.ts'
import { InvalidEssenceCraftingDataError, loadEssenceCraftingData, validateEssenceCraftingDataset } from './data.ts'
import { createEssenceCraftingTestPayload } from './test-fixture.ts'
import { getAvailableEnhancementChoices } from './enhancementEligibility'
import { decodeEssenceCraftingPermalink, encodeEssenceCraftingPermalink } from './permalink'
import { resolveEnhancementEffects } from './enhancementEffects'
import { hydrateEssencePlan } from './plannerTransitions'

vi.mock('../gearPlanner/itemCatalog', () => ({ loadScopedAugmentCatalog: vi.fn() }))
vi.mock('../../shared/data/loadDataset.ts', () => ({
  loadDatasetFile: vi.fn()
}))

const required = <T>(value: T | undefined): T => {
  if (value === undefined) throw new Error('Expected fixture value')
  return value
}

function mockNativeShards(withCrosswalk = false) {
  const recipe = {
    recipeId: 23,
    level: 20,
    essence: 55,
    collectible: [{ name: 'Small Wooden Idol', quantity: 7 }],
    minItemLevel: 1,
    prefix: ['Weapon'],
    suffix: [],
    extra: ['Head'],
    placementRules: { extra: [{ slots: ['Head'], minItemLevel: 2 }] },
    enchantments: [
      {
        name: 'Dodge',
        bonus: 'Enhancement',
        modifiers: [
          { level: 1, value: 0.005 },
          { level: 2, value: 0.04 },
          { level: 4, value: 0.06 }
        ]
      }
    ]
  }
  vi.mocked(loadDatasetFile)
    .mockResolvedValueOnce({
      system: 'essence',
      resources: { shards: 'essenceCrafting.v2.json', ...(withCrosswalk && { idCrosswalk: 'id-crosswalk.json' }) }
    })
    .mockResolvedValueOnce([
      {
        name: 'Native Shard Test',
        bound: recipe,
        unbound: { ...recipe, recipeId: 24, extra: [], placementRules: {} }
      }
    ])
}

describe('Essence Crafting data', () => {
  beforeEach(() => {
    vi.mocked(loadDatasetFile).mockReset()
    vi.mocked(loadScopedAugmentCatalog).mockReset()
  })

  it('uses native costs, effects and placement floors with the saved enhancement ID', async () => {
    mockNativeShards()
    const data = await loadEssenceCraftingData()
    expect(loadDatasetFile).toHaveBeenNthCalledWith(2, 'essence/essenceCrafting.v2.json')
    const id = 'enhancement-1829b895dd926167'
    expect(data.indexes.enhancementById.get(id)?.recipes.boundRecipeId).toBe('recipe-source-23')
    expect(data.recipes.find((r) => r.id === 'recipe-source-23')?.requirements.map(({ quantity }) => quantity)).toEqual(
      [55, 7]
    )
    expect(resolveEnhancementEffects(data, id, 1).effects[0].modifier).toMatchObject({
      value: 0.5,
      representation: 'percentage'
    })
    expect(resolveEnhancementEffects(data, id, 3).effects[0].modifier.status).toBe('no-match-for-item-level')
    expect(resolveEnhancementEffects(data, id, 4).effects[0].modifier).toMatchObject({ value: 6 })
    expect(getAvailableEnhancementChoices(data, 'helmet', 'extra', 1)).toEqual([])
    expect(getAvailableEnhancementChoices(data, 'helmet', 'extra', 2).map((row) => row.id)).toEqual([id])
    const restored = hydrateEssencePlan(data, {
      masterMinimumLevel: 1,
      activeSlotIds: ['main-hand'],
      itemsBySlotId: { 'main-hand': { prefixEnhancementId: id } }
    })
    expect(restored.itemsBySlotId['main-hand']?.prefixEnhancementId).toBe(id)
  })

  it('keeps minimum-level and Mark costs when the shard package is the only Essence source', async () => {
    mockNativeShards()
    const data = await loadEssenceCraftingData()

    expect(loadDatasetFile).toHaveBeenCalledTimes(2)
    expect(loadDatasetFile).toHaveBeenNthCalledWith(1, 'essence/manifest.json')
    expect(data.rules.extraAffix.markRequirement.quantity).toBe(1)
    expect(data.indexes.minimumLevelRecipeByLevel.get(1)?.bound).toMatchObject({
      craftingLevel: 1,
      requirements: [{ quantity: 10 }]
    })
    for (const [level, quantities] of [
      [20, [500]],
      [21, [520, 5]],
      [26, [620, 10]],
      [36, [820, 15]]
    ] as const) {
      expect(
        data.indexes.minimumLevelRecipeByLevel.get(level)?.unbound.requirements.map(({ quantity }) => quantity)
      ).toEqual(quantities)
    }
  })

  it('retains the saved augment ID and uses the public catalog for display and filter labels', async () => {
    mockNativeShards()
    const entry = {
      id: 10,
      name: 'Ruby of Charisma +1',
      minimumLevel: 2,
      slotTypes: ['Red'],
      presentation: [],
      effectsAdded: [],
      searchLabels: [],
      fallbackDescription: 'A charged gem.'
    }
    vi.mocked(loadScopedAugmentCatalog).mockResolvedValueOnce({
      entries: [entry],
      names: ['Eldritch Blast: Dice', 'Eldritch Blast: Pact Dice']
    })
    const data = await loadEssenceCraftingData()
    expect(data.indexes.augmentById.get('augment-4834aeaf0182f92b')).toMatchObject({
      scoped: { fallbackDescription: 'A charged gem.' },
      effects: [],
      filterEffects: []
    })
    expect(data.enchantmentNames).toEqual(['Eldritch Blast: Dice', 'Eldritch Blast: Pact Dice'])
  })

  it('uses the optional CDN crosswalk only for v3 augments and resolves duplicate names by item ID', async () => {
    mockNativeShards(true)
    const sapphire = {
      name: 'Sapphire of Good Luck +1',
      slotTypes: ['Blue'],
      presentation: [],
      effectsAdded: [],
      searchLabels: []
    }
    vi.mocked(loadScopedAugmentCatalog).mockResolvedValueOnce({
      names: [],
      entries: [
        { ...sapphire, id: 1879270644, minimumLevel: 4 },
        { ...sapphire, id: 1879171477, minimumLevel: 12 }
      ]
    })
    const data = await loadEssenceCraftingData()
    const emptyPlan = hydrateEssencePlan(data, {})
    await decodeEssenceCraftingPermalink(data, encodeEssenceCraftingPermalink(data, emptyPlan))
    expect(loadDatasetFile).toHaveBeenCalledTimes(2)

    const encoded = LZString.compressToEncodedURIComponent(
      JSON.stringify({
        v: 3,
        ml: 12,
        a: [4],
        c: [],
        i: [[4, 0, 0, 0, 0, 0, [[2, 899, 0, []]]]]
      })
    )
    vi.mocked(loadDatasetFile).mockRejectedValueOnce(new Error('Crosswalk unavailable'))
    const fallback = await decodeEssenceCraftingPermalink(data, encoded)
    expect(fallback).toMatchObject({
      ok: true,
      plan: { itemsBySlotId: { armor: { augmentSlots: [{ augmentId: null }] } } }
    })

    const legacyId = 'augment-4a8d5bc634a20e0c'
    vi.mocked(loadDatasetFile).mockResolvedValueOnce({
      schemaVersion: 1,
      augments: { [legacyId]: { id: legacyId, name: sapphire.name, itemId: 1879171477 } }
    })
    const decoded = await decodeEssenceCraftingPermalink(data, encoded)
    expect(loadDatasetFile).toHaveBeenLastCalledWith('essence/id-crosswalk.json')
    expect(decoded).toMatchObject({
      ok: true,
      plan: { itemsBySlotId: { armor: { augmentSlots: [{ augmentId: legacyId }] } } }
    })
  })

  it('decodes a valid fixture and builds only the required indexes', () => {
    const data = validateEssenceCraftingDataset(createEssenceCraftingTestPayload())

    expect(data.indexes.ingredientById.get('ingredient-mark')?.displayName).toBe('Mark of House Cannith')
    expect(data.indexes.augmentById.get('augment-red-charisma')?.minimumItemLevel).toBe(2)
    expect(data.indexes.minimumLevelRecipeByLevel.get(2)?.unbound.id).toBe('recipe-minimum-level-unbound-02')
  })

  it('preserves a split-prefix placement record with multiple effects', () => {
    const data = validateEssenceCraftingDataset(createEssenceCraftingTestPayload())
    const enhancement = required(data.indexes.enhancementById.get('enhancement-split-prefix'))

    expect(enhancement.placements.map(({ position }) => position)).toEqual(['prefix', 'suffix'])
    expect(enhancement.effects.map(({ id }) => id)).toEqual(['effect-light', 'effect-implement'])
  })

  it('decodes the relevant augment record by its stable ID', () => {
    const data = validateEssenceCraftingDataset(createEssenceCraftingTestPayload())

    expect(data.indexes.augmentById.get('augment-red-charisma')).toMatchObject({
      augmentTypeId: 'red',
      minimumItemLevel: 2,
      effects: [{ id: 'effect-charisma' }]
    })
  })

  it.each([
    [
      'an unsupported domain schema',
      (payload: ReturnType<typeof createEssenceCraftingTestPayload>) => {
        payload.schemaVersion = 2
      }
    ],
    [
      'duplicate IDs',
      (payload: ReturnType<typeof createEssenceCraftingTestPayload>) => {
        payload.ingredients.push({ id: 'ingredient-mark', displayName: 'Duplicate Mark' })
      }
    ],
    [
      'missing references',
      (payload: ReturnType<typeof createEssenceCraftingTestPayload>) => {
        required(required(payload.recipes.at(0)).requirements.at(0)).ingredientId = 'ingredient-missing'
      }
    ],
    [
      'invalid enums',
      (payload: ReturnType<typeof createEssenceCraftingTestPayload>) => {
        required(required(payload.enhancements.at(0)).placements.at(0)).position = 'unknown'
      }
    ],
    [
      'invalid quantities',
      (payload: ReturnType<typeof createEssenceCraftingTestPayload>) => {
        required(required(payload.recipes.at(0)).requirements.at(0)).quantity = 0
      }
    ],
    [
      'missing minimum-level coverage',
      (payload: ReturnType<typeof createEssenceCraftingTestPayload>) => {
        payload.minimumLevelShards = payload.minimumLevelShards.filter(({ itemLevel }) => itemLevel !== 2)
      }
    ]
  ])('rejects %s', (_label, mutate) => {
    const payload = createEssenceCraftingTestPayload()
    mutate(payload)

    expect(() => validateEssenceCraftingDataset(payload)).toThrow(InvalidEssenceCraftingDataError)
  })

  it('does not mutate the published payload', () => {
    const payload = createEssenceCraftingTestPayload()
    const before = JSON.stringify(payload)

    validateEssenceCraftingDataset(payload)

    expect(JSON.stringify(payload)).toBe(before)
  })

  it('propagates loader rejection unchanged', async () => {
    const cause = new Error('CDN unavailable')
    vi.mocked(loadDatasetFile).mockRejectedValueOnce(cause)

    await expect(loadEssenceCraftingData()).rejects.toBe(cause)
  })
})
