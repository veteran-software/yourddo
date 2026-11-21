// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { getCompatibleAugments } from './augmentRules.ts'
import { validateEssenceCraftingDataset } from './data.ts'
import PlannedItemEditor from './PlannedItemEditor.tsx'
import { createEssenceCraftingTestPayload } from './test-fixture.ts'

vi.mock('./augmentRules.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./augmentRules.ts')>()

  return {
    ...actual,
    getCompatibleAugments: vi.fn(actual.getCompatibleAugments)
  }
})

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  )
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
  )
})

afterEach(() => {
  cleanup()
  vi.mocked(getCompatibleAugments).mockClear()
})

describe('PlannedItemEditor augment rendering', () => {
  it('computes compatible augments once for each rendered augment slot', () => {
    const payload = createEssenceCraftingTestPayload()
    payload.augments.push(
      {
        id: 'augment-red-strength',
        displayName: 'Ruby of Strength +1',
        augmentTypeId: 'red',
        minimumItemLevel: 2,
        effects: [
          {
            id: 'effect-strength',
            displayName: 'Strength',
            bonusTypeId: 'bonus-enhancement',
            modifier: { kind: 'fixed', unit: 'number', value: 1 }
          }
        ]
      },
      {
        id: 'augment-red-vitality',
        displayName: 'Ruby of Vitality +1',
        augmentTypeId: 'red',
        minimumItemLevel: 2,
        effects: [
          {
            id: 'effect-vitality',
            displayName: 'Vitality',
            bonusTypeId: 'bonus-enhancement',
            modifier: { kind: 'fixed', unit: 'number', value: 1 }
          }
        ]
      }
    )
    const data = validateEssenceCraftingDataset(payload)

    render(
      <MantineProvider env='test'>
        <PlannedItemEditor
          data={data}
          equipmentSlotId='main-hand'
          item={{
            prefixEnhancementId: null,
            suffixEnhancementId: null,
            extraEnhancementId: null,
            hasCannithMark: false,
            minimumLevelOverride: null,
            augmentSlots: [
              {
                id: 'augment-slot:red',
                augmentSlotTypeId: 'red',
                augmentId: 'augment-red-charisma',
                selectedEffectNames: [],
                filterMode: 'or'
              }
            ]
          }}
          masterMinimumLevel={2}
          collapsed={false}
          onAction={vi.fn()}
          onRequestDeactivate={vi.fn()}
        />
      </MantineProvider>
    )

    expect(getCompatibleAugments).toHaveBeenCalledTimes(1)
    expect(getCompatibleAugments).toHaveBeenCalledWith(data, 'red')
  })
})
