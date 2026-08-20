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
  name: 'Green Steel Longsword',
  description: 'A crafted sword.',
  recipeId: 100,
  type: 'weapon',
  weaponType: 'Longsword'
}
const equipment: HgsBaseItem = {
  id: 11,
  name: 'Green Steel Goggles',
  description: 'Crafted goggles.',
  recipeId: 105,
  type: 'equipment'
}
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
  baseItems: [weapon, equipment],
  effects: [effect],
  tier1: [tier1, option(21, { type: 'equipment' })],
  baseItemById: new Map([
    [weapon.id, weapon],
    [equipment.id, equipment]
  ]),
  effectById: new Map([[effect.id, effect]]),
  tier1ById: new Map([
    [tier1.id, tier1],
    [21, option(21, { type: 'equipment' })]
  ])
}
const tier2Data: HgsTier2Data = {
  tier2: [tier2],
  spells: [spell],
  tier2ById: new Map([[tier2.id, tier2]]),
  spellById: new Map([[spell.id, spell]])
}
const tier3Data: HgsTier3Data = {
  tier3Basic: [basic],
  tier3Focused: [focused],
  tier3BasicById: new Map([[basic.id, basic]]),
  tier3FocusedById: new Map([[focused.id, focused]])
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

    await choose(user, 'Green Steel base item', /Green Steel Longsword/)
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
    expect(screen.getByText('Select a base item first.')).toBeTruthy()
  })

  it('renders Build Summary and lazily mounts Ingredients and Crafting Breakdown tools', async () => {
    mockLoadedData()
    const user = userEvent.setup()
    renderPage()
    await choose(user, 'Green Steel base item', /Green Steel Longsword/)
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
