import { describe, expect, it } from 'vitest'
import {
  checkPotentialConflict,
  getBonus,
  resolveConflicts
} from './conflictResolver'
import { type GearItem, GearSlot } from './types'

describe('conflictResolver Bugs', () => {
  describe('Bug #8: Numeric Values in Bonus Field', () => {
    it('should treat numeric bonus types as "no type"', () => {
      expect(getBonus('123')).toBe('no type')
      expect(getBonus(123)).toBe('no type')
    })

    it('should treat empty/null/undefined as "no type"', () => {
      expect(getBonus('')).toBe('no type')
      expect(getBonus(null)).toBe('no type')
      expect(getBonus(undefined)).toBe('no type')
    })

    it('should preserve legitimate bonus types', () => {
      expect(getBonus('Enhancement')).toBe('enhancement')
      expect(getBonus('Insightful')).toBe('insightful')
    })
  })

  describe('Bug #3: Stacking Untyped Bonuses', () => {
    const item1 = {
      id: 'item1',
      name: 'Item 1',
      slot: GearSlot.MainHand,
      enchantments: [{ name: 'Strength', bonus: '', modifier: '1' }]
    } as unknown as GearItem

    const item2 = {
      id: 'item2',
      name: 'Item 2',
      slot: GearSlot.OffHand,
      enchantments: [{ name: 'Strength', bonus: null, modifier: '1' }]
    } as unknown as GearItem

    it('resolveConflicts should not report conflicts for "no type" bonuses', () => {
      const conflicts = resolveConflicts([item1, item2])
      expect(conflicts.strength).toBeUndefined()
    })

    it('checkPotentialConflict should not report conflict for "no type" bonus', () => {
      const result = checkPotentialConflict({ name: 'Strength', bonus: '', modifier: '1' }, [item1], GearSlot.OffHand)
      expect(result.isConflict).toBe(false)
    })

    it('should still report conflicts for typed bonuses', () => {
      const typedItem1 = {
        id: 'item1',
        name: 'Item 1',
        slot: GearSlot.MainHand,
        enchantments: [{ name: 'Strength', bonus: 'Enhancement', modifier: '1' }]
      } as unknown as GearItem

      const typedItem2 = {
        id: 'item2',
        name: 'Item 2',
        slot: GearSlot.OffHand,
        enchantments: [{ name: 'Strength', bonus: 'Enhancement', modifier: '1' }]
      } as unknown as GearItem

      const conflicts = resolveConflicts([typedItem1, typedItem2])
      expect(conflicts.strength).toBeDefined()
      expect(conflicts.strength.length).toBe(1)
      expect(conflicts.strength[0].bonus).toBe('Enhancement')
    })
  })
})
