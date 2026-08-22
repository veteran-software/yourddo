import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadDatasetFile } from '../../shared/data/loadDataset.ts'
import {
  InvalidHeroicGreenSteelDataError,
  loadHeroicGreenSteelInitialData,
  loadHeroicGreenSteelRecipeData,
  loadHeroicGreenSteelTier2Data,
  loadHeroicGreenSteelTier3Data,
  parseBaseItems,
  parseEffects,
  parseHeroicGreenSteelManifest,
  parseTierOptions,
  resetHeroicGreenSteelDataCache
} from './data.ts'

vi.mock('../../shared/data/loadDataset.ts', () => ({ loadDatasetFile: vi.fn() }))

const manifest = {
  schemaVersion: 1,
  system: 'heroic-green-steel',
  sourceVersion: 'test',
  devices: {
    base: { id: 1, name: 'Fecundity' },
    tier1: { id: 2, name: 'Invasion' },
    tier2: { id: 3, name: 'Subjugation' },
    tier3: { id: 4, name: 'Devastation' }
  },
  resources: {
    baseItems: 'base-items.json',
    effects: 'effects.json',
    spells: 'spells.json',
    ingredients: 'ingredients.json',
    tiers: {
      tier1: 'tiers/tier1.json',
      tier2: 'tiers/tier2.json',
      tier3Basic: 'tiers/tier3-basic.json',
      tier3Focused: 'tiers/tier3-focused.json'
    },
    recipes: {
      base: 'recipes/base.json',
      tier1: 'recipes/tier1.json',
      tier2: 'recipes/tier2.json',
      tier3: 'recipes/tier3.json'
    }
  }
}

const baseItems = [
  { id: 10, name: 'Green Steel Sword', description: 'Sword', recipeId: 100, type: 'weapon', weaponType: 'Sword' }
]
const effects = [{ id: 20, displayName: 'Keen', description: 'Keen', enchantments: [], procs: [] }]
const tier1 = [
  {
    id: 30,
    name: 'Tier 1',
    type: 'weapon',
    essence: 'Material',
    focus: 'Earth',
    gem: 'Dominion',
    effectIds: [20],
    recipeId: 101
  }
]
const tier2 = [{ ...tier1[0], id: 31, aspect: 'Earth', requiresFocus: 'Earth', spellId: 40, recipeId: 102 }]
const tier3Basic = [{ ...tier1[0], id: 32, recipeId: 103 }]
const tier3Focused = [{ ...tier1[0], id: 33, requiresAspect: 'Earth', shardType: 'single', recipeId: 104 }]
const spells = [{ id: 40, name: 'Stone Skin', description: 'Stone', casterLevel: 16, charges: 2, rechargePerDay: 2 }]
const ingredients = [{ id: 50, name: 'Stone', description: 'A stone' }]
const recipe = { id: 100, name: 'Sword recipe', device: 'base', ingredients: [{ ingredientId: 50, quantity: 1 }] }

const payloads: Record<string, unknown> = {
  'heroic-green-steel/manifest.json': manifest,
  'heroic-green-steel/base-items.json': baseItems,
  'heroic-green-steel/effects.json': effects,
  'heroic-green-steel/spells.json': spells,
  'heroic-green-steel/ingredients.json': ingredients,
  'heroic-green-steel/tiers/tier1.json': tier1,
  'heroic-green-steel/tiers/tier2.json': tier2,
  'heroic-green-steel/tiers/tier3-basic.json': tier3Basic,
  'heroic-green-steel/tiers/tier3-focused.json': tier3Focused,
  'heroic-green-steel/recipes/base.json': [recipe],
  'heroic-green-steel/recipes/tier1.json': [{ ...recipe, id: 101, device: 'tier1' }],
  'heroic-green-steel/recipes/tier2.json': [{ ...recipe, id: 102, device: 'tier2' }],
  'heroic-green-steel/recipes/tier3.json': [{ ...recipe, id: 103, device: 'tier3' }]
}

const mockFiles = () => {
  vi.mocked(loadDatasetFile).mockImplementation((path) => Promise.resolve(payloads[path]))
}

afterEach(() => {
  resetHeroicGreenSteelDataCache()
  vi.clearAllMocks()
})

