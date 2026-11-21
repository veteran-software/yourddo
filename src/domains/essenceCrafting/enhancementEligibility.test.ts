import { describe, expect, it } from 'vitest'
import { validateEssenceCraftingDataset } from './data.ts'
import {
  getAvailableEnhancementChoices,
  getPlacementEligibleEnhancements,
  hasCannithMarkExtraAffixPermission,
  isEnhancementAvailableAtMinimumLevel,
  isEnhancementPlacementEligible,
  isSelectedEnhancementStillValid
} from './enhancementEligibility.ts'
import { createEssenceCraftingTestPayload } from './test-fixture.ts'

const data = () => validateEssenceCraftingDataset(createEssenceCraftingTestPayload())

describe('Essence Crafting enhancement eligibility', () => {
  it('finds normalized prefix, suffix, and Extra placements for planner equipment slots', () => {
    const fixture = data()

    expect(getPlacementEligibleEnhancements(fixture, 'main-hand', 'prefix').map(({ id }) => id)).toEqual([
      'enhancement-split-prefix',
      'enhancement-alpha-prefix',
      'enhancement-zebra-prefix'
    ])
    expect(getPlacementEligibleEnhancements(fixture, 'main-hand', 'suffix').map(({ id }) => id)).toEqual([
      'enhancement-level-two-suffix'
    ])
    expect(getPlacementEligibleEnhancements(fixture, 'ring-1', 'extra').map(({ id }) => id)).toEqual([
      'enhancement-ring-extra'
    ])
  })

  it('rejects invalid item categories and affix positions without scanning legacy placement tokens', () => {
    const fixture = data()

    expect(getPlacementEligibleEnhancements(fixture, 'armor', 'prefix')).toEqual([])
    expect(getPlacementEligibleEnhancements(fixture, 'main-hand', 'unsupported')).toEqual([])
    expect(isEnhancementPlacementEligible(fixture, 'enhancement-split-prefix', 'armor', 'prefix')).toBe(false)
    expect(isEnhancementPlacementEligible(fixture, 'enhancement-split-prefix', 'main-hand', 'unsupported')).toBe(false)
  })

  it('uses the generated minimum item level as the availability boundary', () => {
    const fixture = data()

    expect(isEnhancementAvailableAtMinimumLevel(fixture, 'enhancement-level-two-suffix', 2)).toBe(true)
    expect(isEnhancementAvailableAtMinimumLevel(fixture, 'enhancement-level-two-suffix', 1)).toBe(false)
    expect(getAvailableEnhancementChoices(fixture, 'main-hand', 'suffix', 1)).toEqual([])
    expect(getAvailableEnhancementChoices(fixture, 'main-hand', 'suffix', 2).map(({ id }) => id)).toEqual([
      'enhancement-level-two-suffix'
    ])
  })

  it('revalidates an existing selection after slot, position, or level changes', () => {
    const fixture = data()

    expect(isSelectedEnhancementStillValid(fixture, 'enhancement-ring-extra', 'ring-1', 'extra', 1)).toBe(true)
    expect(isSelectedEnhancementStillValid(fixture, 'enhancement-ring-extra', 'ring-1', 'prefix', 1)).toBe(false)
    expect(isSelectedEnhancementStillValid(fixture, 'enhancement-ring-extra', 'ring-2', 'extra', 1)).toBe(true)
    expect(isSelectedEnhancementStillValid(fixture, 'enhancement-level-two-suffix', 'main-hand', 'suffix', 1)).toBe(
      false
    )
    expect(isSelectedEnhancementStillValid(fixture, 'enhancement-level-two-suffix', 'ring-1', 'suffix', 2)).toBe(false)
  })

  it('honors published Extra placements for ring, headgear, and trinket slots', () => {
    const fixture = data()

    expect(isEnhancementPlacementEligible(fixture, 'enhancement-ring-extra', 'ring-1', 'extra')).toBe(true)
    expect(isEnhancementPlacementEligible(fixture, 'enhancement-headgear-extra', 'helmet', 'extra')).toBe(true)
    expect(isEnhancementPlacementEligible(fixture, 'enhancement-trinket-extra', 'trinket', 'extra')).toBe(true)
    expect(isEnhancementPlacementEligible(fixture, 'enhancement-headgear-extra', 'trinket', 'extra')).toBe(false)
  })

  it('keeps a split-prefix enhancement as one eligible choice', () => {
    const fixture = data()

    expect(
      getPlacementEligibleEnhancements(fixture, 'main-hand', 'prefix').filter(
        ({ id }) => id === 'enhancement-split-prefix'
      )
    ).toEqual([fixture.indexes.enhancementById.get('enhancement-split-prefix')])
    expect(isEnhancementPlacementEligible(fixture, 'effect-light', 'main-hand', 'prefix')).toBe(false)
  })

  it('sorts displayed choices alphabetically by display name with ID tie-breaking', () => {
    const fixture = data()

    expect(
      getAvailableEnhancementChoices(fixture, 'main-hand', 'prefix', 1).map(({ displayName }) => displayName)
    ).toEqual(['Alpha Prefix', 'Split Prefix Test', 'Zebra Prefix'])
  })

  it('keeps Mark permission separate from enhancement placement eligibility', () => {
    const fixture = data()

    expect(isEnhancementPlacementEligible(fixture, 'enhancement-ring-extra', 'ring-1', 'extra')).toBe(true)
    expect(hasCannithMarkExtraAffixPermission(fixture, false)).toBe(false)
    expect(hasCannithMarkExtraAffixPermission(fixture, true)).toBe(true)
  })

  it('fails safely for missing enhancement and equipment IDs', () => {
    const fixture = data()

    expect(getPlacementEligibleEnhancements(fixture, 'missing-slot', 'prefix')).toEqual([])
    expect(isEnhancementPlacementEligible(fixture, 'missing-enhancement', 'main-hand', 'prefix')).toBe(false)
    expect(isEnhancementAvailableAtMinimumLevel(fixture, 'missing-enhancement', 1)).toBe(false)
    expect(isSelectedEnhancementStillValid(fixture, 'missing-enhancement', 'main-hand', 'prefix', 1)).toBe(false)
    expect(isSelectedEnhancementStillValid(fixture, null, 'missing-slot', 'prefix', 1)).toBe(true)
  })
})
