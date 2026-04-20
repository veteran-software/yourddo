import { describe, expect, it } from 'vitest'
import { createDefaultSetup } from '../../pages/gearPlanner/initialState'
import {
  type GearAugment,
  type GearItem,
  GearSlot
} from '../../pages/gearPlanner/types'
import gearPlannerReducer, {
  type GearPlannerState,
  removeSetup
} from './gearPlannerSlice'

describe('gearPlannerSlice reducers', () => {
  it('Bug #7: removeSetup should not leave characterSetups empty', () => {
    const initialState: GearPlannerState = {
      characterSetups: [createDefaultSetup('setup1', 'Setup 1')],
      activeSetupId: 'setup1'
    }

    const nextState: GearPlannerState = gearPlannerReducer(initialState, removeSetup('setup1'))

    expect(nextState.characterSetups.length).toBeGreaterThan(0)
    expect(nextState.characterSetups[0].id).toBe('default')
    expect(nextState.activeSetupId).toBe('default')
  })

  it('Bug #7: removeSetup should set activeSetupId to first setup if active setup was removed', () => {
    const initialState: GearPlannerState = {
      characterSetups: [createDefaultSetup('setup1', 'Setup 1'), createDefaultSetup('setup2', 'Setup 2')],
      activeSetupId: 'setup1'
    }

    const nextState: GearPlannerState = gearPlannerReducer(initialState, removeSetup('setup1'))

    expect(nextState.characterSetups.length).toBe(1)
    expect(nextState.characterSetups[0].id).toBe('setup2')
    expect(nextState.activeSetupId).toBe('setup2')
  })

  it('Bug #7: removeSetup should update activeSetupId if current active is no longer in setups', () => {
    const initialState: GearPlannerState = {
      characterSetups: [createDefaultSetup('setup2', 'Setup 2')],
      activeSetupId: 'setup1'
    }

    const nextState: GearPlannerState = gearPlannerReducer(initialState, removeSetup('someOtherId'))

    expect(nextState.activeSetupId).toBe('setup2')
  })

  it('Bug #2: metadata should be isolated between different slots even if the item is the same type', () => {
    const setup1 = createDefaultSetup('setup1', 'Setup 1');
    const item1 = { id: 'Slot 1|Ring|29|ring.json', name: 'Ring', slot: GearSlot.MainHand, minLevel: '29', type: 'Ring' } as unknown as GearItem
    const item2 = { id: 'Slot 2|Ring|29|ring.json', name: 'Ring', slot: GearSlot.OffHand, minLevel: '29', type: 'Ring' } as unknown as GearItem

    const initialState: GearPlannerState = {
      characterSetups: [
        {
          ...setup1,
          id: 'setup1',
          slots: { [GearSlot.MainHand]: item1, [GearSlot.OffHand]: item2 } as unknown as Record<GearSlot, GearItem | null>,
          slottedAugments: {
            [item1.id]: { 0: { name: 'Augment 1', augmentType: 'Yellow', minLevel: '1' } as unknown as GearAugment },
            [item2.id]: { 0: { name: 'Augment 2', augmentType: 'Yellow', minLevel: '1' } as unknown as GearAugment }
          }
        }
      ],
      activeSetupId: 'setup1'
    }

    const stateAfterUnequip = gearPlannerReducer(initialState, {
      type: 'gearPlanner/equipItem',
      payload: { slot: GearSlot.MainHand, item: null }
    })

    const nextSetup = stateAfterUnequip.characterSetups[0]
    expect(nextSetup.slottedAugments[item1.id]).toBeUndefined()
    expect(nextSetup.slottedAugments[item2.id]).toBeDefined()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(nextSetup.slottedAugments[item2.id][0]!.name).toBe('Augment 2')
  })
})
