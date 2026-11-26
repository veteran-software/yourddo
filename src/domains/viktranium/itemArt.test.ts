import { expect, it, vi } from 'vitest'
import { loadDatasetFile } from '../../shared/data/loadDataset'
import { viktraniumItemArt } from './itemArt'
vi.mock('../../shared/data/loadDataset', () => ({ loadDatasetFile: vi.fn() }))
it('selects ordered icon layers and reuses the recipe icon when the catalog name differs', async () => {
  vi.mocked(loadDatasetFile)
    .mockResolvedValueOnce({
      categoryEffects: { 'weapons/club/items': 'weapons/club/effects' },
      resources: { 'weapons/club/items': 'weapons/club/items.json' }
    })
    .mockResolvedValueOnce([
      {
        name: 'Calamitous Club',
        iconLayers: [
          { order: 2, iconId: 22 },
          { order: 1, iconId: 11 }
        ]
      }
    ])
  const club = { name: 'Calamitous Club', type: 'Club', icon: 'Club 2', minimumLevel: 8 }
  const baton = { ...club, name: 'Cruel Baton' }
  for (const item of [club, baton]) {
    expect(await viktraniumItemArt(item, [club, baton])).toEqual({ domain: 'items', layers: [11, 22] })
  }
  expect(loadDatasetFile).toHaveBeenCalledTimes(2)
})
