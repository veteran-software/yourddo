// @vitest-environment jsdom

import { type MantineColorScheme, MantineProvider } from '@mantine/core'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import CauldronOfCadencePage from './CauldronOfCadencePage.tsx'
import {
  type CauldronEffect,
  type CauldronRecipe,
  InvalidCauldronRecipesError,
  loadCauldronRecipes
} from './recipes.ts'

vi.mock('./recipes.ts', async (importOriginal) => {
  const recipes = await importOriginal<typeof import('./recipes.ts')>()

  return {
    ...recipes,
    loadCauldronRecipes: vi.fn()
  }
})

const createRecipe = (item: string, set: string, effects: CauldronEffect[]): CauldronRecipe => ({
  augmentType: 'Colorless',
  baseValue: { platinum: 500 },
  binding: { type: 'Bound', to: 'Account', from: 'Acquisition' },
  craftedIn: 'Cauldron of Cadence',
  description: `Slotting this Augment in any Augment Slot will override its Set Bonus to the ${set} set.`,
  image: 'cauldronOfCadenceAugment',
  minimumLevel: 30,
  name: `Set Augment: ${set}`,
  quantity: 1,
  requirements: [
    { name: 'Thread of Fate', quantity: 50 },
    { name: 'Empty Soul Vessel', quantity: 1 },
    { name: item, quantity: 1 }
  ],
  setBonus: [{ name: set, numPiecesEquipped: 3, enhancements: effects }],
  weight: 0.01
})

const perfectSilence = createRecipe('Vestments of Ravenloft', 'Perfect Silence', [
  { name: 'Sneak Attack Dice', modifier: 3, bonus: 'Artifact' }
])
const duskRaider = createRecipe('Coat of Van Richten', 'Dusk Raider', [
  { name: 'Melee Power', modifier: 15, bonus: 'Artifact' },
  { name: 'Ranged Power', modifier: 15, bonus: 'Artifact' }
])
const recipes = [perfectSilence, duskRaider]

const renderPage = (defaultColorScheme: MantineColorScheme = 'auto') =>
  render(
    <MantineProvider env='test' defaultColorScheme={defaultColorScheme}>
      <CauldronOfCadencePage />
    </MantineProvider>
  )

const selectOption = async (user: ReturnType<typeof userEvent.setup>, label: string, option: string) => {
  await user.click(await screen.findByRole('combobox', { name: label }))
  await user.click(await screen.findByRole('option', { name: option }))
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
  vi.mocked(loadCauldronRecipes).mockResolvedValue(recipes)
})

afterEach(() => {
  cleanup()
  vi.mocked(loadCauldronRecipes).mockReset()
  localStorage.clear()
})

afterAll(() => {
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  vi.unstubAllGlobals()
})

