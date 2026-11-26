// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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
  await user.click(await screen.findByRole(label.startsWith('Augment for ') ? 'button' : 'option', { name: option }))
}

const getSelect = (label: string) => screen.getByRole<HTMLInputElement>('combobox', { name: label })

const activateSlot = async (user: ReturnType<typeof userEvent.setup>, slotLabel: string) => {
  await user.click(await screen.findByRole('button', { name: `Plan ${slotLabel}` }))
  await screen.findByTestId(`planned-item-${slotLabel.toLowerCase().replaceAll(' ', '-')}`)
}

const addAugmentSlot = async (user: ReturnType<typeof userEvent.setup>, slotLabel: string, slotColor: string) => {
  await selectOption(user, `Add an augment slot to ${slotLabel}`, slotColor)
}

const openTool = async (user: ReturnType<typeof userEvent.setup>, name: 'Recipes' | 'Ingredients' | 'Sharing') => {
  await screen.findByRole('combobox', { name: 'Master ML' })

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
  it('prompts before unequipping an off-hand weapon', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Off Hand')
    await selectOption(user, 'Prefix for Off Hand', 'Alpha Prefix')
    await user.click(screen.getByRole('button', { name: 'Plan Orb' }))
    let dialog = screen.getByRole('dialog', { name: 'Equipment conflict' })
    expect(dialog.textContent).toContain('Unequip Off Hand to add Orb?')
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(getSelect('Prefix for Off Hand').value).toBe('Alpha Prefix')
    expect(screen.getByRole('button', { name: 'Plan Orb' })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Plan Orb' }))
    dialog = screen.getByRole('dialog', { name: 'Equipment conflict' })
    await user.click(within(dialog).getByRole('button', { name: 'Unequip and continue' }))
    expect(screen.getByRole('button', { name: 'Plan Off Hand' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Edit Orb' })).toBeTruthy()
  })

  it('prompts before setting or replacing a two-handed weapon when equipment conflicts', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Orb')
    await activateSlot(user, 'Main Hand')
    await user.click(screen.getByRole('switch', { name: 'Two-handed weapon' }))
    let dialog = screen.getByRole('dialog', { name: 'Equipment conflict' })
    expect(dialog.textContent).toContain('Unequip Orb to use a two-handed Main Hand weapon?')
    await user.click(within(dialog).getByRole('button', { name: 'Unequip and continue' }))

    await user.click(screen.getByRole('button', { name: 'Plan Rune Arm' }))
    dialog = screen.getByRole('dialog', { name: 'Equipment conflict' })
    expect(dialog.textContent).toContain('Unequip the two-handed Main Hand weapon to add Rune Arm?')
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole<HTMLInputElement>('switch', { name: 'Two-handed weapon' }).checked).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Plan Shield' }))
    dialog = screen.getByRole('dialog', { name: 'Equipment conflict' })
    await user.click(within(dialog).getByRole('button', { name: 'Unequip and continue' }))
    expect(screen.getByRole('button', { name: 'Plan Main Hand' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Edit Shield' })).toBeTruthy()
  })

  it('lets the user resolve the same equipment conflict when applying a shard from the lookup', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Orb')
    await user.click(screen.getByRole('tab', { name: 'Master Shard Lookup' }))
    await user.type(screen.getByRole('textbox', { name: 'Shard or effect' }), 'Alpha Prefix')
    await user.click(screen.getByRole('button', { name: 'Off Hand prefix' }))
    const dialog = screen.getByRole('dialog', { name: 'Equipment conflict' })
    expect(dialog.textContent).toContain('Unequip Orb to continue')
    await user.click(within(dialog).getByRole('button', { name: 'Unequip and apply' }))

    await user.click(screen.getByRole('tab', { name: 'Crafting Plan' }))
    expect(screen.getByRole('button', { name: 'Plan Orb' })).toBeTruthy()
    expect(getSelect('Prefix for Off Hand').value).toBe('Alpha Prefix')
  })

  it('opens the help guide from the lookup and returns focus when dismissed', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('tab', { name: 'Master Shard Lookup' }))
    const help = screen.getByRole('button', { name: 'Essence Crafting help' })
    await user.click(help)

    const dialog = screen.getByRole('dialog', { name: 'Essence Crafting help' })
    expect(within(dialog).getByText('Deception')).toBeTruthy()
    expect(within(dialog).getByText('Sneak Attack')).toBeTruthy()
    expect(within(dialog).getByText('Master ML')).toBeTruthy()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Essence Crafting help' })).toBeNull()
    await waitFor(() => {
      expect(document.activeElement).toBe(help)
    })
    expect(screen.getByRole('tab', { name: 'Master Shard Lookup' }).getAttribute('aria-selected')).toBe('true')
  })

  it('applies a shard to a new item and confirms before replacing an occupied affix', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('tab', { name: 'Master Shard Lookup' }))
    const lookup = screen.getByRole('tabpanel', { name: 'Master Shard Lookup' })
    const search = within(lookup).getByRole('textbox', { name: 'Shard or effect' })
    await user.type(search, 'Alpha Prefix')
    expect(within(lookup).getByRole('button', { name: 'Off Hand prefix' })).toBeTruthy()
    await user.click(within(lookup).getByRole('button', { name: 'Main Hand prefix' }))
    const applyDialog = screen.getByRole('dialog', { name: 'Apply effect?' })
    expect(applyDialog.textContent).toContain('Apply Alpha Prefix as the prefix on Main Hand?')
    expect(applyDialog.textContent).toContain('This adds the item to your plan.')
    await user.click(within(applyDialog).getByRole('button', { name: 'Apply effect' }))
    expect(within(lookup).getByRole('button', { name: 'Main Hand prefix (applied)' })).toBeTruthy()

    await user.clear(search)
    await user.type(search, 'Zebra Prefix')
    const slot = within(lookup).getByRole('button', { name: 'Main Hand prefix' })
    await user.click(slot)
    const replaceDialog = screen.getByRole('dialog', { name: 'Replace effect?' })
    expect(replaceDialog.textContent).toContain('Replace Alpha Prefix with Zebra Prefix as the prefix on Main Hand?')
    await user.click(within(replaceDialog).getByRole('button', { name: 'Cancel' }))
    await user.click(slot)
    const confirmedDialog = screen.getByRole('dialog', { name: 'Replace effect?' })
    expect(confirmedDialog.textContent).toContain('Replace Alpha Prefix with Zebra Prefix')
    await user.click(within(confirmedDialog).getByRole('button', { name: 'Replace effect' }))

    await user.click(screen.getByRole('tab', { name: 'Crafting Plan' }))
    expect(getSelect('Prefix for Main Hand').value).toBe('Zebra Prefix')
    expect(screen.getByRole('button', { name: 'Plan Off Hand' })).toBeTruthy()
  })

  it('discloses the item level and mark changes needed to apply a shard', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('tab', { name: 'Master Shard Lookup' }))
    const lookup = screen.getByRole('tabpanel', { name: 'Master Shard Lookup' })
    const search = within(lookup).getByRole('textbox', { name: 'Shard or effect' })
    await user.type(search, 'Level Two Suffix')
    await user.click(within(lookup).getByRole('button', { name: 'Main Hand suffix' }))
    let dialog = screen.getByRole('dialog', { name: 'Apply effect?' })
    expect(dialog.textContent).toContain("raises the item's minimum level from 1 to 2")
    await user.click(within(dialog).getByRole('button', { name: 'Apply effect' }))

    await user.clear(search)
    await user.type(search, 'Main Hand Extra')
    await user.click(within(lookup).getByRole('button', { name: 'Main Hand extra' }))
    dialog = screen.getByRole('dialog', { name: 'Apply effect?' })
    expect(dialog.textContent).toContain('1 × Mark of House Cannith')
    await user.click(within(dialog).getByRole('button', { name: 'Apply effect' }))

    await user.click(screen.getByRole('tab', { name: 'Crafting Plan' }))
    expect(getSelect('Master ML').value).toBe('1')
    expect(getSelect('ML for Main Hand').value).toBe('2')
    expect(getSelect('Suffix for Main Hand').value).toBe('Level Two Suffix')
    expect(getSelect('Extra for Main Hand').value).toBe('Main Hand Extra')
    expect(screen.getByRole<HTMLInputElement>('switch', { name: 'Mark of House Cannith for Main Hand' }).checked).toBe(
      true
    )
  })

  it('looks up shards by component effect and matching slot placement, with live effects and recipe variants', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('tab', { name: 'Master Shard Lookup' }))
    const lookup = screen.getByRole('tabpanel', { name: 'Master Shard Lookup' })
    const search = within(lookup).getByRole('textbox', { name: 'Shard or effect' })
    await user.type(search, 'LIGHT spell power')

    const results = within(lookup).getByRole('table', { name: 'Shard results' })
    expect(within(results).getAllByRole('row')).toHaveLength(2)
    expect(within(results).getByRole('button', { name: /Split Prefix Test/ })).toBeTruthy()
    const detail = within(lookup).getByRole('region', { name: 'Selected shard' })
    expect(within(detail).getByText('+1')).toBeTruthy()
    expect(within(detail).getByText('+5%')).toBeTruthy()
    await selectOption(user, 'Preview item level', '2')
    expect(within(detail).getByText('+2')).toBeTruthy()
    expect(within(detail).getByText('×10')).toBeTruthy()

    await user.click(within(lookup).getByText('Unbound', { exact: true }))
    expect(within(detail).getByRole('heading', { name: 'Unbound recipe' })).toBeTruthy()
    expect(within(detail).getByText('Crafting level 120')).toBeTruthy()
    expect(within(detail).getByText('×20')).toBeTruthy()

    await selectOption(user, 'Equipment slot', 'Ring')
    await selectOption(user, 'Affix position', 'Prefix')
    expect(within(lookup).getByText('No matching shards')).toBeTruthy()
    await selectOption(user, 'Affix position', 'Suffix')
    expect(within(lookup).getByRole('button', { name: /Split Prefix Test/ })).toBeTruthy()

    await user.click(within(lookup).getByRole('button', { name: 'Clear filters' }))
    await user.type(search, 'ml2')
    expect(within(lookup).getByRole('heading', { name: 'Minimum Level 2 Shard' })).toBeTruthy()
    expect(within(lookup).getByText('×140')).toBeTruthy()

    await user.click(screen.getByRole('tab', { name: 'Crafting Plan' }))
    expect(screen.getByRole('combobox', { name: 'Master ML' })).toBeTruthy()
    await user.click(screen.getByRole('tab', { name: 'Master Shard Lookup' }))
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Shard or effect' }).value).toBe('ml2')
  })

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

    expect(await screen.findByRole('combobox', { name: 'Master ML' })).toBeTruthy()
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
    expect(getSelect('Master ML').value).toBe('2')
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
    expect(getSelect('Master ML').value).toBe('2')
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
    expect(getSelect('Master ML').value).toBe('2')
    expect(new URLSearchParams(window.location.search).get('cc')).toBe('damaged-link')
    expect(new URLSearchParams(window.location.search).get('view')).toBe('compact')
  })

  it('generates a v4 permalink for the stable Essence Crafting path', async () => {
    const user = userEvent.setup()
    renderPage()

    const tool = await openTool(user, 'Sharing')
    await user.click(within(tool).getByText('Preview share text'))
    const input = within(tool).getByRole<HTMLInputElement>('textbox', { name: 'Share preview' })
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
      expect(control.hasAttribute('aria-current')).toBe(false)
    }
  })

  it('edits an affix in Grid and keeps it when switching to List', async () => {
    const user = userEvent.setup()
    renderPage()
    expect((await screen.findByRole<HTMLInputElement>('radio', { name: 'List' })).checked).toBe(true)
    await user.click(screen.getByText('Grid', { selector: 'span' }))
    const board = within(screen.getByTestId('equipment-slot-selector'))
    expect(board.getAllByRole('article')).toHaveLength(EQUIPMENT_SLOTS.length)
    const hand = within(board.getByRole('article', { name: 'Main Hand crafting slot' }))
    await user.click(screen.getByRole('button', { name: 'Plan Main Hand' }))
    const prefix = await hand.findByRole('combobox', { name: 'Prefix for Main Hand' })
    await user.click(prefix)
    await user.click(await screen.findByRole('option', { name: 'Alpha Prefix' }))
    await user.click(screen.getByRole('button', { name: 'Plan Ring 1' }))
    expect(screen.getByRole('combobox', { name: 'Extra for Ring 1' })).toBeTruthy()
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Prefix for Main Hand' }).value).toBe('Alpha Prefix')
    await user.click(screen.getByRole('button', { name: 'Collapse Ring 1 planned item' }))
    await user.click(screen.getByText('List', { selector: 'span' }))
    await user.click(screen.getByRole('button', { name: 'Edit Main Hand' }))
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Prefix for Main Hand' }).value).toBe('Alpha Prefix')
    await user.click(screen.getByRole('button', { name: 'Import / Export' }))
    const backup = within(await screen.findByRole('dialog', { name: 'Import / Export' }))
    expect(backup.getByRole('button', { name: 'Download JSON' })).toBeTruthy()
    expect(backup.getByRole('button', { name: 'Review backup' })).toBeTruthy()
  })

  it('registers Recipes, Ingredients, and Sharing as desktop workspace tools', async () => {
    desktopViewport = true
    const user = userEvent.setup()
    renderPage()

    await screen.findByRole('combobox', { name: 'Master ML' })
    const rail = within(screen.getByTestId('workspace-tool-rail'))
    expect(rail.getByRole('button', { name: 'Recipes' })).toBeTruthy()
    expect(rail.getByRole('button', { name: 'Ingredients' })).toBeTruthy()
    expect(rail.getByRole('button', { name: 'Sharing' })).toBeTruthy()
    const tool = await openRecipes(user)
    expect(tool).toBeTruthy()
    expect(screen.getByText('No planned items')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Close Recipes' }))
    expect(screen.queryByRole('complementary', { name: 'Recipes' })).toBeNull()
    await openTool(user, 'Sharing')
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
    await user.click(screen.getByRole('button', { name: 'Edit Main Hand' }))
    await openIngredients(user)
    expect(totalQuantity('ingredient-essence')).toBe('20')

    await selectOption(user, 'ML for Main Hand', '2')
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

  it('shows a split prefix once and keeps recipe IDs out of recipe details', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await selectOption(user, 'Prefix for Main Hand', 'Split Prefix Test')
    await addAugmentSlot(user, 'Main Hand', 'Red')
    await selectOption(user, 'Augment for Red augment slot on Main Hand', /Ruby of Charisma \+1/)
    const recipes = await openRecipes(user)

    expect(within(recipes).getByText('Prefix shard: Split Prefix Test')).toBeTruthy()
    expect(within(recipes).getByText(/Ruby of Charisma \+1 \(Red\)/)).toBeTruthy()
    expect(recipes.textContent).not.toMatch(/Recipe ID|recipe-(?:enhancement|minimum-level)-/i)
    expect(within(recipes).getByText('Crafting level 100 · Bound')).toBeTruthy()
    expect(within(screen.getByTestId('recipes-step-main-hand-prefix')).getByText('Magic Item Essence')).toBeTruthy()

    await user.click(within(recipes).getByRole('radio', { name: 'Unbound' }))

    expect(recipes.textContent).not.toMatch(/Recipe ID|recipe-(?:enhancement|minimum-level)-/i)
    expect(within(recipes).getByText('Crafting level 120 · Unbound')).toBeTruthy()
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
    await user.click(screen.getByRole('button', { name: 'Edit Main Hand' }))
    await selectOption(user, 'ML for Main Hand', '2')
    await openRecipes(user)

    expect(screen.getByTestId('recipes-item-main-hand').textContent).toContain('ML 2')
    expect(screen.getByTestId('recipes-item-off-hand').textContent).toContain('ML 1')
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

    await selectOption(user, 'ML for Main Hand', '2')
    expect(screen.getByText('Light Spell Power: +2 (Enhancement)')).toBeTruthy()
    expect(screen.queryByText('Light Spell Power: +1 (Enhancement)')).toBeNull()
  })

  it('shows selected effects without modifiers or bonus types without placeholder text', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await selectOption(user, 'Prefix for Main Hand', 'Alpha Prefix')

    const planner = within(screen.getByRole('tabpanel', { name: 'Crafting Plan' }))
    expect(planner.getByText('Alpha Prefix Effect')).toBeTruthy()
    expect(planner.queryByText(/modifier not defined/i)).toBeNull()
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

    expect(await screen.findByRole('combobox', { name: 'Master ML' })).toBeTruthy()
    expect(vi.mocked(loadEssenceCraftingData)).toHaveBeenCalledTimes(2)
  })

  it('keeps slots in catalog order and opens only the selected item editor', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Ring 2')
    await activateSlot(user, 'Main Hand')
    await activateSlot(user, 'Off Hand')

    const selector = within(screen.getByTestId('equipment-slot-selector'))
    expect(
      selector.getAllByRole('button', { name: /^Edit / }).map((button) => button.getAttribute('aria-label'))
    ).toEqual(['Edit Main Hand', 'Edit Off Hand', 'Edit Ring 2'])
    expect(screen.getAllByTestId(/^planned-item-/)).toHaveLength(1)
    expect(selector.getByRole('button', { name: 'Edit Off Hand' }).getAttribute('aria-current')).toBe('true')
  })

  it('keeps Ring 1 and Ring 2 independently configurable', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Ring 1')
    await activateSlot(user, 'Ring 2')
    await user.click(screen.getByRole('button', { name: 'Edit Ring 1' }))
    await selectOption(user, 'ML for Ring 1', '2')

    expect(getSelect('ML for Ring 1').value).toBe('2')
    expect(screen.getByRole('heading', { name: 'Ring 1 planned item' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Edit Ring 2' }))
    expect(getSelect('ML for Ring 2').value).toBe('Inherit master ML (1)')
    expect(screen.getByRole('heading', { name: 'Ring 2 planned item' })).toBeTruthy()
  })

  it('deactivates one slot only after confirmation without changing other items', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await activateSlot(user, 'Off Hand')
    await user.click(screen.getByRole('button', { name: 'Remove Off Hand planned item' }))

    expect(screen.getByRole('dialog', { name: 'Remove Off Hand?' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Remove item' }))

    expect(screen.getByTestId('planned-item-main-hand')).toBeTruthy()
    expect(screen.queryByTestId('planned-item-off-hand')).toBeNull()
    expect(screen.getByRole('button', { name: 'Plan Off Hand' })).toBeTruthy()
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
    await selectOption(user, 'Master ML', '2')
    expect(screen.getByText('Effective ML 2')).toBeTruthy()

    await selectOption(user, 'Master ML', '1')
    await selectOption(user, 'ML for Main Hand', '2')
    expect(screen.getByText('Effective ML 2')).toBeTruthy()
  })

  it('resets one item without deactivating it or changing other active items', async () => {
    const user = userEvent.setup()
    renderPage()

    await activateSlot(user, 'Main Hand')
    await activateSlot(user, 'Off Hand')
    await user.click(screen.getByRole('button', { name: 'Edit Main Hand' }))
    await selectOption(user, 'ML for Main Hand', '2')
    await selectOption(user, 'Prefix for Main Hand', 'Alpha Prefix')
    await user.click(screen.getByRole('button', { name: 'Reset Main Hand planned item' }))

    expect(screen.getByTestId('planned-item-main-hand')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Edit Off Hand' })).toBeTruthy()
    expect(getSelect('ML for Main Hand').value).toBe('Inherit master ML (1)')
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
    expect(screen.getByText('This slot requires ML 2. Effective ML is 2.')).toBeTruthy()
    expect(screen.getByText('Effective ML 2')).toBeTruthy()
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
    expect(getSelect(augmentLabel).textContent).toBe('Ruby of Charisma +1')
    expect(screen.getByText('Charisma: +1 (Enhancement)')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Clear augment for Red augment slot on Main Hand' }))
    expect(getSelect(augmentLabel).textContent).toBe('Choose augment')
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
    expect(await screen.findByRole('button', { name: /Ruby of Charisma \+1/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Ruby of Strength \+1/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Ruby of Versatility \+1/ })).toBeTruthy()
    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('radio', { name: 'Match all effects' }))
    await user.click(getSelect(augmentLabel))
    expect(await screen.findByRole('button', { name: /Ruby of Versatility \+1/ })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Ruby of Charisma \+1/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Ruby of Strength \+1/ })).toBeNull()
  })
})
