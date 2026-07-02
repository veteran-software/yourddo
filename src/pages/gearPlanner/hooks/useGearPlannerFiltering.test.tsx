import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import * as conflictResolver from '../conflictResolver'
import { type EntityGearState, type GearItem, type GearSetup, GearSlot } from '../types'
import useGearPlannerFiltering from './useGearPlannerFiltering'

// Mock conflictResolver
vi.mock('../conflictResolver', () => ({
  checkPotentialConflict: vi.fn(),
  getSlotOwner: vi.fn(() => 'player'),
  normalizeString: vi.fn((s: string) => s.toLowerCase()),
  isPetSlot: vi.fn(() => false)
}))

const mockActiveSetup = {
  id: 'test',
  name: 'Test Setup',
  minLevel: 1,
  maxLevel: 30,
  artificerPet: [],
  druidPet: [],
  classes: ['Fighter'],
  armorFilters: ['Heavy Armor'],
  weaponFilters: ['Long Sword'],
  shieldFilters: ['Large Shield']
}

const mockGearItem = (id: number, name: string, slot: GearSlot = GearSlot.Quiver): GearItem =>
  ({
    id,
    name,
    normalizedName: name.toLowerCase(),
    normalizedEnchantments: [],
    slot,
    minLevel: 1,
    enchantments: [{ name: 'Test Enchantment' }]
  }) as unknown as GearItem

describe('useGearPlannerFiltering Hook', () => {
  const defaultProps = {
    dataReady: true,
    allItems: [],
    allFiligrees: [],
    allItemsBySlot: new Map<GearSlot, GearItem[]>(),
    itemToSetsMap: new Map<string, string[]>(),
    itemSetBonusIndex: {},
    filigreeSetBonusIndex: {},
    activeSetup: mockActiveSetup as unknown as GearSetup,
    browsingSlot: GearSlot.Quiver,
    browsingSet: null,
    itemNameSearch: '',
    enchantmentSearch: '',
    enchantmentBonusType: '',
    setBonusFilter: null,
    showOwnedOnly: false,
    showConflicts: true,
    getEntityState: vi.fn(() => ({ equipped: [], slottedAugments: {} }) as unknown as EntityGearState),
    troveData: {},
    isItemVisibleForClasses: () => true
  }

  it('should filter items by name', () => {
    const items = [mockGearItem(1, 'Quiver of Heroism'), mockGearItem(2, 'Bracers of Power', GearSlot.Wrists)]
    const allItemsBySlot = new Map([
      [GearSlot.Quiver, [items[0]]],
      [GearSlot.Wrists, [items[1]]]
    ])

    const { result } = renderHook(() =>
      useGearPlannerFiltering({
        ...defaultProps,
        allItemsBySlot,
        itemNameSearch: 'Heroism'
      })
    )

    expect(result.current.filteredItems).toHaveLength(1)
    expect(result.current.filteredItems[0].name).toBe('Quiver of Heroism')
  })

  it('should filter conflicting items when showConflicts is false', () => {
    vi.mocked(conflictResolver.checkPotentialConflict).mockReturnValue({
      isConflict: true,
      isRedundant: false,
      currentMax: 10,
      isUpgrade: false
    })

    const items = [mockGearItem(1, 'Conflicting Quiver')]
    const allItemsBySlot = new Map([[GearSlot.Quiver, items]])

    const { result } = renderHook(() =>
      useGearPlannerFiltering({
        ...defaultProps,
        allItemsBySlot,
        showConflicts: false
      })
    )

    expect(result.current.filteredItems).toHaveLength(0)
  })

  it('should NOT filter conflicting items when showConflicts is true', () => {
    vi.mocked(conflictResolver.checkPotentialConflict).mockReturnValue({
      isConflict: true,
      isRedundant: false,
      currentMax: 10,
      isUpgrade: false
    })

    const items = [mockGearItem(1, 'Conflicting Quiver')]
    const allItemsBySlot = new Map([[GearSlot.Quiver, items]])

    const { result } = renderHook(() =>
      useGearPlannerFiltering({
        ...defaultProps,
        allItemsBySlot,
        showConflicts: true
      })
    )

    expect(result.current.filteredItems).toHaveLength(1)
  })

  it('should NOT filter upgrade conflicts even when showConflicts is false', () => {
    vi.mocked(conflictResolver.checkPotentialConflict).mockReturnValue({
      isConflict: true,
      isRedundant: false,
      currentMax: 10,
      isUpgrade: true
    })

    const items = [mockGearItem(1, 'Upgrade Quiver')]
    const allItemsBySlot = new Map([[GearSlot.Quiver, items]])

    const { result } = renderHook(() =>
      useGearPlannerFiltering({
        ...defaultProps,
        allItemsBySlot,
        showConflicts: false
      })
    )

    expect(result.current.filteredItems).toHaveLength(1)
  })

  it('should respect isItemVisibleForClasses (e.g., Armor/Docent filtering)', () => {
    const docent = { ...mockGearItem(1, 'Docent of the Sea', GearSlot.Armor), type: 'Docent' }
    const plate = { ...mockGearItem(2, 'Full Plate', GearSlot.Armor), type: 'Heavy Armor' }
    const allItemsBySlot = new Map([[GearSlot.Armor, [docent, plate]]])

    const isItemVisibleForClasses = (item: GearItem, setup: GearSetup) => {
      if (item.slot === GearSlot.Armor) {
        return setup.armorFilters.includes(item.type)
      }
      return true
    }

    const { result } = renderHook(() =>
      useGearPlannerFiltering({
        ...defaultProps,
        allItemsBySlot,
        browsingSlot: GearSlot.Armor,
        isItemVisibleForClasses
      })
    )

    const names = result.current.filteredItems.map((i) => i.name)
    expect(names).not.toContain('Docent of the Sea')
    expect(names).toContain('Full Plate')
  })
})
