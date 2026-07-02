import { describe, expect, it } from 'vitest'
import { checkPotentialConflict, getBonus, normalizeString, resolveConflicts } from './conflictResolver'
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
      expect(conflicts.strength).toHaveLength(1)
      expect(conflicts.strength[0].bonus).toBe('Enhancement')
    })

    it('should resolve legacy upgrade fields through the compact state resolver', () => {
      const legacyItem = {
        id: 'item3',
        name: 'Item 3',
        slot: GearSlot.MainHand,
        enchantments: []
      } as unknown as GearItem

      const result = checkPotentialConflict(
        { name: 'Strength', bonus: 'Enhancement', modifier: '1' },
        [legacyItem],
        GearSlot.OffHand,
        {
          slottedNearlyFinished: {
            item3: { name: 'Strength', bonus: 'Enhancement', modifier: '2' }
          }
        }
      )

      expect(result.isConflict).toBe(true)
      expect(result.currentMax).toBe(2)
      expect(result.isOverpowered).toBe(true)
    })
  })

  describe('normalizeString', () => {
    it('should return a trimmed and lowercase version of the input string', () => {
      expect(normalizeString('  HeLLo WoRLD  ')).toBe('hello world')
    })

    it('should return an empty string for null input', () => {
      expect(normalizeString(null)).toBe('')
    })

    it('should return an empty string for undefined input', () => {
      expect(normalizeString(undefined)).toBe('')
    })

    it('should convert a number to a string and normalize it', () => {
      expect(normalizeString(123)).toBe('123')
    })

    it('should handle an empty string gracefully', () => {
      expect(normalizeString('')).toBe('')
    })

    it('should not modify a string that is already trimmed and lowercase', () => {
      expect(normalizeString('lowercase')).toBe('lowercase')
    })
  })
})
