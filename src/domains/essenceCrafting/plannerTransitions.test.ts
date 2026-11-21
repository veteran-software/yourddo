import { describe, expect, it } from 'vitest'
import { validateEssenceCraftingDataset } from './data.ts'
import { createEmptyEssencePlan, createPlannedAugmentSlotId, type EssencePlanState } from './plannerState.ts'
import { type EssencePlanAction, transitionEssencePlan } from './plannerTransitions.ts'
import { createEssenceCraftingTestPayload } from './test-fixture.ts'

const createData = () => validateEssenceCraftingDataset(createEssenceCraftingTestPayload())

const createDataWithChangeableAugmentSlots = () => {
  const payload = createEssenceCraftingTestPayload()
  payload.augments.push({
    id: 'augment-colorless-utility',
    displayName: 'Colorless Utility',
    augmentTypeId: 'colorless',
    minimumItemLevel: 1,
    effects: [
      {
        id: 'effect-utility',
        displayName: 'Utility',
        bonusTypeId: 'bonus-enhancement',
        modifier: { kind: 'fixed', unit: 'number', value: 1 }
      }
    ]
  })
  payload.rules.augmentSlotTypes.unshift({
    id: 'colorless',
    displayName: 'Colorless',
    acceptsAugmentTypeIds: ['colorless']
  })
  payload.rules.augmentSlotPlacements[0]?.augmentSlotTypeIds.unshift('colorless')
  return validateEssenceCraftingDataset(payload)
}

const transition = (state: EssencePlanState, action: EssencePlanAction): EssencePlanState =>
  transitionEssencePlan(createData(), state, action)

const activate = (state: EssencePlanState, equipmentSlotId: string): EssencePlanState =>
  transition(state, { type: 'activate-equipment-slot', equipmentSlotId })

