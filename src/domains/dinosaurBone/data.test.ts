import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadDatasetFile, loadManualPayload } from '../../shared/data/loadDataset.ts'
import {
  dinosaurBoneDatasetPaths,
  dinosaurBoneRequirementsPayloadName,
  InvalidDinosaurBoneDataError,
  loadDinosaurBoneData,
  parseAugments,
  parseCraftingRequirements,
  parseItems
} from './data.ts'

vi.mock('../../shared/data/loadDataset.ts', () => ({ loadDatasetFile: vi.fn(), loadManualPayload: vi.fn() }))

const item = {
  name: 'Dinosaur Bone Test Sword',
  type: 'Long Sword',
  requirements: null,
  augments: [{ augmentType: 'Red' }]
}
const recipe = {
  schemaVersion: 1,
  source: 'legacy Dinosaur Bone item factories',
  items: [{ name: item.name, requirements: [{ name: 'Bone', quantity: 25 }] }],
  identityDifferences: []
}
const dinosaurAugments = [{ name: 'Claw One', augmentType: 'Isle of Dread: Claw (Weapon)', requirements: [] }]
const masterAugments = [{ name: 'Red One', augmentType: 'Red' }]

const arrangeLoad = (overrides: { items?: unknown; dinosaur?: unknown; master?: unknown; recipe?: unknown } = {}) => {
  vi.mocked(loadDatasetFile)
    .mockResolvedValueOnce(overrides.items ?? [item])
    .mockResolvedValueOnce(overrides.dinosaur ?? dinosaurAugments)
    .mockResolvedValueOnce(overrides.master ?? masterAugments)
  vi.mocked(loadManualPayload).mockResolvedValueOnce(overrides.recipe ?? recipe)
}

beforeEach(() => {
  vi.mocked(loadDatasetFile).mockReset()
  vi.mocked(loadManualPayload).mockReset()
})

describe('Dinosaur Bone data', () => {
  it('loads every approved generated path and the exact manual manifest domain', async () => {
    arrangeLoad()
    const data = await loadDinosaurBoneData()
    expect(vi.mocked(loadDatasetFile).mock.calls).toEqual(dinosaurBoneDatasetPaths.map((path) => [path]))
    expect(loadManualPayload).toHaveBeenCalledWith(dinosaurBoneRequirementsPayloadName)
    expect(data.items[0]).toMatchObject({ name: item.name, family: 'crafted-weapons' })
    expect(data.items[0]?.requirements).toEqual([{ name: 'Bone', quantity: 25 }])
    expect(data.indexes.augmentByName.get('Red One')?.name).toBe('Red One')
  })

  it('joins an approved legacy-to-CDN identity difference', async () => {
    arrangeLoad({
      items: [{ ...item, name: 'Dinosaur Bone Bone Dart' }],
      recipe: {
        ...recipe,
        items: [{ name: 'Dinosaur Bone Dart', requirements: [{ name: 'Bone', quantity: 25 }] }],
        identityDifferences: [{ legacyName: 'Dinosaur Bone Dart', currentCdnName: 'Dinosaur Bone Bone Dart' }]
      }
    })
    await expect(loadDinosaurBoneData()).resolves.toMatchObject({
      items: [{ name: 'Dinosaur Bone Bone Dart', family: 'crafted-weapons', requirements: [{ quantity: 25 }] }]
    })
  })

  it('accepts null requirements only for a non-crafted augment', () => {
    expect(
      parseAugments(
        [{ name: 'Loot Horn', augmentType: 'Isle of Dread: Horn (Weapon)', foundIn: ['Raid'], requirements: null }],
        'Dinosaur Bone'
      )[0]?.requirements
    ).toEqual([])
    expect(() =>
      parseAugments(
        [
          { name: 'Crafted Horn', augmentType: 'Isle of Dread: Horn (Weapon)', craftedIn: 'Device', requirements: null }
        ],
        'Dinosaur Bone'
      )
    ).toThrow('requirements missing for crafted augment Crafted Horn')
  })

  it('retains artifact identity from the published item payload', () => {
    expect(parseItems([{ ...item, artifactType: 'Minor' }])[0]?.artifactType).toBe('Minor')
  })

  it('rejects unsupported manual schema, missing joins, and invalid quantities', async () => {
    expect(() => parseCraftingRequirements({ ...recipe, schemaVersion: 2 })).toThrow(
      'unsupported crafting requirements payload'
    )
    expect(() =>
      parseCraftingRequirements({
        ...recipe,
        items: [{ name: item.name, requirements: [{ name: 'Bone', quantity: 0 }] }]
      })
    ).toThrow('invalid requirement quantity for Bone')

    arrangeLoad({ recipe: { ...recipe, items: [{ name: 'Missing', requirements: [{ name: 'Bone', quantity: 25 }] }] } })
    await expect(loadDinosaurBoneData()).rejects.toThrow('missing item join')
  })

  it('rejects empty payloads, duplicate identities, and unknown slot contracts', async () => {
    expect(() => parseItems([])).toThrow('non-empty array')
    arrangeLoad({ items: [item, item] })
    await expect(loadDinosaurBoneData()).rejects.toThrow('Duplicate item name')

    arrangeLoad({ items: [{ ...item, augments: [{ augmentType: 'Mystery Slot' }] }] })
    await expect(loadDinosaurBoneData()).rejects.toThrow('Unknown Dinosaur Bone slot contract')
  })

  it('does not mutate any source payload', async () => {
    const inputs = { items: [item], dinosaur: dinosaurAugments, master: masterAugments, recipe }
    const before = structuredClone(inputs)
    arrangeLoad(inputs)
    await loadDinosaurBoneData()
    expect(inputs).toEqual(before)
  })

  it('surfaces network failures from any required source', async () => {
    vi.mocked(loadDatasetFile).mockRejectedValueOnce(new Error('network failed'))
    vi.mocked(loadManualPayload).mockResolvedValueOnce(recipe)
    await expect(loadDinosaurBoneData()).rejects.toThrow('network failed')
  })

  it('uses a typed domain error for malformed payloads', () => {
    expect(() => parseItems({})).toThrow(InvalidDinosaurBoneDataError)
  })
})
