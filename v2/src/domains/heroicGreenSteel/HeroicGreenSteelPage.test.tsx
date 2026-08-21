// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  loadHeroicGreenSteelInitialData,
  loadHeroicGreenSteelRecipeData,
  loadHeroicGreenSteelTier2Data,
  loadHeroicGreenSteelTier3Data
} from './data.ts'
import type {
  HgsBaseItem,
  HgsEffect,
  HgsIngredient,
  HgsInitialData,
  HgsRecipe,
  HgsRecipeData,
  HgsSpell,
  HgsTier2Data,
  HgsTier3Data,
  HgsTierOption
} from './heroicGreenSteel.types.ts'
import HeroicGreenSteelPage from './HeroicGreenSteelPage.tsx'
import { sortHgsSelectOptions } from './selectOptions.ts'

vi.mock('./data.ts', () => ({
  loadHeroicGreenSteelInitialData: vi.fn(),
  loadHeroicGreenSteelTier2Data: vi.fn(),
  loadHeroicGreenSteelTier3Data: vi.fn(),
  loadHeroicGreenSteelRecipeData: vi.fn()
}))

const effect: HgsEffect = {
  id: 1,
  displayName: 'Keen',
  description: 'Doubles the critical threat range.',
  enchantments: [{ type: 'criticalThreatRange', multiplier: 2 }],
  procs: []
}
const spell: HgsSpell = {
  id: 2,
  name: 'Earthgrab',
  description: '<rgb=#fff>Grabs a target.</rgb>',
  casterLevel: 16,
  charges: 2,
  rechargePerDay: 2
}
const weapon: HgsBaseItem = {
  id: 10,
  name: 'Green Steel Dagger',
  description: 'A crafted sword.',
  recipeId: 100,
  type: 'weapon',
  weaponType: 'Dagger'
}
const equipment: HgsBaseItem = {
  id: 11,
  name: 'Green Steel Goggles',
  description: 'Crafted goggles.',
  recipeId: 105,
  type: 'equipment'
}
const greatAxe: HgsBaseItem = {
  ...weapon,
  id: 12,
  name: 'Green Steel Great Axe',
  recipeId: 101,
  weaponType: 'Great Axe'
}
const longsword: HgsBaseItem = {
  ...weapon,
  id: 13,
  name: 'Green Steel Longsword',
  recipeId: 102,
  weaponType: 'Longsword'
}
const belt: HgsBaseItem = { ...equipment, id: 14, name: 'Green Steel Belt', recipeId: 103 }
const option = (id: number, overrides: Partial<HgsTierOption> = {}): HgsTierOption => ({
  id,
  name: `Upgrade ${id.toString()}`,
  type: 'weapon',
  essence: 'Material',
  focus: 'Earth',
  gem: 'Dominion',
  effectIds: [1],
  recipeId: id + 100,
  ...overrides
})
const tier1 = option(20)
const tier2 = option(30, { requiresFocus: 'Earth', aspect: 'Mineral', spellId: 2 })
const basic = option(40)
const focused = option(41, { requiresAspect: 'Mineral', shardType: 'compound', focuses: ['Earth', 'Positive Energy'] })
const tier1Air = option(21, { focus: 'Air' })
const tier1Fire = option(22, { focus: 'Fire' })
const tier1Equipment = option(23, { type: 'equipment' })
const tier2Air = option(31, { focus: 'Air', requiresFocus: 'Air', aspect: 'Mineral', spellId: 2 })
const tier2Fire = option(32, { focus: 'Fire', requiresFocus: 'Fire', aspect: 'Ash', spellId: 2 })
const basicAir = option(42, { focus: 'Air' })
const basicFire = option(43, { focus: 'Fire' })
const focusedAir = option(44, { focus: 'Air', requiresAspect: 'Mineral', shardType: 'compound', focuses: ['Air'] })
const focusedFire = option(45, { focus: 'Fire', requiresAspect: 'Ash', shardType: 'compound', focuses: ['Fire'] })

const manifest = {
  schemaVersion: 1 as const,
  system: 'heroic-green-steel' as const,
  sourceVersion: 'test',
  devices: {
    base: { id: 1, name: 'Eldritch Altar of Fecundity' },
    tier1: { id: 2, name: 'Altar of Invasion' },
    tier2: { id: 3, name: 'Altar of Subjugation' },
    tier3: { id: 4, name: 'Altar of Devastation' }
  },
  resources: {
    baseItems: 'base-items.json',
    effects: 'effects.json',
    spells: 'spells.json',
    ingredients: 'ingredients.json',
    tiers: {
      tier1: 'tiers/tier1.json',
      tier2: 'tiers/tier2.json',
      tier3Basic: 'tiers/tier3-basic.json',
      tier3Focused: 'tiers/tier3-focused.json'
    },
    recipes: {
      base: 'recipes/base.json',
      tier1: 'recipes/tier1.json',
      tier2: 'recipes/tier2.json',
      tier3: 'recipes/tier3.json'
    }
  }
}

