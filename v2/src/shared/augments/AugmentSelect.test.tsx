// @vitest-environment jsdom

import { Input, MantineProvider } from '@mantine/core'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import AugmentSelect from './AugmentSelect.tsx'
import Error = Input.Error

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
    const duplicateOptions = await screen.findAllByRole('option', { name: /Duplicate Name/ })
    expect(duplicateOptions).toHaveLength(2)
    const colorlessOption = duplicateOptions.at(1)
    if (!colorlessOption) throw new Error('Missing colorless test option')
    await user.click(colorlessOption)
    expect(onChange.mock.calls[0]?.[0]).toBe('colorless-id')
  })
})
