import { describe, expect, it } from 'vitest'
import {
  canApplyGearPlannerCurse,
  gearPlannerCurseDefinitions,
  gearPlannerCurseIdentity,
  parseGearPlannerCurseDataset
} from './curses.ts'
import type { GearPlannerCurse, GearPlannerItem } from './gearPlanner.types.ts'
import { gearPlannerSlots } from './gearPlanner.types.ts'
import {
  createEmptyGearPlannerSelectionState,
  equipGearPlannerItemInSelection,
  setGearPlannerSlottedCurse
} from './planner.ts'
import {
  activeGearPlannerSetup,
  addGearPlannerSetup,
  clearGearPlannerSetup,
  createDefaultGearPlannerState,
  equipGearPlannerSetupItem,
  selectGearPlannerSetup,
  setGearPlannerSetupCurse
} from './setups.ts'

const curse = (name: string): GearPlannerCurse => ({
  id: name,
  name,
  type: 'Common',
  enchantments: [{ name: 'Strength', modifier: 1, bonus: 'Fortune' }],
  source: { name, type: 'Common' }
})

const item = (id: string, slot: GearPlannerItem['slot'], name = id): GearPlannerItem => ({
  id,
  slot,
  sourceFile: 'test.json',
  minimumLevel: 1,
  source: { name }
})

const curses = [curse('Curse A'), curse('Curse B')]

describe('Gear Planner curses', () => {
  it('keeps the legacy applicability rule: every normal equipment slot except Quiver', () => {
    for (const slot of [
      gearPlannerSlots.head,
      gearPlannerSlots.armor,
      gearPlannerSlots.mainHand,
      gearPlannerSlots.offHand,
      gearPlannerSlots.firstFinger
    ]) {
      expect(canApplyGearPlannerCurse(item(slot, slot))).toBe(true)
    }
    expect(canApplyGearPlannerCurse(item('quiver', gearPlannerSlots.quiver))).toBe(false)
  })

  it('selects, replaces, and clears independently slotted curses', () => {
    const head = item('head', gearPlannerSlots.head)
    const armor = item('armor', gearPlannerSlots.armor)
    let state = equipGearPlannerItemInSelection(createEmptyGearPlannerSelectionState(), gearPlannerSlots.head, head)
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.armor, armor)
    state = setGearPlannerSlottedCurse(state, head.id, 'Curse A', curses)
    state = setGearPlannerSlottedCurse(state, armor.id, 'Curse B', curses)
    expect(state.slottedCurses).toEqual({ [head.id]: curses[0], [armor.id]: curses[1] })

    state = setGearPlannerSlottedCurse(state, head.id, 'Curse B', curses)
    expect(state.slottedCurses[head.id]).toBe(curses[1])
    state = setGearPlannerSlottedCurse(state, head.id, null, curses)
    expect(state.slottedCurses).toEqual({ [armor.id]: curses[1] })
  })

  it('keeps same-source rings independent by planner item ID', () => {
    const source = { name: 'Shared Ring' }
    const first: GearPlannerItem = {
      ...item('first-ring', gearPlannerSlots.firstFinger),
      source
    }
    const second: GearPlannerItem = {
      ...item('second-ring', gearPlannerSlots.secondFinger),
      source
    }
    let state = equipGearPlannerItemInSelection(
      createEmptyGearPlannerSelectionState(),
      gearPlannerSlots.firstFinger,
      first
    )
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.secondFinger, second)
    state = setGearPlannerSlottedCurse(state, first.id, 'Curse A', curses)
    state = setGearPlannerSlottedCurse(state, second.id, 'Curse B', curses)

    expect(state.slottedCurses[first.id]).toBe(curses[0])
    expect(state.slottedCurses[second.id]).toBe(curses[1])
  })

  it('rejects invalid hosts and unknown curse identities', () => {
    const quiver = item('quiver', gearPlannerSlots.quiver)
    const head = item('head', gearPlannerSlots.head)
    let state = equipGearPlannerItemInSelection(createEmptyGearPlannerSelectionState(), gearPlannerSlots.quiver, quiver)
    expect(setGearPlannerSlottedCurse(state, quiver.id, 'Curse A', curses)).toBe(state)

    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.head, head)
    expect(setGearPlannerSlottedCurse(state, 'missing-host', 'Curse A', curses)).toBe(state)
    expect(setGearPlannerSlottedCurse(state, head.id, 'missing-curse', curses)).toBe(state)
  })

  it('cleans removed and replaced hosts while keeping unrelated curse selections', () => {
    const firstHead = item('head-a', gearPlannerSlots.head)
    const secondHead = item('head-b', gearPlannerSlots.head)
    const ring = item('ring', gearPlannerSlots.firstFinger)
    let state = equipGearPlannerItemInSelection(
      createEmptyGearPlannerSelectionState(),
      gearPlannerSlots.head,
      firstHead
    )
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.firstFinger, ring)
    state = setGearPlannerSlottedCurse(state, firstHead.id, 'Curse A', curses)
    state = setGearPlannerSlottedCurse(state, ring.id, 'Curse B', curses)
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.head, secondHead)
    expect(state.slottedCurses).toEqual({ [ring.id]: curses[1] })

    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.firstFinger, null)
    expect(state.slottedCurses).toEqual({})
  })

  it('keeps curses isolated by setup and clears them with their setup', () => {
    const firstHead = item('setup-a', gearPlannerSlots.head)
    const secondHead = item('setup-b', gearPlannerSlots.head)
    let state = equipGearPlannerSetupItem(createDefaultGearPlannerState(), gearPlannerSlots.head, firstHead)
    state = setGearPlannerSetupCurse(state, firstHead.id, 'Curse A', curses)
    state = addGearPlannerSetup(state, 'setup-two', 'Second setup')
    state = equipGearPlannerSetupItem(state, gearPlannerSlots.head, secondHead)
    state = setGearPlannerSetupCurse(state, secondHead.id, 'Curse B', curses)

    state = selectGearPlannerSetup(state, 'default')
    expect(activeGearPlannerSetup(state).slottedCurses[firstHead.id]).toBe(curses[0])
    state = selectGearPlannerSetup(state, 'setup-two')
    expect(activeGearPlannerSetup(state).slottedCurses[secondHead.id]).toBe(curses[1])
    state = clearGearPlannerSetup(state, 'setup-two')
    expect(activeGearPlannerSetup(state).slottedCurses).toEqual({})
  })

  it('uses exact canonical names as identities and preserves both Masterworks records', () => {
    const names = gearPlannerCurseDefinitions.map((definition) => gearPlannerCurseIdentity(definition))
    expect(new Set(names).size).toBe(names.length)
    expect(names).toContain('Curse of Minor Masterworks')
    expect(names).toContain('Curse of Major Masterworks')
  })

  it('rejects duplicate canonical curse names during data validation', () => {
    expect(() =>
      parseGearPlannerCurseDataset([
        { name: 'Duplicate', type: 'Common', enchantments: [] },
        { name: 'Duplicate', type: 'Rare', enchantments: [] }
      ])
    ).toThrow('must be unique')
  })
})
