// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { IconFileInfo, IconListCheck, IconListDetails, IconTools } from '@tabler/icons-react'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadLgsData } from './data.ts'
import type { LgsData } from './legendaryGreenSteel.types.ts'
import LegendaryGreenSteelPage from './LegendaryGreenSteelPage.tsx'
import { encodeLgsPermalink } from './sharing.ts'
import { lgsWorkspaceToolDefinitions } from './workspaceTools.ts'

const browserMocks = vi.hoisted(() => ({
  copyText: vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined)
}))

vi.mock('../../shared/serialization/browser.ts', () => ({
  copyText: browserMocks.copyText,
  downloadTextFile: vi.fn(),
  readTextFile: vi.fn()
}))

vi.mock('./data.ts', () => ({ loadLgsData: vi.fn(), InvalidLgsDataError: class InvalidLgsDataError extends Error {} }))

const data: LgsData = {
  schemaVersion: 1,
  baseItems: [
    {
      name: 'Weapon Base',
      ingredientType: 'Legendary Green Steel Weapon',
      craftedIn: 'Altar',
      quantity: 1,
      requirements: [{ name: 'Weapon Raw', quantity: 1 }],
      source: {}
    },
    {
      name: 'Accessory Base',
      ingredientType: 'Legendary Green Steel Accessory',
      craftedIn: 'Altar',
      quantity: 1,
      requirements: [{ name: 'Accessory Raw', quantity: 1 }],
      source: {}
    }
  ],
  tier1: [
    {
      name: 'Tier 1 Weapon',
      title: 'Tier 1 Weapon',
      augmentType: 'Tier 1',
      minimumLevel: 26,
      craftedIn: 'Altar',
      quantity: 1,
      requirements: [{ name: 'Weapon Component', quantity: 1 }],
      effectsAdded: [{ name: 'Electric Spell Power', modifier: 139, bonus: 'Equipment' }],
      tier: 1,
      itemType: 'Weapon',
      primaryFocus: 'Air',
      essence: 'Ethereal',
      gem: 'Dominion',
      source: {}
    },
    {
      name: 'Tier 1 Equipment',
      title: 'Tier 1 Equipment',
      augmentType: 'Tier 1',
      minimumLevel: 26,
      craftedIn: 'Altar',
      quantity: 1,
      requirements: [],
      effectsAdded: [{ name: 'Good-aligned Weapon' }],
      tier: 1,
      itemType: 'Equipment',
      primaryFocus: 'Air',
      essence: 'Ethereal',
      gem: 'Dominion',
      source: {}
    }
  ],
  tier2: [
    {
      name: 'Tier 2 Weapon',
      title: 'Tier 2 Weapon',
      augmentType: 'Tier 2',
      minimumLevel: 26,
      craftedIn: 'Tier 2 Altar',
      quantity: 1,
      requirements: [{ name: 'Tier 2 Raw', quantity: 2 }],
      effectsAdded: [{ name: 'Electric Lore', modifier: 29, bonus: 'Equipment' }],
      tier: 2,
      itemType: 'Weapon',
      primaryFocus: 'Air',
      essence: 'Ethereal',
      gem: 'Dominion',
      source: {}
    }
  ],
  tier3: [
    {
      name: 'Tier 3 Weapon Air Fire',
      title: 'Tier 3 Weapon Air Fire',
      augmentType: 'Tier 3',
      minimumLevel: 26,
      craftedIn: 'Tier 3 Altar',
      quantity: 1,
      requirements: [{ name: 'Tier 3 Component', quantity: 3 }],
      effectsAdded: [{ name: 'Electric Critical Damage', modifier: 6 }],
      tier: 3,
      itemType: 'Weapon',
      primaryFocus: 'Air',
      secondaryFocus: 'Fire',
      essence: 'Ethereal',
      gem: 'Dominion',
      source: {}
    }
  ],
  activeAugments: [
    {
      name: 'Legendary Green Steel Augment: Animal Growth',
      displayName: 'Animal Growth',
      minimumLevel: 26,
      augmentType: 'Active',
      description: 'Animal spell.',
      craftedIn: 'Altar',
      quantity: 1,
      requirements: [{ name: 'Active Raw', quantity: 1 }],
      source: {}
    },
    {
      name: 'Legendary Green Steel Augment: Cometfall',
      displayName: 'Cometfall',
      type: 'Damage',
      minimumLevel: 26,
      augmentType: 'Active',
      craftedIn: 'Altar',
      quantity: 1,
      requirements: [{ name: 'Active Raw', quantity: 1 }],
      source: {}
    }
  ],
  bonusEffects: [
    {
      name: 'Air Fire Bonus',
      description: 'Air and fire description.',
      lowerFoci: ['Air'],
      tier3Foci: ['Air', 'Fire'],
      source: {}
    }
  ],
  craftingComponents: [
    {
      name: 'Weapon Component',
      craftedIn: 'Altar',
      quantity: 1,
      requirements: [{ name: 'Component Raw', quantity: 2 }],
      source: {}
    },
    {
      name: 'Tier 3 Component',
      craftedIn: 'Component Altar',
      quantity: 1,
      requirements: [{ name: 'Tier 3 Raw', quantity: 3 }],
      source: {}
    }
  ],
  specialRecipes: [
    { name: "Immortal's Heart", quantity: 1, requirements: [{ name: 'Codex Runes', quantity: 2500 }], source: {} }
  ]
}

