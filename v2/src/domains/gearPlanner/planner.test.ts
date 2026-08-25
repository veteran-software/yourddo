import { describe, expect, it } from 'vitest'
import type { GearPlannerAugment } from './gearPlanner.types.ts'
import { gearPlannerCharacterSlots, type GearPlannerItem, gearPlannerSlots } from './gearPlanner.types.ts'
import {
  createEmptyGearPlannerEquipment,
  createEmptyGearPlannerSelectionState,
  equipGearPlannerItem,
  equipGearPlannerItemInSelection,
  filterGearPlannerCandidates,
  type GearPlannerCharacterSlot,
  prepareGearPlannerCandidates,
  setGearPlannerSlottedAugment
} from './planner.ts'

const item = (
  id: string,
  slot: GearPlannerItem['slot'],
  name: string,
  minimumLevel = 1,
  type = 'Item',
  effects: readonly string[] = [],
  sets: readonly string[] = []
): GearPlannerItem => ({
  id,
  slot,
  sourceFile: 'test.json',
  minimumLevel,
  source: {
    name,
    type,
    minLevel: minimumLevel,
    enchantments: effects.map((effect) => ({ name: effect })),
    setBonus: sets.map((setName) => ({ name: setName }))
  }
})

const filters = {
  search: '',
  minimumLevel: 1,
  maximumLevel: 36,
  type: null,
  setName: null
}

describe('Gear Planner equipment selection', () => {
  it('creates all normal character slots empty', () => {
    const equipment = createEmptyGearPlannerEquipment()

    expect(Object.keys(equipment)).toEqual(gearPlannerCharacterSlots)
    expect(Object.values(equipment)).toEqual(Array(gearPlannerCharacterSlots.length).fill(null))
  })

  it('equips, replaces, removes, and leaves unrelated slots unchanged', () => {
    const first = item('head-a', gearPlannerSlots.head, 'First Helm')
    const second = item('head-b', gearPlannerSlots.head, 'Second Helm')
    const ring = item('ring-a', gearPlannerSlots.firstFinger, 'Test Ring')
    const equipped = equipGearPlannerItem(createEmptyGearPlannerEquipment(), gearPlannerSlots.head, first)
    const replaced = equipGearPlannerItem(equipped, gearPlannerSlots.head, second)
    const withRing = equipGearPlannerItem(replaced, gearPlannerSlots.firstFinger, ring)
    const removed = equipGearPlannerItem(withRing, gearPlannerSlots.head, null)

    expect(replaced.Head).toBe(second)
    expect(replaced['First Finger']).toBeNull()
    expect(removed.Head).toBeNull()
    expect(removed['First Finger']).toBe(ring)
  })

  it('keeps slot-specific rings and weapons independent, including two-handed parity', () => {
    const source = { name: 'Shared Ring', type: 'Ring', minLevel: 10 }
    const firstRing: GearPlannerItem = {
      id: 'first-ring',
      slot: gearPlannerSlots.firstFinger,
      sourceFile: 'ring.json',
      minimumLevel: 10,
      source
    }
    const secondRing: GearPlannerItem = { ...firstRing, id: 'second-ring', slot: gearPlannerSlots.secondFinger }
    const weaponSource = { name: 'Shared Dagger', type: 'Dagger', minLevel: 10 }
    const mainDagger: GearPlannerItem = {
      id: 'dagger-main',
      slot: gearPlannerSlots.mainHand,
      sourceFile: 'dagger.json',
      minimumLevel: 10,
      source: weaponSource
    }
    const offDagger: GearPlannerItem = { ...mainDagger, id: 'dagger-off', slot: gearPlannerSlots.offHand }
    const greatAxe = item('axe-main', gearPlannerSlots.mainHand, 'Great Axe', 10, 'Great Axe')
    const before = structuredClone(source)
    const withRings = equipGearPlannerItem(
      equipGearPlannerItem(createEmptyGearPlannerEquipment(), gearPlannerSlots.firstFinger, firstRing),
      gearPlannerSlots.secondFinger,
      secondRing
    )
    const withDualWield = equipGearPlannerItem(
      equipGearPlannerItem(withRings, gearPlannerSlots.offHand, offDagger),
      gearPlannerSlots.mainHand,
      mainDagger
    )
    const withWeapons = equipGearPlannerItem(
      equipGearPlannerItem(withDualWield, gearPlannerSlots.offHand, offDagger),
      gearPlannerSlots.mainHand,
      greatAxe
    )

    expect(firstRing.id).not.toBe(secondRing.id)
    expect(withWeapons['First Finger']).toBe(firstRing)
    expect(withWeapons['Second Finger']).toBe(secondRing)
    expect(withDualWield['Main Hand']).toBe(mainDagger)
    expect(withDualWield['Off Hand']).toBe(offDagger)
    expect(withWeapons['Main Hand']).toBe(greatAxe)
    expect(withWeapons['Off Hand']).toBe(offDagger)
    expect(source).toEqual(before)
  })

  it('rejects an item for a different slot without changing selection', () => {
    const head = item('head', gearPlannerSlots.head, 'Helm')
    const ring = item('ring', gearPlannerSlots.firstFinger, 'Ring')
    const equipment = equipGearPlannerItem(createEmptyGearPlannerEquipment(), gearPlannerSlots.head, head)

    expect(equipGearPlannerItem(equipment, gearPlannerSlots.head, ring)).toBe(equipment)
  })
})

