import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadDatasetFile } from '../../shared/data/loadDataset.ts'
import { loadDinosaurBoneData } from './data.ts'

vi.mock('../../shared/data/loadDataset.ts', () => ({ loadDatasetFile: vi.fn() }))
beforeEach(() => {
  vi.mocked(loadDatasetFile).mockReset()
})

function fixture() {
  const manifest = (system: string, resources: string[]) => ({
    system,
    resources: Object.fromEntries(resources.map((key) => [key, key + '.json'])),
    devices: { crafting: { name: 'Dinosaur Bone Crafting' } }
  })
  const files: Record<string, unknown> = {
    'dinosaur-bone/manifest.json': manifest('dinosaur-bone', [
      'baseItems',
      'effects',
      'spells',
      'equipmentSets',
      'recipes',
      'ingredients'
    ]),
    'items/augments/manifest.json': manifest('items', ['standard', 'dinosaur-bone', 'sets', 'effects', 'spells']),
    'dinosaur-bone/baseItems.json': [
      {
        id: 1,
        name: 'Dinosaur Bone Dart',
        itemType: 'Dart',
        baseStats: {},
        effects: [{ effectId: 8 }],
        augmentSlots: [{ name: 'Isle of Dread: Scale Slot (Weapon)', types: ['Dread_Weapon_Prefix'] }]
      }
    ],
    'items/augments/dinosaur-bone.json': [
      { id: 2, name: 'Flamescale', effects: [{ effectId: 8 }], slotTypes: ['Dread_Weapon_Prefix'] }
    ],
    'dinosaur-bone/recipes.json': [
      { category: 'equipment', device: 'crafting', outputItemId: 1, ingredients: [{ ingredientId: 7, quantity: 25 }] },
      { category: 'augment', device: 'crafting', outputItemId: 2, ingredients: [{ ingredientId: 7, quantity: 9 }] }
    ],
    'dinosaur-bone/ingredients.json': [{ id: 7, name: 'Bone' }],
    'dinosaur-bone/effects.json': [{ id: 8, hidden: true, displayName: 'Hidden' }],
    'dinosaur-bone/equipmentSets.json': [],
    'dinosaur-bone/spells.json': [],
    'items/augments/standard.json': [{ id: 3, name: 'Ruby', slotTypes: ['Red'] }],
    'items/augments/effects.json': [
      { id: 8, displayName: 'Fire', enchantments: [{ displayName: 'Fire Resistance', value: 5 }] }
    ],
    'items/augments/sets.json': [],
    'items/augments/spells.json': []
  }
  return files
}
function serve(files: Record<string, unknown>) {
  vi.mocked(loadDatasetFile).mockImplementation((path) => {
    if (!(path in files)) return Promise.reject(new Error('Unexpected resource ' + path))
    return Promise.resolve(files[path])
  })
}
describe('Dinosaur Bone data', () => {
  it('joins shared augments to crafting recipes by output ID and preserves saved slots', async () => {
    const files = fixture()
    const original = structuredClone(files)
    serve(files)
    const data = await loadDinosaurBoneData()
    expect(data.items[0]).toMatchObject({
      family: 'crafted-weapons',
      requirements: [{ name: 'Bone', quantity: 25 }],
      enchantments: [],
      augments: [{ id: 'Isle of Dread: Scale Slot (Weapon)' }]
    })
    expect(data.indexes.itemByName.get('Dinosaur Bone Bone Dart')).toBe(data.items[0])
    expect(data.indexes.augmentsByType.get('Isle of Dread: Scale (Weapon)')?.[0].name).toBe('Flamescale')
    expect(data.dinosaurAugments[0]).toMatchObject({
      effectsAdded: [{ name: 'Fire Resistance', modifier: 5 }],
      craftedIn: 'Dinosaur Bone Crafting',
      requirements: [{ name: 'Bone', quantity: 9 }]
    })
    expect(data.colorAugments[0].name).toBe('Ruby')
    expect(files).toEqual(original)
  })

  it('shows public Standard enchantments and keeps Dinosaur Bone augment behavior independent', async () => {
    const files = fixture()
    const manifest = files['items/augments/manifest.json'] as { resources: Record<string, string> }
    manifest.resources['enchantment-names'] = 'labels.json'
    files['items/augments/labels.json'] = ['Fire Resistance']
    files['items/augments/standard.json'] = [{ id: 3, name: 'Ruby', slotTypes: ['Red'], effects: [{ effectId: 8 }] }]
    serve(files)
    const data = await loadDinosaurBoneData()
    expect(data.colorAugments[0]).toMatchObject({
      scoped: { presentation: [{ name: 'Fire', rows: [{ name: 'Fire Resistance', modifier: 5 }] }] },
      searchLabels: ['Fire Resistance']
    })
    expect(data.dinosaurAugments[0].scoped).toBeUndefined()
  })

  it('surfaces missing exports and allows a retry', async () => {
    const files = fixture()
    const augments = files['items/augments/dinosaur-bone.json']
    delete files['items/augments/dinosaur-bone.json']
    serve(files)
    await expect(loadDinosaurBoneData()).rejects.toThrow('items/augments/dinosaur-bone.json')
    files['items/augments/dinosaur-bone.json'] = augments
    await expect(loadDinosaurBoneData()).resolves.toMatchObject({ dinosaurAugments: [{ name: 'Flamescale' }] })
  })

  it('rejects duplicate item names and unresolved recipe ingredients', async () => {
    const files = fixture()
    const bases = files['dinosaur-bone/baseItems.json'] as unknown[]
    files['dinosaur-bone/baseItems.json'] = [...bases, ...bases]
    serve(files)
    await expect(loadDinosaurBoneData()).rejects.toThrow('Duplicate item name')
    files['dinosaur-bone/baseItems.json'] = bases
    files['dinosaur-bone/ingredients.json'] = []
    await expect(loadDinosaurBoneData()).rejects.toThrow('Missing Dinosaur Bone ingredient')
  })
})
