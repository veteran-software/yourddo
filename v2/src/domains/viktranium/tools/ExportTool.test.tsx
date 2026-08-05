// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { validateViktraniumDataset } from '../data.ts'
import { calculateFinishedItem, calculateIngredients, getSelectedAugments } from '../logic.ts'
import { createViktraniumTestPayload } from '../test-fixture.ts'
import ExportTool from './ExportTool.tsx'

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { addEventListener: vi.fn(), removeEventListener: vi.fn() }
  })
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

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Missing test fixture value')
  return value
}

const build = () => {
  const data = validateViktraniumDataset(createViktraniumTestPayload())
  const item = required(data.indexes.itemById.get('item-heroic-crafted'))
  const selected = { 'slot-red': 'augment-red' }
  return {
    finished: calculateFinishedItem(item, selected, data),
    ingredients: calculateIngredients(item, getSelectedAugments(item, selected, data), data)
  }
}

describe('ExportTool', () => {
  it('copies the derived forum export and announces success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(
      <MantineProvider env='test'>
        <ExportTool {...build()} />
      </MantineProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Copy export' }))
    expect(writeText.mock.calls[0]?.[0]).toContain('[b]Cruel Baton[/b]')
    expect((await screen.findByRole('status')).textContent).toContain('Build copied to the clipboard.')
  })

  it('offers manual copying when clipboard access fails', async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) }
    })
    render(
      <MantineProvider env='test'>
        <ExportTool {...build()} />
      </MantineProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Copy export' }))
    expect((await screen.findByRole('alert')).textContent).toContain('Copy failed')
  })
})
