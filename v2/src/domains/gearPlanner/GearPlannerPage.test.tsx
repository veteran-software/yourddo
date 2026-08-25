// @vitest-environment jsdom

import { MantineProvider } from '@mantine/core'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { loadGearPlannerData } from './data.ts'
import {
  allGearPlannerSlots,
  gearPlannerCharacterSlots,
  type GearPlannerData,
  type GearPlannerFiligree,
  type GearPlannerFiligreeSetDefinition,
  type GearPlannerItem,
  gearPlannerSlotGridColumns,
  gearPlannerSlots
} from './gearPlanner.types.ts'
import GearPlannerPage from './GearPlannerPage.tsx'

vi.mock('./data.ts', () => ({
  InvalidGearPlannerDataError: class InvalidGearPlannerDataError extends Error {},
  loadGearPlannerData: vi.fn()
}))

const data: GearPlannerData = {
  sourceDatasets: [],
  items: [],
  itemsBySlot: {} as GearPlannerData['itemsBySlot'],
  augments: [],
  filigrees: [],
  filigreeSetDefinitions: [],
  filigreeSetDefinitionByName: new Map(),
  rawItemCount: 0,
  normalizedItemCount: 0,
  rejectedItemCount: 0
}

const item = (
  id: string,
  slot: GearPlannerItem['slot'],
  name: string,
  minimumLevel = 10,
  enchantments?: GearPlannerItem['source']['enchantments'],
  setNames: readonly string[] = [],
  augments?: GearPlannerItem['source']['augments']
): GearPlannerItem => ({
  id,
  slot,
  sourceFile: 'test.json',
  minimumLevel,
  source: {
    name,
    minLevel: minimumLevel,
    type: slot === gearPlannerSlots.armor ? 'Heavy Armor' : 'Test Item',
    enchantments,
    ...(setNames.length > 0 ? { setBonus: setNames.map((setName) => ({ name: setName })) } : {}),
    ...(augments === undefined ? {} : { augments })
  }
})

const dataWithItems = (
  items: readonly GearPlannerItem[],
  augments: GearPlannerData['augments'] = [],
  filigrees: readonly GearPlannerFiligree[] = [],
  filigreeSetDefinitions: readonly GearPlannerFiligreeSetDefinition[] = []
): GearPlannerData => ({
  ...data,
  items,
  augments,
  filigrees,
  filigreeSetDefinitions,
  filigreeSetDefinitionByName: new Map(filigreeSetDefinitions.map((definition) => [definition.name, definition])),
  itemsBySlot: Object.fromEntries(
    allGearPlannerSlots.map((slot) => [slot, items.filter((plannerItem) => plannerItem.slot === slot)])
  ) as unknown as GearPlannerData['itemsBySlot'],
  normalizedItemCount: items.length
})

const renderReadyPage = async (plannerData: GearPlannerData) => {
  vi.mocked(loadGearPlannerData).mockResolvedValue(plannerData)
  render(
    <MantineProvider env='test'>
      <GearPlannerPage />
    </MantineProvider>
  )
  await screen.findByRole('region', { name: 'Gear Planner workspace' })
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.clearAllMocks()
})

