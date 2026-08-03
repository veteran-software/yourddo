// @vitest-environment jsdom

import { type MantineColorScheme, MantineProvider } from '@mantine/core'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadManualPayload, UnsupportedManifestSchemaError } from '../../shared/data/loadDataset.ts'
import type { NearlyFinishedDataset, ReforgingEntry } from './nearlyFinished.types.ts'
import NearlyFinishedPage from './NearlyFinishedPage.tsx'

vi.mock('../../shared/data/loadDataset.ts', async (importOriginal) => {
  const loader = await importOriginal<typeof import('../../shared/data/loadDataset.ts')>()
  return { ...loader, loadManualPayload: vi.fn() }
})

const createEntry = (values: Partial<ReforgingEntry> & Pick<ReforgingEntry, 'item'>): ReforgingEntry => ({
  stage: 'Nearly Finished',
  cost: [{ name: 'Complex Compound', quantity: 1 }],
  effectsAdded: [],
  ...values
})

const dataset: NearlyFinishedDataset = {
  meltingStation: [
    {
      name: 'Simple Ingot',
      quantity: 1,
      requirements: [{ name: 'Iron Defender Rivet', quantity: 2 }]
    },
    {
      name: 'Complex Compound',
      quantity: 1,
      requirements: [
        { name: 'Simple Ingot', quantity: 3 },
        { name: 'Iron Defender Claw', quantity: 1 }
      ]
    }
  ],
  reforgingStation: [
    createEntry({
      item: 'Heroic Choice Item',
      cost: [{ name: 'Complex Compound', quantity: 2 }],
      choices: [{ name: 'Strength +8' }, { name: 'Dexterity +8' }, { name: 'Wisdom +8' }]
    }),
    createEntry({
      item: 'Heroic Zero Choice Item',
      cost: [{ name: 'Simple Ingot', quantity: 1 }]
    }),
    createEntry({
      item: 'Legendary Fixed Item',
      cost: [{ name: 'Simple Ingot', quantity: 1 }],
      choices: [{ name: 'Quality Strength +3' }]
    }),
    createEntry({
      item: 'Raid Automatic Item',
      cost: [
        { name: 'Simple Ingot', quantity: 1 },
        { name: 'Thread of Fate', quantity: 100 }
      ],
      effectsAdded: [{ name: 'Almost There' }],
      augments: [{ purple: null }]
    }),
    createEntry({ item: 'Future Item', stage: 'Almost There' })
  ]
}

const renderPage = (defaultColorScheme: MantineColorScheme = 'auto') =>
  render(
    <MantineProvider env='test' defaultColorScheme={defaultColorScheme}>
      <NearlyFinishedPage />
    </MantineProvider>
  )

const selectOption = async (user: ReturnType<typeof userEvent.setup>, label: string, option: string) => {
  await user.click(await screen.findByRole('combobox', { name: label }))
  await user.click(await screen.findByRole('option', { name: option }))
}

beforeAll(() => {
  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() })
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

beforeEach(() => {
  vi.mocked(loadManualPayload).mockResolvedValue(structuredClone(dataset))
})

afterEach(() => {
  cleanup()
  vi.mocked(loadManualPayload).mockReset()
  localStorage.clear()
})

afterAll(() => {
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  vi.unstubAllGlobals()
})