describe('Heroic Green Steel data', () => {
  it('validates the manifest schema, system, devices, and relative paths', () => {
    expect(parseHeroicGreenSteelManifest(manifest).resources.tiers.tier3Focused).toBe('tiers/tier3-focused.json')
    expect(() => parseHeroicGreenSteelManifest({ ...manifest, schemaVersion: 2 })).toThrow('schemaVersion 1')
    expect(() => parseHeroicGreenSteelManifest({ ...manifest, system: 'other' })).toThrow('unexpected manifest system')
    expect(() =>
      parseHeroicGreenSteelManifest({
        ...manifest,
        resources: { ...manifest.resources, baseItems: '../base-items.json' }
      })
    ).toThrow('invalid base items resource path')
  })

  it('rejects malformed resource payloads and mechanics', () => {
    expect(() => parseBaseItems([{ ...baseItems[0], id: Number.NaN }])).toThrow(InvalidHeroicGreenSteelDataError)
    expect(() => parseTierOptions([{ ...tier2[0], requiresFocus: undefined }], 'tier2')).toThrow(
      'compatibility fields missing'
    )
    expect(() => parseEffects([{ ...effects[0], enchantments: [{ type: 'invented-mechanic' }] }])).toThrow(
      'unknown mechanic type'
    )
  })

  it('preserves structured outcome eligibility for the presentation layer', () => {
    const parsed = parseEffects([
      {
        ...effects[0],
        procs: [
          {
            trigger: 'onHit',
            outcomes: [
              {
                type: 'damage',
                damageType: 'Bane',
                dice: { count: 1, sides: 4 },
                traits: ['Bleed'],
                targetEligibility: {
                  excludedCreatureTraits: ['Incorporeal'],
                  includedGenus: ['Outsider'],
                  excludedGenus: ['Undead'],
                  unknownIncludedGenusMask: '0x0000000000000008',
                  unknownExcludedGenusMask: '0x0000002000000000'
                }
              }
            ]
          }
        ]
      }
    ])

    expect(parsed[0].procs[0].outcomes[0].targetEligibility).toEqual({
      excludedCreatureTraits: ['Incorporeal'],
      includedGenus: ['Outsider'],
      excludedGenus: ['Undead'],
      unknownIncludedGenusMask: '0x0000000000000008',
      unknownExcludedGenusMask: '0x0000002000000000'
    })
  })

  it('loads only manifest, base items, effects, and Tier 1 initially', async () => {
    mockFiles()
    const data = await loadHeroicGreenSteelInitialData()

    expect(data.baseItemById.get(10)?.name).toBe('Green Steel Sword')
    expect(data.effectById.get(20)?.displayName).toBe('Keen')
    expect(vi.mocked(loadDatasetFile).mock.calls.map(([path]) => path)).toEqual([
      'heroic-green-steel/manifest.json',
      'heroic-green-steel/base-items.json',
      'heroic-green-steel/effects.json',
      'heroic-green-steel/tiers/tier1.json'
    ])
  })

  it('loads and caches the Tier 2 and Tier 3 boundaries independently', async () => {
    mockFiles()
    const firstTier2 = loadHeroicGreenSteelTier2Data()
    const secondTier2 = loadHeroicGreenSteelTier2Data()
    expect(firstTier2).toBe(secondTier2)
    expect((await firstTier2).spellById.get(40)?.name).toBe('Stone Skin')
    expect(vi.mocked(loadDatasetFile).mock.calls.map(([path]) => path)).not.toContain(
      'heroic-green-steel/tiers/tier3-basic.json'
    )

    const loadedTier3 = await loadHeroicGreenSteelTier3Data()
    expect(loadedTier3.tier3FocusedById.get(33)?.shardType).toBe('single')
  })

  it('loads the recipe bundle once for both workspace consumers', async () => {
    mockFiles()
    const [first, second] = await Promise.all([loadHeroicGreenSteelRecipeData(), loadHeroicGreenSteelRecipeData()])

    expect(first).toBe(second)
    expect(first.recipes).toHaveLength(4)
    expect(vi.mocked(loadDatasetFile).mock.calls.filter(([path]) => path.includes('/recipes/'))).toHaveLength(4)
    expect(vi.mocked(loadDatasetFile).mock.calls.filter(([path]) => path.endsWith('/ingredients.json'))).toHaveLength(1)
  })
})
