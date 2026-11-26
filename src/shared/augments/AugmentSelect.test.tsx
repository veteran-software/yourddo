// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { troveStorageKey } from '../../domains/gearPlanner/trove'
import AugmentSelect from './AugmentSelect.tsx'

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

afterEach(cleanup)

describe('AugmentSelect', () => {
  it('combines Trove ownership, socket color, search and host-level filters in the dialog', async () => {
    localStorage.setItem(troveStorageKey, JSON.stringify(['Owned ruby']))
    try {
      const user = userEvent.setup()
      render(
        <MantineProvider env='test'>
          <AugmentSelect
            label='Purple socket'
            slotType='Purple'
            hostLevel={10}
            value={null}
            onChange={vi.fn()}
            options={[
              { name: 'Owned ruby', augmentType: 'Red', minLevel: 20 },
              { name: 'Other ruby', augmentType: 'Red', minLevel: 2 },
              { name: 'Other sapphire', augmentType: 'Blue', minLevel: 2 }
            ]}
          />
        </MantineProvider>
      )
      expect(screen.queryByLabelText('Show owned')).toBeNull()
      await user.click(screen.getByRole('combobox', { name: 'Purple socket' }))
      await user.click(screen.getByRole('button', { name: 'Red' }))
      await user.type(screen.getByRole('textbox', { name: 'Search augments' }), 'ruby')
      await user.click(screen.getByLabelText('Show owned'))
      expect(screen.queryByRole('button', { name: /Other ruby|Owned ruby/ })).toBeNull()
      await user.click(screen.getByLabelText('Show all levels'))
      expect(screen.getByRole('button', { name: /Owned ruby/ })).toBeTruthy()
      expect(screen.queryByRole('button', { name: /Other ruby|Other sapphire/ })).toBeNull()
    } finally {
      localStorage.removeItem(troveStorageKey)
    }
  })
  it('searches public labels and keeps two distinct manifest enchantments independently filterable', async () => {
    const user = userEvent.setup()
    const names = ['Eldritch Blast: Dice', 'Eldritch Blast: Pact Dice']
    render(
      <MantineProvider env='test'>
        <AugmentSelect
          label='Red socket'
          slotType='Red'
          value={null}
          onChange={vi.fn()}
          enchantmentNames={names}
          options={names.map((name, index) => ({
            name: 'Gem ' + String(index),
            augmentType: 'Red',
            searchLabels: [name],
            presentation: [{ name: 'Focused Magic', rows: [{ name, modifier: 2, bonus: 'Artifact' }] }]
          }))}
        />
      </MantineProvider>
    )
    await user.click(screen.getByRole('combobox', { name: 'Red socket' }))
    await user.type(screen.getByRole('textbox', { name: 'Search augments' }), 'blast')
    expect(screen.getAllByText('Focused Magic')).toHaveLength(2)
    await user.click(screen.getByRole('combobox', { name: 'Filter by enchantment' }))
    await user.click(screen.getByRole('option', { name: names[0] }))
    expect(screen.getByText('Eldritch Blast: Dice +2 (Artifact)')).toBeTruthy()
    expect(screen.queryByText('Gem 1')).toBeNull()
  })
  it('selects stable values while preserving duplicate display labels', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <MantineProvider env='test'>
        <AugmentSelect
          label='Red augment'
          slotType='Red'
          options={[
            { value: 'red-id', label: 'Duplicate Name', augmentType: 'Red', minimumLevel: 12 },
            { value: 'colorless-id', label: 'Duplicate Name', augmentType: 'Colorless', minimumLevel: 4 }
          ]}
          value={null}
          onChange={onChange}
        />
      </MantineProvider>
    )

    await user.click(screen.getByRole('combobox', { name: 'Red augment' }))
    const duplicateOptions = await screen.findAllByRole('button', { name: /Duplicate Name/ })
    expect(duplicateOptions).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: 'Colorless' }))
    const colorlessOption = screen.getByRole('button', { name: /Duplicate Name/ })
    if (!colorlessOption) throw new Error('Missing colorless test option')
    await user.click(colorlessOption)
    expect(onChange.mock.calls[0]?.[0]).toBe('colorless-id')
  })
})
