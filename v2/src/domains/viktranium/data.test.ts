import { Input } from '@mantine/core'
import { useOrientation } from '@mantine/hooks'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadDataset } from '../../shared/data/loadDataset.ts'
import { InvalidViktraniumDataError, loadViktraniumData, validateViktraniumDataset } from './data.ts'
import { createViktraniumTestPayload } from './test-fixture.ts'
import Error = Input.Error
import ReturnType = useOrientation.ReturnType
import ReturnType = useOrientation.ReturnType
import ReturnType = useOrientation.ReturnType
import ReturnType = useOrientation.ReturnType
import ReturnType = useOrientation.ReturnType

vi.mock('../../shared/data/loadDataset.ts', () => ({ loadDataset: vi.fn() }))

const required = <T>(value: T | undefined): T => {
  if (value === undefined) throw new Error('Missing test fixture value')
  return value
}

describe('Viktranium data', () => {
  beforeEach(() => vi.mocked(loadDataset).mockResolvedValue(createViktraniumTestPayload()))

  it('loads only the generated Viktranium domain and builds stable indexes', async () => {
    const data = await loadViktraniumData()
    expect(loadDataset).toHaveBeenCalledOnce()
    expect(loadDataset).toHaveBeenCalledWith('viktranium')
    expect(data.indexes.itemById.get('item-heroic-crafted')?.displayName).toBe('Sceptre (Cruel Baton)')
    expect(data.indexes.itemById.get('item-legendary-crafted')?.displayName).toContain("Warden's Hand Turret")
    expect(data.indexes.augmentById.get('augment-red')?.id).toBe('augment-red')
  })

  it('classifies all five approved families from level and published recipes', () => {
    const data = validateViktraniumDataset(createViktraniumTestPayload())
    expect([...data.indexes.itemsByFamily].map(([family, items]) => [family, items.length])).toEqual([
      ['heroic-crafted-weapons', 1],
      ['heroic-quest-loot', 1],
      ['legendary-crafted-weapons', 1],
      ['legendary-quest-loot', 1],
      ['wicked-crafted-weapons', 1]
    ])
  })

  it.each([
    [
      'unsupported schema',
      (value: ReturnType<typeof createViktraniumTestPayload>) => {
        value.schemaVersion = 2
      }
    ],
    [
      'duplicate IDs',
      (value: ReturnType<typeof createViktraniumTestPayload>) => {
        value.items[1].id = value.items[0].id
      }
    ],
    [
      'unknown slots',
      (value: ReturnType<typeof createViktraniumTestPayload>) => {
        required(required(value.items.at(0)).slots.at(0)).augmentType = 'Mystery'
      }
    ],
    [
      'invalid quantities',
      (value: ReturnType<typeof createViktraniumTestPayload>) => {
        required(required(required(value.items.at(0)).recipes?.at(0)).requirements.at(0)).quantity = 0
      }
    ],
    [
      'missing references',
      (value: ReturnType<typeof createViktraniumTestPayload>) => {
        required(required(required(value.items.at(0)).recipes?.at(0)).requirements.at(0)).ingredientId = 'missing'
      }
    ]
  ])('rejects %s', (_label, mutate) => {
    const value = createViktraniumTestPayload()
    mutate(value)
    expect(() => validateViktraniumDataset(value)).toThrow(InvalidViktraniumDataError)
  })

  it('does not mutate the published payload', () => {
    const value = createViktraniumTestPayload()
    const before = JSON.stringify(value)
    validateViktraniumDataset(value)
    expect(JSON.stringify(value)).toBe(before)
  })

  it('rejects incompatible existing filled augment relationships', () => {
    const value = createViktraniumTestPayload()
    Object.assign(required(required(value.items.at(0)).slots.at(1)), { filledAugmentId: 'augment-red' })
    expect(() => validateViktraniumDataset(value)).toThrow(InvalidViktraniumDataError)
  })
})
