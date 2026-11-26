import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadDatasetFile } from '../../shared/data/loadDataset.ts'
import { InvalidIncrediblePotentialDataError, loadIncrediblePotentialData } from './data.ts'
import { buildCraftingPlan, getRingUpgrades, validateIncrediblePotentialData } from './incrediblePotential.logic.ts'

vi.mock('../../shared/data/loadDataset.ts', () => ({ loadDatasetFile: vi.fn() }))

const root = 'incredible-potential/'
const files: Record<string, unknown> = {
  'incredible-potential/manifest.json': {
    system: 'incredible-potential',
    resources: {
      baseItems: 'base-items.json',
      effects: 'effects.json',
      ingredients: 'ingredients.json',
      recipes: 'recipes.json'
    }
  },
  'item-sets/manifest.json': { system: 'item-sets', resources: { itemSets: 'item-sets.json' } },
  'item-sets/item-sets.json': [{ id: 41, name: 'Exorcist of the Silver Flame' }],
  'incredible-potential/base-items.json': [
    {
      id: 1,
      name: "Amara's Band",
      craftingRole: 'ring',
      itemType: 'Ring',
      minimumLevel: 18,
      effects: [{ effectId: 21 }, { effectId: 22 }, { effectId: 23 }, { effectId: 26 }]
    },
    { id: 2, name: 'Shard of Great Power', craftingRole: 'shard' }
  ],
  'incredible-potential/effects.json': [
    { id: 21, displayName: 'Incredible Potential', enchantments: [] },
    { id: 22, displayName: 'Exorcist of the Silver Flame', enchantments: [] },
    { id: 23, displayName: 'Wisdom +6', enchantments: [{ displayName: 'Wisdom', value: 6, bonusType: 'Enhancement' }] },
    {
      id: 24,
      displayName: 'Negative Energy Absorption: +40',
      enchantments: [
        { displayName: 'Elemental Absorption: Negative Energy', value: 0.8, operation: 'Multiply', unit: 'multiplier' },
        { displayName: 'Internal mechanic', value: 1, internal: true }
      ]
    },
    { id: 25, hidden: true, enchantments: [] },
    { id: 26, displayName: 'Confounding Enchantment', enchantments: [] }
  ],
  'incredible-potential/ingredients.json': [
    {
      id: 3,
      name: 'Shavarath Trophy of War',
      sources: [
        { kind: 'quest', name: 'Tower of Despair' },
        { kind: 'quest', name: 'Tower of Despair' }
      ]
    },
    { id: 4, name: 'Focus of Fire' },
    { id: 5, name: 'Shavarath Medium Energy Cell' },
    { id: 6, name: 'Medium Devil Scales' }
  ],
  'incredible-potential/recipes.json': [
    {
      id: 31,
      name: 'Ring Upgrade',
      stage: 'ringUpgrade',
      keeper: { itemIds: [1] },
      addEffectIds: [24, 25],
      ingredients: [
        { itemId: 2, preparationRecipeId: 32, quantity: 1 },
        { ingredientId: 3, name: 'Shavarath Trophies of War', quantity: 9 }
      ]
    },
    {
      id: 32,
      name: 'Imbued Shard',
      stage: 'shardImbuement',
      keeper: { itemId: 2 },
      ingredients: [{ ingredientId: 4, quantity: 2 }]
    },
    {
      id: 33,
      name: 'Focus of Fire',
      stage: 'component',
      outputItemId: 4,
      quantity: 1,
      ingredients: [
        { ingredientId: 5, quantity: 1 },
        { ingredientId: 6, quantity: 2 }
      ]
    },
    { id: 34, name: 'Shavarath Medium Energy Cell', stage: 'component', outputItemId: 5 },
    { id: 35, name: 'Ring Deconstruction', stage: 'ringReset' }
  ]
}

beforeEach(() => {
  vi.mocked(loadDatasetFile).mockReset()
  vi.mocked(loadDatasetFile<unknown>).mockImplementation((path) => Promise.resolve(files[path]))
})

describe('Incredible Potential data', () => {
  it('loads the published catalog and calculates a plan from IDs and quantities', async () => {
    const data = await loadIncrediblePotentialData()
    expect(vi.mocked(loadDatasetFile).mock.calls.map(([path]) => path)).toEqual([
      ...['manifest.json', 'base-items.json', 'ingredients.json', 'effects.json', 'recipes.json'].map(
        (name) => root + name
      ),
      'item-sets/manifest.json',
      'item-sets/item-sets.json'
    ])
    expect(data.rings[0]).toMatchObject({
      id: 1,
      setName: 'Exorcist of the Silver Flame',
      enchantments: [
        { name: 'Incredible Potential' },
        { name: 'Wisdom', modifier: 6, bonus: 'Enhancement' },
        { name: 'Confounding Enchantment' }
      ]
    })
    const [upgrade] = getRingUpgrades(data.recipes)
    expect(upgrade.ringIds).toEqual([1])
    expect(upgrade.added).toEqual([{ name: 'Elemental Absorption: Negative Energy', modifier: '20%' }])
    validateIncrediblePotentialData(data)

    const plan = buildCraftingPlan(upgrade, data.recipes, data.ingredients)
    expect(plan.rawMaterials).toEqual([
      { name: 'Medium Devil Scales', quantity: 4, foundIn: [] },
      { name: 'Shard of Great Power', quantity: 1, foundIn: [] },
      { name: 'Shavarath Medium Energy Cell', quantity: 2, foundIn: [] },
      { name: 'Shavarath Trophy of War', quantity: 9, foundIn: ['Tower of Despair'] }
    ])
    expect(plan.steps.map(({ name }) => name)).toEqual(['Focus of Fire', 'Imbued Shard', 'Ring Upgrade'])
  })

  it('reports when the current release is missing the package', async () => {
    vi.mocked(loadDatasetFile).mockRejectedValueOnce(new Error('Unknown dataset file'))
    await expect(loadIncrediblePotentialData()).rejects.toThrow('Unknown dataset file')
    expect(loadDatasetFile).toHaveBeenCalledTimes(1)
  })

  it('rejects invalid manifest paths', async () => {
    vi.mocked(loadDatasetFile).mockResolvedValueOnce({
      system: 'incredible-potential',
      resources: { baseItems: '../base-items.json' }
    })
    await expect(loadIncrediblePotentialData()).rejects.toThrow(InvalidIncrediblePotentialDataError)
    expect(loadDatasetFile).toHaveBeenCalledTimes(1)
  })
})
