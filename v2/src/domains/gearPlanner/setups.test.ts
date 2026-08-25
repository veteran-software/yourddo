import { describe, expect, it } from 'vitest'
import { type GearPlannerAugment, type GearPlannerItem, gearPlannerSlots } from './gearPlanner.types.ts'
import {
  activeGearPlannerSetup,
  addGearPlannerSetup,
  clearGearPlannerSetup,
  createDefaultGearPlannerState,
  deleteGearPlannerSetup,
  equipGearPlannerSetupItem,
  renameGearPlannerSetup,
  selectGearPlannerSetup,
  setGearPlannerSetupAugment,
  updateGearPlannerSetupLevels
} from './setups.ts'

const item = (id: string, slot: GearPlannerItem['slot']): GearPlannerItem => ({
  id,
  slot,
  sourceFile: 'test.json',
  minimumLevel: 10,
  source: { name: id, augments: [{ augmentType: 'Red' }] }
})

const augment: GearPlannerAugment = {
  name: 'Ruby',
  augmentType: 'Red',
  minLevel: 1,
  effectsAdded: [],
  source: { name: 'Ruby', augmentType: 'Red', minLevel: 1, effectsAdded: [] }
}

describe('Gear Planner setups', () => {
  it('starts with one active empty default setup and default levels', () => {
    const state = createDefaultGearPlannerState()

    expect(state.activeSetupId).toBe('default')
    expect(state.setups).toHaveLength(1)
    expect(activeGearPlannerSetup(state)).toMatchObject({
      id: 'default',
      name: 'Default Setup',
      minimumLevel: 1,
      maximumLevel: 36,
      slottedAugments: {}
    })
    expect(Object.values(activeGearPlannerSetup(state).equipment)).toEqual(Array(15).fill(null))
  })

  it('adds a uniquely identified empty setup, makes it active, and preserves previous state', () => {
    const head = item('head', gearPlannerSlots.head)
    const equipped = equipGearPlannerSetupItem(createDefaultGearPlannerState(), gearPlannerSlots.head, head)
    const next = addGearPlannerSetup(equipped, 'setup-two')

    expect(next.activeSetupId).toBe('setup-two')
    expect(next.setups).toHaveLength(2)
    expect(next.setups[0].equipment.Head).toBe(head)
    expect(next.setups[1]).toMatchObject({ id: 'setup-two', name: 'New Setup 2', slottedAugments: {} })
    expect(Object.values(next.setups[1].equipment)).toEqual(Array(15).fill(null))
    expect(addGearPlannerSetup(next, 'setup-two')).toBe(next)
  })

  it('renames only valid names without changing setup identity or selections', () => {
    const head = item('head', gearPlannerSlots.head)
    const equipped = equipGearPlannerSetupItem(createDefaultGearPlannerState(), gearPlannerSlots.head, head)
    const renamed = renameGearPlannerSetup(equipped, 'default', '  Favored build!  ')

    expect(renamed.setups[0].id).toBe('default')
    expect(renamed.setups[0].name).toBe('Favored build!')
    expect(renamed.setups[0].equipment.Head).toBe(head)
    expect(renameGearPlannerSetup(renamed, 'default', '   ')).toBe(renamed)
  })

  it('keeps equipment and augments independent while switching setups', () => {
    const firstHead = item('first-head', gearPlannerSlots.head)
    const secondHead = item('second-head', gearPlannerSlots.head)
    let state = equipGearPlannerSetupItem(createDefaultGearPlannerState(), gearPlannerSlots.head, firstHead)
    state = setGearPlannerSetupAugment(state, firstHead.id, 0, augment)
    state = addGearPlannerSetup(state, 'setup-two')
    state = equipGearPlannerSetupItem(state, gearPlannerSlots.head, secondHead)
    state = selectGearPlannerSetup(state, 'default')

    expect(activeGearPlannerSetup(state).equipment.Head).toBe(firstHead)
    expect(activeGearPlannerSetup(state).slottedAugments[firstHead.id]?.[0]).toBe(augment)
    state = selectGearPlannerSetup(state, 'setup-two')
    expect(activeGearPlannerSetup(state).equipment.Head).toBe(secondHead)
    expect(activeGearPlannerSetup(state).slottedAugments).toEqual({})
  })

  it('deletes inactive and active setups deterministically but never leaves zero setups', () => {
    let state = addGearPlannerSetup(createDefaultGearPlannerState(), 'setup-two')
    state = addGearPlannerSetup(state, 'setup-three')
    const afterInactiveDelete = deleteGearPlannerSetup(state, 'setup-two')

    expect(afterInactiveDelete.activeSetupId).toBe('setup-three')
    expect(afterInactiveDelete.setups.map(({ id }) => id)).toEqual(['default', 'setup-three'])
    const afterActiveDelete = deleteGearPlannerSetup(afterInactiveDelete, 'setup-three')
    expect(afterActiveDelete.activeSetupId).toBe('default')
    expect(afterActiveDelete.setups.map(({ id }) => id)).toEqual(['default'])
    expect(deleteGearPlannerSetup(afterActiveDelete, 'default')).toBe(afterActiveDelete)
  })

  it('clears one setup in place while preserving name and other setup state', () => {
    const head = item('head', gearPlannerSlots.head)
    const secondHead = item('second-head', gearPlannerSlots.head)
    let state = equipGearPlannerSetupItem(createDefaultGearPlannerState(), gearPlannerSlots.head, head)
    state = setGearPlannerSetupAugment(state, head.id, 0, augment)
    state = updateGearPlannerSetupLevels(state, 'default', { minimumLevel: 20 })
    state = addGearPlannerSetup(state, 'setup-two')
    state = equipGearPlannerSetupItem(state, gearPlannerSlots.head, secondHead)
    state = clearGearPlannerSetup(state, 'default')

    expect(state.setups[0]).toMatchObject({
      id: 'default',
      name: 'Default Setup',
      minimumLevel: 1,
      maximumLevel: 36,
      slottedAugments: {}
    })
    expect(Object.values(state.setups[0].equipment)).toEqual(Array(15).fill(null))
    expect(state.setups[1].equipment.Head).toBe(secondHead)
  })
})
