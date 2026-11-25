// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
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

it('suggests eligible dual shards and shows the full reference starting at effective ML 20', () => {
  const payload = createEssenceCraftingTestPayload()
  const split = payload.enhancements[0]
  split.minimumItemLevel = 20
  split.effects = split.effects.map((effect) =>
    'modifier' in effect && effect.modifier?.kind === 'fixed'
      ? { ...effect, modifier: { ...effect.modifier, value: 14.000000000000002 } }
      : effect
  )
  payload.enhancements.push({
    ...split,
    id: 'ring-dual',
    displayName: 'Ring Dual',
    effects: split.effects.map((effect) => ({ ...effect, id: 'ring-' + effect.id })),
    placements: [{ position: 'prefix', itemCategoryIds: ['ring'] }]
  })
  const levelRecipes = payload.recipes.filter((recipe) => recipe.itemLevel === 2)
  for (let itemLevel = 3; itemLevel <= 20; itemLevel++) {
    for (const { kind, binding, craftingLevel, requirements } of levelRecipes) {
      payload.recipes.push({
        kind,
        binding,
        craftingLevel,
        requirements,
        id: `${binding}-${String(itemLevel)}`,
        itemLevel
      })
    }
    payload.minimumLevelShards.push({
      itemLevel,
      recipes: { boundRecipeId: `bound-${String(itemLevel)}`, unboundRecipeId: `unbound-${String(itemLevel)}` }
    })
  }
  const data = validateEssenceCraftingDataset({
    ...payload,
    rules: { ...payload.rules, supportedItemLevels: { minimum: 1, maximum: 20 } }
  })
  const editor = (minimumLevelOverride: number | null) => (
    <MantineProvider env='test'>
      <PlannedItemEditor
        data={data}
        equipmentSlotId='main-hand'
        masterMinimumLevel={20}
        item={{
          minimumLevelOverride,
          prefixEnhancementId: null,
          suffixEnhancementId: null,
          extraEnhancementId: null,
          hasCannithMark: false,
          augmentSlots: []
        }}
        collapsed={false}
        onAction={vi.fn()}
        onRequestDeactivate={vi.fn()}
      />
    </MantineProvider>
  )
  const { rerender } = render(editor(19))
  expect(screen.queryByRole('button', { name: 'View all Dual Prefix Shards' })).toBeNull()
  rerender(editor(null))
  fireEvent.click(screen.getByLabelText('Prefix for Main Hand'))
  expect(screen.getAllByRole('option')[0].textContent).toBe(
    'Split Prefix Test (Light Spell Power, Spellcasting Implement)'
  )
  expect(screen.queryByRole('option', { name: /Ring Dual/ })).toBeNull()
  fireEvent.keyDown(screen.getByLabelText('Prefix for Main Hand'), { key: 'Escape' })
  fireEvent.click(screen.getByRole('button', { name: 'View all Dual Prefix Shards' }))
  const table = within(screen.getByRole('dialog')).getByRole('table')
  expect(within(table).getByRole('row', { name: /Ring Dual.*Light Spell Power.*Spellcasting Implement/ })).toBeTruthy()
  expect(
    within(table).getByRole('row', { name: /Split Prefix Test.*Light Spell Power.*Spellcasting Implement/ })
  ).toBeTruthy()
  expect(
    within(table)
      .getAllByRole('cell')
      .every((cell) => cell.textContent.endsWith('Spellcasting Implement: +14%'))
  ).toBe(true)
})
