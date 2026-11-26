// @vitest-environment jsdom

import { TroveProvider } from './components/TroveInventory'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { validateEssenceCraftingDataset } from '../essenceCrafting/data.ts'
import { createEssenceCraftingTestPayload } from '../essenceCrafting/test-fixture.ts'
import { emptyGearCraftingData } from './crafting.ts'
import publishedSets from './fixtures/publishedSets.json'
import { standardGearPlannerSetDefinitionByName } from './standardSetDefinitions'
import { parseGearPlannerFiligreeSetDataset, loadGearPlannerData } from './data.ts'
import {
  allGearPlannerSlots,
  gearPlannerCharacterSlots,
  type GearPlannerCurse,
  type GearPlannerData,
  type GearPlannerFiligree,
  type GearPlannerFiligreeSetDefinition,
  type GearPlannerItem,
  gearPlannerSlots
} from './gearPlanner.types.ts'
import { findSlotReplacements, shortlistReplacements } from './slotUpgrades'
import { searchUpgradePaths, type PathRequest } from './upgradePaths'
import { loadoutSnapshot } from './loadoutComparison'
import { gearPlannerPermalink } from './sharing'
import { createGearPlannerSetup } from './setups'
import GearPlannerPage from './GearPlannerPage.tsx'
import { readTroveInventory, troveStorageKey, TroveSnapshot } from './trove'
import { createGearPlannerExport, GEAR_PLANNER_STORAGE_KEY, parsePersistedGearPlannerState } from './plannerStorage.ts'
import { createGearPlannerReforgingData, emptyGearPlannerReforgingData } from './reforging.ts'
import type { ReforgingEntry } from '../nearlyFinished/nearlyFinished.types.ts'

const essenceData = validateEssenceCraftingDataset(createEssenceCraftingTestPayload())

vi.mock(import('./data.ts'), async (original) => ({
  ...(await original()),
  loadGearPlannerData: vi.fn()
}))

vi.mock(import('../essenceCrafting/data.ts'), async (original) => ({
  ...(await original()),
  loadEssenceCraftingData: vi.fn()
}))

const data: GearPlannerData = {
  standardSets: new Map([
    ...standardGearPlannerSetDefinitionByName,
    ...parseGearPlannerFiligreeSetDataset(publishedSets, 'itemSets.enchantments').map((set) => [set.name, set] as const)
  ]),
  sourceDatasets: [],
  items: [],
  itemsBySlot: Object.fromEntries(
    allGearPlannerSlots.map((slot) => [slot, []])
  ) as unknown as GearPlannerData['itemsBySlot'],
  augments: [],
  curses: [],
  filigrees: [],
  filigreeSetDefinitions: [],
  filigreeSetDefinitionByName: new Map(),
  crafting: emptyGearCraftingData,
  reforging: emptyGearPlannerReforgingData,
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
  filigreeSetDefinitions: readonly GearPlannerFiligreeSetDefinition[] = [],
  curses: GearPlannerData['curses'] = []
): GearPlannerData => ({
  ...data,
  items,
  augments,
  curses,
  filigrees,
  filigreeSetDefinitions,
  filigreeSetDefinitionByName: new Map(filigreeSetDefinitions.map((definition) => [definition.name, definition])),
  itemsBySlot: Object.fromEntries(
    allGearPlannerSlots.map((slot) => [slot, items.filter((plannerItem) => plannerItem.slot === slot)])
  ) as unknown as GearPlannerData['itemsBySlot'],
  normalizedItemCount: items.length
})

const renderReadyPage = async (plannerData: GearPlannerData, essence = essenceData) => {
  vi.mocked(loadGearPlannerData).mockResolvedValue(plannerData)
  const { loadEssenceCraftingData } = await import('../essenceCrafting/data.ts')
  vi.mocked(loadEssenceCraftingData).mockResolvedValue(essence)
  render(
    <MantineProvider env='test'>
      <TroveProvider>
        <GearPlannerPage />
      </TroveProvider>
    </MantineProvider>
  )
  await screen.findByRole('region', { name: 'Gear Planner workspace' })
}

beforeEach(() => {
  localStorage.setItem('gearPlannerInfoDismissed', 'true')
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.clearAllMocks()
})

beforeAll(() => {
  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() })
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
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  vi.unstubAllGlobals()
})

