import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadDatasetFile } from '../../shared/data/loadDataset.ts'
import { InvalidDinosaurBoneDataError, loadDinosaurBoneData } from './data.ts'

vi.mock('../../shared/data/loadDataset.ts', () => ({ loadDatasetFile: vi.fn() }))

const item = {
  name: 'Dinosaur Bone Test Sword',
  type: 'Long Sword',
  requirements: [{ name: 'Bone', quantity: 25 }],
  dropLocations: [
    { sourceType: 'Dinosaur Bone Crafting', boneRaptor: 25, boneTriceratops: 25, bonePteradon: 25, boneAnkylosaur: 25 }
  ],
  augments: [{ augmentType: 'Red' }]
}

beforeEach(() => vi.mocked(loadDatasetFile).mockReset())

describe('Dinosaur Bone data', () => {
  it('loads the two Dinosaur Bone files and the master color augment file', async () => {
    vi.mocked(loadDatasetFile)
      .mockResolvedValueOnce([item])
      .mockResolvedValueOnce([{ name: 'Claw One', augmentType: 'Isle of Dread: Claw (Weapon)' }])
      .mockResolvedValueOnce([{ name: 'Red One', augmentType: 'Red' }])

    const data = await loadDinosaurBoneData()

    expect(vi.mocked(loadDatasetFile).mock.calls).toEqual([
      ['dinosaur-bone/items.json'],
      ['dinosaur-bone/augments.json'],
      ['master/augment.json']
    ])
    expect(data.items[0]?.family).toBe('crafted-weapons')
    expect(data.items[0]?.requirements).toEqual([{ name: 'Bone', quantity: 25 }])
    expect(data.colorAugments.map(({ name }) => name)).toEqual(['Red One'])
  })

  it('uses the published crafting location metadata when current items have null requirements', async () => {
    vi.mocked(loadDatasetFile)
      .mockResolvedValueOnce([
        {
          ...item,
          requirements: null
        }
      ])
      .mockResolvedValueOnce([{ name: 'Claw One', augmentType: 'Isle of Dread: Claw (Weapon)' }])
      .mockResolvedValueOnce([{ name: 'Red One', augmentType: 'Red' }])

    const data = await loadDinosaurBoneData()

    expect(data.items[0]?.requirements).toEqual([
      { name: 'Fossilized Raptor Claw', quantity: 25 },
      { name: 'Fossilized Triceratops Horn', quantity: 25 },
      { name: 'Fossilized Pteranodon Vertebra', quantity: 25 },
      { name: 'Fossilized Ankylosaur Rib', quantity: 25 }
    ])
  })

  it('accepts null set-bonus metadata from current item payloads', async () => {
    vi.mocked(loadDatasetFile)
      .mockResolvedValueOnce([{ ...item, requirements: null, setBonus: null }])
      .mockResolvedValueOnce([{ name: 'Claw One', augmentType: 'Isle of Dread: Claw (Weapon)' }])
      .mockResolvedValueOnce([{ name: 'Red One', augmentType: 'Red' }])

    await expect(loadDinosaurBoneData()).resolves.toMatchObject({ items: [{ name: item.name }] })
  })

  it('normalizes scraped augment requirement titles to ingredient names', async () => {
    vi.mocked(loadDatasetFile)
      .mockResolvedValueOnce([item])
      .mockResolvedValueOnce([{ name: 'Claw One', augmentType: 'Isle of Dread: Claw (Weapon)' }])
      .mockResolvedValueOnce([
        { name: 'Red One', augmentType: 'Red', requirements: [{ title: 'Tooth', quantity: 10 }] }
      ])

    const data = await loadDinosaurBoneData()

    expect(data.colorAugments[0]?.requirements).toEqual([{ name: 'Tooth', quantity: 10 }])
  })

  it('rejects invalid payload shapes', async () => {
    vi.mocked(loadDatasetFile).mockResolvedValueOnce({})
    vi.mocked(loadDatasetFile).mockResolvedValueOnce([])
    vi.mocked(loadDatasetFile).mockResolvedValueOnce([])

    await expect(loadDinosaurBoneData()).rejects.toBeInstanceOf(InvalidDinosaurBoneDataError)
  })
})