describe('NearlyFinishedPage data states', () => {
  it('loads recipes through the shared manifest loader and keeps loading stable', async () => {
    let resolveDataset: (value: NearlyFinishedDataset) => void = () => undefined
    vi.mocked(loadManualPayload).mockReturnValue(
      new Promise((resolve) => {
        resolveDataset = resolve
      })
    )

    renderPage()

    expect(screen.getByRole('heading', { name: 'Nearly Finished Crafting' })).toBeTruthy()
    expect(screen.getByRole('status').textContent).toContain('Loading Nearly Finished recipes…')
    expect(screen.queryByRole('combobox', { name: 'Item category' })).toBeNull()
    expect(loadManualPayload).toHaveBeenCalledWith('nearlyFinished.recipes')

    await act(async () => {
      resolveDataset(structuredClone(dataset))
      await Promise.resolve()
    })

    expect(await screen.findByRole('combobox', { name: 'Item category' })).toBeTruthy()
  })

  it('shows a friendly load failure and retries', async () => {
    vi.mocked(loadManualPayload).mockRejectedValueOnce(new Error('Manual payload request failed: 503 Unavailable'))

    renderPage()

    expect(await screen.findByText('Nearly Finished recipes are unavailable')).toBeTruthy()
    vi.mocked(loadManualPayload).mockResolvedValueOnce(structuredClone(dataset))
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByRole('combobox', { name: 'Item category' })).toBeTruthy()
    expect(loadManualPayload).toHaveBeenCalledTimes(2)
  })

  it('distinguishes unsupported schema and structurally invalid recipe data', async () => {
    vi.mocked(loadManualPayload).mockRejectedValueOnce(new UnsupportedManifestSchemaError(3))
    const first = renderPage()

    expect(await screen.findByText('Unsupported recipe data version')).toBeTruthy()
    first.unmount()

    vi.mocked(loadManualPayload).mockResolvedValueOnce({ meltingStation: [], reforgingStation: [{}] })
    renderPage()

    expect(await screen.findByText('Nearly Finished recipe data is invalid')).toBeTruthy()
  })

  it('shows a distinct empty-dataset state', async () => {
    vi.mocked(loadManualPayload).mockResolvedValue({ meltingStation: [], reforgingStation: [] })

    renderPage()

    expect(await screen.findByText('No Nearly Finished recipes found')).toBeTruthy()
    expect(screen.queryByRole('combobox', { name: 'Item category' })).toBeNull()
  })

  it('shows a distinct empty-category state', async () => {
    const user = userEvent.setup()
    vi.mocked(loadManualPayload).mockResolvedValue({
      meltingStation: [dataset.meltingStation[0]],
      reforgingStation: [createEntry({ item: 'Heroic Only Item', cost: [{ name: 'Simple Ingot', quantity: 1 }] })]
    })
    renderPage()

    await selectOption(user, 'Item category', 'Raid')

    expect(screen.getByText('No Raid items found')).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Item' }).hasAttribute('disabled')).toBe(true)
  })

  it('distinguishes cyclic dependencies and unknown missing ingredient recipes', async () => {
    vi.mocked(loadManualPayload).mockResolvedValueOnce({
      meltingStation: [
        { name: 'Alloy A', quantity: 1, requirements: [{ name: 'Alloy B', quantity: 1 }] },
        { name: 'Alloy B', quantity: 1, requirements: [{ name: 'Alloy A', quantity: 1 }] }
      ],
      reforgingStation: [createEntry({ item: 'Cyclic Item', cost: [{ name: 'Alloy A', quantity: 1 }] })]
    })
    const first = renderPage()

    expect(await screen.findByText('Cyclic recipe dependency detected')).toBeTruthy()
    first.unmount()

    vi.mocked(loadManualPayload).mockResolvedValueOnce({
      meltingStation: [],
      reforgingStation: [
        createEntry({ item: 'Missing Recipe Item', cost: [{ name: 'Unknown Compound', quantity: 1 }] })
      ]
    })
    renderPage()

    expect(await screen.findByText('A crafted ingredient recipe is missing')).toBeTruthy()
  })
})

