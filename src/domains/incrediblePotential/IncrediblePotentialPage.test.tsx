// @vitest-environment jsdom

import { type MantineColorScheme, MantineProvider } from '@mantine/core'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { UnsupportedManifestSchemaError } from '../../shared/data/loadDataset.ts'
import {
  type AltarRecipe,
  type RecipeIngredient,
  type RingUpgrade,
  type IncrediblePotentialData,
  InvalidIncrediblePotentialDataError,
  loadIncrediblePotentialData
} from './data.ts'
import IncrediblePotentialPage from './IncrediblePotentialPage.tsx'

vi.mock('./data.ts', async (importOriginal) => {
  const dataModule = await importOriginal<typeof import('./data.ts')>()
  return { ...dataModule, loadIncrediblePotentialData: vi.fn() }
})

const material = (name: string, quantity = 1): RecipeIngredient => ({ name, quantity })
const crafted = ({ recipeId, name }: AltarRecipe, quantity = 1): RecipeIngredient => ({ name, quantity, recipeId })
const makeRecipe = (recipeId: number, name: string, ingredients: RecipeIngredient[]) => ({
  recipeId,
  name,
  stage: 'component' as const,
  ingredients
})

const focus = makeRecipe(1, 'Focus of Fire', [
  material('Medium Devil Scales'),
  material('Shavarath Medium Energy Cell')
])
const gem = makeRecipe(2, 'Gem of Dominion', [material('Medium Gnawed Bone'), material('Shavarath Medium Energy Cell')])
const essence = makeRecipe(3, 'Material Essence', [
  material('Medium Twisted Shrapnel'),
  material('Shavarath Medium Energy Cell')
])
const shard: AltarRecipe = {
  ...makeRecipe(4, 'Material Fire Dominion Shard of Great Power', [
    crafted(focus),
    crafted(gem),
    crafted(essence),
    material('Shard of Great Power'),
    material('Shavarath Medium Energy Cell')
  ]),
  stage: 'shardImbuement'
}

const fireUpgrade: RingUpgrade = {
  ...makeRecipe(5, 'Material Fire Dominion Ring Upgrade', [crafted(shard), material('Shavarath Trophy of War', 9)]),
  stage: 'ringUpgrade',
  ringIds: [100, 200],
  added: [{ name: 'Flaming Burst', notes: 'Adds fire damage on critical hits.' }]
}
const insightUpgrade: RingUpgrade = {
  ...makeRecipe(6, 'Material Fire Escalation Ring Upgrade', [crafted(shard), material('Shavarath Trophy of War', 9)]),
  stage: 'ringUpgrade',
  ringIds: [100, 200],
  added: [{ name: 'Dexterity', modifier: 2, bonus: 'Insight' }]
}

const data: IncrediblePotentialData = {
  rings: [
    {
      id: 100,
      name: "Amara's Band",
      type: 'Ring',
      minLevel: 18,
      setName: 'Exorcist of the Silver Flame',
      enchantments: [
        { name: 'Wisdom', modifier: '6', bonus: 'Enhancement' },
        { name: 'Charisma', modifier: '1', bonus: 'Exceptional' },
        { name: 'Incredible Potential' }
      ]
    },
    {
      id: 200,
      name: 'Whisper Ring',
      type: 'Ring',
      minLevel: 18,
      setName: 'Assassin',
      enchantments: [
        { name: 'Dexterity', modifier: '6', bonus: 'Enhancement' },
        { name: 'Intelligence', modifier: '1', bonus: 'Exceptional' },
        { name: 'Incredible Potential' }
      ]
    }
  ],
  recipes: [focus, gem, essence, shard, fireUpgrade, insightUpgrade],
  ingredients: [{ name: 'Medium Devil Scales', foundIn: ['Tower of Despair'] }]
}

const renderPage = (colorScheme: MantineColorScheme = 'auto') =>
  render(
    <MantineProvider env='test' defaultColorScheme={colorScheme}>
      <IncrediblePotentialPage />
    </MantineProvider>
  )

