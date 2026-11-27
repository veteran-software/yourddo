// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, render, screen, within } from '@testing-library/react'
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
  it('opens the first slot, unlocks multiple slots at once, and protects occupied slots', async () => {
    const first = filigree('first', "First Filigree with a Long Name and the Wanderer's Legacy")
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
    const host = screen.getByRole('button', { name: 'Manage filigrees for Sentient Dagger' })
    await user.click(host)
    const capacity = screen.getByRole<HTMLSelectElement>('combobox', { name: 'Unlocked slots' })
    expect(capacity.value).toBe('1')
    expect(screen.getByRole('heading', { name: 'Select for slot 1' })).toBeTruthy()
    await user.type(screen.getByRole('textbox', { name: 'Search filigrees' }), 'first')
    expect(screen.queryByRole('button', { name: 'Select Second Filigree' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Select ' + first.name }))
    const slotOne = screen.getByRole('button', { name: 'Filigree slot 1' })
    expect(slotOne.textContent).toContain(first.name)
    expect(slotOne.textContent).toContain('Strength 1')

    await user.selectOptions(capacity, '5')
    expect(screen.getByRole('heading', { name: 'Select for slot 2' })).toBeTruthy()
    const duplicate = screen.getByRole<HTMLButtonElement>('button', { name: first.name + ' is in slot 1' })
    expect(duplicate.disabled).toBe(true)
    expect(duplicate.textContent).toBe('In slot 1')
    const slotFive = screen.getByRole('button', { name: 'Filigree slot 5' })
    await user.click(slotFive)
    await user.click(screen.getByRole('button', { name: 'Select Second Filigree' }))
    expect(host.textContent).toContain('2 filled · 5/10 unlocked')
    expect(screen.getByRole<HTMLOptionElement>('option', { name: '4 of 10' }).disabled).toBe(true)
    await user.click(slotFive)
    const details = within(screen.getByRole('region', { name: 'Slot 5' }))
    expect(details.getByText('Second Filigree')).toBeTruthy()
    expect(details.getByText('Test Set')).toBeTruthy()
    await user.click(details.getByRole('button', { name: 'Clear filigree' }))
    expect(document.activeElement).toBe(slotFive)
    expect(slotFive.textContent).toContain('Empty slot')
    await user.selectOptions(capacity, '1')
    expect(screen.getByRole('region', { name: 'Slot 1' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Filigree slot 5' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Close filigree selector' }))
    expect(host.textContent).toContain('1 filled · 1/10 unlocked')
  })
})
