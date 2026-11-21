import { describe, expect, it } from 'vitest'
import { getCompatibleAugmentTypes, isColorAugmentSlot, normaliseAugmentSlotType } from './compatibility.ts'

describe('augment compatibility', () => {
  it.each([
    ['Red', ['Red', 'Colorless']],
    ['Blue Slot', ['Blue', 'Colorless']],
    ['Yellow', ['Yellow', 'Colorless']],
    ['Purple', ['Purple', 'Red', 'Blue', 'Colorless']],
    ['Orange Slot', ['Orange', 'Red', 'Yellow', 'Colorless']],
    ['Green', ['Green', 'Blue', 'Yellow', 'Colorless']],
    ['Colorless', ['Colorless']]
  ])('returns all augment colors accepted by a %s slot', (slotType, expected) => {
    expect(getCompatibleAugmentTypes(slotType)).toEqual(expected)
  })

  it('preserves a non-color slot as an exact augment type', () => {
    expect(normaliseAugmentSlotType('Isle of Dread: Claw Slot (Weapon)')).toBe('Isle of Dread: Claw (Weapon)')
    expect(getCompatibleAugmentTypes('Isle of Dread: Claw Slot (Weapon)')).toEqual(['Isle of Dread: Claw (Weapon)'])
    expect(isColorAugmentSlot('Isle of Dread: Claw Slot (Weapon)')).toBe(false)
  })
})
