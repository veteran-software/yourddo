// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { GearPlannerFiligree, GearPlannerItem } from '../gearPlanner.types.ts'
import FiligreeSlotSelector from './FiligreeSlotSelector.tsx'

const item: GearPlannerItem = {
  id: 'host',
  slot: 'Main Hand',
  sourceFile: 'test.json',
  minimumLevel: 30,
  source: { name: 'Sentient Dagger', type: 'Dagger' }
}

const filigree = (id: string, name: string): GearPlannerFiligree => ({
  id,
  name,
  minimumLevel: 1,
  grouping: 'Test Set',
  source: { name, pageTitle: id, enchantments: [{ name: 'Strength', modifier: 1 }] }
})

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

describe('FiligreeSlotSelector', () => {
  it('shows slots, searches, selects, replaces, clears, and unlocks compact filigree controls', async () => {
    const first = filigree('first', 'First Filigree')
    const second = filigree('second', 'Second Filigree')
    const user = userEvent.setup()
    const Harness = () => {
      const [selected, setSelected] = useState<Record<string, Record<number, GearPlannerFiligree>>>({})
      const [unlocked, setUnlocked] = useState<Record<string, number>>({})
      return (
        <MantineProvider env='test'>
          <FiligreeSlotSelector
            item={item}
            filigrees={[first, second]}
            slottedFiligrees={selected}
            unlockedFiligreeSlots={unlocked}
            onChange={(slotIndex, value) => {
              setSelected((current) => {
                const itemSelections = { ...(current[item.id] ?? {}) }
                const nextSelections = value
                  ? { ...itemSelections, [slotIndex]: value }
                  : Object.fromEntries(Object.entries(itemSelections).filter(([index]) => Number(index) !== slotIndex))
                return Object.keys(nextSelections).length ? { ...current, [item.id]: nextSelections } : {}
              })
            }}
            onUnlockedSlotCountChange={(count) => {
              setUnlocked({ [item.id]: count })
            }}
          />
        </MantineProvider>
      )
    }

    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Manage filigrees for Sentient Dagger' }))
    expect(screen.getByTestId('filigree-slot-count-host').textContent).toContain('0 / 10 slots unlocked')
    await user.click(screen.getByRole('button', { name: 'Unlock slot' }))
    await user.click(screen.getByRole('button', { name: 'Filigree slot 1' }))
    await user.type(screen.getByRole('textbox', { name: 'Search filigrees' }), 'first')
    await user.click(screen.getByRole('button', { name: 'Select First Filigree' }))
    expect(screen.getByRole('button', { name: 'Filigree slot 1' }).textContent).toContain('First Filigree')

    await user.click(screen.getByRole('button', { name: 'Filigree slot 1' }))
    await user.type(screen.getByRole('textbox', { name: 'Search filigrees' }), 'second')
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Select Second Filigree' }).disabled).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Clear filigree' }))
    await user.click(screen.getByRole('button', { name: 'Select Second Filigree' }))
    expect(screen.getByRole('button', { name: 'Filigree slot 1' }).textContent).toContain('Second Filigree')
    await user.click(screen.getByRole('button', { name: 'Close filigree selector' }))
    const host = screen.getByRole('button', { name: 'Manage filigrees for Sentient Dagger' })
    expect(host.textContent).toContain('1 filled · 1/10 unlocked')
    await user.click(host)
    await user.click(screen.getByRole('button', { name: 'Remove Second Filigree from slot 1' }))
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Filigree slot 1' }))
    expect(screen.queryByRole('textbox', { name: 'Search filigrees' })).toBeNull()
    expect(host.textContent).toContain('0 filled · 1/10 unlocked')
    expect(screen.getByRole('button', { name: 'Filigree slot 1' }).textContent).toContain('Empty slot 1')
    await user.click(screen.getByRole('button', { name: 'Unlock slot' }))
    expect(screen.getByTestId('filigree-slot-count-host').textContent).toContain('2 / 10 slots unlocked')
  })
})
