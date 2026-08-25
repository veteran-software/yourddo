// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { GearPlannerAugment, GearPlannerItem } from '../gearPlanner.types.ts'
import AugmentSlotSelector from './AugmentSlotSelector.tsx'

const augment = (name: string, augmentType: string): GearPlannerAugment => ({
  name,
  augmentType,
  minLevel: 8,
  effectsAdded: [{ name: 'Strength', modifier: '+8', bonus: 'Enhancement' }],
  source: { name, augmentType, minLevel: 8, effectsAdded: [] }
})

const item: GearPlannerItem = {
  id: 'head',
  slot: 'Head',
  sourceFile: 'test.json',
  minimumLevel: 10,
  source: { name: 'Socketed Helm', augments: [{ augmentType: 'Red', name: 'Ruby socket' }] }
}

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      media: '',
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

afterEach(cleanup)

describe('AugmentSlotSelector', () => {
  it('searches compatible choices, selects, replaces, and clears an augment', async () => {
    const ruby = augment('Ruby of Strength', 'Red')
    const diamond = augment('Diamond of Strength', 'Colorless')
    const sapphire = augment('Sapphire of Strength', 'Blue')
    const user = userEvent.setup()

    const Harness = () => {
      const [selected, setSelected] = useState<GearPlannerAugment | null>(null)
      return (
        <MantineProvider env='test'>
          <AugmentSlotSelector
            item={item}
            slotIndex={0}
            augmentSlot={item.source.augments?.[0] ?? { augmentType: 'Red' }}
            augments={[ruby, diamond, sapphire]}
            selected={selected}
            onChange={setSelected}
          />
        </MantineProvider>
      )
    }

    render(<Harness />)
    const selector = screen.getByTestId('augment-slot-head-0')
    const input = within(selector).getByRole('combobox', { name: 'Ruby socket' })
    await user.click(input)
    await user.type(input, 'diamond')
    expect(await screen.findByRole('option', { name: /Diamond of Strength/ })).toBeTruthy()
    expect(screen.queryByRole('option', { name: /Ruby of Strength/ })).toBeNull()
    expect(screen.queryByRole('option', { name: /Sapphire of Strength/ })).toBeNull()

    await user.click(screen.getByRole('option', { name: /Diamond of Strength/ }))
    expect(within(selector).getAllByText('Diamond of Strength')).toHaveLength(2)

    await user.click(input)
    await user.clear(input)
    expect(await screen.findByRole('option', { name: /Ruby of Strength/ })).toBeTruthy()
    await user.click(screen.getByRole('option', { name: /Ruby of Strength/ }))
    expect(within(selector).getAllByText('Ruby of Strength')).toHaveLength(2)

    await user.click(within(selector).getByRole('button', { name: 'Clear augment' }))
    expect((input as HTMLInputElement).value).toBe('')
    expect(within(selector).queryByRole('button', { name: 'Clear augment' })).toBeNull()
  })

  it('hides over-level augments until Show all levels is enabled', async () => {
    const overLevel = { ...augment('Legendary Ruby', 'Red'), minLevel: 30 }
    const user = userEvent.setup()

    render(
      <MantineProvider env='test'>
        <AugmentSlotSelector
          item={item}
          slotIndex={0}
          augmentSlot={item.source.augments?.[0] ?? { augmentType: 'Red' }}
          augments={[overLevel]}
          selected={null}
          onChange={vi.fn()}
        />
      </MantineProvider>
    )

    const input = screen.getByRole('combobox', { name: 'Ruby socket' })
    await user.click(input)
    expect(screen.queryByRole('option', { name: /Legendary Ruby/ })).toBeNull()
    await user.click(screen.getByRole('switch', { name: 'Show all levels' }))
    await user.click(input)
    expect(await screen.findByRole('option', { name: /Legendary Ruby/ })).toBeTruthy()
  })
})
