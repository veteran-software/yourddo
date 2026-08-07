// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadEssenceCraftingData, validateEssenceCraftingDataset } from './data.ts'
import { EQUIPMENT_SLOTS } from './equipment.ts'
import EssenceCraftingPage from './EssenceCraftingPage.tsx'
import { encodeEssenceCraftingPermalink } from './permalink.ts'
import { ESSENCE_CRAFTING_SESSION_STORAGE_KEY } from './plannerStorage.ts'
import { hydrateEssencePlan } from './plannerTransitions.ts'
import { createEssenceCraftingTestPayload } from './test-fixture.ts'

vi.mock('./data.ts', async (importOriginal) => {
  const data = await importOriginal<typeof import('./data.ts')>()

  return {
    ...data,
    loadEssenceCraftingData: vi.fn()
  }
})

let desktopViewport = false

const createPageData = () => {
  const payload = createEssenceCraftingTestPayload()
  const augmentEffect = (id: string, displayName: string) => ({
    id,
    displayName,
    bonusTypeId: 'bonus-enhancement',
    modifier: { kind: 'fixed' as const, unit: 'number' as const, value: 1 }
  })
  payload.enhancements.push({
    id: 'enhancement-main-hand-extra',
    displayName: 'Main Hand Extra',
    minimumItemLevel: 1,
    placements: [{ position: 'extra', itemCategoryIds: ['weapon'] }],
    effects: [{ id: 'effect-main-hand-extra', displayName: 'Main Hand Extra Effect' }],
    recipes: { boundRecipeId: 'recipe-enhancement-bound', unboundRecipeId: 'recipe-enhancement-unbound' }
  })
  payload.augments.push(
    {
      id: 'augment-colorless-utility',
      displayName: 'Colorless Utility',
      augmentTypeId: 'colorless',
      minimumItemLevel: 1,
      effects: [augmentEffect('effect-utility', 'Utility')]
    },
    {
      id: 'augment-red-strength',
      displayName: 'Ruby of Strength +1',
      augmentTypeId: 'red',
      minimumItemLevel: 2,
      effects: [augmentEffect('effect-strength', 'Strength')]
    },
    {
      id: 'augment-red-versatility',
      displayName: 'Ruby of Versatility +1',
      augmentTypeId: 'red',
      minimumItemLevel: 2,
      effects: [
        augmentEffect('effect-versatility-charisma', 'Charisma'),
        augmentEffect('effect-versatility-strength', 'Strength')
      ]
    }
  )
  return validateEssenceCraftingDataset(payload)
}

const renderPage = () =>
  render(
    <MantineProvider env='test'>
      <EssenceCraftingPage />
    </MantineProvider>
  )

const selectOption = async (user: ReturnType<typeof userEvent.setup>, label: string, option: string | RegExp) => {
  await user.click(await screen.findByRole('combobox', { name: label }))
  await user.click(await screen.findByRole('option', { name: option }))
}

const getSelect = (label: string) => screen.getByRole<HTMLInputElement>('combobox', { name: label })

const activateSlot = async (user: ReturnType<typeof userEvent.setup>, slotLabel: string) => {
  await user.click(await screen.findByRole('button', { name: `Plan ${slotLabel}` }))
  await screen.findByTestId(`planned-item-${slotLabel.toLowerCase().replaceAll(' ', '-')}`)
}

const addAugmentSlot = async (user: ReturnType<typeof userEvent.setup>, slotLabel: string, slotColor: string) => {
  await selectOption(user, `Add an augment slot to ${slotLabel}`, slotColor)
}

const openTool = async (
  user: ReturnType<typeof userEvent.setup>,
  name: 'Recipes' | 'Ingredients' | 'Export' | 'Permalink'
) => {
  await screen.findByRole('combobox', { name: 'Master minimum level' })

  if (desktopViewport) {
    await user.click(within(screen.getByTestId('workspace-tool-rail')).getByRole('button', { name }))
    return screen.findByRole('complementary', { name })
  }

  await user.click(within(screen.getByTestId('workspace-mobile-tools')).getByRole('button', { name }))
  return screen.findByRole('dialog', { name })
}

