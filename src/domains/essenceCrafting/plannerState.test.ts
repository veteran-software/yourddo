import { describe, expect, it } from 'vitest'
import { validateEssenceCraftingDataset } from './data.ts'
import { EQUIPMENT_SLOTS } from './equipment.ts'
import { createEmptyEssencePlan, createPlannedAugmentSlotId } from './plannerState.ts'
import { createEssenceCraftingTestPayload } from './test-fixture.ts'

const expectedSlots = [
  ['main-hand', 'Main Hand', ['weapon']],
  ['off-hand', 'Off Hand', ['weapon']],
  ['rune-arm', 'Rune Arm', ['rune-arm']],
  ['orb', 'Orb', ['orb']],
  ['armor', 'Armor', ['armor']],
  ['belt', 'Belt', ['belt']],
  ['boots', 'Boots', ['boots']],
  ['bracers', 'Bracers', ['bracers']],
  ['cloak', 'Cloak', ['cloak']],
  ['gloves', 'Gloves', ['gloves']],
  ['goggles', 'Goggles', ['goggles']],
  ['helmet', 'Helmet', ['head']],
  ['necklace', 'Necklace', ['necklace']],
  ['ring-1', 'Ring 1', ['ring']],
  ['ring-2', 'Ring 2', ['ring']],
  ['trinket', 'Trinket', ['trinket']],
  ['shield', 'Shield', ['shield']]
] as const

describe('Essence Crafting equipment catalog', () => {
  it('has unique stable IDs in the fixed planner order with their display labels and canonical categories', () => {
    expect(EQUIPMENT_SLOTS.map(({ id }) => id)).toEqual(expectedSlots.map(([id]) => id))
    expect(new Set(EQUIPMENT_SLOTS.map(({ id }) => id)).size).toBe(EQUIPMENT_SLOTS.length)
    expect(EQUIPMENT_SLOTS.map(({ label }) => label)).toEqual(expectedSlots.map(([, label]) => label))
    expect(EQUIPMENT_SLOTS.map(({ itemCategoryIds }) => itemCategoryIds)).toEqual(
      expectedSlots.map(([, , itemCategoryIds]) => itemCategoryIds)
    )
  })

  it('keeps first and second rings as distinct planner identities mapped to the same category', () => {
    const [firstRing, secondRing] = EQUIPMENT_SLOTS.filter(({ id }) => id === 'ring-1' || id === 'ring-2')

    expect(firstRing).toMatchObject({ id: 'ring-1', itemCategoryIds: ['ring'] })
    expect(secondRing).toMatchObject({ id: 'ring-2', itemCategoryIds: ['ring'] })
  })
})

describe('empty Essence Crafting plan', () => {
  it('uses the published minimum level and creates no selected CDN objects', () => {
    const data = validateEssenceCraftingDataset(createEssenceCraftingTestPayload())
    const plan = createEmptyEssencePlan(data)

    expect(plan).toEqual({
      masterMinimumLevel: data.rules.supportedItemLevels.minimum,
      activeSlotIds: [],
      collapsedSlotIds: [],
      itemsBySlotId: {}
    })
    expect(plan.masterMinimumLevel).toBeGreaterThanOrEqual(data.rules.supportedItemLevels.minimum)
    expect(plan.masterMinimumLevel).toBeLessThanOrEqual(data.rules.supportedItemLevels.maximum)
    expect(Object.values(plan.itemsBySlotId)).toEqual([])
  })

  it('creates independent mutable containers for every plan', () => {
    const data = validateEssenceCraftingDataset(createEssenceCraftingTestPayload())
    const first = createEmptyEssencePlan(data)
    const second = createEmptyEssencePlan(data)

    expect(first.activeSlotIds).not.toBe(second.activeSlotIds)
    expect(first.collapsedSlotIds).not.toBe(second.collapsedSlotIds)
    expect(first.itemsBySlotId).not.toBe(second.itemsBySlotId)

    first.activeSlotIds.push('main-hand')
    first.collapsedSlotIds.push('main-hand')
    first.itemsBySlotId['main-hand'] = {
      prefixEnhancementId: 'enhancement-split-prefix',
      suffixEnhancementId: null,
      extraEnhancementId: null,
      hasCannithMark: false,
      minimumLevelOverride: null,
      augmentSlots: []
    }

    expect(second).toEqual({
      masterMinimumLevel: data.rules.supportedItemLevels.minimum,
      activeSlotIds: [],
      collapsedSlotIds: [],
      itemsBySlotId: {}
    })
  })

  it('derives planner-created augment slot identities deterministically', () => {
    expect(createPlannedAugmentSlotId('red')).toBe('augment-slot:red')
    expect(createPlannedAugmentSlotId('red')).toBe(createPlannedAugmentSlotId('red'))
  })
})
