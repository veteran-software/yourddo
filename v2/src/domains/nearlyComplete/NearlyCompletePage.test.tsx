// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { loadNearlyCompleteItems, type NearlyCompleteItem } from './data.ts'
import NearlyCompletePage from './NearlyCompletePage.tsx'
import { getRecipeCategory, getRecipeTier, nearlyCompleteRecipes } from './recipes.ts'

vi.mock('./data.ts', async (importOriginal) => {
  const data = await importOriginal<typeof import('./data.ts')>()

  return {
    ...data,
    loadNearlyCompleteItems: vi.fn()
  }
})

const item = (name: string, property = 'Ability Score'): NearlyCompleteItem => ({
  pageTitle: name,
  name,
  type: 'Necklace',
  minLevel: '11',
  enchantments: [{ name: `Nearly Complete: ${property}` }]
})

const renderPage = () =>
  render(
    <MantineProvider env='test'>
      <NearlyCompletePage />
    </MantineProvider>
  )

const selectOption = async (user: ReturnType<typeof userEvent.setup>, label: string, option: string) => {
  await user.click(screen.getByRole('combobox', { name: label }))
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

afterEach(() => {
  cleanup()
  vi.mocked(loadNearlyCompleteItems).mockReset()
})

afterAll(() => {
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  vi.unstubAllGlobals()
})

describe('NearlyCompletePage', () => {
  it('keeps the page controls visible while eligible items load', async () => {
    let resolveItems: (items: NearlyCompleteItem[]) => void = () => undefined
    vi.mocked(loadNearlyCompleteItems).mockReturnValue(
      new Promise((resolve) => {
        resolveItems = resolve
      })
    )

    renderPage()

    expect(screen.getByRole('heading', { name: 'Nearly Complete' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Completed Property' })).toBeTruthy()
    expect(screen.getByText('Loading eligible items…')).toBeTruthy()

    await act(async () => {
      resolveItems([item('Astral Spore Pendant')])
      await Promise.resolve()
    })

    expect(await screen.findByText(/Astral Spore Pendant/)).toBeTruthy()
  })

  it.each(['Manifest request failed: 503 Unavailable', 'Dataset request failed: 503 Unavailable'])(
    'shows a friendly failure for %s and recovers on retry',
    async (message) => {
      const cause = new Error(message)
      cause.stack = 'private stack trace'
      vi.mocked(loadNearlyCompleteItems)
        .mockRejectedValueOnce(cause)
        .mockResolvedValueOnce([item('Retry Pendant')])

      renderPage()

      expect(await screen.findByText('Eligible items are unavailable')).toBeTruthy()
      expect(screen.getByText(/Check your connection and try again/)).toBeTruthy()
      expect(screen.getByText(message)).toBeTruthy()
      expect(screen.queryByText('private stack trace')).toBeNull()

      fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

      expect(await screen.findByText(/Retry Pendant/)).toBeTruthy()
      expect(screen.queryByText('Eligible items are unavailable')).toBeNull()
    }
  )

  it('explains the incomplete selection and shows the selected recipe', async () => {
    const user = userEvent.setup()
    vi.mocked(loadNearlyCompleteItems).mockResolvedValue([item('Recipe Pendant')])

    renderPage()

    expect(await screen.findByText(/Recipe Pendant/)).toBeTruthy()
    expect(screen.getByText(/Select a Completed Property above/)).toBeTruthy()

    const completedProperty = screen.getByRole('combobox', { name: 'Completed Property' })
    completedProperty.focus()
    await user.keyboard('Strength +6')
    await user.keyboard('{ArrowDown}{Enter}')

    expect(screen.getByRole('heading', { name: 'Strength +6' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Recipe Requirements' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Resulting Effects' })).toBeTruthy()
  })

  it('distinguishes a loaded dataset with no matching item from a request failure', async () => {
    vi.mocked(loadNearlyCompleteItems).mockResolvedValue([item('Skill Pendant', 'Skill')])

    renderPage()

    expect(await screen.findByText('No eligible items found')).toBeTruthy()
    expect(screen.getByText(/does not contain a Heroic item with Nearly Complete: Ability Score/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull()
  })

  it('keeps a completed selection after a failed request is retried', async () => {
    const user = userEvent.setup()
    vi.mocked(loadNearlyCompleteItems)
      .mockRejectedValueOnce(new Error('Dataset request failed'))
      .mockResolvedValueOnce([item('Recovered Pendant')])

    renderPage()

    expect(await screen.findByText('Eligible items are unavailable')).toBeTruthy()
    await selectOption(user, 'Completed Property', 'Strength +6')
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => {
      expect(screen.getByText(/Recovered Pendant/)).toBeTruthy()
    })
    expect(screen.getByRole('heading', { name: 'Strength +6' })).toBeTruthy()
  })

  it.each(nearlyCompleteRecipes)(
    'renders the requirements and effects for $name',
    async (recipe) => {
      const user = userEvent.setup()
      const tier = getRecipeTier(recipe)
      const category = getRecipeCategory(recipe)
      vi.mocked(loadNearlyCompleteItems).mockResolvedValue([])

      renderPage()

      if (tier !== 'Heroic') await selectOption(user, 'Item Tier', tier)
      if (category !== 'Ability Score') await selectOption(user, 'Nearly Complete Property', category)
      await selectOption(user, 'Completed Property', recipe.name)

      expect(screen.getByRole('heading', { name: recipe.name })).toBeTruthy()
      expect(screen.getByText(`Crafted in: ${recipe.craftedIn}`)).toBeTruthy()

      for (const requirement of recipe.requirements) {
        expect(screen.getByText(requirement.name)).toBeTruthy()
        expect(screen.getAllByText(`×${(requirement.quantity ?? 1).toString()}`).length).toBeGreaterThan(0)
      }

      for (const effect of recipe.effectsAdded) {
        expect(screen.getByText(effect.name)).toBeTruthy()
        expect(screen.getAllByText(effect.modifier != null ? `+${effect.modifier}` : '—').length).toBeGreaterThan(0)
        if (effect.bonus) expect(screen.getAllByText(effect.bonus).length).toBeGreaterThan(0)
      }
    },
    10_000
  )
})