describe('Essence Crafting planner transitions', () => {
  it('activates slots with synchronized empty items in stable equipment order and ignores unknown IDs', () => {
    const initial = createEmptyEssencePlan(createData())
    const withSecondRing = activate(initial, 'ring-2')
    const active = activate(withSecondRing, 'main-hand')

    expect(active.activeSlotIds).toEqual(['main-hand', 'ring-2'])
    expect(Object.keys(active.itemsBySlotId)).toEqual(['main-hand', 'ring-2'])
    expect(active.itemsBySlotId['main-hand']).toEqual({
      prefixEnhancementId: null,
      suffixEnhancementId: null,
      extraEnhancementId: null,
      hasCannithMark: false,
      minimumLevelOverride: null,
      augmentSlots: []
    })
    expect(activate(active, 'unknown')).toBe(active)
  })

  it('collapses and expands only active slots while preserving canonical collapse order', () => {
    let state = activate(createEmptyEssencePlan(createData()), 'ring-1')
    state = activate(state, 'main-hand')
    state = transition(state, { type: 'collapse-equipment-slot', equipmentSlotId: 'ring-1' })
    state = transition(state, { type: 'collapse-equipment-slot', equipmentSlotId: 'main-hand' })

    expect(state.collapsedSlotIds).toEqual(['main-hand', 'ring-1'])

    state = transition(state, { type: 'expand-equipment-slot', equipmentSlotId: 'main-hand' })
    expect(state.collapsedSlotIds).toEqual(['ring-1'])
    expect(transition(state, { type: 'collapse-equipment-slot', equipmentSlotId: 'armor' })).toBe(state)
  })

  it('deactivating a slot removes its complete item and collapse state', () => {
    let state = activate(createEmptyEssencePlan(createData()), 'main-hand')
    state = transition(state, {
      type: 'select-prefix-enhancement',
      equipmentSlotId: 'main-hand',
      enhancementId: 'enhancement-split-prefix'
    })
    state = transition(state, { type: 'collapse-equipment-slot', equipmentSlotId: 'main-hand' })
    state = transition(state, { type: 'deactivate-equipment-slot', equipmentSlotId: 'main-hand' })

    expect(state.activeSlotIds).toEqual([])
    expect(state.collapsedSlotIds).toEqual([])
    expect(state.itemsBySlotId).toEqual({})
  })

  it('a master level change immediately clears invalid inherited selections but leaves overridden items isolated', () => {
    let state = createEmptyEssencePlan(createData())
    state = activate(state, 'main-hand')
    state = activate(state, 'off-hand')
    state = transition(state, { type: 'set-master-minimum-level', minimumLevel: 2 })
    state = transition(state, {
      type: 'set-item-minimum-level-override',
      equipmentSlotId: 'main-hand',
      minimumLevel: 2
    })
    for (const equipmentSlotId of ['main-hand', 'off-hand']) {
      state = transition(state, {
        type: 'select-suffix-enhancement',
        equipmentSlotId,
        enhancementId: 'enhancement-level-two-suffix'
      })
    }

    state = transition(state, { type: 'set-master-minimum-level', minimumLevel: 1 })

    expect(state.itemsBySlotId['main-hand']?.suffixEnhancementId).toBe('enhancement-level-two-suffix')
    expect(state.itemsBySlotId['off-hand']?.suffixEnhancementId).toBeNull()
    expect(transition(state, { type: 'set-master-minimum-level', minimumLevel: 99 })).toBe(state)
  })

  it('a per-item override revalidates only that item', () => {
    let state = createEmptyEssencePlan(createData())
    state = activate(state, 'main-hand')
    state = activate(state, 'off-hand')
    state = transition(state, { type: 'set-master-minimum-level', minimumLevel: 2 })
    for (const equipmentSlotId of ['main-hand', 'off-hand']) {
      state = transition(state, {
        type: 'select-suffix-enhancement',
        equipmentSlotId,
        enhancementId: 'enhancement-level-two-suffix'
      })
    }

    state = transition(state, {
      type: 'set-item-minimum-level-override',
      equipmentSlotId: 'main-hand',
      minimumLevel: 1
    })

    expect(state.itemsBySlotId['main-hand']?.suffixEnhancementId).toBeNull()
    expect(state.itemsBySlotId['off-hand']?.suffixEnhancementId).toBe('enhancement-level-two-suffix')
  })

  it('selects and clears placement-eligible prefix and suffix IDs while rejecting stale or misplaced IDs', () => {
    let state = activate(createEmptyEssencePlan(createData()), 'main-hand')
    state = transition(state, {
      type: 'select-prefix-enhancement',
      equipmentSlotId: 'main-hand',
      enhancementId: 'enhancement-split-prefix'
    })
    const withSplitPrefix = state

    expect(state.itemsBySlotId['main-hand']?.prefixEnhancementId).toBe('enhancement-split-prefix')
    expect(
      transition(state, {
        type: 'select-suffix-enhancement',
        equipmentSlotId: 'main-hand',
        enhancementId: 'enhancement-split-prefix'
      })
    ).toBe(state)
    expect(
      transition(state, {
        type: 'select-prefix-enhancement',
        equipmentSlotId: 'main-hand',
        enhancementId: 'stale-enhancement'
      })
    ).toBe(state)

    state = transition(state, {
      type: 'select-prefix-enhancement',
      equipmentSlotId: 'main-hand',
      enhancementId: null
    })
    expect(state.itemsBySlotId['main-hand']?.prefixEnhancementId).toBeNull()
    expect(withSplitPrefix.itemsBySlotId['main-hand']?.prefixEnhancementId).toBe('enhancement-split-prefix')
  })

  it('requires the Mark for Extra and disabling it clears Extra immediately', () => {
    let state = activate(createEmptyEssencePlan(createData()), 'ring-1')
    const selectExtra: EssencePlanAction = {
      type: 'select-extra-enhancement',
      equipmentSlotId: 'ring-1',
      enhancementId: 'enhancement-ring-extra'
    }

    expect(transition(state, selectExtra)).toBe(state)
    state = transition(state, { type: 'set-cannith-mark', equipmentSlotId: 'ring-1', enabled: true })
    state = transition(state, selectExtra)
    expect(state.itemsBySlotId['ring-1']?.extraEnhancementId).toBe('enhancement-ring-extra')

    state = transition(state, { type: 'set-cannith-mark', equipmentSlotId: 'ring-1', enabled: false })
    expect(state.itemsBySlotId['ring-1']?.hasCannithMark).toBe(false)
    expect(state.itemsBySlotId['ring-1']?.extraEnhancementId).toBeNull()
  })

  it('adding an augment slot raises its item override, prevents duplicates, and constrains explicit lowering', () => {
    let state = activate(createEmptyEssencePlan(createData()), 'main-hand')
    state = transition(state, { type: 'add-augment-slot', equipmentSlotId: 'main-hand', augmentSlotTypeId: 'red' })

    expect(state.itemsBySlotId['main-hand']?.minimumLevelOverride).toBe(2)
    expect(state.itemsBySlotId['main-hand']?.augmentSlots).toEqual([
      {
        id: 'augment-slot:red',
        augmentSlotTypeId: 'red',
        augmentId: null,
        selectedEffectNames: [],
        filterMode: 'or'
      }
    ])
    expect(
      transition(state, { type: 'add-augment-slot', equipmentSlotId: 'main-hand', augmentSlotTypeId: 'red' })
    ).toBe(state)

    state = transition(state, {
      type: 'set-item-minimum-level-override',
      equipmentSlotId: 'main-hand',
      minimumLevel: null
    })
    expect(state.itemsBySlotId['main-hand']?.minimumLevelOverride).toBe(2)

    let constrained = activate(createEmptyEssencePlan(createData()), 'main-hand')
    constrained = transition(constrained, { type: 'set-master-minimum-level', minimumLevel: 2 })
    constrained = transition(constrained, {
      type: 'add-augment-slot',
      equipmentSlotId: 'main-hand',
      augmentSlotTypeId: 'red'
    })
    expect(constrained.itemsBySlotId['main-hand']?.minimumLevelOverride).toBeNull()
    constrained = transition(constrained, { type: 'set-master-minimum-level', minimumLevel: 1 })
    expect(constrained.itemsBySlotId['main-hand']?.minimumLevelOverride).toBe(2)
  })

  it('removing an augment slot does not lower an auto-raised level; only a later explicit level action does', () => {
    let state = activate(createEmptyEssencePlan(createData()), 'main-hand')
    state = transition(state, { type: 'add-augment-slot', equipmentSlotId: 'main-hand', augmentSlotTypeId: 'red' })
    state = transition(state, {
      type: 'remove-augment-slot',
      equipmentSlotId: 'main-hand',
      augmentSlotId: createPlannedAugmentSlotId('red')
    })

    expect(state.itemsBySlotId['main-hand']?.augmentSlots).toEqual([])
    expect(state.itemsBySlotId['main-hand']?.minimumLevelOverride).toBe(2)

    state = transition(state, {
      type: 'set-item-minimum-level-override',
      equipmentSlotId: 'main-hand',
      minimumLevel: null
    })
    expect(state.itemsBySlotId['main-hand']?.minimumLevelOverride).toBeNull()
  })

  it('selects, clears, filters, and changes mode for an augment without accepting unknown values', () => {
    let state = activate(createEmptyEssencePlan(createData()), 'main-hand')
    state = transition(state, { type: 'add-augment-slot', equipmentSlotId: 'main-hand', augmentSlotTypeId: 'red' })
    const augmentSlotId = createPlannedAugmentSlotId('red')
    state = transition(state, {
      type: 'select-augment',
      equipmentSlotId: 'main-hand',
      augmentSlotId,
      augmentId: 'augment-red-charisma'
    })
    state = transition(state, {
      type: 'set-augment-filters',
      equipmentSlotId: 'main-hand',
      augmentSlotId,
      effectNames: ['missing-effect', 'Charisma', 'Charisma']
    })
    state = transition(state, {
      type: 'set-augment-filter-mode',
      equipmentSlotId: 'main-hand',
      augmentSlotId,
      filterMode: 'and'
    })

    expect(state.itemsBySlotId['main-hand']?.augmentSlots[0]).toMatchObject({
      augmentId: 'augment-red-charisma',
      selectedEffectNames: ['Charisma'],
      filterMode: 'and'
    })
    expect(
      transition(state, {
        type: 'select-augment',
        equipmentSlotId: 'main-hand',
        augmentSlotId,
        augmentId: 'missing-augment'
      })
    ).toBe(state)

    state = transition(state, { type: 'clear-augment', equipmentSlotId: 'main-hand', augmentSlotId })
    expect(state.itemsBySlotId['main-hand']?.augmentSlots[0]).toMatchObject({
      augmentId: null,
      selectedEffectNames: ['Charisma'],
      filterMode: 'and'
    })
  })

  it('changes an augment slot color only when the target is approved and clears incompatible dependent state', () => {
    const data = createDataWithChangeableAugmentSlots()
    let state = transitionEssencePlan(data, createEmptyEssencePlan(data), {
      type: 'activate-equipment-slot',
      equipmentSlotId: 'main-hand'
    })
    state = transitionEssencePlan(data, state, {
      type: 'add-augment-slot',
      equipmentSlotId: 'main-hand',
      augmentSlotTypeId: 'red'
    })
    state = transitionEssencePlan(data, state, {
      type: 'select-augment',
      equipmentSlotId: 'main-hand',
      augmentSlotId: 'augment-slot:red',
      augmentId: 'augment-red-charisma'
    })
    state = transitionEssencePlan(data, state, {
      type: 'set-augment-filters',
      equipmentSlotId: 'main-hand',
      augmentSlotId: 'augment-slot:red',
      effectNames: ['Charisma']
    })
    state = transitionEssencePlan(data, state, {
      type: 'change-augment-slot-type',
      equipmentSlotId: 'main-hand',
      augmentSlotId: 'augment-slot:red',
      augmentSlotTypeId: 'colorless'
    })

    expect(state.itemsBySlotId['main-hand']?.augmentSlots).toEqual([
      {
        id: 'augment-slot:colorless',
        augmentSlotTypeId: 'colorless',
        augmentId: null,
        selectedEffectNames: [],
        filterMode: 'or'
      }
    ])
    expect(
      transitionEssencePlan(data, state, {
        type: 'change-augment-slot-type',
        equipmentSlotId: 'main-hand',
        augmentSlotId: 'augment-slot:colorless',
        augmentSlotTypeId: 'missing-color'
      })
    ).toBe(state)
  })

  it('resetting one item keeps its activation and collapse state, while resetting the plan returns a fresh empty plan', () => {
    let state = activate(createEmptyEssencePlan(createData()), 'main-hand')
    state = transition(state, {
      type: 'select-prefix-enhancement',
      equipmentSlotId: 'main-hand',
      enhancementId: 'enhancement-split-prefix'
    })
    state = transition(state, { type: 'collapse-equipment-slot', equipmentSlotId: 'main-hand' })
    state = transition(state, { type: 'reset-planned-item', equipmentSlotId: 'main-hand' })

    expect(state.activeSlotIds).toEqual(['main-hand'])
    expect(state.collapsedSlotIds).toEqual(['main-hand'])
    expect(state.itemsBySlotId['main-hand']).toEqual({
      prefixEnhancementId: null,
      suffixEnhancementId: null,
      extraEnhancementId: null,
      hasCannithMark: false,
      minimumLevelOverride: null,
      augmentSlots: []
    })

    state = transition(state, { type: 'reset-plan' })
    expect(state).toEqual(createEmptyEssencePlan(createData()))
  })

  it('hydrates external state into synchronized, ordered records and sanitizes stale IDs and duplicate colors', () => {
    const data = createData()
    const externalState = {
      masterMinimumLevel: 99,
      activeSlotIds: ['ring-1', 'missing-slot', 'main-hand', 'main-hand'],
      collapsedSlotIds: ['ring-1', 'armor', 'main-hand'],
      itemsBySlotId: {
        'main-hand': {
          prefixEnhancementId: 'stale-enhancement',
          suffixEnhancementId: 'enhancement-level-two-suffix',
          extraEnhancementId: 'enhancement-ring-extra',
          hasCannithMark: false,
          minimumLevelOverride: 400,
          augmentSlots: [
            {
              id: 'random-id',
              augmentSlotTypeId: 'red',
              augmentId: 'stale-augment',
              selectedEffectNames: ['stale-effect', 'Charisma'],
              filterMode: 'unexpected'
            },
            { augmentSlotTypeId: 'red', augmentId: 'augment-red-charisma' },
            { augmentSlotTypeId: 'missing-color', augmentId: 'augment-red-charisma' }
          ]
        },
        armor: {
          prefixEnhancementId: 'enhancement-split-prefix'
        }
      }
    }

    const hydrated = transitionEssencePlan(data, createEmptyEssencePlan(data), {
      type: 'hydrate-plan',
      externalState
    })

    expect(hydrated.masterMinimumLevel).toBe(1)
    expect(hydrated.activeSlotIds).toEqual(['main-hand', 'ring-1'])
    expect(hydrated.collapsedSlotIds).toEqual(['main-hand', 'ring-1'])
    expect(Object.keys(hydrated.itemsBySlotId)).toEqual(['main-hand', 'ring-1'])
    expect(hydrated.itemsBySlotId['main-hand']).toEqual({
      prefixEnhancementId: null,
      suffixEnhancementId: 'enhancement-level-two-suffix',
      extraEnhancementId: null,
      hasCannithMark: false,
      minimumLevelOverride: 2,
      augmentSlots: [
        {
          id: 'augment-slot:red',
          augmentSlotTypeId: 'red',
          augmentId: null,
          selectedEffectNames: ['Charisma'],
          filterMode: 'or'
        }
      ]
    })
    expect(hydrated.itemsBySlotId['ring-1']).toEqual({
      prefixEnhancementId: null,
      suffixEnhancementId: null,
      extraEnhancementId: null,
      hasCannithMark: false,
      minimumLevelOverride: null,
      augmentSlots: []
    })
    expect(externalState.itemsBySlotId['main-hand'].augmentSlots[0]?.id).toBe('random-id')
  })

  it('returns fully corrected state from each transition without a later render-phase repair', () => {
    let state = activate(createEmptyEssencePlan(createData()), 'main-hand')
    state = transition(state, { type: 'set-master-minimum-level', minimumLevel: 2 })
    state = transition(state, {
      type: 'select-suffix-enhancement',
      equipmentSlotId: 'main-hand',
      enhancementId: 'enhancement-level-two-suffix'
    })

    const lowered = transition(state, { type: 'set-master-minimum-level', minimumLevel: 1 })
    expect(lowered.itemsBySlotId['main-hand']?.suffixEnhancementId).toBeNull()

    const withAugmentSlot = transition(lowered, {
      type: 'add-augment-slot',
      equipmentSlotId: 'main-hand',
      augmentSlotTypeId: 'red'
    })
    expect(withAugmentSlot.itemsBySlotId['main-hand']?.minimumLevelOverride).toBe(2)
  })

  it('never mutates the original state or caller-owned action arrays', () => {
    let state = activate(createEmptyEssencePlan(createData()), 'main-hand')
    state = transition(state, { type: 'add-augment-slot', equipmentSlotId: 'main-hand', augmentSlotTypeId: 'red' })
    const originalSnapshot = JSON.stringify(state)
    const effectNames = ['Charisma']

    const next = transition(state, {
      type: 'set-augment-filters',
      equipmentSlotId: 'main-hand',
      augmentSlotId: 'augment-slot:red',
      effectNames
    })

    expect(JSON.stringify(state)).toBe(originalSnapshot)
    expect(effectNames).toEqual(['Charisma'])
    expect(next).not.toBe(state)
    expect(next.itemsBySlotId['main-hand']).not.toBe(state.itemsBySlotId['main-hand'])
    expect(next.itemsBySlotId['main-hand']?.augmentSlots).not.toBe(state.itemsBySlotId['main-hand']?.augmentSlots)
  })
})