const selectOption = async (user: ReturnType<typeof userEvent.setup>, label: string, option: RegExp | string) => {
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
  vi.mocked(loadIncrediblePotentialData).mockResolvedValue(structuredClone(data))
})

afterEach(() => {
  cleanup()
  vi.mocked(loadIncrediblePotentialData).mockReset()
})

afterAll(() => {
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  vi.unstubAllGlobals()
})

describe('IncrediblePotentialPage', () => {
  it('shows a stable loading state and the preserved title and subtitle', async () => {
    let resolveData: (value: IncrediblePotentialData) => void = () => undefined
    vi.mocked(loadIncrediblePotentialData).mockReturnValue(
      new Promise((resolve) => {
        resolveData = resolve
      })
    )

    renderPage()

    expect(screen.getByRole('heading', { name: 'Incredible Potential Crafting' })).toBeTruthy()
    expect(screen.getByText('Tower of Despair Rings')).toBeTruthy()
    expect(screen.getByText('Loading Incredible Potential data…')).toBeTruthy()
    expect(screen.queryByRole('combobox', { name: 'Base ring' })).toBeNull()

    await act(async () => {
      resolveData(structuredClone(data))
      await Promise.resolve()
    })

    expect(await screen.findByRole('combobox', { name: 'Base ring' })).toBeTruthy()
  })

  it('distinguishes request, invalid, unsupported-schema, and empty dataset states and supports retry', async () => {
    vi.mocked(loadIncrediblePotentialData)
      .mockRejectedValueOnce(new Error('Unavailable'))
      .mockResolvedValueOnce(structuredClone(data))

    renderPage()
    expect(await screen.findByText('Crafting data is unavailable')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByRole('combobox', { name: 'Base ring' })).toBeTruthy()

    cleanup()
    vi.mocked(loadIncrediblePotentialData).mockRejectedValueOnce(new InvalidIncrediblePotentialDataError())
    renderPage()
    expect(await screen.findByText('Incredible Potential data is invalid')).toBeTruthy()

    cleanup()
    vi.mocked(loadIncrediblePotentialData).mockRejectedValueOnce(new UnsupportedManifestSchemaError(3))
    renderPage()
    expect(await screen.findByText('Unsupported crafting data version')).toBeTruthy()

    cleanup()
    vi.mocked(loadIncrediblePotentialData).mockResolvedValueOnce({ rings: [], recipes: [], ingredients: [] })
    renderPage()
    expect(await screen.findByText('No Tower of Despair rings found')).toBeTruthy()

    cleanup()
    vi.mocked(loadIncrediblePotentialData).mockResolvedValueOnce({ ...structuredClone(data), recipes: [] })
    renderPage()
    expect(await screen.findByText('No Incredible Potential upgrades found')).toBeTruthy()
  })

  it('reports missing and cyclic recipe dependencies before rendering controls', async () => {
    vi.mocked(loadIncrediblePotentialData).mockResolvedValueOnce({
      ...structuredClone(data),
      recipes: data.recipes.filter(({ name }) => name !== shard.name)
    })
    renderPage()
    expect(await screen.findByText('A crafting recipe is missing')).toBeTruthy()

    cleanup()
    vi.mocked(loadIncrediblePotentialData).mockResolvedValueOnce({
      ...structuredClone(data),
      recipes: data.recipes.map((recipe) =>
        recipe.name === focus.name ? { ...recipe, ingredients: [crafted(shard)] } : recipe
      )
    })
    renderPage()
    expect(await screen.findByText('Cyclic recipe dependency detected')).toBeTruthy()
  })

  it('selects a ring and upgrade, replaces the placeholder once, and renders the complete plan', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Base ring', /Amara's Band/)
    expect(screen.getByRole('heading', { name: "Amara's Band" })).toBeTruthy()
    expect(screen.getByText('Item type: Ring')).toBeTruthy()
    expect(screen.getByText('Slots: First Finger, Second Finger')).toBeTruthy()
    expect(screen.getByText('Ingredient type: Ring of Incredible Potential')).toBeTruthy()
    expect(screen.getByText('Binding: Bound to Character on Acquisition')).toBeTruthy()
    expect(screen.getByText('Item set: Exorcist of the Silver Flame')).toBeTruthy()
    const ringDetails = screen.getByRole('heading', { name: "Amara's Band" }).closest<HTMLElement>('[data-with-border]')
    if (!ringDetails) throw new Error('Ring details card not found')
    expect(within(ringDetails).getByText(/Incredible Potential is unresolved/)).toBeTruthy()

    await selectOption(user, 'Upgrade effect', /Flaming Burst/)

    expect(within(ringDetails).queryByText(/Incredible Potential is unresolved/)).toBeNull()
    expect(within(ringDetails).getAllByText('Flaming Burst')).toHaveLength(1)
    expect(within(ringDetails).getByText('Adds fire damage on critical hits.')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Total Shopping List' })).toBeTruthy()
    expect(screen.getAllByText('×9')).toHaveLength(2)
    expect(screen.queryByText('Found in: Tower of Despair')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Crafting Steps' })).toBeTruthy()
    expect(screen.getByText('The Focus, Gem, and Essence can be crafted in any order.')).toBeTruthy()
    expect(screen.getByText(/Apply the upgrade to Amara's Band/)).toBeTruthy()
    expect(screen.getByText('Bring charged Medium Energy Cells to the altar.')).toBeTruthy()

    const image = ringDetails.querySelector('img')
    expect(image?.getAttribute('alt')).toBe('')
    expect(image?.getAttribute('src')).toContain('ringOfIncrediblePotential.png')
  })

  it('uses one OR/AND mode, reports matches, and keeps excluded selections', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Base ring', /Amara's Band/)
    await selectOption(user, 'Upgrade effect', /Flaming Burst/)
    await selectOption(user, 'Ring effects and item sets', 'Dexterity')

    expect(screen.getByText('1 of 2 rings shown.')).toBeTruthy()
    expect(screen.getByRole('heading', { name: "Amara's Band" })).toBeTruthy()
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Base ring' }).value).toContain("Amara's Band")
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Upgrade effect' }).value).toContain('Flaming Burst')

    await selectOption(user, 'Ring effects and item sets', 'Wisdom')
    expect(screen.getByText('2 of 2 rings shown.')).toBeTruthy()

    await user.click(screen.getByText('Match all'))
    expect(screen.getByText('No rings match')).toBeTruthy()
    expect(screen.getByRole('heading', { name: "Amara's Band" })).toBeTruthy()

    await selectOption(user, 'Upgrade effects', 'Dexterity')
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Upgrade effect' }).value).toContain('Flaming Burst')
    await selectOption(user, 'Upgrade effects', 'Flaming Burst')
    expect(screen.getByText('No upgrades match')).toBeTruthy()
  })

  it('groups ring effects and item sets while keeping both groups selectable', async () => {
    const user = userEvent.setup()
    renderPage()

    const filters = await screen.findByRole('combobox', { name: 'Ring effects and item sets' })
    await user.click(filters)

    expect(screen.getByText('Item effects')).toBeTruthy()
    expect(screen.getByText('Item sets')).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Wisdom' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Exorcist of the Silver Flame' })).toBeTruthy()

    await user.click(screen.getByRole('option', { name: 'Exorcist of the Silver Flame' }))
    expect(screen.getByText('1 of 2 rings shown.')).toBeTruthy()
  })

  it('preserves the chosen upgrade across ring changes and clears all user state on reset', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Base ring', /Amara's Band/)
    await selectOption(user, 'Upgrade effect', /Dexterity \(\+2 Insight\)/)
    await selectOption(user, 'Base ring', /Whisper Ring/)

    expect(screen.getByRole('heading', { name: 'Whisper Ring' })).toBeTruthy()
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Upgrade effect' }).value).toContain('Dexterity')

    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.queryByRole('heading', { name: 'Whisper Ring' })).toBeNull()
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Base ring' }).value).toBe('')
    expect(screen.getByText('2 of 2 rings shown.')).toBeTruthy()
  })

  it('only offers upgrades whose keeper accepts the selected ring', async () => {
    const user = userEvent.setup()
    vi.mocked(loadIncrediblePotentialData).mockResolvedValueOnce({
      ...data,
      recipes: [focus, gem, essence, shard, fireUpgrade, { ...insightUpgrade, ringIds: [100] }]
    })
    renderPage()

    await selectOption(user, 'Base ring', /Amara's Band/)
    await selectOption(user, 'Upgrade effect', /Dexterity/)
    await selectOption(user, 'Base ring', /Whisper Ring/)

    expect(screen.getByText('1 of 1 upgrades shown.')).toBeTruthy()
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Upgrade effect' }).value).toBe('')
    expect(screen.queryByRole('heading', { name: 'Total Shopping List' })).toBeNull()
    await selectOption(user, 'Upgrade effect', /Flaming Burst/)
    expect(screen.getByRole('heading', { name: 'Total Shopping List' })).toBeTruthy()
  })

  it('changes the resolved upgrade without duplicating stale effect details', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Base ring', /Amara's Band/)
    await selectOption(user, 'Upgrade effect', /Flaming Burst/)
    expect(screen.getByText('Adds fire damage on critical hits.')).toBeTruthy()

    await selectOption(user, 'Upgrade effect', /Dexterity \(\+2 Insight\)/)

    expect(screen.queryByText('Adds fire damage on critical hits.')).toBeNull()
    expect(screen.getAllByText('Dexterity (+2 Insight)')).toHaveLength(1)
  })

  it('announces multiple upgrade results when an active filter remains ambiguous', async () => {
    const user = userEvent.setup()
    const secondDexterityUpgrade = {
      ...insightUpgrade,
      recipeId: 7,
      name: 'Material Air Escalation Ring Upgrade'
    }
    vi.mocked(loadIncrediblePotentialData).mockResolvedValueOnce({
      ...structuredClone(data),
      recipes: [...data.recipes, secondDexterityUpgrade]
    })
    renderPage()

    await selectOption(user, 'Base ring', /Amara's Band/)
    await selectOption(user, 'Upgrade effects', 'Dexterity')

    expect(screen.getByText('2 of 3 upgrades shown.')).toBeTruthy()
    expect(screen.getByText(/Multiple upgrades match/)).toBeTruthy()
  })

  it.each([375, 768, 1366, 1920])('keeps all controls and results available at a %ipx viewport', async (width) => {
    const user = userEvent.setup()
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    window.dispatchEvent(new Event('resize'))
    renderPage()

    const ringSelect = await screen.findByRole('combobox', { name: 'Base ring' })
    ringSelect.focus()
    expect(document.activeElement).toBe(ringSelect)
    expect(screen.getByText('Match any')).toBeTruthy()

    await selectOption(user, 'Base ring', /Amara's Band/)
    expect(screen.getByRole('combobox', { name: 'Upgrade effect' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: "Amara's Band" })).toBeTruthy()
  })

  it.each<MantineColorScheme>(['light', 'dark', 'auto'])('renders in the %s color scheme', async (scheme) => {
    renderPage(scheme)

    expect(await screen.findByRole('combobox', { name: 'Base ring' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Incredible Potential Crafting' })).toBeTruthy()
  })

  it('allows active filters to be removed from the keyboard', async () => {
    const user = userEvent.setup()
    renderPage()

    await selectOption(user, 'Ring effects and item sets', 'Wisdom')
    expect(screen.getByText('1 of 2 rings shown.')).toBeTruthy()

    const filters = screen.getByRole('combobox', { name: 'Ring effects and item sets' })
    filters.focus()
    await user.keyboard('{Backspace}')

    expect(screen.getByText('2 of 2 rings shown.')).toBeTruthy()
  })
})