const initialData: HgsInitialData = {
  manifest,
  baseItems: [longsword, equipment, weapon, belt, greatAxe],
  effects: [effect],
  tier1: [tier1Fire, tier1, tier1Equipment, tier1Air],
  baseItemById: new Map([
    [weapon.id, weapon],
    [equipment.id, equipment],
    [greatAxe.id, greatAxe],
    [longsword.id, longsword],
    [belt.id, belt]
  ]),
  effectById: new Map([[effect.id, effect]]),
  tier1ById: new Map([
    [tier1.id, tier1],
    [tier1Air.id, tier1Air],
    [tier1Fire.id, tier1Fire],
    [tier1Equipment.id, tier1Equipment]
  ])
}
const tier2Data: HgsTier2Data = {
  tier2: [tier2Fire, tier2, tier2Air],
  spells: [spell],
  tier2ById: new Map([
    [tier2.id, tier2],
    [tier2Air.id, tier2Air],
    [tier2Fire.id, tier2Fire]
  ]),
  spellById: new Map([[spell.id, spell]])
}
const tier3Data: HgsTier3Data = {
  tier3Basic: [basicFire, basic, basicAir],
  tier3Focused: [focusedFire, focused, focusedAir],
  tier3BasicById: new Map([
    [basic.id, basic],
    [basicAir.id, basicAir],
    [basicFire.id, basicFire]
  ]),
  tier3FocusedById: new Map([
    [focused.id, focused],
    [focusedAir.id, focusedAir],
    [focusedFire.id, focusedFire]
  ])
}
const ingredient: HgsIngredient = { id: 500, name: 'Large Devil Scale', description: '' }
const recipe = (id: number, device: HgsRecipe['device']): HgsRecipe => ({
  id,
  name: `Recipe ${id.toString()}`,
  device,
  ingredients: [{ ingredientId: ingredient.id, quantity: 1 }]
})
const recipeData: HgsRecipeData = {
  ingredients: [ingredient],
  recipes: [recipe(100, 'base'), recipe(120, 'tier1'), recipe(130, 'tier2'), recipe(140, 'tier3')],
  ingredientById: new Map([[ingredient.id, ingredient]]),
  recipeById: new Map([
    [100, recipe(100, 'base')],
    [120, recipe(120, 'tier1')],
    [130, recipe(130, 'tier2')],
    [140, recipe(140, 'tier3')]
  ])
}

const renderPage = () =>
  render(
    <MantineProvider env='test'>
      <HeroicGreenSteelPage />
    </MantineProvider>
  )

let desktopViewport = true

const choose = async (user: ReturnType<typeof userEvent.setup>, label: string, optionName: RegExp) => {
  const input = await screen.findByRole('combobox', { name: label })
  await user.click(input)
  await user.click(await screen.findByRole('option', { name: optionName }))
}

const optionLabels = () => screen.getAllByRole('option').map((optionElement) => optionElement.textContent)

const tierOptionLabels = (focuses: string[]) => focuses.map((focus) => `${focus} · Material · Dominion — Keen`)

const tier2OptionLabels = (options: [string, string][]) =>
  options.map(([focus, aspect]) => `${focus} · Material · Dominion · ${aspect} — Keen`)

beforeAll(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: desktopViewport && query.includes('75em'),
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
      observe() {
        return undefined
      }
      unobserve() {
        return undefined
      }
      disconnect() {
        return undefined
      }
    }
  )
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  desktopViewport = true
})

afterAll(() => vi.unstubAllGlobals())

const mockLoadedData = () => {
  vi.mocked(loadHeroicGreenSteelInitialData).mockResolvedValue(initialData)
  vi.mocked(loadHeroicGreenSteelTier2Data).mockResolvedValue(tier2Data)
  vi.mocked(loadHeroicGreenSteelTier3Data).mockResolvedValue(tier3Data)
  vi.mocked(loadHeroicGreenSteelRecipeData).mockResolvedValue(recipeData)
}