describe('Gear Planner item browser filtering', () => {
  const candidates = prepareGearPlannerCandidates([
    item('alpha', gearPlannerSlots.mainHand, 'Alpha Blade', 20, 'Sword', ['Flaming'], ['Winter']),
    item('beta', gearPlannerSlots.mainHand, 'Beta Blade', 20, 'Axe', ['Vorpal'], ['Summer']),
    item('gamma', gearPlannerSlots.mainHand, 'Gamma Blade', 10, 'Sword', ['Flaming'], ['Winter']),
    item('delta-a', gearPlannerSlots.mainHand, 'Delta Blade', 20, 'Sword'),
    item('delta-b', gearPlannerSlots.mainHand, 'Delta Blade', 20, 'Sword')
  ])

  it('matches item names and effect names case-insensitively', () => {
    expect(
      filterGearPlannerCandidates(candidates, { ...filters, search: 'ALPHA' }).map(({ item: result }) => result.id)
    ).toEqual(['alpha'])
    expect(
      filterGearPlannerCandidates(candidates, { ...filters, search: 'fLaMiNg' }).map(({ item: result }) => result.id)
    ).toEqual(['alpha', 'gamma'])
    expect(filterGearPlannerCandidates(candidates, { ...filters, search: 'missing' })).toEqual([])
  })

  it('applies inclusive level, set, type, and search filters with AND semantics', () => {
    expect(
      filterGearPlannerCandidates(candidates, { ...filters, minimumLevel: 20, maximumLevel: 20 })
        .map(({ item: result }) => result.id)
        .sort()
    ).toEqual(['alpha', 'beta', 'delta-a', 'delta-b'])
    expect(
      filterGearPlannerCandidates(candidates, {
        ...filters,
        search: 'flaming',
        minimumLevel: 20,
        maximumLevel: 20,
        type: 'Sword',
        setName: 'Winter'
      }).map(({ item: result }) => result.id)
    ).toEqual(['alpha'])
    expect(
      filterGearPlannerCandidates(candidates, { ...filters, setName: 'Summer' }).map(({ item: result }) => result.id)
    ).toEqual(['beta'])
    expect(
      filterGearPlannerCandidates(candidates, { ...filters, type: 'Axe' }).map(({ item: result }) => result.id)
    ).toEqual(['beta'])
  })

  it('sorts by minimum level, name, then stable identity', () => {
    expect(filterGearPlannerCandidates(candidates, filters).map(({ item: result }) => result.id)).toEqual([
      'alpha',
      'beta',
      'delta-a',
      'delta-b',
      'gamma'
    ])
  })
})

const augment = (name: string, augmentType: string): GearPlannerAugment => ({
  name,
  augmentType,
  minLevel: 1,
  effectsAdded: [],
  source: { name, augmentType, minLevel: 1, effectsAdded: [] }
})

const augmentedItem = (
  id: string,
  slot: GearPlannerCharacterSlot,
  name: string,
  augmentType = 'Red'
): GearPlannerItem => ({
  id,
  slot,
  sourceFile: 'test.json',
  minimumLevel: 10,
  source: { name, augments: [{ augmentType }] }
})

describe('Gear Planner augment state transitions', () => {
  it('keeps slot-distinct ring augment selections independent', () => {
    const first = augmentedItem('first-ring', gearPlannerSlots.firstFinger, 'Shared Ring')
    const second = augmentedItem('second-ring', gearPlannerSlots.secondFinger, 'Shared Ring')
    const ruby = augment('Ruby', 'Red')
    const colorless = augment('Diamond', 'Colorless')
    let state = createEmptyGearPlannerSelectionState()
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.firstFinger, first)
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.secondFinger, second)
    state = setGearPlannerSlottedAugment(state, first.id, 0, ruby)
    state = setGearPlannerSlottedAugment(state, second.id, 0, colorless)

    expect(state.slottedAugments).toEqual({ [first.id]: { 0: ruby }, [second.id]: { 0: colorless } })
  })

  it('clears replaced or removed item augments while preserving unrelated items', () => {
    const headA = augmentedItem('head-a', gearPlannerSlots.head, 'First Helm')
    const headB = augmentedItem('head-b', gearPlannerSlots.head, 'Second Helm')
    const mainHand = augmentedItem('main-hand', gearPlannerSlots.mainHand, 'Sword')
    const ruby = augment('Ruby', 'Red')
    let state = createEmptyGearPlannerSelectionState()
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.head, headA)
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.mainHand, mainHand)
    state = setGearPlannerSlottedAugment(state, headA.id, 0, ruby)
    state = setGearPlannerSlottedAugment(state, mainHand.id, 0, ruby)
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.head, headB)

    expect(state.slottedAugments).toEqual({ [mainHand.id]: { 0: ruby } })
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.mainHand, null)
    expect(state.slottedAugments).toEqual({})
  })

  it('ignores incompatible programmatic selections and clears empty selection entries', () => {
    const head = augmentedItem('head', gearPlannerSlots.head, 'Helm', 'Red')
    const blue = augment('Sapphire', 'Blue')
    const ruby = augment('Ruby', 'Red')
    let state = equipGearPlannerItemInSelection(createEmptyGearPlannerSelectionState(), gearPlannerSlots.head, head)

    expect(setGearPlannerSlottedAugment(state, head.id, 0, blue)).toBe(state)
    state = setGearPlannerSlottedAugment(state, head.id, 0, ruby)
    state = setGearPlannerSlottedAugment(state, head.id, 0, null)
    expect(state.slottedAugments).toEqual({})
  })
})
