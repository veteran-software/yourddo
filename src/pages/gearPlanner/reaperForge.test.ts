import { describe, expect, it } from 'vitest'
import { getReaperForgeEffectsForSlot, getReaperForgeEnchantments } from './helpers'
import { GearSlot } from './types'

describe('reaper forge helpers', () => {
  it('returns the ring effects for ring slots', () => {
    expect(getReaperForgeEffectsForSlot(GearSlot.FirstFinger).map((effect) => effect.id)).toEqual([
      'reaper-ring-boost-1',
      'reaper-ring-boost-2',
      'reaper-ring-boost-3',
      'reaper-ring-boost-4'
    ])
  })

  it('converts a selected effect into enchantments', () => {
    expect(getReaperForgeEnchantments('reaper-bracers-enchantment')).toEqual([
      { name: 'Fortitude Saving Throws', bonus: 'Reaper', modifier: 1 },
      { name: 'Reflex Saving Throws', bonus: 'Reaper', modifier: 1 },
      { name: 'Will Saving Throws', bonus: 'Reaper', modifier: 1 },
      { name: 'Magical Resistance Rating', bonus: 'Reaper', modifier: 3 }
    ])
  })
})
