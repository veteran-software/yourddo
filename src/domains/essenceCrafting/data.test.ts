import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadDataset } from '../../shared/data/loadDataset.ts'
import { InvalidEssenceCraftingDataError, loadEssenceCraftingData, validateEssenceCraftingDataset } from './data.ts'
import { createEssenceCraftingTestPayload } from './test-fixture.ts'

vi.mock('../../shared/data/loadDataset.ts', () => ({ loadDataset: vi.fn() }))

const required = <T>(value: T | undefined): T => {
  if (value === undefined) throw new Error('Expected fixture value')
  return value
}

describe('Essence Crafting data', () => {
  beforeEach(() => vi.mocked(loadDataset).mockReset())

  it('loads only the generated Essence Crafting domain', async () => {
    vi.mocked(loadDataset).mockResolvedValue(createEssenceCraftingTestPayload())

    const data = await loadEssenceCraftingData()

    expect(loadDataset).toHaveBeenCalledOnce()
    expect(loadDataset).toHaveBeenCalledWith('essence-crafting')
    expect(data.indexes.enhancementById.get('enhancement-split-prefix')?.displayName).toBe('Split Prefix Test')
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
    vi.mocked(loadDataset).mockRejectedValueOnce(cause)

    await expect(loadEssenceCraftingData()).rejects.toBe(cause)
  })
})