beforeAll(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
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

afterAll(() => {
  vi.unstubAllGlobals()
})

describe('GearPlannerPage', () => {
  it('renders character slots in legacy row-major order with responsive grid columns', async () => {
    await renderReadyPage(data)

    expect(screen.getAllByTestId(/gear-slot-/).map((slot) => slot.getAttribute('data-testid'))).toEqual([
      'gear-slot-Eyes',
      'gear-slot-Head',
      'gear-slot-Neck',
      'gear-slot-Trinket',
      'gear-slot-Armor',
      'gear-slot-Cloak',
      'gear-slot-Wrists',
      'gear-slot-Waist',
      'gear-slot-First Finger',
      'gear-slot-Feet',
      'gear-slot-Hands',
      'gear-slot-Second Finger',
      'gear-slot-Main Hand',
      'gear-slot-Off Hand',
      'gear-slot-Quiver'
    ])
    expect(gearPlannerSlotGridColumns).toEqual({ base: 1, xs: 2, md: 3, lg: 4 })
  })

  it('renders an all-or-error load state and retries failed data loading', async () => {
    vi.mocked(loadGearPlannerData).mockRejectedValueOnce(new Error('ring.json unavailable')).mockResolvedValueOnce(data)

    render(
      <MantineProvider env='test'>
        <GearPlannerPage />
      </MantineProvider>
    )

    expect(screen.getByRole('status')).toBeTruthy()
    expect(await screen.findByText('Gear Planner data could not be loaded. Try again.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => {
      expect(screen.getByRole('region', { name: 'Gear Planner workspace' })).toBeTruthy()
    })
    expect(loadGearPlannerData).toHaveBeenCalledTimes(2)
  })

  it('opens candidates only for clicked Head, Main Hand, and Off Hand slots', async () => {
    await renderReadyPage(
      dataWithItems([
        item('head', gearPlannerSlots.head, 'Test Helm'),
        item('main', gearPlannerSlots.mainHand, 'Test Sword'),
        item('off', gearPlannerSlots.offHand, 'Test Shield')
      ])
    )

    for (const [slot, candidate] of [
      ['Head', 'Test Helm'],
      ['Main Hand', 'Test Sword'],
      ['Off Hand', 'Test Shield']
    ] as const) {
      fireEvent.click(screen.getByRole('button', { name: `Select ${slot}` }))
      expect(await screen.findByText(`Select item for ${slot}`)).toBeTruthy()
      expect(screen.getByText(candidate)).toBeTruthy()
      fireEvent.click(screen.getByRole('button', { name: 'Close item browser' }))
    }
  })

  it('equips, replaces, and clears an item without altering another slot', async () => {
    await renderReadyPage(
      dataWithItems([
        item('head-a', gearPlannerSlots.head, 'First Helm'),
        item('head-b', gearPlannerSlots.head, 'Second Helm'),
        item('ring', gearPlannerSlots.firstFinger, 'Independent Ring')
      ])
    )

    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip First Helm' }))
    expect(screen.getByTestId('gear-slot-Head').textContent).toContain('First Helm')

    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Second Helm' }))
    expect(screen.getByTestId('gear-slot-Head').textContent).toContain('Second Helm')

    fireEvent.click(screen.getByRole('button', { name: 'Select First Finger' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Independent Ring' }))
    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Clear Head' }))

    expect(screen.getByTestId('gear-slot-Head').textContent).toContain('Select an item')
    expect(screen.getByTestId('gear-slot-First Finger').textContent).toContain('Independent Ring')
  })

  it('limits results to 50 until more are requested', async () => {
    await renderReadyPage(
      dataWithItems(
        Array.from({ length: 51 }, (_, index) =>
          item(`head-${String(index)}`, gearPlannerSlots.head, `Result ${String(index)}`)
        )
      )
    )

    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    expect((await screen.findAllByRole('button', { name: /Equip Result/ })).length).toBe(50)
    fireEvent.click(screen.getByRole('button', { name: 'Show 1 more' }))
    expect((await screen.findAllByRole('button', { name: /Equip Result/ })).length).toBe(51)
  })

  it('shows the Enchantments tool empty state before gear is equipped', async () => {
    await renderReadyPage(data)

    fireEvent.click(screen.getByRole('button', { name: 'Enchantments' }))
    expect(await screen.findByText('No enchantments yet')).toBeTruthy()
  })

  it('shows the Set Bonuses tool empty state before any set source is selected', async () => {
    await renderReadyPage(data)

    fireEvent.click(screen.getByRole('button', { name: 'Set Bonuses' }))
    expect(await screen.findByText('No set memberships yet')).toBeTruthy()
  })

  it('shows partial and active standard set progress, contributions, and Enchantments provenance', async () => {
    await renderReadyPage(
      dataWithItems([
        item('head', gearPlannerSlots.head, 'Arcane Helm', 30, undefined, ['Arcane Barrier']),
        item('ring', gearPlannerSlots.firstFinger, 'Arcane Ring', 30, undefined, ['Arcane Barrier']),
        item('second-ring', gearPlannerSlots.secondFinger, 'Arcane Ring Two', 30, undefined, ['Arcane Barrier'])
      ])
    )

    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Arcane Helm' }))
    fireEvent.click(screen.getByRole('button', { name: 'Select First Finger' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Arcane Ring' }))
    fireEvent.click(screen.getByRole('button', { name: 'Set Bonuses' }))

    expect(await screen.findByText('2 contributions')).toBeTruthy()
    expect(screen.getByText('Head: Arcane Helm')).toBeTruthy()
    expect(screen.getByText('First Finger: Arcane Ring')).toBeTruthy()
    expect(screen.getByText('3-piece bonus')).toBeTruthy()
    expect(screen.getByText('Equip 1 more')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Close workspace tool' }))
    fireEvent.click(screen.getByRole('button', { name: 'Select Second Finger' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Arcane Ring Two' }))
    fireEvent.click(screen.getByRole('button', { name: 'Set Bonuses' }))
    expect(await screen.findByText('3 contributions')).toBeTruthy()
    expect(screen.getByText('Active')).toBeTruthy()
    expect(screen.getByText('Magical Resistance Rating Cap 30 (Artifact)')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Close workspace tool' }))
    fireEvent.click(screen.getByRole('button', { name: 'Enchantments' }))
    expect(await screen.findByText(/Arcane Barrier · 3-piece bonus/)).toBeTruthy()
    expect(screen.getAllByText('Magical Resistance Rating Cap').length).toBeGreaterThan(0)
  })

  it('updates set memberships when an augment or its host item is cleared', async () => {
    const setAugment = {
      name: 'Set Augment: Arcane Barrier',
      augmentType: 'Colorless',
      minLevel: 1,
      effectsAdded: [],
      setBonus: [{ name: 'Arcane Barrier' }],
      source: { name: 'Set Augment: Arcane Barrier', augmentType: 'Colorless', minLevel: 1, effectsAdded: [] }
    }
    await renderReadyPage(
      dataWithItems(
        [
          item(
            'head',
            gearPlannerSlots.head,
            'Socketed Helm',
            30,
            undefined,
            [],
            [{ augmentType: 'Colorless', name: 'Colorless socket' }]
          )
        ],
        [setAugment]
      )
    )

    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Socketed Helm' }))
    fireEvent.click(screen.getByRole('combobox', { name: 'Colorless socket' }))
    fireEvent.click(await screen.findByRole('option', { name: /Set Augment: Arcane Barrier/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Set Bonuses' }))
    expect(await screen.findByText('1 contribution')).toBeTruthy()
    expect(screen.getByText('Head: Set Augment: Arcane Barrier on Socketed Helm')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Close workspace tool' }))
    fireEvent.click(screen.getByRole('button', { name: 'Clear augment' }))
    fireEvent.click(screen.getByRole('button', { name: 'Set Bonuses' }))
    expect(await screen.findByText('No set memberships yet')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Close workspace tool' }))
    fireEvent.click(screen.getByRole('combobox', { name: 'Colorless socket' }))
    fireEvent.click(await screen.findByRole('option', { name: /Set Augment: Arcane Barrier/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Clear Head from equipment' }))
    fireEvent.click(screen.getByRole('button', { name: 'Set Bonuses' }))
    expect(await screen.findByText('No set memberships yet')).toBeTruthy()
  })

  it('renders multiple and unresolved set memberships safely', async () => {
    await renderReadyPage(
      dataWithItems([
        item('head', gearPlannerSlots.head, 'Unknown Helm', 10, undefined, ['Unknown Set']),
        item('ring', gearPlannerSlots.firstFinger, 'Arcane Ring', 10, undefined, ['Arcane Barrier'])
      ])
    )

    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Unknown Helm' }))
    fireEvent.click(screen.getByRole('button', { name: 'Select First Finger' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Arcane Ring' }))
    fireEvent.click(screen.getByRole('button', { name: 'Set Bonuses' }))

    expect(await screen.findByText('Unknown Set')).toBeTruthy()
    expect(screen.getByText('Arcane Barrier')).toBeTruthy()
    expect(screen.getByText('Effect definition unavailable')).toBeTruthy()
  })

  it('updates summary and equipped-card conflict treatment as gear changes', async () => {
    await renderReadyPage(
      dataWithItems([
        item('head', gearPlannerSlots.head, 'Ten Helm', 10, [
          { name: 'Strength', modifier: '+10', bonus: 'Enhancement' },
          { name: 'Doublestrike', modifier: '+14%', bonus: 'Enhancement' },
          { name: 'Weapon Damage', modifier: '2[W]', bonus: 'Enhancement' }
        ]),
        item('ring', gearPlannerSlots.firstFinger, 'Twelve Ring', 10, [
          { name: 'Strength', modifier: '+12', bonus: 'Enhancement' }
        ]),
        item('second-ring', gearPlannerSlots.secondFinger, 'Tie Ring', 10, [
          { name: 'Strength', modifier: '+10', bonus: 'Enhancement' }
        ])
      ])
    )

    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Ten Helm' }))
    fireEvent.click(screen.getByRole('button', { name: 'Select First Finger' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Twelve Ring' }))

    expect(screen.getByTestId('equipped-effect-head:equipped-item:0').getAttribute('data-conflict-state')).toBe(
      'lesser'
    )
    expect(screen.getByTestId('equipped-effect-ring:equipped-item:0').getAttribute('data-conflict-state')).toBe(
      'effective'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Enchantments' }))
    expect(await screen.findByText('Strength')).toBeTruthy()
    expect(screen.getAllByText('+12')).toHaveLength(2)
    expect(screen.getAllByText(/Doublestrike/).length).toBeGreaterThan(1)
    expect(screen.getAllByText(/\+14%/).length).toBeGreaterThan(1)
    expect(screen.getAllByText(/2\[W\]/).length).toBeGreaterThan(1)

    fireEvent.click(screen.getByRole('button', { name: 'Close workspace tool' }))
    fireEvent.click(screen.getByRole('button', { name: 'Clear First Finger from equipment' }))
    expect(screen.getByTestId('equipped-effect-head:equipped-item:0').getAttribute('data-conflict-state')).toBe('none')

    fireEvent.click(screen.getByRole('button', { name: 'Select Second Finger' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Tie Ring' }))
    expect(screen.getByTestId('equipped-effect-head:equipped-item:0').getAttribute('data-conflict-state')).toBe(
      'effective'
    )
    expect(screen.getByTestId('equipped-effect-second-ring:equipped-item:0').getAttribute('data-conflict-state')).toBe(
      'effective'
    )
  })

  it('shows selectors only for published item augment slots and filters choices before search', async () => {
    const ruby = {
      name: 'Ruby of Strength',
      augmentType: 'Red',
      minLevel: 8,
      effectsAdded: [{ name: 'Strength', modifier: '+8', bonus: 'Enhancement' }],
      source: { name: 'Ruby of Strength', augmentType: 'Red', minLevel: 8, effectsAdded: [] }
    }
    const diamond = {
      name: 'Diamond of Strength',
      augmentType: 'Colorless',
      minLevel: 8,
      effectsAdded: [{ name: 'Strength', modifier: '+8', bonus: 'Insight' }],
      source: { name: 'Diamond of Strength', augmentType: 'Colorless', minLevel: 8, effectsAdded: [] }
    }
    const sapphire = {
      name: 'Sapphire of Strength',
      augmentType: 'Blue',
      minLevel: 8,
      effectsAdded: [{ name: 'Strength', modifier: '+8', bonus: 'Enhancement' }],
      source: { name: 'Sapphire of Strength', augmentType: 'Blue', minLevel: 8, effectsAdded: [] }
    }
    const head = {
      ...item('head', gearPlannerSlots.head, 'Socketed Helm', 10),
      source: {
        ...item('head', gearPlannerSlots.head, 'Socketed Helm', 10).source,
        augments: [{ augmentType: 'Red', name: 'Ruby socket' }]
      }
    }

    await renderReadyPage(
      dataWithItems([head, item('plain', gearPlannerSlots.neck, 'Plain Necklace')], [ruby, diamond, sapphire])
    )
    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Socketed Helm' }))
    expect(screen.getByRole('combobox', { name: 'Ruby socket' })).toBeTruthy()

    fireEvent.click(screen.getByRole('combobox', { name: 'Ruby socket' }))
    expect(await screen.findByRole('option', { name: /Ruby of Strength/ })).toBeTruthy()
    expect(screen.getByRole('option', { name: /Diamond of Strength/ })).toBeTruthy()
    expect(screen.queryByRole('option', { name: /Sapphire of Strength/ })).toBeNull()

    fireEvent.click(screen.getByRole('option', { name: /Ruby of Strength/ }))
    expect((await screen.findAllByText('Ruby of Strength')).length).toBeGreaterThan(1)
    expect(screen.getByText('Strength +8 (Enhancement)')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Enchantments' }))
    expect(await screen.findByText(/Ruby of Strength slotted in Socketed Helm · Head \/ Ruby socket/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Close workspace tool' }))
    fireEvent.click(screen.getByRole('button', { name: 'Clear Head from equipment' }))
    expect(screen.queryByText('Ruby of Strength')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Select Neck' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Plain Necklace' }))
    expect(screen.queryByRole('combobox', { name: 'Ruby socket' })).toBeNull()
  })

  it('shows filigree controls only on capable items and wires selections into Enchantments and Set Bonuses', async () => {
    const sentient = {
      ...item('sentient', gearPlannerSlots.mainHand, 'Sentient Dagger', 30),
      source: { ...item('sentient', gearPlannerSlots.mainHand, 'Sentient Dagger', 30).source, type: 'Dagger' }
    }
    const plain = item('plain', gearPlannerSlots.neck, 'Plain Necklace', 30)
    const selected: GearPlannerFiligree = {
      id: 'filigree-a',
      name: 'Filigree A',
      minimumLevel: 1,
      grouping: 'Test Filigree Set',
      source: { name: 'Filigree A', pageTitle: 'Filigree A', enchantments: [{ name: 'Strength', modifier: 2 }] }
    }
    const definition: GearPlannerFiligreeSetDefinition = {
      name: 'Test Filigree Set',
      thresholds: [{ threshold: 1, effects: [{ name: 'Melee Power', modifier: 5 }] }],
      source: { name: 'Test Filigree Set' }
    }
    await renderReadyPage(dataWithItems([sentient, plain], [], [selected], [definition]))

    fireEvent.click(screen.getByRole('button', { name: 'Select Neck' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Plain Necklace' }))
    expect(screen.queryByRole('button', { name: 'Manage filigrees for Plain Necklace' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Select Main Hand' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Sentient Dagger' }))
    fireEvent.click(screen.getByRole('button', { name: 'Manage filigrees for Sentient Dagger' }))
    expect(screen.getByText('0 / 10 slots unlocked')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Unlock slot' }))
    fireEvent.click(screen.getByRole('button', { name: 'Filigree slot 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Select Filigree A' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close filigree selector' }))
    fireEvent.click(screen.getByRole('button', { name: 'Enchantments' }))
    expect(await screen.findByText(/Filigree A on Sentient Dagger · Main Hand \/ Filigree slot 1/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Close workspace tool' }))
    fireEvent.click(screen.getByRole('button', { name: 'Set Bonuses' }))
    expect(await screen.findByText('Test Filigree Set')).toBeTruthy()
    expect(screen.getByText('Filigree Set')).toBeTruthy()
    expect(screen.getByText('Main Hand: Filigree A on Sentient Dagger / Filigree slot 1')).toBeTruthy()
  })

  it('rejects a second minor artifact in the browser and keeps the original equipped', async () => {
    const first = {
      ...item('artifact-a', gearPlannerSlots.firstFinger, 'First Artifact', 30),
      source: {
        ...item('artifact-a', gearPlannerSlots.firstFinger, 'First Artifact', 30).source,
        artifactType: 'Minor'
      }
    }
    const second = {
      ...item('artifact-b', gearPlannerSlots.secondFinger, 'Second Artifact', 30),
      source: {
        ...item('artifact-b', gearPlannerSlots.secondFinger, 'Second Artifact', 30).source,
        artifactType: 'Minor'
      }
    }
    await renderReadyPage(dataWithItems([first, second]))

    fireEvent.click(screen.getByRole('button', { name: 'Select First Finger' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip First Artifact' }))
    fireEvent.click(screen.getByRole('button', { name: 'Select Second Finger' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Second Artifact' }))
    expect(await screen.findByText('Only one minor artifact can be equipped at a time.')).toBeTruthy()
    expect(screen.getByTestId('gear-slot-First Finger').textContent).toContain('First Artifact')
    expect(screen.getByTestId('gear-slot-Second Finger').textContent).toContain('Select an item')
  })

  it('adds, switches, renames, clears, and safely deletes compact setup tabs', async () => {
    await renderReadyPage(
      dataWithItems([
        item('head-one', gearPlannerSlots.head, 'First Setup Helm'),
        item('head-two', gearPlannerSlots.head, 'Second Setup Helm')
      ])
    )

    expect(screen.getByRole('tab', { name: 'Default Setup' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip First Setup Helm' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add setup' }))

    expect(screen.getByRole('tab', { name: 'New Setup 2' })).toBeTruthy()
    expect(screen.getByTestId('gear-slot-Head').textContent).toContain('Select an item')
    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Second Setup Helm' }))
    fireEvent.click(screen.getByRole('tab', { name: 'Default Setup' }))
    expect(screen.getByTestId('gear-slot-Head').textContent).toContain('First Setup Helm')

    fireEvent.click(screen.getByRole('button', { name: 'Rename active setup' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Setup name' }), { target: { value: '  Raid plan  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save name' }))
    expect(screen.getByRole('tab', { name: 'Raid plan' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Clear active setup' }))
    expect(screen.getByTestId('gear-slot-Head').textContent).toContain('Select an item')
    fireEvent.click(screen.getByRole('button', { name: 'Delete active setup' }))
    expect(await screen.findByText('Delete setup?')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Delete setup' }))
    expect(screen.queryByRole('tab', { name: 'Raid plan' })).toBeNull()
    expect(screen.getByRole('tab', { name: 'New Setup 2' })).toBeTruthy()
  })

  it('exposes JSON actions and replaces setups only after a valid import resolves', async () => {
    await renderReadyPage(dataWithItems([item('imported-head', gearPlannerSlots.head, 'Imported Helm')]))
    expect(screen.getByRole('button', { name: 'Export JSON' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Import JSON' })).toBeTruthy()

    const equipment = Object.fromEntries(gearPlannerCharacterSlots.map((slot) => [slot, null])) as Record<
      (typeof gearPlannerCharacterSlots)[number],
      string | null
    >
    equipment.Head = 'imported-head'
    const file = new File(
      [
        JSON.stringify({
          version: 1,
          activeSetupId: 'imported',
          setups: [
            {
              id: 'imported',
              name: 'Imported setup',
              minimumLevel: 1,
              maximumLevel: 36,
              equipment,
              selectedAugments: []
            }
          ]
        })
      ],
      'gear-planner.json',
      { type: 'application/json' }
    )
    const input = document.querySelector('input[type="file"]')
    expect(input).toBeTruthy()
    fireEvent.change(input as HTMLInputElement, { target: { files: [file] } })

    expect(await screen.findByRole('tab', { name: 'Imported setup' })).toBeTruthy()
    expect(screen.getByTestId('gear-slot-Head').textContent).toContain('Imported Helm')
    expect(screen.queryByRole('tab', { name: 'Default Setup' })).toBeNull()
  })

  it('recalculates set tools from the newly active setup', async () => {
    await renderReadyPage(
      dataWithItems([
        item(
          'set-head',
          gearPlannerSlots.head,
          'Set Helm',
          30,
          [{ name: 'Strength', modifier: 2 }],
          ['Arcane Barrier']
        ),
        item('plain-head', gearPlannerSlots.head, 'Plain Helm', 30, [{ name: 'Dexterity', modifier: 2 }])
      ])
    )

    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Set Helm' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add setup' }))
    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Plain Helm' }))
    fireEvent.click(screen.getByRole('tab', { name: 'Default Setup' }))
    fireEvent.click(screen.getByRole('button', { name: 'Set Bonuses' }))
    expect(await screen.findByText('1 contribution')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Close workspace tool' }))
    fireEvent.click(screen.getByRole('tab', { name: 'New Setup 2' }))
    fireEvent.click(screen.getByRole('button', { name: 'Set Bonuses' }))
    expect(await screen.findByText('No set memberships yet')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Close workspace tool' }))
    fireEvent.click(screen.getByRole('button', { name: 'Enchantments' }))
    expect(await screen.findByText('Dexterity')).toBeTruthy()
  })
})
