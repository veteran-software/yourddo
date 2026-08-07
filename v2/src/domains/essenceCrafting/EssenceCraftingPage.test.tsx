// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadEssenceCraftingData, validateEssenceCraftingDataset } from './data.ts'
import { EQUIPMENT_SLOTS } from './equipment.ts'
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

    await user.click(screen.getByRole('button', { name: 'Clear augment for Red augment slot on Main Hand' }))
    expect(getSelect(augmentLabel).value).toBe('')
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