const renderPage = () =>
  render(
    <MantineProvider env='test'>
      <LegendaryGreenSteelPage />
    </MantineProvider>
  )

const choose = async (user: ReturnType<typeof userEvent.setup>, label: string, optionName: RegExp) => {
  await user.click(await screen.findByRole('combobox', { name: label }))
  await user.click(await screen.findByRole('option', { name: optionName }))
}

let desktopViewport = true

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: desktopViewport && query.includes('75em'),
      media: '',
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
})

afterEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/')
  vi.mocked(loadLgsData).mockReset()
  browserMocks.copyText.mockClear()
  vi.unstubAllGlobals()
  desktopViewport = true
})

describe('LegendaryGreenSteelPage', () => {
  it('uses WorkspaceLayout tools and presents base-grouped compatible crafting controls', async () => {
    vi.mocked(loadLgsData).mockResolvedValue(data)
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: 'Legendary Green Steel' })
    expect(screen.getByTestId('workspace-layout')).toBeTruthy()
    expect(
      screen
        .getAllByRole('button')
        .filter((button) => button.dataset.testid?.startsWith('workspace-tool-'))
        .map((button) => button.getAttribute('aria-label'))
    ).toEqual(['Tools', 'Build Summary', 'Ingredients', 'Crafting Breakdown'])
    expect(screen.queryByRole('button', { name: 'Effects & Details' })).toBeNull()

    expect(screen.getByText('Select a base item first.')).toBeTruthy()
    await user.click(screen.getByRole('combobox', { name: 'Legendary Green Steel base item' }))
    expect(await screen.findByText('Weapons')).toBeTruthy()
    expect(screen.getByText('Accessories')).toBeTruthy()
    await user.click(screen.getByRole('option', { name: 'Weapon Base' }))
    expect(screen.getByTestId('lgs-tier-grid')).toBeTruthy()
    await user.click(screen.getByRole('combobox', { name: 'Tier 1 upgrade' }))
    expect(await screen.findByRole('option', { name: /Air · Ethereal · Dominion/ })).toBeTruthy()
    expect(screen.queryByRole('option', { name: /Tier 1 Equipment/ })).toBeNull()
  })

  it('shows ingredients and details through Workspace mobile drawers, then resets selections', async () => {
    desktopViewport = false
    vi.mocked(loadLgsData).mockResolvedValue(data)
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: 'Legendary Green Steel' })
    await user.click(screen.getByRole('combobox', { name: 'Legendary Green Steel base item' }))
    await user.click(screen.getByRole('option', { name: 'Weapon Base' }))
    await user.click(screen.getByRole('combobox', { name: 'Active Augment' }))
    await user.click(screen.getByRole('option', { name: 'Animal Growth' }))

    await user.click(screen.getByRole('button', { name: 'Ingredients' }))
    let dialog = await screen.findByRole('dialog', { name: 'Ingredients' })
    expect(within(dialog).getByText('Weapon Raw')).toBeTruthy()
    expect(within(dialog).getByText('Active Raw')).toBeTruthy()
    await user.click(within(dialog).getByRole('button', { name: 'Build Summary' }))
    dialog = await screen.findByRole('dialog', { name: 'Build Summary' })
    expect(within(dialog).getByText('Animal Growth')).toBeTruthy()
    expect(within(dialog).getByText('Animal spell.')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Reset plan' }))
    expect(screen.getByRole('combobox', { name: 'Legendary Green Steel base item' }).getAttribute('value')).toBe('')
    expect(screen.getByRole('combobox', { name: 'Active Augment' }).getAttribute('value')).toBe('')
  })

  it('keeps an active augment without description selectable and omits description text', async () => {
    desktopViewport = false
    vi.mocked(loadLgsData).mockResolvedValue(data)
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: 'Legendary Green Steel' })
    await user.click(screen.getByRole('combobox', { name: 'Active Augment' }))
    await user.click(screen.getByRole('option', { name: 'Cometfall' }))
    await user.click(screen.getByRole('button', { name: 'Build Summary' }))

    const dialog = await screen.findByRole('dialog', { name: 'Build Summary' })
    expect(within(dialog).getByText('Cometfall')).toBeTruthy()
    expect(within(dialog).getByText('Damage')).toBeTruthy()
    expect(within(dialog).queryByText('undefined')).toBeNull()
  })

  it('matches HGS tool IDs, order, and icon components without inspecting SVG markup', () => {
    expect(lgsWorkspaceToolDefinitions.map(({ id, label }) => ({ id, label }))).toEqual([
      { id: 'tools', label: 'Tools' },
      { id: 'summary', label: 'Build Summary' },
      { id: 'ingredients', label: 'Ingredients' },
      { id: 'breakdown', label: 'Crafting Breakdown' }
    ])
    expect(lgsWorkspaceToolDefinitions.map(({ Icon }) => Icon)).toEqual([
      IconTools,
      IconFileInfo,
      IconListCheck,
      IconListDetails
    ])
  })

  it('shows stage recipes separately from aggregated ingredients and round trips a complete plan through Tools', async () => {
    vi.mocked(loadLgsData).mockResolvedValue(data)
    const user = userEvent.setup()
    renderPage()

    await choose(user, 'Legendary Green Steel base item', /^Weapon Base$/)
    await choose(user, 'Tier 1 upgrade', /^Electric Spell Power \+139/)
    await choose(user, 'Tier 2 upgrade', /^Electric Lore \+29/)
    await choose(user, 'Tier 3 upgrade', /^Electric Critical Damage \+6/)
    await choose(user, 'Bonus Effect', /^Air Fire Bonus$/)
    await choose(user, 'Active Augment', /^Animal Growth$/)

    await user.click(screen.getByRole('button', { name: 'Crafting Breakdown' }))
    const breakdown = await screen.findByRole('complementary', { name: 'Crafting Breakdown' })
    for (const name of ['Weapon Base', 'Tier 1 Weapon', 'Tier 2 Weapon', 'Tier 3 Weapon Air Fire', 'Animal Growth']) {
      expect(within(breakdown).getByText(name)).toBeTruthy()
    }
    expect(within(breakdown).getByText(/Weapon Component ×1 \(crafted component\)/)).toBeTruthy()
    expect(within(breakdown).queryByText("Immortal's Heart")).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Ingredients' }))
    const ingredients = await screen.findByRole('complementary', { name: 'Ingredients' })
    expect(within(ingredients).getByText('Component Raw')).toBeTruthy()
    expect(within(ingredients).queryByText('Tier 1 Weapon')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Tools' }))
    const tools = await screen.findByRole('complementary', { name: 'Tools' })
    expect(
      within(tools)
        .getAllByRole('button')
        .map((button) => button.textContent?.trim())
        .filter((label) => label?.startsWith('Copy ') || label === 'Download JSON' || label === 'Load Build')
    ).toEqual(['Copy Permalink', 'Copy Discord', 'Copy Forum', 'Copy JSON', 'Download JSON', 'Load Build'])
    await user.click(within(tools).getByRole('button', { name: 'Copy Permalink' }))
    await user.click(within(tools).getByRole('button', { name: 'Copy Discord' }))
    await user.click(within(tools).getByRole('button', { name: 'Copy Forum' }))
    await user.click(within(tools).getByRole('button', { name: 'Copy JSON' }))
    await waitFor(() => {
      expect(browserMocks.copyText).toHaveBeenCalledTimes(4)
    })
    expect(browserMocks.copyText.mock.calls[0]?.[0]).toContain('/legendary-green-steel?build=')
    expect(browserMocks.copyText.mock.calls[1]?.[0]).toContain('**Legendary Green Steel**')
    expect(browserMocks.copyText.mock.calls[2]?.[0]).toContain('[b]Legendary Green Steel[/b]')
    const exported = browserMocks.copyText.mock.calls[3]?.[0]
    expect(exported).toContain('"schema": "yourddo-lgs"')
    if (typeof exported !== 'string') throw new Error('Expected LGS JSON export')

    await user.click(screen.getByRole('button', { name: 'Reset plan' }))
    const input = within(tools).getByRole('textbox', { name: 'Paste LGS JSON' })
    fireEvent.change(input, { target: { value: exported } })
    await user.click(within(tools).getByRole('button', { name: 'Load Build' }))
    await waitFor(() => {
      expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Legendary Green Steel base item' }).value).toBe(
        'Weapon Base'
      )
    })
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Tier 1 upgrade' }).value).toBe(
      'Electric Spell Power +139 (Equipment)'
    )
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Tier 2 upgrade' }).value).toBe(
      'Electric Lore +29 (Equipment)'
    )
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Tier 3 upgrade' }).value).toBe(
      'Electric Critical Damage +6'
    )
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Bonus Effect' }).value).toBe('Air Fire Bonus')
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Active Augment' }).value).toBe('Animal Growth')
  })

  it('restores a complete permalink after loading data and leaves stale links isolated from the catalog', async () => {
    const complete = {
      baseItemName: 'Weapon Base',
      tier1Name: 'Tier 1 Weapon',
      tier2Name: 'Tier 2 Weapon',
      tier3Name: 'Tier 3 Weapon Air Fire',
      bonusEffectName: 'Air Fire Bonus',
      activeAugmentName: 'Legendary Green Steel Augment: Animal Growth'
    }
    vi.mocked(loadLgsData).mockResolvedValue(data)
    window.history.replaceState(
      {},
      '',
      `/legendary-green-steel?build=${encodeURIComponent(encodeLgsPermalink(complete))}`
    )
    const valid = renderPage()

    await waitFor(() => {
      expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Legendary Green Steel base item' }).value).toBe(
        'Weapon Base'
      )
    })
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Tier 1 upgrade' }).value).toBe(
      'Electric Spell Power +139 (Equipment)'
    )
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Tier 2 upgrade' }).value).toBe(
      'Electric Lore +29 (Equipment)'
    )
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Tier 3 upgrade' }).value).toBe(
      'Electric Critical Damage +6'
    )
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Bonus Effect' }).value).toBe('Air Fire Bonus')
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Active Augment' }).value).toBe('Animal Growth')

    valid.unmount()
    const stale = { ...complete, activeAugmentName: 'Removed active augment' }
    window.history.replaceState({}, '', `/legendary-green-steel?build=${encodeURIComponent(encodeLgsPermalink(stale))}`)
    renderPage()
    expect((await screen.findByRole('alert')).textContent).toContain('Build link could not be loaded')
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Legendary Green Steel base item' }).value).toBe('')
  })
})
