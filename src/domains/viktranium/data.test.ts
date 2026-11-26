import { describe, expect, it, vi } from 'vitest'
import { loadScopedAugmentCatalog } from '../gearPlanner/itemCatalog'
import { loadDatasetFile } from '../../shared/data/loadDataset'
import { InvalidViktraniumDataError, loadViktraniumData } from './data'
import { createViktraniumTestData, createViktraniumTestRecords } from './test-fixture'

vi.mock('../gearPlanner/itemCatalog', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../gearPlanner/itemCatalog')>()),
  loadScopedAugmentCatalog: vi.fn()
}))
vi.mock('../../shared/data/loadDataset', () => ({ loadDatasetFile: vi.fn(), hasDatasetFile: vi.fn() }))

const device = { id: 10, name: 'Heroic Viktranium Experiment Crafting' }
const viktraniumFiles = new Map<string, unknown>([
  [
    'viktranium/manifest.json',
    {
      system: 'viktranium',
      devices: { heroic: device },
      resources: {
        baseItems: 'base-items.json',
        augments: 'augments.json',
        effects: 'effects.json',
        spells: 'spells.json',
        recipes: 'recipes.json',
        ingredients: 'ingredients.json'
      }
    }
  ],
  [
    'viktranium/base-items.json',
    [
      {
        id: 20,
        name: 'Calamitous Bastard Sword',
        itemType: 'Bastard Sword',
        minimumLevel: 8,
        baseStats: {},
        iconId: 21,
        augmentSlots: [{ name: 'Lamordia: Dolorous Slot (Weapon)', types: ['Lamordia_Weapon_Suffix'] }]
      }
    ]
  ],
  [
    'viktranium/augments.json',
    [{ id: 30, name: 'Dolorous Flames', minimumLevel: 8, slotTypes: ['Lamordia_Weapon_Suffix'] }]
  ],
  [
    'viktranium/recipes.json',
    [{ id: 40, device: 'heroic', outputItemId: 20, quantity: 1, ingredients: [{ ingredientId: 50, quantity: 2 }] }]
  ],
  ['viktranium/ingredients.json', [{ id: 50, name: 'Bleak Alternator' }]],
  ['viktranium/effects.json', []],
  ['viktranium/spells.json', []]
])

describe('Viktranium data', () => {
  it('loads the dedicated CDN package and combines it with the shared scoped augment catalog', async () => {
    vi.mocked(loadDatasetFile).mockImplementation((path) => {
      if (!viktraniumFiles.has(path)) throw new Error('Unexpected data request for ' + path)
      return Promise.resolve(viktraniumFiles.get(path))
    })
    const row = { name: 'Eldritch Blast: Dice', modifier: 1, bonus: 'Artifact' }
    const record = {
      id: 1,
      name: 'Solar Test',
      slotTypes: ['Sun'],
      minimumLevel: 30,
      effectsAdded: [row],
      searchLabels: [row.name],
      presentation: [{ name: 'Blast Dice', rows: [row] }]
    }
    vi.mocked(loadScopedAugmentCatalog).mockResolvedValueOnce({ names: [row.name], entries: [record] })

    const data = await loadViktraniumData()

    expect(loadDatasetFile).toHaveBeenCalledWith('viktranium/manifest.json')
    expect(data.indexes.itemById.get('item-20')).toMatchObject({
      family: 'heroic-crafted-weapons',
      art: { domain: 'viktranium', layers: [21] },
      recipes: [{ requirements: [{ ingredientId: 'ingredient-50', quantity: 2 }] }]
    })
    expect(data.indexes.augmentById.get('augment-30')?.name).toBe('Dolorous Flames')
    expect(data.indexes.augmentById.get('augment-1')?.scoped?.presentation).toEqual(record.presentation)
    expect(data.enchantmentNames).toEqual([row.name])
  })

  it('classifies all five approved families from level and published recipes', () => {
    const data = createViktraniumTestData()
    expect([...data.indexes.itemsByFamily].map(([family, items]) => [family, items.length])).toEqual([
      ['heroic-crafted-weapons', 1],
      ['heroic-quest-loot', 1],
      ['legendary-crafted-weapons', 1],
      ['legendary-quest-loot', 1],
      ['wicked-crafted-weapons', 1]
    ])
  })

  it('rejects duplicate item IDs', () => {
    const fixture = createViktraniumTestRecords()
    fixture.items[1].id = fixture.items[0].id
    expect(() => createViktraniumTestData(fixture)).toThrow(InvalidViktraniumDataError)
  })

  it('rejects incompatible existing filled augment relationships', () => {
    const fixture = createViktraniumTestRecords()
    fixture.items[0].slots = [
      { id: 'slot-sun', augmentType: 'Sun', label: 'Sun', order: 0, filledAugmentId: 'augment-red' }
    ]
    expect(() => createViktraniumTestData(fixture)).toThrow(InvalidViktraniumDataError)
  })
})
