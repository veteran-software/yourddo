import { describe, expect, it } from 'vitest'
import reaperForge from './reaperForge.json'

const validSlots = new Set([
  'Armor',
  'Head',
  'Hands',
  'Cloak',
  'Waist',
  'Feet',
  'Wrists',
  'Eyes',
  'Neck',
  'First Finger',
  'Second Finger',
  'Trinket',
  'Main Hand',
  'Off Hand',
  'Quiver'
])

describe('reaper forge data', () => {
  it('defines craftable effects only', () => {
    expect(reaperForge.effects).toHaveLength(14)
    expect(reaperForge.effects.every((effect) => effect.allowedSlots.length > 0)).toBe(true)
    expect(reaperForge.effects.every((effect) => Array.isArray(effect.grants) && effect.grants.length > 0)).toBe(true)
  })

  it('uses planner slot names in the slot rules', () => {
    for (const [slot, effectIds] of Object.entries(reaperForge.slotRules)) {
      expect(validSlots.has(slot)).toBe(true)
      expect(effectIds.length).toBeGreaterThan(0)

      for (const effectId of effectIds) {
        expect(reaperForge.effects.some((effect) => effect.id === effectId)).toBe(true)
      }
    }
  })

  it('keeps the ring boosts available on both ring slots', () => {
    const ringEffects = ['reaper-ring-boost-1', 'reaper-ring-boost-2', 'reaper-ring-boost-3', 'reaper-ring-boost-4']

    expect(reaperForge.slotRules['First Finger']).toEqual(ringEffects)
    expect(reaperForge.slotRules['Second Finger']).toEqual(ringEffects)
  })
})