describe('HeroicGreenSteelPage', () => {
  it('keeps the heading visible while the initial data loads', () => {
    vi.mocked(loadHeroicGreenSteelInitialData).mockReturnValue(new Promise(() => undefined))
    renderPage()
    expect(screen.getByRole('heading', { name: 'Heroic Green Steel Crafting' })).toBeTruthy()
    expect(screen.getByRole('status').textContent).toContain('Loading Heroic Green Steel')
  })

  it('shows an initial-load error and retries only that boundary', async () => {
    vi.mocked(loadHeroicGreenSteelInitialData)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(initialData)
    renderPage()
    expect(await screen.findByRole('alert')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByRole('combobox', { name: 'Green Steel base item' })).toBeTruthy()
    expect(loadHeroicGreenSteelInitialData).toHaveBeenCalledTimes(2)
  })

  it('progresses through Tier 2 spells and both Tier 3 modes, invalidates downstream choices, and resets', async () => {
    mockLoadedData()
    const user = userEvent.setup()
    renderPage()

    await choose(user, 'Green Steel base item', /^Green Steel Dagger$/)
    expect(screen.getByText('A crafted sword.')).toBeTruthy()
    await choose(user, 'Tier 1 upgrade', /Earth · Material · Dominion/)
    expect(await screen.findByRole('combobox', { name: 'Tier 2 upgrade' })).toBeTruthy()
    await choose(user, 'Tier 2 upgrade', /Earth · Material · Dominion/)
    expect((await screen.findAllByText('Earthgrab')).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Caster level 16/).length).toBeGreaterThan(0)

    await user.click(await screen.findByText('Basic'))
    await choose(user, 'Tier 3 Basic upgrade', /Earth · Material · Dominion/)
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Tier 3 Basic upgrade' }).value).not.toBe('')
    await user.click(screen.getByText('Focused'))
    const focusedInput = await screen.findByRole<HTMLInputElement>('combobox', { name: 'Tier 3 Focused upgrade' })
    expect(focusedInput.value).toBe('')
    await choose(user, 'Tier 3 Focused upgrade', /Earth · Material · Dominion/)
    expect(screen.getAllByText('compound shard').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Reset build' }))
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Green Steel base item' }).value).toBe('')
    expect(screen.getAllByText('Select a base item first.')).toHaveLength(3)
  })

  it('preserves the full pre-em-dash base-item label while selecting the original base item', async () => {
    mockLoadedData()
    const user = userEvent.setup()
    renderPage()

    const baseItemSelector = await screen.findByRole<HTMLInputElement>('combobox', { name: 'Green Steel base item' })
    await user.click(baseItemSelector)

    const visibleOptionLabels = screen.getAllByRole('option').map((optionElement) => optionElement.textContent)
    expect(visibleOptionLabels).toEqual(expect.arrayContaining(['Green Steel Dagger', 'Green Steel Goggles']))
    expect(visibleOptionLabels.join('')).not.toContain('—')
    expect(visibleOptionLabels).not.toContain('Green Steel Dagger — Green Steel Dagger')

    await user.click(screen.getByRole('option', { name: 'Green Steel Dagger' }))

    expect(baseItemSelector.value).toBe('Green Steel Dagger')
    expect(screen.getByText(weapon.description)).toBeTruthy()
  })

  it('sorts base item and all tier option lists by their visible labels', async () => {
    mockLoadedData()
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('combobox', { name: 'Green Steel base item' }))
    expect(optionLabels()).toEqual([
      'Green Steel Dagger',
      'Green Steel Great Axe',
      'Green Steel Longsword',
      'Green Steel Belt',
      'Green Steel Goggles'
    ])
    await user.click(screen.getByRole('option', { name: 'Green Steel Dagger' }))

    await user.click(await screen.findByRole('combobox', { name: 'Tier 1 upgrade' }))
    expect(optionLabels()).toEqual(tierOptionLabels(['Air', 'Earth', 'Fire']))
    await user.keyboard('{Escape}')

    await user.click(await screen.findByRole('combobox', { name: 'Tier 2 upgrade' }))
    expect(optionLabels()).toEqual(
      tier2OptionLabels([
        ['Air', 'Mineral'],
        ['Earth', 'Mineral'],
        ['Fire', 'Ash']
      ])
    )
    await user.keyboard('{Escape}')

    await user.click(screen.getByText('Basic'))
    await user.click(await screen.findByRole('combobox', { name: 'Tier 3 Basic upgrade' }))
    expect(optionLabels()).toEqual(tierOptionLabels(['Air', 'Earth', 'Fire']))
    await user.keyboard('{Escape}')

    await user.click(screen.getByText('Focused'))
    await user.click(await screen.findByRole('combobox', { name: 'Tier 3 Focused upgrade' }))
    expect(optionLabels()).toEqual(tierOptionLabels(['Air', 'Earth', 'Fire']))
  })

  it('keeps reverse-filtered options alphabetical when Tier 3 is selected first', async () => {
    mockLoadedData()
    const user = userEvent.setup()
    renderPage()

    await choose(user, 'Green Steel base item', /^Green Steel Dagger$/)
    await user.click(await screen.findByText('Focused'))
    await choose(user, 'Tier 3 Focused upgrade', /^Air · Material · Dominion/)

    await user.click(screen.getByRole('combobox', { name: 'Tier 1 upgrade' }))
    expect(optionLabels()).toEqual(tierOptionLabels(['Air', 'Earth']))
    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('combobox', { name: 'Tier 2 upgrade' }))
    expect(optionLabels()).toEqual(
      tier2OptionLabels([
        ['Air', 'Mineral'],
        ['Earth', 'Mineral']
      ])
    )
  })

  it('preserves a valid selection when another altar recomputes its option list', async () => {
    mockLoadedData()
    const user = userEvent.setup()
    renderPage()

    await choose(user, 'Green Steel base item', /^Green Steel Dagger$/)
    await choose(user, 'Tier 1 upgrade', /^Earth · Material · Dominion/)
    await choose(user, 'Tier 2 upgrade', /^Earth · Material · Dominion/)

    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Tier 1 upgrade' }).value).toBe(
      'Earth · Material · Dominion — Keen'
    )
    await user.click(screen.getByRole('combobox', { name: 'Tier 1 upgrade' }))
    expect(optionLabels()).toEqual(tierOptionLabels(['Earth']))
  })

  it('uses IDs as a deterministic tie-breaker for equal visible labels', () => {
    expect(
      sortHgsSelectOptions([
        { value: '20', label: 'same label' },
        { value: '3', label: 'Same Label' },
        { value: '100', label: 'Another label' }
      ])
    ).toEqual([
      { value: '100', label: 'Another label' },
      { value: '3', label: 'Same Label' },
      { value: '20', label: 'same label' }
    ])
  })

  it('allows Tier 2 to be selected before Tier 1', async () => {
    mockLoadedData()
    const user = userEvent.setup()
    renderPage()

    await choose(user, 'Green Steel base item', /^Green Steel Dagger$/)
    await choose(user, 'Tier 2 upgrade', /Earth · Material · Dominion/)

    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Tier 2 upgrade' }).value).not.toBe('')
    expect(screen.getByRole('combobox', { name: 'Tier 1 upgrade' })).toBeTruthy()
    expect(screen.getByText('Focused')).toBeTruthy()
  })

  it('allows Tier 3 to be selected before Tier 1 and Tier 2', async () => {
    mockLoadedData()
    const user = userEvent.setup()
    renderPage()

    await choose(user, 'Green Steel base item', /^Green Steel Dagger$/)
    await user.click(await screen.findByText('Focused'))
    await choose(user, 'Tier 3 Focused upgrade', /Earth · Material · Dominion/)

    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Tier 3 Focused upgrade' }).value).not.toBe('')
    expect(screen.getByRole('combobox', { name: 'Tier 1 upgrade' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Tier 2 upgrade' })).toBeTruthy()
  })

  it('renders Build Summary and lazily mounts Ingredients and Crafting Breakdown tools', async () => {
    mockLoadedData()
    const user = userEvent.setup()
    renderPage()
    await choose(user, 'Green Steel base item', /^Green Steel Dagger$/)
    await user.click(screen.getByRole('button', { name: 'Build Summary' }))
    expect(screen.getByRole('complementary', { name: 'Build Summary' })).toBeTruthy()
    expect(screen.getByText('Tier 1 is incomplete.')).toBeTruthy()
    expect(loadHeroicGreenSteelRecipeData).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Ingredients' }))
    expect(await screen.findByText('Large Devil Scale')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Crafting Breakdown' }))
    expect(await screen.findByText('Eldritch Altar of Fecundity')).toBeTruthy()
    expect(screen.getByText('Recipe 100')).toBeTruthy()
  })

  it('exposes workspace tools as accessible mobile controls', async () => {
    desktopViewport = false
    mockLoadedData()
    renderPage()
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: 'Workspace tools' })).toBeTruthy()
    })
    expect(screen.getByRole('button', { name: 'Ingredients' })).toBeTruthy()
  })
})