describe('CauldronOfCadencePage', () => {
  it('shows a stable loading state before rendering controls', async () => {
    let resolveRecipes: (value: CauldronRecipe[]) => void = () => undefined
    vi.mocked(loadCauldronRecipes).mockReturnValue(
      new Promise((resolve) => {
        resolveRecipes = resolve
      })
    )

    renderPage()

    expect(screen.getByRole('heading', { name: 'Cauldron of Cadence' })).toBeTruthy()
    expect(screen.getByText('Loading Cauldron recipes…')).toBeTruthy()
    expect(screen.queryByRole('combobox', { name: 'Required item' })).toBeNull()

    await act(async () => {
      resolveRecipes(recipes)
      await Promise.resolve()
    })

    expect(await screen.findByRole('combobox', { name: 'Required item' })).toBeTruthy()
  })

  it('shows a friendly failure and recovers on retry', async () => {
    const cause = new Error('Manual payload request failed: 503 Unavailable')
    cause.stack = 'private stack trace'
    vi.mocked(loadCauldronRecipes).mockRejectedValueOnce(cause).mockResolvedValueOnce(recipes)

    renderPage()

    expect(await screen.findByText('Cauldron recipes are unavailable')).toBeTruthy()
    expect(screen.getByText(/Check your connection and try again/)).toBeTruthy()
    expect(screen.queryByText('private stack trace')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByRole('combobox', { name: 'Required item' })).toBeTruthy()
    expect(screen.queryByText('Cauldron recipes are unavailable')).toBeNull()
  })

  it('distinguishes invalid data from a request failure and retries it', async () => {
    vi.mocked(loadCauldronRecipes)
      .mockRejectedValueOnce(new InvalidCauldronRecipesError())
      .mockResolvedValueOnce(recipes)

    renderPage()

    expect(await screen.findByText('Cauldron recipe data is invalid')).toBeTruthy()
    expect(screen.getByText(/does not match the expected Cauldron recipe format/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByRole('combobox', { name: 'Required item' })).toBeTruthy()
  })

  it('shows a distinct empty-dataset state', async () => {
    vi.mocked(loadCauldronRecipes).mockResolvedValue([])

    renderPage()

    expect(await screen.findByText('No Cauldron recipes found')).toBeTruthy()
    expect(screen.queryByRole('combobox', { name: 'Required item' })).toBeNull()
  })

  it('shows clear empty states before selection and before an upgrade is chosen', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Select an item or effect' })).toBeTruthy()

    await selectOption(user, 'Required item', 'Vestments of Ravenloft')

    expect(screen.getByRole('heading', { name: 'Select an upgrade effect' })).toBeTruthy()
    expect(screen.getByText(/available effect for Vestments of Ravenloft/)).toBeTruthy()
  })

  it('disables unavailable items and effects, then renders the selected recipe', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Required item', 'Vestments of Ravenloft')
    await user.click(screen.getByRole('combobox', { name: 'Set bonus effect' }))

    const availableEffect = await screen.findByRole('option', { name: 'Sneak Attack Dice (+3 Artifact)' })
    const unavailableEffect = screen.getByRole('option', {
      name: 'Melee Power (+15 Artifact), Ranged Power (+15 Artifact)'
    })
    expect(availableEffect.hasAttribute('data-combobox-disabled')).toBe(false)
    expect(unavailableEffect.hasAttribute('data-combobox-disabled')).toBe(true)

    await user.click(availableEffect)

    expect(screen.getByRole('heading', { name: 'Set Augment: Perfect Silence' })).toBeTruthy()
    expect(screen.getByText('Perfect Silence')).toBeTruthy()
    expect(screen.getByText('3 pieces')).toBeTruthy()
    expect(screen.getAllByText('Sneak Attack Dice (+3 Artifact)')).not.toHaveLength(0)
    expect(screen.getByText('Minimum Level 30')).toBeTruthy()
    expect(screen.getByText('Bound to Account on Acquisition')).toBeTruthy()
    expect(screen.getByText('Thread of Fate')).toBeTruthy()
    expect(screen.getByText('×50')).toBeTruthy()

    await user.click(screen.getByRole('combobox', { name: 'Required item' }))
    expect(
      (await screen.findByRole('option', { name: 'Coat of Van Richten' })).hasAttribute('data-combobox-disabled')
    ).toBe(true)
  })

  it('supports effect-first selection and resets the whole selection', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Set bonus effect', 'Melee Power (+15 Artifact), Ranged Power (+15 Artifact)')

    expect(screen.getByRole('heading', { name: 'Set Augment: Dusk Raider' })).toBeTruthy()
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Required item' }).value).toBe('Coat of Van Richten')

    await user.click(screen.getByRole('button', { name: 'Clear selection' }))

    expect(screen.getByRole('heading', { name: 'Select an item or effect' })).toBeTruthy()
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Required item' }).value).toBe('')
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Set bonus effect' }).value).toBe('')
  })

  it('preserves the usage note, minimum-level warning, and known-issues link', async () => {
    renderPage()

    const usageNote = await screen.findByText(/Choose an item you have or an effect you want/)
    expect(usageNote.style.color).toContain('light-dark')
    expect(screen.getByText(/All Cauldron set augments are Minimum Level 30/)).toBeTruthy()
    const link = screen.getByRole('link', { name: 'Known issues / bug reports' })
    expect(link.getAttribute('href')).toContain('label%3A%22Cauldron%20of%20Cadence%22')
    expect(link.getAttribute('target')).toBe('_blank')
  })

  it.each<MantineColorScheme>(['light', 'dark', 'auto'])('renders in the %s color scheme', async (scheme) => {
    renderPage(scheme)

    expect(await screen.findByRole('combobox', { name: 'Required item' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Cauldron of Cadence' })).toBeTruthy()
  })

  it.each([390, 768, 1280, 1920])('keeps the complete interaction available at a %ipx viewport', async (width) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    window.dispatchEvent(new Event('resize'))
    renderPage()

    expect(await screen.findByRole('combobox', { name: 'Required item' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Set bonus effect' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Select an item or effect' })).toBeTruthy()
  })

  it('exposes selection and reset controls to keyboard focus', async () => {
    const user = userEvent.setup()
    renderPage()

    const itemSelect = await screen.findByRole('combobox', { name: 'Required item' })
    itemSelect.focus()
    expect(document.activeElement).toBe(itemSelect)

    await user.keyboard('{ArrowDown}{Enter}')
    expect(screen.getByRole('heading', { name: 'Select an upgrade effect' })).toBeTruthy()

    const effectSelect = screen.getByRole('combobox', { name: 'Set bonus effect' })
    effectSelect.focus()
    await user.keyboard('{ArrowDown}{Enter}')
    const clear = await screen.findByRole('button', { name: 'Clear selection' })
    clear.focus()
    expect(document.activeElement).toBe(clear)
    expect(clear.className).toContain('mantine-focus-auto')
  })
})