const openIngredients = (user: ReturnType<typeof userEvent.setup>) => openTool(user, 'Ingredients')
const openRecipes = (user: ReturnType<typeof userEvent.setup>) => openTool(user, 'Recipes')

const totalQuantity = (ingredientId: string) =>
  within(screen.getByTestId(`ingredients-total-materials-${ingredientId}`)).getByRole('cell', {
    name: /\d+/
  }).textContent

beforeAll(() => {
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn()
  })

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
  desktopViewport = false
  sessionStorage.clear()
  window.history.replaceState({}, '', '/')
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

  it('hydrates the stored plan before writing, so the empty initial plan cannot overwrite it', async () => {
    let resolveData: (value: ReturnType<typeof createPageData>) => void = () => undefined
    vi.mocked(loadEssenceCraftingData).mockReturnValue(
      new Promise((resolve) => {
        resolveData = resolve
      })
    )
    sessionStorage.setItem(
      ESSENCE_CRAFTING_SESSION_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        masterMinimumLevel: 2,
        activeSlotIds: ['main-hand'],
        collapsedSlotIds: [],
        itemsBySlotId: {
          'main-hand': {
            prefixEnhancementId: 'enhancement-alpha-prefix',
            suffixEnhancementId: null,
            extraEnhancementId: null,
            hasCannithMark: false,
            minimumLevelOverride: null,
            augmentSlots: []
          }
        }
      })
    )
    const setItem = vi.spyOn(Storage.prototype, 'setItem')

    renderPage()

    expect(setItem).not.toHaveBeenCalled()
    await act(async () => {
      resolveData(createPageData())
      await Promise.resolve()
    })

    expect(await screen.findByTestId('planned-item-main-hand')).toBeTruthy()
    expect(getSelect('Master minimum level').value).toBe('2')
    setItem.mockRestore()
  })

  it('hydrates a normal-search permalink and removes only cc with replace semantics', async () => {
    const data = createPageData()
    vi.mocked(loadEssenceCraftingData).mockResolvedValue(data)
    const importedPlan = hydrateEssencePlan(data, {
      masterMinimumLevel: 2,
      activeSlotIds: ['main-hand'],
      collapsedSlotIds: ['main-hand'],
      itemsBySlotId: {
        'main-hand': {
          prefixEnhancementId: 'enhancement-split-prefix',
          suffixEnhancementId: null,
          extraEnhancementId: null,
          hasCannithMark: false,
          minimumLevelOverride: 2,
          augmentSlots: []
        }
      }
    })
    const search = new URLSearchParams({
      view: 'compact',
      cc: encodeEssenceCraftingPermalink(data, importedPlan),
      theme: 'dark'
    })
    window.history.replaceState({}, '', `/essence-crafting?${search.toString()}`)
    const replaceState = vi.spyOn(window.history, 'replaceState')

    renderPage()

    expect(await screen.findByTestId('planned-item-main-hand')).toBeTruthy()
    expect(getSelect('Master minimum level').value).toBe('2')
    expect(replaceState).toHaveBeenCalled()
    expect(window.location.search).toBe('?view=compact&theme=dark')
    expect(screen.queryByText('Permalink could not be loaded')).toBeNull()
    replaceState.mockRestore()
  })

  it('keeps the existing plan and cc parameter when a permalink is invalid', async () => {
    sessionStorage.setItem(
      ESSENCE_CRAFTING_SESSION_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        masterMinimumLevel: 2,
        activeSlotIds: ['main-hand'],
        collapsedSlotIds: [],
        itemsBySlotId: {
          'main-hand': {
            prefixEnhancementId: 'enhancement-alpha-prefix',
            suffixEnhancementId: null,
            extraEnhancementId: null,
            hasCannithMark: false,
            minimumLevelOverride: null,
            augmentSlots: []
          }
        }
      })
    )
    window.history.replaceState({}, '', '/essence-crafting?view=compact&cc=damaged-link')

    renderPage()

    expect(await screen.findByText('Permalink could not be loaded')).toBeTruthy()
    expect(screen.getByText(/invalid or damaged/i)).toBeTruthy()
    expect(await screen.findByTestId('planned-item-main-hand')).toBeTruthy()
    expect(getSelect('Master minimum level').value).toBe('2')
    expect(new URLSearchParams(window.location.search).get('cc')).toBe('damaged-link')
    expect(new URLSearchParams(window.location.search).get('view')).toBe('compact')
  })

  it('generates a v4 permalink for the stable Essence Crafting path', async () => {
    const user = userEvent.setup()
    renderPage()

    const tool = await openTool(user, 'Permalink')
    const input = within(tool).getByRole<HTMLInputElement>('textbox', { name: 'Essence Crafting permalink' })
    const url = new URL(input.value)

    expect(url.pathname).toBe('/essence-crafting')
    expect(url.searchParams.get('cc')).toBeTruthy()
    expect(url.searchParams.size).toBe(1)
  })

  it('renders every supported equipment slot in a responsive main-workspace selector', async () => {
    renderPage()

    const selector = await screen.findByTestId('equipment-slot-selector')
    expect(selector.tagName).toBe('DIV')
    expect(screen.queryByRole('complementary')).toBeNull()
    expect(within(selector).getAllByRole('button')).toHaveLength(EQUIPMENT_SLOTS.length)
    for (const slot of EQUIPMENT_SLOTS) {
      const control = within(selector).getByRole('button', { name: `Plan ${slot.label}` })
      expect(control.getAttribute('aria-pressed')).toBe('false')
    }
  })

  it('registers Recipes, Ingredients, Export, and Permalink as desktop workspace tools', async () => {
    desktopViewport = true
    const user = userEvent.setup()
    renderPage()

    await screen.findByRole('combobox', { name: 'Master minimum level' })
    const rail = within(screen.getByTestId('workspace-tool-rail'))
    expect(rail.getByRole('button', { name: 'Recipes' })).toBeTruthy()
    expect(rail.getByRole('button', { name: 'Ingredients' })).toBeTruthy()
    expect(rail.getByRole('button', { name: 'Export' })).toBeTruthy()
    expect(rail.getByRole('button', { name: 'Permalink' })).toBeTruthy()
    const tool = await openRecipes(user)
    expect(tool).toBeTruthy()
    expect(screen.getByText('No planned items')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Close Recipes' }))
    expect(screen.queryByRole('complementary', { name: 'Recipes' })).toBeNull()
    await openTool(user, 'Export')
    expect(screen.getByRole('button', { name: 'Download JSON' })).toBeTruthy()
  })

  it('announces the empty Ingredients plan and opens it in the mobile workspace drawer', async () => {
    const user = userEvent.setup()
    renderPage()

    const tool = await openIngredients(user)
    expect(tool).toBeTruthy()
    expect(screen.getByRole('status').textContent).toContain('Add an equipment slot')
    expect(screen.getByRole('radio', { name: 'Bound' })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Close workspace tool' }))
    expect(screen.queryByRole('dialog', { name: 'Ingredients' })).toBeNull()
  })

  it('shows aggregate bound and unbound total requirements for active items', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await openIngredients(user)
    expect(totalQuantity('ingredient-essence')).toBe('10')
    expect(screen.queryByText('ingredient-essence')).toBeNull()

    await user.click(screen.getByRole('radio', { name: 'Unbound' }))
    expect(totalQuantity('ingredient-essence')).toBe('100')
    expect(screen.getByText(/whole crafting plan/)).toBeTruthy()
  })

  it('aggregates multiple active items and respects an item-level override', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await activateSlot(user, 'Off Hand')
    await openIngredients(user)
    expect(totalQuantity('ingredient-essence')).toBe('20')

    await selectOption(user, 'Minimum level for Main Hand', '2')
    expect(totalQuantity('ingredient-essence')).toBe('30')
  })

  it('includes a selected Extra and its Mark in aggregate totals', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await user.click(screen.getByRole('switch', { name: 'Mark of House Cannith for Main Hand' }))
    await selectOption(user, 'Extra for Main Hand', 'Main Hand Extra')
    await openIngredients(user)

    expect(totalQuantity('ingredient-essence')).toBe('20')
    expect(totalQuantity('ingredient-mark')).toBe('1')
    await openRecipes(user)
    expect(screen.getByText('Extra shard: Main Hand Extra')).toBeTruthy()
    expect(screen.getAllByText('Mark of House Cannith')).toHaveLength(2)
  })

  it('shows a split prefix exactly once in the detailed Recipes plan', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await selectOption(user, 'Prefix for Main Hand', 'Split Prefix Test')
    await openRecipes(user)

    expect(screen.getByText('Prefix shard: Split Prefix Test')).toBeTruthy()
    expect(screen.getAllByText('Prefix shard: Split Prefix Test')).toHaveLength(1)
  })

  it('closes the Ingredients workspace tool without changing the planner state', async () => {
    desktopViewport = true
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await selectOption(user, 'Prefix for Main Hand', 'Alpha Prefix')
    await openIngredients(user)
    await user.click(screen.getByRole('button', { name: 'Close Ingredients' }))

    expect(getSelect('Prefix for Main Hand').value).toBe('Alpha Prefix')
    expect(screen.getByTestId('planned-item-main-hand')).toBeTruthy()
  })

  it('shows multiple active items and an item minimum-level override in Recipes', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await activateSlot(user, 'Off Hand')
    await selectOption(user, 'Minimum level for Main Hand', '2')
    await openRecipes(user)

    expect(screen.getByTestId('recipes-item-main-hand').textContent).toContain('Minimum level 2')
    expect(screen.getByTestId('recipes-item-off-hand').textContent).toContain('Minimum level 1')
  })

  it('does not include an Extra or Mark recipe step unless Mark is enabled', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await user.click(screen.getByRole('switch', { name: 'Mark of House Cannith for Main Hand' }))
    await selectOption(user, 'Extra for Main Hand', 'Main Hand Extra')
    await user.click(screen.getByRole('switch', { name: 'Mark of House Cannith for Main Hand' }))
    await openRecipes(user)

    expect(screen.queryByText('Extra shard: Main Hand Extra')).toBeNull()
    expect(screen.queryByText('Mark of House Cannith')).toBeNull()
  })

  it('shows all selected enhancement effects and resolves their values at the effective minimum level', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await selectOption(user, 'Prefix for Main Hand', 'Split Prefix Test')
    expect(screen.getByText('Light Spell Power: +1 (Enhancement)')).toBeTruthy()
    expect(screen.getByText('Spellcasting Implement: +5%')).toBeTruthy()

    await selectOption(user, 'Minimum level for Main Hand', '2')
    expect(screen.getByText('Light Spell Power: +2 (Enhancement)')).toBeTruthy()
    expect(screen.queryByText('Light Spell Power: +1 (Enhancement)')).toBeNull()
  })

  it('shows selected effects without modifiers or bonus types without placeholder text', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await selectOption(user, 'Prefix for Main Hand', 'Alpha Prefix')

    expect(screen.getByText('Alpha Prefix Effect')).toBeTruthy()
    expect(screen.queryByText(/modifier not defined/i)).toBeNull()
  })

  it('warns when the selected binding variant is unavailable', async () => {
    const data = createPageData()
    const enhancement = data.indexes.enhancementById.get('enhancement-alpha-prefix')
    if (!enhancement) throw new Error('Expected Alpha Prefix test enhancement')
    vi.mocked(loadEssenceCraftingData).mockResolvedValue({
      ...data,
      indexes: {
        ...data.indexes,
        enhancementById: new Map(data.indexes.enhancementById).set('enhancement-alpha-prefix', {
          ...enhancement,
          recipes: { ...enhancement.recipes, unboundRecipeId: 'missing-unbound-recipe' }
        })
      }
    })
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await selectOption(user, 'Prefix for Main Hand', 'Alpha Prefix')
    await openIngredients(user)
    await user.click(screen.getByRole('radio', { name: 'Unbound' }))

    expect(screen.getByRole('alert').textContent).toContain('Alpha Prefix has no unbound recipe variant.')
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

  it('activates multiple slots and keeps cards in catalog order regardless of activation order', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Ring 2')
    await activateSlot(user, 'Main Hand')
    await activateSlot(user, 'Off Hand')

    expect(screen.getAllByTestId(/^planned-item-/).map((card) => card.dataset.testid)).toEqual([
      'planned-item-main-hand',
      'planned-item-off-hand',
      'planned-item-ring-2'
    ])
    expect(screen.getByRole('button', { name: 'Remove Ring 2' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('keeps Ring 1 and Ring 2 independently configurable', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Ring 1')
    await activateSlot(user, 'Ring 2')
    await selectOption(user, 'Minimum level for Ring 1', '2')

    expect(getSelect('Minimum level for Ring 1').value).toBe('2')
    expect(getSelect('Minimum level for Ring 2').value).toBe('Inherit master minimum level (1)')
    expect(screen.getByRole('heading', { name: 'Ring 1 planned item' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Ring 2 planned item' })).toBeTruthy()
  })

  it('deactivates one slot only after confirmation without changing other items', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await activateSlot(user, 'Off Hand')
    await user.click(screen.getByRole('button', { name: 'Remove Off Hand' }))

    expect(screen.getByRole('dialog', { name: 'Remove Off Hand?' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Remove item' }))

    expect(screen.getByTestId('planned-item-main-hand')).toBeTruthy()
    expect(screen.queryByTestId('planned-item-off-hand')).toBeNull()
    expect(screen.getByRole('button', { name: 'Plan Off Hand' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('collapses and expands an individual item card accessibly', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    const collapse = screen.getByRole('button', { name: 'Collapse Main Hand planned item' })
    await user.click(collapse)

    expect(collapse.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('combobox', { name: 'Prefix for Main Hand' })).toBeNull()

    const expand = screen.getByRole('button', { name: 'Expand Main Hand planned item' })
    await user.click(expand)
    expect(expand.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('combobox', { name: 'Prefix for Main Hand' })).toBeTruthy()
  })

  it('inherits the master minimum level until an item override is selected', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await selectOption(user, 'Master minimum level', '2')
    expect(screen.getByText('Effective minimum level: 2')).toBeTruthy()

    await selectOption(user, 'Master minimum level', '1')
    await selectOption(user, 'Minimum level for Main Hand', '2')
    expect(screen.getByText('Effective minimum level: 2')).toBeTruthy()
  })

  it('resets one item without deactivating it or changing other active items', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await activateSlot(user, 'Off Hand')
    await selectOption(user, 'Minimum level for Main Hand', '2')
    await selectOption(user, 'Prefix for Main Hand', 'Alpha Prefix')
    await user.click(screen.getByRole('button', { name: 'Reset Main Hand planned item' }))

    expect(screen.getByTestId('planned-item-main-hand')).toBeTruthy()
    expect(screen.getByTestId('planned-item-off-hand')).toBeTruthy()
    expect(getSelect('Minimum level for Main Hand').value).toBe('Inherit master minimum level (1)')
    expect(getSelect('Prefix for Main Hand').value).toBe('')
  })

  it('requires confirmation before resetting the complete plan', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await user.click(screen.getByRole('button', { name: 'Reset plan' }))

    const dialog = screen.getByRole('dialog', { name: 'Reset the entire plan?' })
    expect(dialog).toBeTruthy()
    await user.keyboard('{Escape}')
    expect(screen.getByTestId('planned-item-main-hand')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Reset plan' }))
    await user.click(
      within(screen.getByRole('dialog', { name: 'Reset the entire plan?' })).getByRole('button', { name: 'Reset plan' })
    )
    expect(screen.queryByTestId('planned-item-main-hand')).toBeNull()
    expect(screen.getByText('Select an equipment slot to begin crafting.')).toBeTruthy()
  })

  it('uses the pure transition engine for Mark and affix changes without render-phase corrections', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    expect(getSelect('Extra for Main Hand').disabled).toBe(true)

    await user.click(screen.getByRole('switch', { name: 'Mark of House Cannith for Main Hand' }))
    expect(getSelect('Extra for Main Hand').disabled).toBe(false)
    await selectOption(user, 'Extra for Main Hand', 'Main Hand Extra')
    await user.click(screen.getByRole('switch', { name: 'Mark of House Cannith for Main Hand' }))

    expect(getSelect('Extra for Main Hand').disabled).toBe(true)
    expect(getSelect('Extra for Main Hand').value).toBe('')
  })

  it('adds one eligible augment slot, prevents a duplicate color, explains its level impact, and removes it', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    expect(screen.getByRole('status').textContent).toBe('No augment slots have been added for Main Hand.')

    await addAugmentSlot(user, 'Main Hand', 'Red')

    expect(screen.getByTestId('augment-slot-editor-augment-slot:red')).toBeTruthy()
    expect(screen.getByText('This slot requires minimum level 2. The effective minimum level is 2.')).toBeTruthy()
    expect(screen.getByText('Effective minimum level: 2')).toBeTruthy()
    expect(getSelect('Add an augment slot to Main Hand').disabled).toBe(true)
    expect(screen.getByRole('combobox', { name: 'Augment for Red augment slot on Main Hand' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Filter effects for Red augment slot on Main Hand' })).toBeTruthy()
    expect(screen.getByText('Filter mode for Red augment slot on Main Hand')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Remove Red augment slot from Main Hand' }))
    expect(screen.getByRole('status').textContent).toBe('No augment slots have been added for Main Hand.')
  })

  it('selects a compatible augment by stable ID and clears it through the shared selector', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await addAugmentSlot(user, 'Main Hand', 'Red')
    const augmentLabel = 'Augment for Red augment slot on Main Hand'

    await selectOption(user, augmentLabel, /Ruby of Charisma \+1/)
    expect(getSelect(augmentLabel).value).toBe('Ruby of Charisma +1')
    expect(screen.getByText('Charisma: +1 (Enhancement)')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Clear augment for Red augment slot on Main Hand' }))
    expect(getSelect(augmentLabel).value).toBe('')
    expect(screen.queryByText('Charisma: +1 (Enhancement)')).toBeNull()
  })

  it('filters compatible augments by effects in OR and AND modes', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await addAugmentSlot(user, 'Main Hand', 'Red')
    const filterLabel = 'Filter effects for Red augment slot on Main Hand'
    const augmentLabel = 'Augment for Red augment slot on Main Hand'

    await selectOption(user, filterLabel, 'Charisma')
    await selectOption(user, filterLabel, 'Strength')

    await user.click(getSelect(augmentLabel))
    expect(await screen.findByRole('option', { name: /Ruby of Charisma \+1/ })).toBeTruthy()
    expect(screen.getByRole('option', { name: /Ruby of Strength \+1/ })).toBeTruthy()
    expect(screen.getByRole('option', { name: /Ruby of Versatility \+1/ })).toBeTruthy()
    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('radio', { name: 'Match all effects' }))
    await user.click(getSelect(augmentLabel))
    expect(await screen.findByRole('option', { name: /Ruby of Versatility \+1/ })).toBeTruthy()
    expect(screen.queryByRole('option', { name: /Ruby of Charisma \+1/ })).toBeNull()
    expect(screen.queryByRole('option', { name: /Ruby of Strength \+1/ })).toBeNull()
  })
})