describe('NearlyFinishedPage workflow', () => {
  it('starts empty with accessible controls and a disabled shopping list', async () => {
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Select an item category' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Item category' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Item' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: 'Shopping List' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('link', { name: 'Known issues / bug reports' }).getAttribute('href')).toContain(
      'label%3A%22Nearly%20Finished%22'
    )
  })

  it('renders multiple choices, direct costs, nested totals, and the ordered final step', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Item category', 'Heroic')
    await selectOption(user, 'Item', 'Heroic Choice Item')

    expect(screen.getByRole('heading', { name: 'Heroic Choice Item' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Property choice' })).toBeTruthy()
    await selectOption(user, 'Property choice', 'Dexterity +8')
    expect(screen.getAllByText('Dexterity +8').length).toBeGreaterThan(0)

    expect(screen.getByRole('heading', { name: 'Direct Reforging Cost' })).toBeTruthy()
    expect(screen.getAllByText('Complex Compound').length).toBeGreaterThan(0)
    expect(screen.getByText('Iron Defender Rivet')).toBeTruthy()
    expect(screen.getByText('×12')).toBeTruthy()

    expect(screen.getByText('Final reforging: Heroic Choice Item')).toBeTruthy()
  })

  it('clears incompatible items and property choices when category or item changes', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Item category', 'Heroic')
    await selectOption(user, 'Item', 'Heroic Choice Item')
    await selectOption(user, 'Property choice', 'Strength +8')
    await selectOption(user, 'Item', 'Heroic Zero Choice Item')

    expect(screen.queryByRole('combobox', { name: 'Property choice' })).toBeNull()
    expect(screen.queryByText('Strength +8')).toBeNull()

    await selectOption(user, 'Item category', 'Legendary')
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Item' }).value).toBe('')
    expect(screen.getByRole('heading', { name: 'Select an item' })).toBeTruthy()
  })

  it('preserves the legacy one-choice behavior by not rendering or retaining a selector', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Item category', 'Legendary')
    await selectOption(user, 'Item', 'Legendary Fixed Item')

    expect(screen.queryByRole('combobox', { name: 'Property choice' })).toBeNull()
    expect(screen.queryByText('Quality Strength +3')).toBeNull()
  })

  it('shows zero-choice automatic effects and augment information independently', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Item category', 'Raid')
    await selectOption(user, 'Item', 'Raid Automatic Item')

    expect(screen.queryByRole('combobox', { name: 'Property choice' })).toBeNull()
    expect(screen.getByText('Almost There')).toBeTruthy()
    expect(screen.getByText('Purple slot')).toBeTruthy()
    expect(screen.getAllByText('Thread of Fate').length).toBeGreaterThan(0)
  })

  it('opens a required-only shopping list with matching raw and crafted totals', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Item category', 'Heroic')
    await selectOption(user, 'Item', 'Heroic Choice Item')
    await user.click(screen.getByRole('button', { name: 'Shopping List' }))

    const drawer = screen.getByRole('dialog')
    expect(drawer.textContent).toContain('Shopping List — Heroic Choice Item')
    expect(drawer.textContent).toContain('required quantities only')
    expect(drawer.textContent).toContain('Iron Defender Rivet')
    expect(drawer.textContent).toContain('Simple Ingot')
    expect(drawer.textContent).toContain('Complex Compound')
    expect(drawer.textContent).not.toContain('Have / Required')
  })

  it('describes an empty raw-material list', async () => {
    const user = userEvent.setup()
    vi.mocked(loadManualPayload).mockResolvedValue({
      meltingStation: [{ name: 'Empty Component', quantity: 1, requirements: [] }],
      reforgingStation: [createEntry({ item: 'Empty Raw Item', cost: [{ name: 'Empty Component', quantity: 1 }] })]
    })
    renderPage()

    await selectOption(user, 'Item category', 'Heroic')
    await selectOption(user, 'Item', 'Empty Raw Item')

    expect(screen.getByText('No raw materials are required.')).toBeTruthy()
  })

  it('describes an empty crafted-material shopping list', async () => {
    const user = userEvent.setup()
    vi.mocked(loadManualPayload).mockResolvedValue({
      meltingStation: [],
      reforgingStation: [createEntry({ item: 'Raw Only Item', cost: [{ name: 'Thread of Fate', quantity: 10 }] })]
    })
    renderPage()

    await selectOption(user, 'Item category', 'Raid')
    await selectOption(user, 'Item', 'Raw Only Item')
    await user.click(screen.getByRole('button', { name: 'Shopping List' }))

    expect(screen.getByRole('dialog').textContent).toContain('No melting-station materials are required.')
  })

  it('reset returns the page to its initial state and closes the drawer', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Item category', 'Heroic')
    await selectOption(user, 'Item', 'Heroic Choice Item')
    await user.click(screen.getByRole('button', { name: 'Shopping List' }))
    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Item category' }).value).toBe('')
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Item' }).value).toBe('')
    expect(screen.getByRole('heading', { name: 'Select an item category' })).toBeTruthy()
  })

  it('supports completing the selection workflow with the keyboard', async () => {
    const user = userEvent.setup()
    renderPage()

    const category = await screen.findByRole('combobox', { name: 'Item category' })
    category.focus()
    await user.keyboard('{ArrowDown}{Enter}')

    const item = screen.getByRole('combobox', { name: 'Item' })
    item.focus()
    await user.keyboard('{ArrowDown}{Enter}')

    expect(screen.getByRole('heading', { name: /Heroic/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Shopping List' }).hasAttribute('disabled')).toBe(false)
  })

  it.each<MantineColorScheme>(['light', 'dark', 'auto'])(
    'renders the workflow in the %s color scheme',
    async (scheme) => {
      renderPage(scheme)

      expect(await screen.findByRole('combobox', { name: 'Item category' })).toBeTruthy()
      expect(screen.getByRole('heading', { name: 'Nearly Finished Crafting' })).toBeTruthy()
    }
  )

  it.each([
    [375, 667],
    [768, 1024],
    [1366, 768],
    [1920, 1080]
  ])('keeps the complete interaction available at a %i×%i viewport', async (width, height) => {
    Object.defineProperties(window, {
      innerWidth: { configurable: true, value: width },
      innerHeight: { configurable: true, value: height }
    })
    window.dispatchEvent(new Event('resize'))
    renderPage()

    expect(await screen.findByRole('combobox', { name: 'Item category' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Item' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Shopping List' })).toBeTruthy()
  })
})