describe('GearPlannerPage', () => {
  it('links farming list items with unknown drop locations to their Compendium pages', async () => {
    await renderReadyPage(dataWithItems([item('helm', gearPlannerSlots.head, 'Helm of Fire & Ice')]))
    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Helm of Fire & Ice' }))
    fireEvent.click(screen.getByRole('button', { name: 'Farming list' }))
    const list = within(await screen.findByRole('region', { name: 'To farm' }))
    expect(list.getByRole('heading', { name: 'DDO Compendium Links' })).toBeTruthy()
    expect(list.getByRole('link', { name: 'Helm of Fire & Ice' }).getAttribute('href')).toBe(
      'https://ddocompendium.com/w/Helm%20of%20Fire%20%26%20Ice'
    )
    expect(list.queryByText(/source unlisted/i)).toBeNull()
  })

  it('finds enchantments across slots and equips the result in its own slot', async () => {
    await renderReadyPage(
      dataWithItems([
        item('helm', gearPlannerSlots.head, 'Quiet Helm', 10, [{ name: 'Concentration' }]),
        item('neck', gearPlannerSlots.neck, 'Steady Pendant', 10, [{ name: 'Concentration' }]),
        item('other', gearPlannerSlots.eyes, 'Plain Goggles')
      ])
    )
    fireEvent.click(screen.getByRole('button', { name: 'Find gear' }))
    fireEvent.change(screen.getByLabelText('Search items'), { target: { value: 'concentration' } })
    expect(screen.getByRole('button', { name: 'Equip Quiet Helm in Head' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Equip Plain Goggles in Eyes' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Equip Steady Pendant in Neck' }))
    expect(within(screen.getByTestId('gear-item-editor')).getByText('Steady Pendant')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Neck' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Back to results' }))
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Search items' }).value).toBe('concentration')
    expect(screen.queryByRole('button', { name: 'Equip Plain Goggles in Eyes' })).toBeNull()
  })

  it('previews the level range during a drag and saves once on release', async () => {
    await renderReadyPage(dataWithItems([]))
    fireEvent.click(screen.getByRole('button', { name: 'Character setup' }))
    const range = within(screen.getByRole('group', { name: 'Gear level range' }))
    const minimum = range.getByLabelText<HTMLSelectElement>('Minimum level')
    const thumb = range.getByRole('slider', { name: 'Adjust minimum level' })
    const geometry = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 0, 350, 20))
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    const setupWrites = () => writes.mock.calls.filter(([key]) => key === GEAR_PLANNER_STORAGE_KEY)
    try {
      fireEvent.mouseDown(thumb, { clientX: 50 })
      await waitFor(() => {
        expect(minimum.value).toBe('6')
      })
      fireEvent.mouseMove(document, { clientX: 100 })
      await waitFor(() => {
        expect(minimum.value).toBe('11')
      })
      expect(setupWrites()).toHaveLength(0)
      fireEvent.mouseUp(document)
      await waitFor(() => {
        expect(setupWrites()).toHaveLength(1)
      })
      expect(minimum.value).toBe('11')
    } finally {
      geometry.mockRestore()
      writes.mockRestore()
    }
  })

  it('uses the Character Setup level range in Find Gear', async () => {
    await renderReadyPage(
      dataWithItems([item('head', 'Head', 'Summer Helm', 10), item('neck', 'Neck', 'Spring Pendant', 20)])
    )
    fireEvent.click(screen.getByRole('button', { name: 'Character setup' }))
    const range = within(screen.getByRole('group', { name: 'Gear level range' }))
    fireEvent.change(range.getByLabelText('Minimum level'), { target: { value: '8' } })
    expect(range.getByRole('slider', { name: 'Adjust minimum level' }).getAttribute('aria-valuenow')).toBe('8')
    fireEvent.change(range.getByLabelText('Maximum level'), { target: { value: '15' } })
    fireEvent.click(screen.getByRole('button', { name: 'Find gear' }))
    expect(await screen.findByText('Summer Helm')).toBeTruthy()
    expect(screen.queryByText('Spring Pendant')).toBeNull()
  })

  it('limits equipment and augment set choices to the inclusive level range', async () => {
    const augment = {
      name: 'Winter Crystal',
      augmentType: 'Blue',
      minLevel: 15,
      effectsAdded: [],
      setBonus: [{ name: 'Winter' }],
      source: { name: 'Winter Crystal', augmentType: 'Blue', minLevel: 15, effectsAdded: [] }
    }
    await renderReadyPage(
      dataWithItems(
        [
          item('head', 'Head', 'Summer Helm', 10, [], ['Summer']),
          item('neck', 'Neck', 'Spring Pendant', 20, [], ['Spring'])
        ],
        [augment]
      )
    )
    fireEvent.click(screen.getByRole('button', { name: 'Find gear' }))
    const picker = screen.getByRole<HTMLInputElement>('combobox', { name: 'Item set' })
    fireEvent.click(picker)
    fireEvent.click(screen.getByRole('option', { name: 'Spring' }))
    fireEvent.change(screen.getByLabelText('Maximum level'), { target: { value: '15' } })
    expect(picker.value).toBe('')
    fireEvent.change(screen.getByLabelText('ML'), { target: { value: '10' } })
    fireEvent.click(picker)
    expect(screen.queryByRole('option', { name: 'Spring' })).toBeNull()
    expect(screen.getByRole('option', { name: 'Summer' })).toBeTruthy()
    fireEvent.click(screen.getByRole('option', { name: 'Winter' }))
    fireEvent.change(screen.getByLabelText('Maximum level'), { target: { value: '14' } })
    fireEvent.click(picker)
    expect(screen.queryByRole('option', { name: 'Winter' })).toBeNull()
    fireEvent.click(screen.getByRole('option', { name: 'Summer' }))
    fireEvent.change(screen.getByLabelText('ML'), { target: { value: '11' } })
    expect(picker.value).toBe('')
    fireEvent.click(picker)
    expect(screen.queryByRole('option', { name: 'Summer' })).toBeNull()
  })

  it('opens exact searches from equipped and missing bonuses, and retargets an open finder from a set', async () => {
    const e = (name: string, bonus: string) => ({ name, bonus, modifier: 2 })
    await renderReadyPage(
      dataWithItems([
        item(
          'head',
          'Head',
          'Quiet Helm',
          10,
          [e('Strength', 'Enhancement'), e('Light Spell Power', 'Quality')],
          ['Winter']
        ),
        item('neck', 'Neck', 'Insight Pendant', 10, [e('Strength', 'Insight')], ['Winter']),
        item('cloak', 'Cloak', 'Strength Cloak', 10, [e('Strength Skills', 'Insight'), e('Strength', 'Quality')]),
        item('feet', 'Feet', 'Other Boots', 37, [e('Strength', 'Profane')])
      ])
    )
    const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
    click('Select Head')
    click('Winter')
    expect(screen.getByRole('button', { name: 'Equip Insight Pendant in Neck' })).toBeTruthy()
    click('Equip Quiet Helm in Head')
    click('Winter')
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Item set' }).value).toBe('Winter')
    click('Enchantments')
    expect(screen.queryByRole('button', { name: 'Find Strength with Profane bonus' })).toBeNull()
    click('Find Strength with Insight bonus')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Exact enchantment' }).value).toBe('Strength')
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Enchantment bonus type' }).value).toBe('Insight')
    expect(screen.getByRole('button', { name: 'Equip Insight Pendant in Neck' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Equip Strength Cloak in Cloak' })).toBeNull()
    click('Clear search')
    const search = screen.getByRole<HTMLInputElement>('textbox', { name: 'Search items' })
    expect(search.value).toBe('')
    expect(document.activeElement).toBe(search)
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull()
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Enchantment bonus type' }).value).toBe('Insight')
    expect(screen.getByRole('button', { name: 'Equip Strength Cloak in Cloak' })).toBeTruthy()
    click('Enchantments')
    click('Find Strength with Enhancement bonus')
    expect(screen.getByRole('button', { name: 'Equip Quiet Helm in Head' })).toBeTruthy()
    click('Enchantments')
    click('Find gear with Strength')
    expect(screen.getByRole('button', { name: 'Equip Strength Cloak in Cloak' })).toBeTruthy()
    click('Enchantments')
    click('Find Light Spell Power with Enhancement bonus')
    expect(screen.getAllByText('Craftable prefix · Split Prefix Test').length).toBeGreaterThan(0)
    click('Set Bonuses')
    click('Find members of Winter')
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Item set' }).value).toBe('Winter')
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Search items' }).value).toBe('')
    expect(screen.queryByRole('button', { name: 'Equip Strength Cloak in Cloak' })).toBeNull()
    click('Equip Insight Pendant in Neck')
    expect(within(screen.getByTestId('gear-item-editor')).getByText('Insight Pendant')).toBeTruthy()
  })

  it('previews materials, sockets, crafting provenance and slot-specific equipped status in both browsers', async () => {
    const ring = item(
      'ring-1',
      gearPlannerSlots.firstFinger,
      'Test Ring',
      10,
      [{ name: 'Lost Purpose' }],
      ['Winter'],
      [{ augmentType: 'Blue Slot' }, { augmentType: 'Blue' }, { augmentType: 'Moon' }]
    )
    ring.source = {
      ...ring.source,
      material: 'Silver',
      discrepancyNotes: ['The description lists 15%. The in-game value is 30%.'],
      catalogId: 123,
      dropLocations: [
        { sourceType: 'CraftOnlyItem', isCraftOnly: true },
        { sourceType: 'Crafting', craftingLocation: 'The Twelve' },
        { sourceType: 'Crafting', craftingLocation: 'The Twelve' }
      ]
    }
    await renderReadyPage(
      dataWithItems([
        ring,
        { ...ring, id: 'ring-2', slot: gearPlannerSlots.secondFinger },
        item('alternate', ring.slot, 'Alternate Ring', 10, [], ['Winter', 'Summer'])
      ])
    )
    const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
    const row = (button: string) => {
      const result = screen.getByRole('button', { name: button }).closest('li')
      if (!result) throw new Error('Missing result card for ' + button)
      return within(result)
    }
    click('Select ' + ring.slot)
    const slotResult = row('Equip Test Ring')
    expect(slotResult.getByRole('link', { name: 'DDO Compendium' }).getAttribute('href')).toBe(
      'https://ddocompendium.com/w/Test%20Ring'
    )
    expect(slotResult.getByLabelText('Known in-game discrepancies').textContent).toContain('30%')
    expect(slotResult.getByText('Material · Silver (metal)')).toBeTruthy()
    expect(slotResult.getAllByText('Blue')).toHaveLength(2)
    expect(slotResult.getByText('Moon')).toBeTruthy()
    expect(slotResult.getByText('Crafted at The Twelve')).toBeTruthy()
    expect(slotResult.getByText('Set via Lost Purpose')).toBeTruthy()
    expect(slotResult.queryByText('Equipped')).toBeNull()
    click('Equip Test Ring')
    expect(
      within(screen.getByTestId('gear-item-editor')).getByRole('link', { name: 'DDO Compendium' }).getAttribute('href')
    ).toBe('https://ddocompendium.com/w/Test%20Ring')
    expect(within(screen.getByTestId('gear-item-editor')).getByText('Material · Silver (metal)')).toBeTruthy()
    expect(
      within(screen.getByTestId('gear-item-editor')).getByLabelText('Known in-game discrepancies').textContent
    ).toContain('30%')
    click('Find gear')
    const equipped = () => row('Equip Test Ring in ' + ring.slot)
    expect(equipped().getByText('Equipped')).toBeTruthy()
    expect(equipped().getByText('Material · Silver (metal)')).toBeTruthy()
    expect(row('Equip Test Ring in ' + gearPlannerSlots.secondFinger).queryByText('Equipped')).toBeNull()
    fireEvent.click(screen.getByRole('combobox', { name: 'Item set' }))
    fireEvent.click(screen.getByRole('option', { name: 'Winter' }))
    expect(equipped().queryByText('Set via Lost Purpose')).toBeNull()
    const alternate = () => row('Equip Alternate Ring in ' + ring.slot)
    expect(alternate().getByText('Replaces Test Ring · Member of Winter')).toBeTruthy()
    expect(row('Equip Test Ring in ' + gearPlannerSlots.secondFinger).getByText('Empty slot')).toBeTruthy()
    fireEvent.click(alternate().getByRole('button', { name: 'Winter' }))
    fireEvent.click(screen.getByRole('combobox', { name: 'Item set' }))
    fireEvent.click(screen.getByRole('option', { name: 'Summer' }))
    expect(alternate().getByText('Replaces Test Ring · Outside Summer')).toBeTruthy()
  })

  it('shows all candidate effects inline in both browsers and highlights matching enchantments', async () => {
    const bonus = 'Enhancement'
    await renderReadyPage(
      dataWithItems([
        item('helm', gearPlannerSlots.head, 'Quiet Helm', 10, [
          { name: 'Strength', bonus, modifier: '+4' },
          { name: 'Accuracy', bonus, modifier: '+8%' }
        ]),
        item('neck', gearPlannerSlots.neck, 'Old Pendant', 10, [{ name: 'Wisdom', bonus, modifier: '+8' }]),
        item('other', gearPlannerSlots.neck, 'New Pendant', 10, [
          { name: 'Strength', bonus, modifier: '+6' },
          { name: 'Accuracy', bonus, modifier: '+8%' },
          { name: 'Wisdom', bonus, modifier: '+3' }
        ])
      ])
    )
    const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
    click('Select Head')
    click('Equip Quiet Helm')
    click('Select Neck')
    click('Equip Old Pendant')
    click('Change item')
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show conflicting or lesser items' }))
    const sheet = within(screen.getByRole('group', { name: 'New Pendant enchantments' }))
    expect(sheet.getByText('Enhancement')).toBeTruthy()
    expect(sheet.getByText('Upgrade from +4').parentElement?.textContent).toContain('+6')
    expect(sheet.getByText('Matches equipped +8%')).toBeTruthy()
    expect(sheet.getByText('Wisdom').nextElementSibling?.textContent).toBe('+3')
    expect(screen.getByTestId('gear-slot-Neck').textContent).toContain('Old Pendant')
    expect(screen.getByRole('group', { name: 'Old Pendant enchantments' })).toBeTruthy()
    click('Find gear')
    fireEvent.change(screen.getByLabelText('Search items'), { target: { value: 'stren' } })
    expect(within(screen.getByRole('group', { name: 'New Pendant enchantments' })).getByText('Strength').tagName).toBe(
      'MARK'
    )
    expect(within(screen.getByRole('group', { name: 'New Pendant enchantments' })).getAllByRole('term')).toHaveLength(3)
  })

  it('collapses one candidate independently and remembers it while filtering', async () => {
    await renderReadyPage(
      dataWithItems([
        item('quiet', gearPlannerSlots.head, 'Quiet Helm', 10, [{ name: 'Wisdom' }]),
        item('keen', gearPlannerSlots.head, 'Keen Helm', 10, [{ name: 'Accuracy' }]),
        item('plain', gearPlannerSlots.head, 'Plain Helm')
      ])
    )
    const button = (name: string) => screen.getByRole('button', { name })
    fireEvent.click(button('Select Head'))
    const toggle = button('Collapse enchantments for Quiet Helm in Head')
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(document.getElementById(toggle.getAttribute('aria-controls') ?? '')?.textContent).toContain('Wisdom')
    fireEvent.click(toggle)
    expect(screen.queryByRole('group', { name: 'Quiet Helm enchantments' })).toBeNull()
    expect(screen.getByRole('group', { name: 'Keen Helm enchantments' })).toBeTruthy()
    expect(button('Equip Quiet Helm')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /enchantments for Plain Helm/ })).toBeNull()
    const search = screen.getByLabelText('Search items')
    fireEvent.change(search, { target: { value: 'keen' } })
    fireEvent.change(search, { target: { value: '' } })
    const expand = button('Expand enchantments for Quiet Helm in Head')
    expect(expand.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(expand)
    expect(screen.getByRole('group', { name: 'Quiet Helm enchantments' })).toBeTruthy()
  })

  it('groups equal school bonuses while preserving different values, comparison notes and search matches', async () => {
    const school = (name: string, modifier: string) => ({ name: 'Spell DC: ' + name, modifier, bonus: 'Equipment' })
    await renderReadyPage(
      dataWithItems([
        item('goggles', gearPlannerSlots.eyes, 'Focus Goggles', 10, [school('Illusion', '+2')]),
        item('helm', gearPlannerSlots.head, 'Spell Helm', 10, [
          school('Illusion', '+4'),
          school('Evocation', '+4'),
          school('Abjuration', '+4'),
          school('Conjuration', '+6'),
          { name: 'True Seeing' }
        ])
      ])
    )
    fireEvent.click(screen.getByRole('button', { name: 'Equip Focus Goggles' }))
    fireEvent.click(screen.getByRole('button', { name: 'Find gear' }))
    fireEvent.change(screen.getByLabelText('Search items'), { target: { value: 'abjuration' } })
    const sheet = within(screen.getByRole('group', { name: 'Spell Helm enchantments' }))
    const terms = sheet.getAllByRole('term')
    expect(terms).toHaveLength(4)
    expect(terms[0].textContent).toBe('Spell DC: Illusion')
    expect(terms[0].nextElementSibling?.textContent).toContain('Upgrade from +2')
    expect(terms[1].textContent).toContain('Evocation, Abjuration')
    expect(terms[1].nextElementSibling?.textContent).toBe('+4')
    expect(sheet.getByText('Abjuration').tagName).toBe('MARK')
    expect(sheet.getByText('Spell DC: Conjuration').nextElementSibling?.textContent).toBe('+6')
    expect(sheet.getByText('True Seeing')).toBeTruthy()
  })

  it('shows published drop locations and collapses equipped details individually or across the loadout', async () => {
    const helm = item('helm', gearPlannerSlots.head, 'Quiet Helm')
    const quest = {
      questWildernessChain: 'The Cove (Heroic)',
      titleForLink: 'The Cove',
      difficulty: 'Heroic',
      whichChestPerson: 'End Chest'
    }
    await renderReadyPage(
      dataWithItems([
        {
          ...helm,
          source: {
            ...helm.source,
            dropLocations: [
              quest,
              quest,
              { isCraftOnly: true },
              { sourceType: 'RaidRune' },
              { questWildernessChain: 4 }
            ]
          }
        },
        item('neck', gearPlannerSlots.neck, 'Old Pendant')
      ])
    )
    const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
    click('Select Head')
    click('Equip Quiet Helm')
    const drops = within(screen.getByRole('list', { name: 'Drop locations' }))
    expect(drops.getByRole('link', { name: 'The Cove (Heroic)' }).getAttribute('href')).toBe(
      'https://ddocompendium.com/w/The%20Cove'
    )
    expect(drops.getByText(/Heroic · End Chest/)).toBeTruthy()
    expect(drops.getByRole('link', { name: 'Craft only' }).getAttribute('href')).toBe(
      'https://ddocompendium.com/w/Special:Search?search=Crafting'
    )
    expect(drops.getByRole('link', { name: 'Raid Rune' }).getAttribute('href')).toBe(
      'https://ddocompendium.com/w/Special:Search?search=Raid%20Rune'
    )
    expect(drops.getAllByRole('listitem')).toHaveLength(3)
    click('Select Neck')
    click('Equip Old Pendant')
    click('Collapse all')
    expect(screen.getByTestId('gear-slot-Head').textContent).toContain('Quiet Helm')
    expect(screen.getByRole('button', { name: 'Expand details' }).getAttribute('aria-expanded')).toBe('false')
    click('Select Head')
    expect(screen.queryByRole('list', { name: 'Drop locations' })).toBeNull()
    click('Expand details')
    expect(screen.getByRole('list', { name: 'Drop locations' })).toBeTruthy()
    click('Select Neck')
    expect(screen.getByRole('button', { name: 'Expand details' })).toBeTruthy()
    click('Collapse all')
    click('Expand all')
    expect(screen.getByRole('button', { name: 'Collapse details' })).toBeTruthy()
    expect(screen.queryByRole('list', { name: 'Drop locations' })).toBeNull()
  })

  it('preserves Trove owners in inventory search, the equipped editor, and browser storage', async () => {
    await renderReadyPage(dataWithItems([item('helm', gearPlannerSlots.head, 'Quiet Helm')]))
    fireEvent.click(screen.getByRole('button', { name: 'Import Trove' }))
    const dialog = within(await screen.findByRole('dialog', { name: 'DH Trove Import' }))
    fireEvent.click(dialog.getByLabelText('Legacy CSV'))
    const input = document.querySelector('input[accept=".csv,text/csv"]')
    if (!input) throw new Error('Missing CSV input')
    const csv =
      'Name,Quantity,Character,Location\nQuiet Helm,1,Robin,Bank\nQuiet Helm,2,—,SharedBank\nQuiet Helm,1,Robin,Bank'
    const file = new File([csv], 'Inventory.csv')
    Object.defineProperty(file, 'text', { value: () => Promise.resolve(csv) })
    fireEvent.change(input, { target: { files: [file] } })
    await dialog.findByText(/Inventory updated/)
    fireEvent.click(dialog.getByRole('button', { name: 'Close' }))
    expect(screen.getByRole('button', { name: 'Import Trove' }).getAttribute('aria-description')).toMatch(
      /^1 distinct item loaded · Last imported /
    )
    fireEvent.click(screen.getByRole('button', { name: 'Find gear' }))
    const label = 'Robin (Bank)'
    expect(await screen.findByText(label)).toBeTruthy()
    expect(screen.getByText('Owned').closest('.mantine-Badge-root')).toBeTruthy()
    fireEvent.click(screen.getByText('+1 more'))
    expect(screen.getByText('Shared Bank').closest('details')?.open).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Equip Quiet Helm in Head' }))
    expect(within(screen.getByTestId('gear-item-editor')).getByText(label)).toBeTruthy()
    expect(readTroveInventory().get('quiet helm')).toEqual(['Robin (Bank)', 'Shared Bank'])
  })

  it('restores both legacy owner formats and preserves older v2 name-only imports', () => {
    localStorage.setItem(
      'troveData',
      JSON.stringify({
        Ring: { byCharacter: { Robin: { Inventory: 1, Bank: 0 } } },
        Helm: { byCharacter: [{ character: '-', locations: { SharedBank: 1, SharedCrafting: 2 } }] }
      })
    )
    expect([...readTroveInventory()]).toEqual([
      ['ring', ['Robin (Inventory)']],
      ['helm', ['Shared Bank', 'Shared Crafting Bank']]
    ])
    localStorage.setItem(troveStorageKey, JSON.stringify([' Ring ', 'Unknown']))
    expect([...readTroveInventory()]).toEqual([
      ['ring', ['Robin (Inventory)']],
      ['unknown', []]
    ])
  })

  it('shows the guide on startup, remembers dismissal and can reopen from the masthead', async () => {
    localStorage.removeItem('gearPlannerInfoDismissed')
    await renderReadyPage(data)
    const guide = within(screen.getByRole('dialog', { name: 'About the Gear Planner' }))
    expect(guide.getByText('Download JSON')).toBeTruthy()
    expect(guide.getByText('Review backup')).toBeTruthy()
    fireEvent.click(guide.getByRole('checkbox', { name: /show again on startup/i }))
    fireEvent.click(guide.getByRole('button', { name: 'Got it' }))
    cleanup()
    await renderReadyPage(data)
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'About and backup guide' }))
    expect(screen.getByRole<HTMLInputElement>('checkbox', { name: /show again on startup/i }).checked).toBe(true)
    fireEvent.click(screen.getByRole('checkbox', { name: /show again on startup/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Close planner guide' }))
    cleanup()
    await renderReadyPage(data)
    expect(screen.getByRole('dialog', { name: 'About the Gear Planner' })).toBeTruthy()
  })

  it('opens a shared setup directly and keeps the guide available on demand', async () => {
    localStorage.removeItem('gearPlannerInfoDismissed')
    const previous = window.location.href
    try {
      const link = gearPlannerPermalink(createGearPlannerSetup('link', 'Shared loadout'), previous)
      window.history.replaceState(null, '', link)
      await renderReadyPage(data)
      expect(await screen.findByRole('tab', { name: 'Shared loadout' })).toBeTruthy()
      expect(screen.queryByRole('dialog')).toBeNull()
      fireEvent.click(screen.getByRole('button', { name: 'About and backup guide' }))
      expect(screen.getByRole('dialog', { name: 'About the Gear Planner' })).toBeTruthy()
    } finally {
      window.history.replaceState(null, '', previous)
    }
  })

  it('opens the Trove import guide directly from the planner toolbar', async () => {
    localStorage.setItem(troveStorageKey, JSON.stringify(['ring', 'boots']))
    await renderReadyPage(data)
    const trigger = screen.getByRole('button', { name: 'Import Trove' })
    expect(trigger.getAttribute('aria-description')).toBe('2 distinct items loaded')
    expect(trigger.parentElement).toBe(screen.getByRole('button', { name: 'Find gear' }).parentElement)
    fireEvent.click(trigger)
    const dialog = within(await screen.findByRole('dialog', { name: 'DH Trove Import' }))
    expect(dialog.getByRole('button', { name: 'Choose server folder' })).toBeTruthy()
    expect(dialog.getByRole('button', { name: 'Select JSON files' })).toBeTruthy()
    expect(document.querySelector('input[webkitdirectory]')).toBeTruthy()
    fireEvent.click(dialog.getByLabelText('Legacy CSV'))
    expect(document.querySelector('input[webkitdirectory]')).toBeNull()
    expect(dialog.getByText('TroveExport.Inventory.csv')).toBeTruthy()
    expect(dialog.getAllByRole('button', { name: /^Copy .+ path$/ })).toHaveLength(4)
    expect(dialog.getByRole('button', { name: 'Upload DH Trove CSV' })).toBeTruthy()
  })

  it.each([0, 1, 4, 5, 8])(
    'shows all %i item enchantments in one bulleted list when a slot has effects',
    async (count) => {
      const enchantments = Array.from({ length: count }, (_, index) => ({ name: `Effect ${String(index + 1)}` }))
      await renderReadyPage(
        dataWithItems([item('enchanted-head', gearPlannerSlots.head, 'Enchanted Helm', 10, enchantments)])
      )

      fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
      fireEvent.click(await screen.findByRole('button', { name: 'Equip Enchanted Helm' }))

      const card = screen.getByTestId('gear-item-editor')
      if (count === 0) {
        expect(within(card).queryByRole('list', { name: 'Head enchantments' })).toBeNull()
        return
      }
      const list = within(card).getByRole('list', { name: 'Head enchantments' })
      expect(list.tagName).toBe('UL')
      expect(
        within(list)
          .getAllByRole('listitem')
          .map((entry) => entry.textContent)
      ).toEqual(enchantments.map(({ name }) => name))
      expect(within(card).queryByRole('region', { name: 'Head enchantments' })).toBeNull()
    }
  )

  it('lists all character slots in the equipment navigator', async () => {
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
    expect(screen.getByText('0 / 15 equipped')).toBeTruthy()
  })

  it('renders an all-or-error load state and retries failed data loading', async () => {
    vi.mocked(loadGearPlannerData).mockRejectedValueOnce(new Error('ring.json unavailable')).mockResolvedValueOnce(data)

    render(
      <MantineProvider env='test'>
        <TroveProvider>
          <GearPlannerPage />
        </TroveProvider>
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

  it.each([
    ['Spell Crit Damage', 'Fire', 'Spell Critical Damage: Fire'],
    ['Spell Crit Chance', 'Cold', 'Spell Critical Chance: Cold'],
    ['Spell Power', 'Light', 'Spell Power: Light'],
    ['Spell DCs', 'Illusion', 'Spell DC: Illusion']
  ])('selects an upgrade objective through %s, subtype, and bonus type', async (family, subtype, objective) => {
    const names = [
      'Spell Critical Damage: Fire',
      'Spell Critical Damage: Acid',
      'Cold Spell Critical Chance',
      'Spell Critical Chance: Acid',
      'Light Spell Power',
      'Spell Power: Fire',
      'sonic Spell Power',
      'Spell Power:',
      'Spell DC: Illusion',
      'Spell DC: Evocation'
    ]
    const helm = item(
      'caster',
      'Head',
      'Caster Helm',
      10,
      names.map((name) => ({ name, modifier: 3, bonus: 'Insight' }))
    )
    const alias = item('other', 'Neck', 'Other Helm', 10, [
      { name: 'Spell Power: Light', modifier: 2, bonus: 'Quality' },
      { name: 'Spell Critical Chance: Cold', modifier: 2, bonus: 'Quality' }
    ])
    await renderReadyPage(dataWithItems([helm, alias]))
    const click = async (name: string | RegExp) => fireEvent.click(await screen.findByRole('button', { name }))
    await click('Upgrade paths')
    await click('Choose a stat')
    await click(/^Spellcasting/)
    expect(screen.queryByRole('button', { name: objective })).toBeNull()
    await click(family)
    const dialog = within(screen.getByRole('dialog', { name: family }))
    const otherType = family === 'Spell Power' ? 'Fire' : family === 'Spell DCs' ? 'Evocation' : 'Acid'
    expect(dialog.getByRole('button', { name: otherType })).toBeTruthy()
    if (family === 'Spell Power') {
      expect(dialog.getByRole('button', { name: 'Sonic' })).toBeTruthy()
      expect(dialog.getByRole('button', { name: 'General' })).toBeTruthy()
    }
    await click(subtype)
    if (family === 'Spell Crit Chance' || family === 'Spell Power') {
      expect(screen.getByRole('button', { name: 'Quality' })).toBeTruthy()
    }
    await click('Back to ' + family)
    await click('Back to Spellcasting')
    await click(family)
    await click(subtype)
    await click('Insight')
    expect(await screen.findByRole('button', { name: objective + ' · Insight' })).toBeTruthy()
  })

  it('selects a skill by its short label and finds gear using the catalog effect', async () => {
    await renderReadyPage(
      dataWithItems([
        item('boots', 'Feet', 'Acrobat Boots', 10, [{ name: 'Skill: Balance', bonus: 'Insight', modifier: 3 }])
      ])
    )
    const click = async (name: string | RegExp) => fireEvent.click(await screen.findByRole('button', { name }))
    await click('Upgrade paths')
    await click('Choose a stat')
    await click(/^Skills/)
    await click('Balance')
    await click('Insight')
    expect(screen.getByRole('button', { name: 'Balance · Insight' })).toBeTruthy()
    await click('Find paths')
    expect(await screen.findByRole('button', { name: 'Preview' })).toBeTruthy()
  })

  it('previews a suggested upgrade and saves it separately from its baseline', async () => {
    const helm = item('helpful', 'Head', 'Insight Helm', 10, [{ name: 'Strength +3', modifier: 3, bonus: 'Insight' }])
    await renderReadyPage(dataWithItems([helm]))
    const click = async (name: string) => fireEvent.click(await screen.findByRole('button', { name }))
    await click('Upgrade paths')
    const user = userEvent.setup()
    await click('Choose a stat')
    await user.type(screen.getByRole('textbox', { name: 'Search stats' }), 'Stren')
    expect(screen.queryByRole('button', { name: 'Strength +3' })).toBeNull()
    await click('Strength')
    await click('Insight')
    await click('Find paths')
    await click('Preview')
    const dialog = within(await screen.findByRole('dialog', { name: 'Compare loadouts' }))
    expect(dialog.getByRole('row', { name: /Strength/ }).textContent).toContain('+3')
    fireEvent.keyDown(dialog.getByRole('table'), { key: 'Escape', code: 'Escape' })
    await click('Save as setup')
    expect(await screen.findByText('Upgrade path saved as a new setup.')).toBeTruthy()
    await waitFor(() => {
      const saved = parsePersistedGearPlannerState(JSON.parse(localStorage.getItem(GEAR_PLANNER_STORAGE_KEY) ?? '{}'))
      expect(saved.setups).toHaveLength(2)
      expect(JSON.stringify(saved.setups[0])).not.toContain('helpful')
      expect(JSON.stringify(saved.setups[1])).toContain('helpful')
    })
  })

  it('uses ordered focus stats for slot replacements and paths while preserving explicit objectives', () => {
    const stat = (name: string, modifier: number) => ({ name, modifier, bonus: 'Enhancement' })
    const candidates = [
      item('dc', 'Head', 'DC helm', 10, [stat('Wisdom', 1)]),
      item('hp', 'Head', 'HP helm', 10, [stat('Maximum Hit Points', 20)]),
      item('both', 'Head', 'Both', 10, [stat('Wisdom', 1), stat('Maximum Hit Points', 1)])
    ]
    const catalog = dataWithItems(candidates)
    const setup = createGearPlannerSetup('a', 'Focus')
    setup.character.focusStats = ['Wisdom', 'Maximum Hit Points']
    const slots = () =>
      shortlistReplacements(
        [...findSlotReplacements(setup, 'Head', catalog, essenceData)].filter((row) => row !== undefined),
        null
      ).map((row) => row.item.source.name)
    const paths = (kind: PathRequest['kind']) => {
      const search = searchUpgradePaths(
        setup,
        'Character',
        catalog,
        essenceData,
        { kind, objective: 'Maximum Hit Points', character: '', locked: [], protectedTiers: [] },
        new Map()
      )
      let step = search.next()
      while (!step.done) step = search.next()
      return step.value.map((row) => row.name)
    }
    expect(slots()).toEqual(['Both', 'DC helm', 'HP helm'])
    expect(paths('Focus stats')).toEqual(slots())
    expect(paths('Stat')).toEqual(['HP helm', 'Both'])
    setup.character.focusStats.reverse()
    expect(slots()).toEqual(['Both', 'HP helm', 'DC helm'])
    expect(paths('Focus stats')).toEqual(slots())
  })

  it('keeps qualified published spell power separate when calculating stat objectives', () => {
    const spellPower = 'Spell Power: Universal'
    const inspire = 'Inspire Courage: Spell Power: Universal'
    const helm = item('inspire', 'Head', 'Bardic helm', 10, [
      { name: spellPower, modifier: 3, bonus: 'Enhancement' },
      { name: inspire, modifier: 2, bonus: 'Enhancement' }
    ])
    const catalog = { ...dataWithItems([helm]), enchantmentNames: [spellPower, inspire] }
    const setup = createGearPlannerSetup('bard', 'Bard')
    setup.equipment.Head = helm
    const snapshot = loadoutSnapshot(setup, 'Character', catalog, essenceData, inspire)
    expect(snapshot.Stats.get(inspire)?.amount).toBe(2)
    expect(snapshot.Stats.get(spellPower)?.amount).toBe(3)
    expect(snapshot.objectiveBonuses.get('enhancement')?.amount).toBe(2)
  })

  it('uses exported enchantment labels in Focus Stats and exact equipment search', async () => {
    const dice = 'Eldritch Blast: Dice'
    const pact = 'Eldritch Blast: Pact Dice'
    const catalog = dataWithItems([
      item('dice', 'Head', 'Base Helm', 10, [{ name: dice, modifier: 2 }]),
      item('pact', 'Head', 'Pact Helm', 10, [{ name: pact, modifier: 3 }]),
      item('hidden-name', 'Head', 'Other Helm', 10, [{ name: 'Legacy private label', modifier: 1 }])
    ])
    await renderReadyPage({ ...catalog, enchantmentNames: [dice, pact, 'Skill: Jump'] })
    fireEvent.click(screen.getByRole('button', { name: 'Character setup' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add focus stat' }))
    const stats = screen.getByRole('textbox', { name: 'Search stats' })
    fireEvent.change(stats, { target: { value: 'Legacy' } })
    expect(screen.getByText('No matching stats.')).toBeTruthy()
    fireEvent.change(stats, { target: { value: 'jump' } })
    expect(screen.getByRole('button', { name: 'Skill: Jump' })).toBeTruthy()
    fireEvent.change(stats, { target: { value: 'eldritch' } })
    expect(screen.getByRole('button', { name: dice })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: pact }))
    fireEvent.click(screen.getByRole('button', { name: 'Close workspace tool' }))
    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    const search = screen.getByRole('combobox', { name: 'Search items' })
    fireEvent.focus(search)
    fireEvent.change(search, { target: { value: 'eldritch' } })
    fireEvent.click(await screen.findByRole('option', { name: pact }))
    expect(screen.getByRole('combobox', { name: 'Exact enchantment' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Equip Pact Helm' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Equip Base Helm' })).toBeNull()
  })

  it('selects a setup focus stat and uses it to find upgrade paths', async () => {
    await renderReadyPage(
      dataWithItems([
        item('focushelm', 'Head', 'Focus helm', 10, [{ name: 'Jump', modifier: 2, bonus: 'Enhancement' }])
      ])
    )
    const user = userEvent.setup()
    const click = async (name: string) => {
      await user.click(await screen.findByRole('button', { name }))
    }
    await click('Character setup')
    await click('Add focus stat')
    await user.click(screen.getByRole('button', { name: /^Skills/ }))
    await click('Jump')
    expect(await screen.findByRole('button', { name: 'Remove Skill: Jump' })).toBeTruthy()
    const saved = parsePersistedGearPlannerState(JSON.parse(localStorage.getItem(GEAR_PLANNER_STORAGE_KEY) ?? '{}'))
    expect(saved.setups[0].character?.focusStats).toEqual(['Skill: Jump'])
    await user.click(screen.getAllByRole('button', { name: 'Upgrade paths' })[0])
    await click('Find paths')
    expect(await screen.findByText('Skill: Jump +2')).toBeTruthy()
  })

  it('compares same-slot replacements against overlapping bonuses and preserves unique effect losses', () => {
    const stat = (name: string, modifier: number) => ({ name, modifier, bonus: 'Enhancement' })
    const host = item('gloves', 'Hands', 'Original gloves', 10, [stat('Strength', 12), { name: 'Ghostly' }])
    const belt = item('belt', 'Waist', 'Belt', 10, [stat('Strength', 11)])
    const straight = item('upgrade', 'Hands', 'Upgrade', 10, [stat('Strength', 13), { name: 'Ghostly' }])
    const trade = item('trade', 'Hands', 'Trade', 10, [stat('Dexterity', 8)])
    const baseline = createGearPlannerSetup('a', 'Test')
    const setup = { ...baseline, equipment: { ...baseline.equipment, Hands: host, Waist: belt } }
    const paths = [
      ...findSlotReplacements(setup, 'Hands', dataWithItems([host, belt, straight, trade]), essenceData)
    ].filter((p) => p !== undefined)
    expect(paths).toHaveLength(2)
    expect(paths[0]).toMatchObject({ group: 'Straight upgrade', gains: [{ label: 'Strength', delta: '+1' }] })
    expect(paths[1].group).toBe('Worth a trade-off')
    expect(paths[1].losses.map(({ label, delta }) => [label, delta])).toEqual([
      ['Ghostly', 'Lost'],
      ['Strength', '-1']
    ])
    expect(shortlistReplacements(paths, 'Dexterity').map((p) => p.item.id)).toEqual(['trade'])
    expect(setup.equipment.Hands).toBe(host)
  })

  it('reveals every gain and trade-off from the slot upgrade overflow counts', async () => {
    const effects = (names: string[]) => names.map((name) => ({ name, modifier: 2, bonus: 'Enhancement' }))
    const old = item('old', 'Head', 'Old helm', 10, effects(['Strength', 'Wisdom', 'Dexterity']))
    const next = item('new', 'Head', 'New helm', 10, effects(['Charisma', 'Constitution', 'Intelligence']))
    await renderReadyPage(dataWithItems([old, next]))
    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Old helm' }))
    fireEvent.click(screen.getByRole('button', { name: 'Find upgrades' }))
    const user = userEvent.setup()
    for (const [label, stats] of [
      ['gains', ['Charisma +2', 'Constitution +2', 'Intelligence +2']],
      ['trade-offs', ['Dexterity -2', 'Strength -2', 'Wisdom -2']]
    ] as const) {
      const trigger = await screen.findByRole('button', { name: 'Show all 3 ' + label })
      await user.hover(trigger)
      const popup = await screen.findByRole('tooltip')
      expect(
        within(popup)
          .getAllByRole('listitem')
          .map((entry) => entry.textContent)
      ).toEqual(stats)
      await user.unhover(trigger)
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).toBeNull()
      })
    }
  })
  it('opens slot suggestions, previews a swap, then equips it on request', async () => {
    const helm = (name: string, modifier: number) =>
      item(name, 'Head', name, 10, [{ name: 'Wisdom', modifier, bonus: 'Enhancement' }])
    await renderReadyPage(dataWithItems([helm('Original helm', 5), helm('Better helm', 7)]))
    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Original helm' }))
    fireEvent.click(screen.getByRole('button', { name: 'Find upgrades' }))
    const suggestions = within(await screen.findByRole('dialog', { name: 'Find upgrades · Head' }))
    expect(await suggestions.findByText('Wisdom +2')).toBeTruthy()
    fireEvent.click(suggestions.getByRole('button', { name: 'Compare' }))
    const comparison = within(await screen.findByRole('dialog', { name: 'Compare loadouts' }))
    expect(comparison.getByRole('row', { name: /Wisdom/ }).textContent).toContain('+2')
    fireEvent.keyDown(comparison.getByRole('table'), { key: 'Escape', code: 'Escape' })
    const returned = within(await screen.findByRole('dialog', { name: 'Find upgrades · Head' }))
    expect(screen.getByTestId('gear-slot-Head').textContent).toContain('Original helm')
    fireEvent.click(returned.getByRole('button', { name: 'Equip' }))
    expect(screen.getByTestId('gear-slot-Head').textContent).toContain('Better helm')
  })

  it('ranks a stat against equipped bonuses and shows only effective improvements of the selected type', () => {
    const ranked = (id: string, slot: GearPlannerItem['slot'], rank: number, bonus: string) =>
      item(id, slot, id, 10, [{ name: 'Aim +' + String(rank), modifier: rank, bonus }])
    const current = ranked('Old', 'Head', 4, 'Enhancement')
    const baseline = createGearPlannerSetup('a', 'A')
    const setup = { ...baseline, equipment: { ...baseline.equipment, Head: current } }
    const catalog = dataWithItems([
      current,
      ranked('Higher', 'Head', 10, 'Enhancement'),
      ranked('Equal', 'Eyes', 4, 'Enhancement'),
      ranked('Lower', 'Eyes', 2, 'Enhancement'),
      ranked('Insightful', 'Eyes', 2, 'Insight')
    ])
    const run = (bonusType?: string) => {
      const iterator = searchUpgradePaths(
        setup,
        'Character',
        catalog,
        essenceData,
        { kind: 'Stat', objective: 'Aim', bonusType, locked: [], protectedTiers: [], character: '' },
        new Map()
      )
      let step = iterator.next()
      while (!step.done) step = iterator.next()
      return step.value
    }
    expect(run('enhancement')).toMatchObject([
      { name: 'Higher', delta: '+6', totals: '4 → 10', bonusChanges: ['Enhancement 4 → 10'] }
    ])
    expect(run('insight')).toMatchObject([{ name: 'Insightful', delta: '+2', totals: '4 → 6' }])
    expect(run().map((p) => p.name)).toEqual(['Higher', 'Insightful'])
  })

  it('respects indirect slot locks, protected set tiers and host limits for augment paths', () => {
    const strength = (modifier: number) => ({ name: 'Strength', modifier, bonus: 'Enhancement' })
    const baseline = createGearPlannerSetup('a', 'A')
    const shield = item('shield', 'Off Hand', 'Shield', 10, [], ['Test set'])
    const helm = item('helm', 'Head', 'Helm', 10, [strength(2)], [], [{ augmentType: 'Blue' }])
    const setup = { ...baseline, equipment: { ...baseline.equipment, 'Off Hand': shield, Head: helm } }
    const blade = { ...item('sword', 'Main Hand', 'Greatsword', 10, [strength(5)]), sourceFile: 'greatSword.json' }
    const augment = {
      name: 'Sapphire',
      augmentType: 'Blue',
      minLevel: 10,
      effectsAdded: [strength(4)],
      setBonus: [{ name: 'Test set' }],
      source: {}
    }
    const catalog = {
      ...dataWithItems(
        [blade, helm, shield],
        [
          augment,
          { ...augment, minLevel: 11, name: 'Too high' },
          { ...augment, augmentType: 'Red', name: 'Wrong color' }
        ]
      ),
      standardSets: new Map([
        [
          'Test set',
          {
            name: 'Test set',
            thresholds: [
              { threshold: 1, effects: [] },
              { threshold: 2, effects: [] }
            ]
          }
        ]
      ])
    }
    const base: PathRequest = { kind: 'Stat', objective: 'Strength', protectedTiers: [], locked: [], character: '' }
    const inventory = new TroveSnapshot()
    inventory.record('Greatsword', 'Alt (Backpack)', 'Alt', 1, 'BtC')
    inventory.record('Sapphire', 'Shared Bank', '', 1, 'BtA')
    const run = (request: PathRequest) => {
      const search = searchUpgradePaths(setup, 'Character', catalog, essenceData, request, inventory)
      let step = search.next()
      while (!step.done) step = search.next()
      return step.value
    }
    expect(run(base).map((p) => [p.name, p.delta])).toEqual([
      ['Greatsword', '+3'],
      ['Sapphire', '+2']
    ])
    expect(run({ ...base, locked: ['Off Hand'] }).map((p) => p.name)).toEqual(['Sapphire'])
    expect(run({ ...base, protectedTiers: ['Test set · 1-piece'] }).map((p) => p.name)).toEqual(['Sapphire'])
    expect(run({ ...base, locked: ['Off Hand', 'Head'] })).toEqual([])
    expect(run({ ...base, kind: 'Set tier', objective: 'Test set · 2-piece' }).map((p) => p.name)).toEqual(['Sapphire'])
    const [bound, bank] = run({ ...base, character: 'Main' })
    expect(bound.availability).toBe('Farm')
    expect(bound.losses).toContain('Unequips Shield')
    expect(bound.location).toContain('Character-bound')
    expect(bank).toMatchObject({ availability: 'Collect', location: 'Shared Bank' })
  })

  it('duplicates a setup, compares a gear change, and reverses the delta when the baseline changes', async () => {
    const helm = item('helm', 'Head', 'Comparison Helm', 10, [
      { name: 'Doublestrike', modifier: '+8%', bonus: 'Enhancement' },
      { name: 'Deathblock' }
    ])
    await renderReadyPage(dataWithItems([helm]))
    const click = async (name: string) => fireEvent.click(await screen.findByRole('button', { name }))
    await click('Compare')
    await click('Duplicate setup')
    await click('Select Head')
    await click('Equip Comparison Helm')
    await click('Compare')
    const dialog = within(await screen.findByRole('dialog', { name: 'Compare loadouts' }))
    expect(dialog.getByRole('row', { name: /Doublestrike/ }).textContent).toContain('+8%')
    expect(dialog.getByRole('row', { name: /Deathblock/ }).textContent).toContain('Gained')
    const select = dialog.getByLabelText<HTMLSelectElement>('Compare to')
    fireEvent.change(dialog.getByLabelText('Baseline'), { target: { value: select.value } })
    expect(dialog.getByRole('row', { name: /Doublestrike/ }).textContent).toContain('-8%')
    fireEvent.click(dialog.getByText('Gear (1)'))
    expect(dialog.getByRole('row', { name: /Comparison Helm/ }).textContent).toContain('Lost')
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
      fireEvent.click(screen.getByRole('button', { name: 'Back to equipment' }))
    }
  })

  it('shows a Wizard the catalog weapon types and grants Club without offering Scepter', async () => {
    const club = item('club', 'Main Hand', 'Crystalline Scepter')
    club.source.type = 'Club'
    const mace = item('mace', 'Main Hand', 'Scepter of Healing')
    mace.source.type = 'Heavy Mace'
    await renderReadyPage(dataWithItems([club, mace]))
    fireEvent.click(screen.getByRole('button', { name: 'Character setup' }))
    fireEvent.click(screen.getByRole('combobox', { name: 'Character classes' }))
    fireEvent.click(await screen.findByRole('option', { name: 'Wizard' }))
    fireEvent.click(screen.getByRole('button', { name: /One-handed weapons/ }))
    expect((await screen.findByRole<HTMLInputElement>('checkbox', { name: 'Club' })).checked).toBe(true)
    expect(screen.getByRole<HTMLInputElement>('checkbox', { name: 'Heavy Mace' }).checked).toBe(false)
    expect(screen.queryByRole('checkbox', { name: 'Scepter' })).toBeNull()
  })

  it.each(['replace', 'clear'])(
    'keeps an unavailable saved filter empty until the player chooses to %s it',
    async (action) => {
      const setup = createGearPlannerSetup('saved', 'Saved build')
      setup.character.weapons = ['Scepter']
      localStorage.setItem(
        GEAR_PLANNER_STORAGE_KEY,
        JSON.stringify(createGearPlannerExport({ setups: [setup], activeSetupId: setup.id }))
      )
      const club = item('scepter', 'Main Hand', 'Crystalline Scepter')
      club.source.type = 'Club'
      const mace = item('mace', 'Main Hand', 'Scepter of Healing')
      mace.source.type = 'Heavy Mace'
      await renderReadyPage(dataWithItems([club, mace]))
      fireEvent.click(screen.getByRole('button', { name: 'Select Main Hand' }))
      expect(await screen.findByText(/Saved weapon filter unavailable: Scepter/)).toBeTruthy()
      expect(screen.queryByRole('button', { name: /^Equip / })).toBeNull()
      fireEvent.click(screen.getByRole('button', { name: 'Character setup' }))
      if (action === 'clear') {
        fireEvent.click(screen.getByRole('button', { name: 'Clear weapon filter' }))
      } else {
        fireEvent.click(screen.getByRole('button', { name: /One-handed weapons/ }))
        fireEvent.click(await screen.findByRole('checkbox', { name: 'Club' }))
      }
      expect(await screen.findByRole('button', { name: 'Equip Crystalline Scepter' })).toBeTruthy()
      expect(Boolean(screen.queryByRole('button', { name: 'Equip Scepter of Healing' }))).toBe(action === 'clear')
      expect(screen.queryByText(/Saved weapon filter unavailable/)).toBeNull()
    }
  )

  it('keeps equipped Essence armor and updates its oath warning and material choices with character settings', async () => {
    await renderReadyPage(dataWithItems([]))
    fireEvent.click(screen.getByRole('button', { name: 'Select Armor' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Essence Crafted Armor' }))
    const material = screen.getByRole('combobox', { name: 'Material' })
    fireEvent.click(material)
    fireEvent.click(await screen.findByRole('option', { name: 'Byeshk' }))
    fireEvent.click(screen.getByRole('button', { name: 'Character setup' }))
    fireEvent.click(screen.getByRole('combobox', { name: 'Character classes' }))
    fireEvent.click(await screen.findByRole('option', { name: 'Druid' }))
    const armor = screen.getByTestId('gear-slot-Armor')
    expect(armor.textContent).toContain('Essence Crafted Armor')
    expect(armor.textContent).toContain('Violates Druidic Oath')
    fireEvent.click(material)
    expect((await screen.findByRole('option', { name: 'Byeshk' })).getAttribute('aria-disabled')).toBe('true')
    expect(screen.getByRole('option', { name: 'Wood' }).getAttribute('aria-disabled')).not.toBe('true')
    fireEvent.click(screen.getByRole('checkbox', { name: 'Allow metal armor and shields' }))
    expect(armor.textContent).not.toContain('Violates Druidic Oath')
    expect((material as HTMLInputElement).value).toBe('Byeshk')
  })

  it('equips and configures a synthetic Essence Crafted item with current v2 effect data', async () => {
    await renderReadyPage(dataWithItems([]))

    fireEvent.click(screen.getByRole('button', { name: 'Select Main Hand' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Essence Crafted Weapon (Melee)' }))
    expect(screen.getByTestId('gear-slot-Main Hand').textContent).toContain('Essence Crafted Weapon (Melee)')
    expect(screen.getByRole('combobox', { name: 'Essence ML' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Material' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Prefix' })).toBeTruthy()

    fireEvent.click(screen.getByRole('combobox', { name: 'Prefix' }))
    fireEvent.click(await screen.findByRole('option', { name: /Split Prefix Test/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Enchantments' }))
    expect(await screen.findAllByText(/Essence Crafting · prefix: Split Prefix Test/)).toHaveLength(2)
  })

  it('applies and clears a Reaper Forge upgrade on the equipped card', async () => {
    await renderReadyPage(dataWithItems([item('eyes', gearPlannerSlots.eyes, 'Test Goggles')]))
    fireEvent.click(screen.getByRole('button', { name: 'Select Eyes' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Test Goggles' }))
    const card = within(screen.getByTestId('gear-item-editor'))
    fireEvent.click(card.getByText('Item upgrades'))
    const selector = card.getByRole('combobox', { name: 'Reaper Forge' })
    fireEvent.click(selector)
    fireEvent.click(await screen.findByRole('option', { name: 'Reaper Goggles Enchantment' }))
    expect(card.getByText('Attack Rolls 1 (Reaper)')).toBeTruthy()
    fireEvent.click(card.getByRole('button', { name: 'Clear Reaper Forge' }))
    expect(card.queryByText('Attack Rolls 1 (Reaper)')).toBeNull()
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
    fireEvent.click(screen.getByRole('button', { name: 'Change item' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Second Helm' }))
    expect(screen.getByTestId('gear-slot-Head').textContent).toContain('Second Helm')

    fireEvent.click(screen.getByRole('button', { name: 'Select First Finger' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Independent Ring' }))
    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Clear Head from equipment' }))

    expect(screen.getByTestId('gear-slot-Head').textContent).toContain('Empty')
    expect(screen.getByTestId('gear-slot-First Finger').textContent).toContain('Independent Ring')
  })

  it('updates effective reforging effects, Enchantments provenance, and augment controls in place', async () => {
    const baseSource = {
      name: 'Reforged Trinket',
      pageTitle: 'Reforged Trinket',
      minLevel: 10,
      enchantments: [{ name: 'Strength', modifier: '+4', bonus: 'Enhancement' }]
    }
    const upgradedSource = {
      name: 'Reforged Trinket',
      pageTitle: 'Reforged Trinket (Nearly Finished Upgraded)',
      minLevel: 10,
      enchantments: [{ name: 'Strength', modifier: '+6', bonus: 'Enhancement' }],
      augments: [{ augmentType: 'Blue', name: 'Reforged blue slot' }]
    }
    const sourceDatasets = [{ fileName: 'trinket.json', records: [baseSource, upgradedSource] }]
    const recipes: ReforgingEntry[] = [
      {
        item: 'Reforged Trinket',
        stage: 'Nearly Finished',
        cost: [{ name: 'Thread of Fate', quantity: 1 }],
        effectsAdded: []
      }
    ]
    const reforging = createGearPlannerReforgingData(recipes, sourceDatasets)
    const reforgedItem: GearPlannerItem = {
      id: 'reforged-trinket',
      slot: gearPlannerSlots.trinket,
      sourceFile: 'trinket.json',
      minimumLevel: 10,
      source: baseSource
    }
    await renderReadyPage({ ...dataWithItems([reforgedItem]), sourceDatasets, reforging })

    fireEvent.click(screen.getByRole('button', { name: 'Select Trinket' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Reforged Trinket' }))
    expect(screen.queryByTestId('augment-slot-reforged-trinket-0')).toBeNull()

    fireEvent.click(screen.getByLabelText('Nearly Finished applied'))
    expect(
      screen.getByTestId('equipped-effect-reforged-trinket:reforging-tier:nearly-finished:0').textContent
    ).toContain('+6')
    expect(screen.getByTestId('augment-slot-reforged-trinket-0')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Enchantments' }))
    expect(await screen.findAllByText(/Reforging · Nearly Finished tier on Trinket: Reforged Trinket/)).toHaveLength(1)
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
    expect(await screen.findAllByRole('button', { name: /Equip Result/ })).toHaveLength(49)
    fireEvent.click(screen.getByRole('button', { name: 'Show 2 more' }))
    expect(await screen.findAllByRole('button', { name: /Equip Result/ })).toHaveLength(51)
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
    fireEvent.click(await screen.findByRole('button', { name: /Set Augment: Arcane Barrier/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Set Bonuses' }))
    expect(await screen.findByText('1 contribution')).toBeTruthy()
    expect(screen.getByText('Head: Set Augment: Arcane Barrier on Socketed Helm')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Find members of Arcane Barrier' }))
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Item set' }).value).toBe('Arcane Barrier')
    expect(screen.getByText('Set Augment: Arcane Barrier · Colorless · ML 1')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(screen.getByRole('button', { name: 'Clear augment' }))
    fireEvent.click(screen.getByRole('button', { name: 'Set Bonuses' }))
    expect(await screen.findByText('No set memberships yet')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Close workspace tool' }))
    fireEvent.click(screen.getByRole('combobox', { name: 'Colorless socket' }))
    fireEvent.click(await screen.findByRole('button', { name: /Set Augment: Arcane Barrier/ }))
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

    const summary = within(await screen.findByRole('dialog'))
    expect(summary.getByText('Unknown Set')).toBeTruthy()
    expect(summary.getByText('Arcane Barrier')).toBeTruthy()
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

    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    expect(screen.getByTestId('equipped-effect-head:equipped-item:0').getAttribute('data-conflict-state')).toBe(
      'lesser'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Select First Finger' }))
    expect(screen.getByText('Overrides Head')).toBeTruthy()
    expect(screen.getByTestId('equipped-effect-ring:equipped-item:0').getAttribute('data-conflict-state')).toBe(
      'effective'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(screen.getByRole('button', { name: 'Enchantments' }))
    expect(await screen.findByText('Strength')).toBeTruthy()
    expect(screen.getAllByText('+12')).toHaveLength(2)
    const enchantments = within(screen.getByRole('dialog'))
    expect(enchantments.getByText('Doublestrike')).toBeTruthy()
    expect(enchantments.getAllByText('+14%')).toHaveLength(2)
    expect(enchantments.getAllByText(/^[+]?2\[W\]$/)).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: 'Close workspace tool' }))
    fireEvent.click(screen.getByRole('button', { name: 'Select First Finger' }))
    fireEvent.click(screen.getByRole('button', { name: 'Clear First Finger from equipment' }))
    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    expect(screen.getByTestId('equipped-effect-head:equipped-item:0').getAttribute('data-conflict-state')).toBe('none')

    fireEvent.click(screen.getByRole('button', { name: 'Select Second Finger' }))
    expect(screen.queryByRole('button', { name: 'Equip Tie Ring' })).toBeNull()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show conflicting or lesser items' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Tie Ring' }))
    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    expect(screen.getByTestId('equipped-effect-head:equipped-item:0').getAttribute('data-conflict-state')).toBe(
      'effective'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Select Second Finger' }))
    expect(screen.getByTestId('equipped-effect-second-ring:equipped-item:0').getAttribute('data-conflict-state')).toBe(
      'effective'
    )
  })

  it('previews each augment against the remaining loadout before replacing a socket', async () => {
    const effect = (name: string, modifier: number, bonus = 'Enhancement') => ({ name, bonus, modifier })
    const head = item(
      'head',
      'Head',
      'Socketed Helm',
      10,
      [],
      [],
      [
        { augmentType: 'Red', name: 'Left socket' },
        { augmentType: 'Red', name: 'Right socket' }
      ]
    )
    const necklace = item('neck', 'Neck', 'Stat Necklace', 10, [
      effect('Strength', 5),
      effect('Wisdom', 5),
      effect('Accuracy', 5),
      effect('Power', 5, 'Mythic')
    ])
    const gem = (name: string, effectsAdded: GearPlannerData['augments'][number]['effectsAdded']) => ({
      name,
      augmentType: 'Red',
      minLevel: 1,
      effectsAdded,
      source: { name }
    })
    const mixed = gem('Mixed Ruby', [effect('Strength', 6), effect('Wisdom', 5), effect('Accuracy', 4)])
    const strong = gem('Strong Ruby', [effect('Strength', 10)])
    const separate = gem('Independent Ruby', [effect('Strength', 1, 'Insight'), effect('Power', 2, 'Mythic')])
    await renderReadyPage(dataWithItems([head, necklace], [mixed, strong, separate]))
    const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
    click('Select Neck')
    click('Equip Stat Necklace')
    click('Select Head')
    click('Equip Socketed Helm')
    const socket = (name: string) => screen.getByRole<HTMLInputElement>('combobox', { name })
    const option = (name: RegExp) => within(screen.getByRole('button', { name }))
    fireEvent.click(socket('Left socket'))
    fireEvent.click(screen.getByRole('button', { name: /Mixed Ruby/ }))
    const selected = within(screen.getByTestId('augment-slot-head-0'))
    const enchantments = within(screen.getByRole('list', { name: 'Head enchantments' }))
    expect(enchantments.getAllByRole('listitem')).toHaveLength(3)
    expect(enchantments.getByText('Strength 6 (Enhancement)')).toBeTruthy()
    expect(selected.getByText('Overrides Neck')).toBeTruthy()
    expect(selected.getByText('Redundant (Neck)')).toBeTruthy()
    expect(selected.getByText('Overridden by Neck')).toBeTruthy()
    click('Clear augment')
    fireEvent.click(socket('Left socket'))
    fireEvent.click(screen.getByRole('button', { name: /Strong Ruby/ }))
    fireEvent.click(socket('Right socket'))
    expect(option(/Mixed Ruby/).queryByText('Upgrade')).toBeNull()
    expect(option(/Mixed Ruby/).getByText(/Strength 6 .*equipped 10/)).toBeTruthy()
    expect(option(/Independent Ruby/).queryByText(/Upgrade|Overpowered|Redundant/)).toBeNull()
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }))
    fireEvent.click(socket('Left socket'))
    fireEvent.change(screen.getByRole('textbox', { name: 'Search augments' }), { target: { value: 'Mixed Ruby' } })
    const preview = option(/Mixed Ruby/)
    expect(preview.getByText('Upgrade').closest('[title]')?.textContent).toContain(
      'Strength 6 (Enhancement) · equipped 5'
    )
    expect(preview.getByText('Redundant').closest('[title]')?.textContent).toContain(
      'Wisdom 5 (Enhancement) · equipped 5'
    )
    expect(preview.getByText('Overpowered').closest('[title]')?.textContent).toContain(
      'Accuracy 4 (Enhancement) · equipped 5'
    )
    expect(within(screen.getByTestId('augment-slot-head-0')).getAllByText('Strong Ruby').length).toBeGreaterThan(0)
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }))
    expect(socket('Right socket').textContent).toBe('Select augment')
  })

  it('shows scoped effect headings and descriptions in the picker and selected slot', async () => {
    const stat = { name: 'Eldritch Blast: Pact Dice', modifier: '+1', bonus: 'Enhancement' }
    const ruby = {
      name: 'Pact Ruby',
      augmentType: 'Red',
      minLevel: 1,
      source: {},
      effectsAdded: [stat],
      presentation: [{ name: 'Pact Magic', rows: [stat] }],
      searchLabels: [stat.name]
    }
    const empty = {
      ...ruby,
      name: 'Seasonal Ruby',
      effectsAdded: [],
      presentation: [],
      fallbackDescription: 'A gift of winter.',
      searchLabels: []
    }
    const helm = item('head', 'Head', 'Socketed Helm', 10, [], [], [{ augmentType: 'Red', name: 'Ruby socket' }])
    await renderReadyPage({ ...dataWithItems([helm], [ruby, empty]), augmentEnchantmentNames: [stat.name] })
    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(screen.getByRole('button', { name: 'Equip Socketed Helm' }))
    fireEvent.click(screen.getByRole('combobox', { name: 'Ruby socket' }))
    const option = within(screen.getByRole('button', { name: /Pact Ruby/ }))
    expect(option.getByText('Pact Magic')).toBeTruthy()
    expect(option.getByText(/Eldritch Blast: Pact Dice/)).toBeTruthy()
    expect(screen.getByText('A gift of winter.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Pact Ruby/ }))
    const slot = within(screen.getByTestId('augment-slot-head-0'))
    expect(slot.getByText('Pact Magic')).toBeTruthy()
    expect(slot.getByText(/Eldritch Blast: Pact Dice/)).toBeTruthy()
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
    expect(await screen.findByRole('button', { name: /Ruby of Strength/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Diamond of Strength/ })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Sapphire of Strength/ })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Ruby of Strength/ }))
    expect(await screen.findAllByText('Ruby of Strength')).toHaveLength(1)
    const stat = 'Strength +8 (Enhancement)'
    expect(within(screen.getByTestId('augment-slot-head-0')).getByText(stat)).toBeTruthy()
    expect(within(screen.getByRole('list', { name: 'Head enchantments' })).getByText(stat)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Enchantments' }))
    expect(await screen.findByText('Ruby of Strength slotted in Socketed Helm · Head / Ruby socket')).toBeTruthy()
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
    fireEvent.click(screen.getByRole('button', { name: 'Find members of Test Filigree Set' }))
    expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Filigree set' }).value).toBe('Test Filigree Set')
    expect(screen.getByText('1 matching filigree')).toBeTruthy()
  })

  it('finds filigrees by effect across hosts and opens the chosen socket on a collapsed item', async () => {
    const blade = item('blade', 'Main Hand', 'Test Blade', 30)
    blade.source.type = 'Dagger'
    const ring = item('ring', 'First Finger', 'Test Ring', 30)
    ring.source.artifactType = 'Minor Artifact'
    const filigree = (id: string, effect: string): GearPlannerFiligree => ({
      id,
      name: id,
      minimumLevel: 1,
      grouping: 'Test Set',
      source: { name: id, enchantments: [{ name: effect, modifier: 2 }] }
    })
    const shard = filigree('Amber Shard', 'Healing Amplification')
    const rare = filigree('Amber Shard (Rare)', 'Healing Amplification')
    await renderReadyPage(dataWithItems([blade, ring], [], [shard, rare, filigree('Other Shard', 'Dodge')]))
    const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
    for (const [host, index] of [
      [blade, 1],
      [ring, 2]
    ] as const) {
      click('Select ' + host.slot)
      click('Equip ' + host.source.name)
      click('Manage filigrees for ' + host.source.name)
      for (let n = 1; n <= index; n++) {
        if (!screen.queryByRole('button', { name: 'Filigree slot ' + String(n) })) click('Unlock slot')
      }
      click('Filigree slot ' + String(index))
      click('Select Amber Shard')
      click('Close filigree selector')
    }
    click('Collapse details')
    click('Select Main Hand')
    const find = () => {
      click('Find gear')
      fireEvent.click(screen.getByRole('radio', { name: 'Filigrees' }))
      fireEvent.change(screen.getByRole('textbox', { name: 'Search filigrees' }), {
        target: { value: '  AMPLIFICATION ' }
      })
    }
    find()
    expect(screen.getByText('2 matching filigrees')).toBeTruthy()
    expect(screen.queryByText('Other Shard')).toBeNull()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Equipped only' }))
    expect(screen.queryByText('Amber Shard (Rare)')).toBeNull()
    expect(screen.getByRole('button', { name: 'Test Blade · Main Hand · Slot 1' })).toBeTruthy()
    click('Test Ring · First Finger · Slot 2')
    const dialog = within(screen.getByRole('dialog', { name: 'Filigrees — Test Ring' }))
    expect(dialog.getByText('Select for slot 2')).toBeTruthy()
    expect(dialog.getByRole('button', { name: 'Filigree slot 2' }).getAttribute('aria-pressed')).toBe('true')
    click('Clear filigree')
    click('Close filigree selector')
    expect(within(screen.getByTestId('gear-item-editor')).getByText('Test Ring')).toBeTruthy()
    find()
    expect(screen.queryByRole('button', { name: 'Test Ring · First Finger · Slot 2' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Test Blade · Main Hand · Slot 1' })).toBeTruthy()
  })

  it('shows Deck of Many Curses controls only for eligible items and keeps selections in summaries and setups', async () => {
    const lesser: GearPlannerCurse = {
      id: 'Curse of Lesser Strength',
      name: 'Curse of Lesser Strength',
      type: 'Common',
      enchantments: [{ name: 'Strength', modifier: '+1', bonus: 'Fortune' }],
      source: { name: 'Curse of Lesser Strength', type: 'Common' }
    }
    const greater: GearPlannerCurse = {
      id: 'Curse of Greater Strength',
      name: 'Curse of Greater Strength',
      type: 'Rare',
      enchantments: [{ name: 'Strength', modifier: '+2', bonus: 'Fortune' }, { name: 'Ghostly' }],
      source: { name: 'Curse of Greater Strength', type: 'Rare' }
    }
    await renderReadyPage(
      dataWithItems(
        [
          item('head', gearPlannerSlots.head, 'Cursed Helm'),
          item('ring', gearPlannerSlots.firstFinger, 'Fortune Ring', 10, [
            { name: 'Strength', modifier: '+1', bonus: 'Fortune' }
          ]),
          item('quiver', gearPlannerSlots.quiver, 'Plain Quiver')
        ],
        [],
        [],
        [],
        [lesser, greater]
      )
    )

    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Cursed Helm' }))
    fireEvent.click(screen.getByRole('button', { name: 'Select First Finger' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Fortune Ring' }))
    fireEvent.click(screen.getByRole('button', { name: 'Select Quiver' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Plain Quiver' }))

    expect(screen.queryByRole('button', { name: 'Manage curses for Plain Quiver' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(screen.getByRole('button', { name: 'Manage curses for Cursed Helm' }))
    expect(await screen.findByText('Rare')).toBeTruthy()
    expect(screen.getByText('Strength +2 (Fortune)')).toBeTruthy()
    expect(screen.getByText('Upgrade')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Select Curse of Greater Strength' }))

    expect(screen.getByTestId('selected-curse-head').textContent).toContain('Curse of Greater Strength')
    expect(screen.getByTestId('selected-curse-head').textContent).toContain('Ghostly')
    fireEvent.click(screen.getByRole('button', { name: 'Enchantments' }))
    expect(await screen.findAllByText('Curse of Greater Strength on Head')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Close workspace tool' }))

    fireEvent.click(screen.getByRole('button', { name: 'Manage curses for Cursed Helm' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Select Curse of Lesser Strength' }))
    expect(screen.getByTestId('selected-curse-head').textContent).toContain('Curse of Lesser Strength')
    fireEvent.click(screen.getByRole('button', { name: 'Clear curse' }))
    expect(screen.queryByTestId('selected-curse-head')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Manage curses for Cursed Helm' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Select Curse of Greater Strength' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add setup' }))
    expect(screen.queryByTestId('selected-curse-head')).toBeNull()
    fireEvent.click(screen.getByRole('tab', { name: 'Default Setup' }))
    expect(screen.getByTestId('selected-curse-head').textContent).toContain('Curse of Greater Strength')
  })

  it('automatically carries over browser setups, opens the active loadout and keeps later v2 edits on reload', async () => {
    const head = item('helm', 'Head', 'Legacy helm')
    const catalog = dataWithItems([head])
    const raw = JSON.stringify({
      characterSetups: [
        { id: 'first', name: 'Questing', slots: {} },
        { id: 'raid', name: 'Raiding', slots: { Head: { name: 'Legacy helm' }, Neck: { name: 'Retired necklace' } } }
      ],
      activeSetupId: 'raid'
    })
    localStorage.setItem('gearPlannerState', raw)
    await renderReadyPage(catalog)
    expect(screen.getByRole('tab', { name: 'Raiding' }).getAttribute('aria-selected')).toBe('true')
    expect(within(screen.getByTestId('gear-item-editor')).getByText('Legacy helm')).toBeTruthy()
    expect(screen.getByText('Carried over 2 legacy Gear Planner setups.')).toBeTruthy()
    expect(screen.getByText(/could not uniquely match Retired necklace/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Clear Head from equipment' }))
    cleanup()
    await renderReadyPage(catalog)
    expect(screen.getByRole('tab', { name: 'Raiding' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.queryByText('Carried over 2 legacy Gear Planner setups.')).toBeNull()
    expect(screen.getByTestId('gear-slot-Head').textContent).not.toContain('Legacy helm')
    expect(localStorage.getItem('gearPlannerState')).toBe(raw)
  })

  it('restores a persisted curse selection into its item card and Enchantments Workspace', async () => {
    const selected: GearPlannerCurse = {
      id: 'Curse of Restoration',
      name: 'Curse of Restoration',
      type: 'Uncommon',
      enchantments: [{ name: 'Strength', modifier: '+2', bonus: 'Fortune' }],
      source: { name: 'Curse of Restoration', type: 'Uncommon' }
    }
    const head = item('restored-head', gearPlannerSlots.head, 'Restored Helm')
    const equipment = Object.fromEntries(gearPlannerCharacterSlots.map((slot) => [slot, null])) as Record<
      (typeof gearPlannerCharacterSlots)[number],
      string | null
    >
    equipment.Head = head.id
    localStorage.setItem(
      GEAR_PLANNER_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        activeSetupId: 'restored',
        setups: [
          {
            id: 'restored',
            name: 'Restored setup',
            minimumLevel: 1,
            maximumLevel: 36,
            equipment,
            selectedAugments: [],
            selectedCurses: [{ itemId: head.id, curseId: selected.id }]
          }
        ]
      })
    )

    await renderReadyPage(dataWithItems([head], [], [], [], [selected]))
    expect(screen.getByTestId('selected-curse-restored-head').textContent).toContain('Curse of Restoration')
    fireEvent.click(screen.getByRole('button', { name: 'Enchantments' }))
    expect(await screen.findByText('Curse of Restoration on Head')).toBeTruthy()
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
    expect(screen.getByTestId('gear-slot-Second Finger').textContent).toContain('Empty')
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
    expect(screen.getByTestId('gear-slot-Head').textContent).toContain('Empty')
    fireEvent.click(screen.getByRole('button', { name: 'Select Head' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Equip Second Setup Helm' }))
    fireEvent.click(screen.getByRole('tab', { name: 'Default Setup' }))
    expect(screen.getByTestId('gear-slot-Head').textContent).toContain('First Setup Helm')

    fireEvent.click(screen.getByRole('button', { name: 'Rename active setup' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Setup name' }), { target: { value: '  Raid plan  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save name' }))
    expect(screen.getByRole('tab', { name: 'Raid plan' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Setup actions' }))
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Clear setup…' }))
    expect(screen.getByTestId('gear-slot-Head').textContent).toContain('First Setup Helm')
    fireEvent.click(screen.getByRole('button', { name: 'Clear setup' }))
    expect(screen.getByTestId('gear-slot-Head').textContent).toContain('Empty')
    fireEvent.click(screen.getByRole('button', { name: 'Setup actions' }))
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Delete setup…' }))
    expect(await screen.findByText('Delete setup?')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Delete setup' }))
    expect(screen.queryByRole('tab', { name: 'Raid plan' })).toBeNull()
    expect(screen.getByRole('tab', { name: 'New Setup 2' })).toBeTruthy()
  })

  it('exposes JSON actions and replaces setups only after a valid import resolves', async () => {
    await renderReadyPage(dataWithItems([item('imported-head', gearPlannerSlots.head, 'Imported Helm')]))
    fireEvent.click(screen.getByRole('button', { name: 'Sharing' }))
    expect(await screen.findByRole('button', { name: 'Download JSON' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Review backup' })).toBeTruthy()

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

    const review = await screen.findByRole('dialog', { name: 'Replace current setups?' })
    expect(screen.queryByRole('tab', { name: 'Imported setup', hidden: true })).toBeNull()
    fireEvent.click(within(review).getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('tab', { name: 'Default Setup', hidden: true })).toBeTruthy()
    const paste = screen.getByLabelText<HTMLTextAreaElement>('Paste Gear Planner JSON')
    fireEvent.change(paste, { target: { value: paste.value + '\n' } })
    fireEvent.click(screen.getByRole('button', { name: 'Review backup' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Replace setups' }))
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
