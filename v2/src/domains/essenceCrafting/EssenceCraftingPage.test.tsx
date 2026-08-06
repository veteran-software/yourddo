// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadEssenceCraftingData, validateEssenceCraftingDataset } from './data.ts'
import EssenceCraftingPage from './EssenceCraftingPage.tsx'
import { createEssenceCraftingTestPayload } from './test-fixture.ts'

vi.mock('./data.ts', async (importOriginal) => {
  const data = await importOriginal<typeof import('./data.ts')>()

  return {
    ...data,
    loadEssenceCraftingData: vi.fn()
  }
})

const createPageData = () => {
  const payload = createEssenceCraftingTestPayload()
  payload.enhancements.push({
    id: 'enhancement-main-hand-extra',
    displayName: 'Main Hand Extra',
    minimumItemLevel: 1,
    placements: [{ position: 'extra', itemCategoryIds: ['weapon'] }],
    effects: [{ id: 'effect-main-hand-extra', displayName: 'Main Hand Extra Effect' }],
    recipes: { boundRecipeId: 'recipe-enhancement-bound', unboundRecipeId: 'recipe-enhancement-unbound' }
  })
  return validateEssenceCraftingDataset(payload)
}

const renderPage = () =>
  render(
    <MantineProvider env='test'>
      <EssenceCraftingPage />
    </MantineProvider>
  )

const selectOption = async (user: ReturnType<typeof userEvent.setup>, label: string, option: string) => {
  await user.click(await screen.findByRole('combobox', { name: label }))
  await user.click(await screen.findByRole('option', { name: option }))
}

const getSelect = (label: string) => screen.getByRole<HTMLInputElement>('combobox', { name: label })

const activateMainHand = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: 'Plan a Main Hand' }))
  await screen.findByRole('heading', { name: 'Main Hand' })
}

beforeAll(() => {
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn()
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

beforeEach(() => {
  vi.mocked(loadEssenceCraftingData).mockResolvedValue(createPageData())
})

afterEach(() => {
  cleanup()
  vi.mocked(loadEssenceCraftingData).mockReset()
})

afterAll(() => {
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  vi.unstubAllGlobals()
})

describe('EssenceCraftingPage', () => {
  it('shows a CDN loading state while retaining the page title', async () => {
    let resolveData: (value: ReturnType<typeof createPageData>) => void = () => undefined
    vi.mocked(loadEssenceCraftingData).mockReturnValue(
      new Promise((resolve) => {
        resolveData = resolve
      })
    )

    renderPage()

    expect(screen.getByRole('heading', { name: 'Essence Crafting' })).toBeTruthy()
    expect(screen.getByRole('status').textContent).toContain('Loading Essence Crafting data…')

    await act(async () => {
      resolveData(createPageData())
      await Promise.resolve()
    })

    expect(await screen.findByRole('combobox', { name: 'Master minimum level' })).toBeTruthy()
  })

  it('renders the loaded page title without requiring a route', async () => {
    renderPage()

    expect(await screen.findByTestId('workspace-layout')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Essence Crafting' })).toBeTruthy()
    expect(screen.getByText(/Plan one crafted item/)).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Master minimum level' })).toBeTruthy()
  })

  it('retries a failed CDN load', async () => {
    vi.mocked(loadEssenceCraftingData)
      .mockRejectedValueOnce(new Error('Dataset request failed: 503 Unavailable'))
      .mockResolvedValueOnce(createPageData())

    renderPage()

    expect(await screen.findByText('Essence Crafting data is unavailable')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByRole('combobox', { name: 'Master minimum level' })).toBeTruthy()
    expect(vi.mocked(loadEssenceCraftingData)).toHaveBeenCalledTimes(2)
  })

  it('updates the master minimum level', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Master minimum level', '2')

    expect(getSelect('Master minimum level').value).toBe('2')
  })

  it('activates the intentionally limited Main Hand slot', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateMainHand(user)

    expect(screen.queryByText(/only a Main Hand item/)).toBeNull()
    expect(screen.getByRole('combobox', { name: 'Prefix' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Plan a Main Hand' })).toBeNull()
  })

  it('selects a prefix by stable enhancement ID', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateMainHand(user)
    await selectOption(user, 'Prefix', 'Alpha Prefix')

    expect(getSelect('Prefix').value).toBe('Alpha Prefix')
  })

  it('selects an eligible suffix after raising the master minimum level', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateMainHand(user)
    await selectOption(user, 'Master minimum level', '2')
    await selectOption(user, 'Suffix', 'Level Two Suffix')

    expect(getSelect('Suffix').value).toBe('Level Two Suffix')
  })

  it('enables Extra when the Mark of House Cannith is selected', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateMainHand(user)
    expect(getSelect('Extra').disabled).toBe(true)

    await user.click(screen.getByRole('switch', { name: 'Mark of House Cannith' }))

    expect(getSelect('Extra').disabled).toBe(false)
    await selectOption(user, 'Extra', 'Main Hand Extra')
    expect(getSelect('Extra').value).toBe('Main Hand Extra')
  })

  it('clears Extra when the Mark of House Cannith is disabled', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateMainHand(user)
    const mark = screen.getByRole('switch', { name: 'Mark of House Cannith' })
    await user.click(mark)
    await selectOption(user, 'Extra', 'Main Hand Extra')
    await user.click(mark)

    expect(getSelect('Extra').disabled).toBe(true)
    expect(getSelect('Extra').value).toBe('')
  })

  it('shows the effective item minimum level', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateMainHand(user)
    await selectOption(user, 'Master minimum level', '2')

    expect(screen.getByText('Effective minimum level: 2')).toBeTruthy()
  })

  it('renders a split-prefix enhancement as one prefix option', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateMainHand(user)
    await user.click(screen.getByRole('combobox', { name: 'Prefix' }))

    expect(await screen.findAllByRole('option', { name: 'Split Prefix Test' })).toHaveLength(1)
  })
})
